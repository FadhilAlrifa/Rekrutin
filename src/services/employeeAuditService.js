import { supabase, supabaseAdminAuth } from './supabaseClient.js';
import { fetchEmployees, deleteEmployeeRole } from './stockoService.js';

const EMPLOYEE_PROFILES_STORAGE_KEY = 'stocko_employee_profiles_v1';
const EMPLOYEE_SESSIONS_STORAGE_KEY = 'stocko_employee_sessions_v1';
const UNAVAILABLE_TABLES_KEY = 'stocko_unavailable_tables_v1';

const GENERIC_SHARED_NAME_REGEX =
  /^(kasir|cashier|stocker|gudang|admin|superadmin|staff|karyawan|team|shared|umum|bersama|shift|akun|operator|user|demo)(\s*\d*)$/i;

function readLocalJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocalJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Abaikan jika storage dibatasi
  }
}

function isTableUnavailable(table) {
  try {
    const list = JSON.parse(window.sessionStorage.getItem(UNAVAILABLE_TABLES_KEY) || '[]');
    return list.includes(table);
  } catch {
    return false;
  }
}

function markTableUnavailable(table) {
  try {
    const list = JSON.parse(window.sessionStorage.getItem(UNAVAILABLE_TABLES_KEY) || '[]');
    if (!list.includes(table)) {
      window.sessionStorage.setItem(UNAVAILABLE_TABLES_KEY, JSON.stringify([...list, table]));
    }
  } catch {
    // Abaikan
  }
}

function isMissingResourceError(error) {
  if (!error) return false;
  const code = String(error.code || '');
  const msg = String(error.message || '').toLowerCase();
  return (
    code === 'PGRST205' ||
    code === 'PGRST204' ||
    code === '42P01' ||
    code === '42703' ||
    error.status === 404 ||
    msg.includes('could not find') ||
    msg.includes('not found') ||
    msg.includes('column')
  );
}

/**
 * Validasi kebijakan 1 Akun = 1 Karyawan (wajib nama lengkap pribadi, tanpa akun bersama/generik).
 */
export function validatePersonalEmployeeName(fullName, existingEmployees = [], ignoreEmail = '') {
  const clean = String(fullName || '').trim().replace(/\s+/g, ' ');
  if (clean.length < 3) {
    return {
      valid: false,
      message: 'Nama lengkap karyawan wajib diisi minimal 3 karakter (tanpa ID employee).'
    };
  }

  if (GENERIC_SHARED_NAME_REGEX.test(clean)) {
    return {
      valid: false,
      message:
        'Dilarang menggunakan nama generik/akun bersama (mis. "Kasir 1", "Stocker", "Admin"). Masukkan nama lengkap pribadi karyawan.'
    };
  }

  const duplicate = (existingEmployees || []).find((emp) => {
    if (ignoreEmail && (emp.email || '').toLowerCase() === ignoreEmail.toLowerCase()) return false;
    return (emp.fullName || '').trim().toLowerCase() === clean.toLowerCase();
  });

  if (duplicate) {
    return {
      valid: false,
      message: `Nama karyawan "${clean}" sudah terdaftar pada akun (${duplicate.email}). Kebijakan 1 akun = 1 karyawan melarang duplikasi nama.`
    };
  }

  return { valid: true, cleanName: clean };
}

/**
 * Deteksi ringkas perangkat & browser untuk log sesi keamanan login.
 */
export function getBrowserDeviceLabel() {
  if (typeof navigator === 'undefined') return 'Web Browser';
  const ua = navigator.userAgent || '';
  let browser = 'Browser';
  if (ua.includes('Edg/')) browser = 'Edge';
  else if (ua.includes('Chrome/')) browser = 'Chrome';
  else if (ua.includes('Firefox/')) browser = 'Firefox';
  else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browser = 'Safari';

  let os = 'Desktop';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS')) os = 'macOS';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Linux')) os = 'Linux';

  return `${browser} • ${os}`;
}

function deriveFallbackName(email) {
  const localPart = String(email || '').split('@')[0] || 'Karyawan';
  return localPart
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Ambil daftar akun staf lengkap dengan nama pribadi, status aktif/resign, & penempatan outlet.
 */
export async function fetchStaffProfiles() {
  const result = await fetchEmployees();
  if (!result.success) return result;

  const localMap = readLocalJson(EMPLOYEE_PROFILES_STORAGE_KEY, {});

  const enriched = (result.data || []).map((row) => {
    const emailKey = String(row.email || '').toLowerCase();
    const cached = localMap[emailKey] || localMap[String(row.id)] || {};
    const resolvedFullName = row.full_name || cached.fullName || deriveFallbackName(row.email);
    const resolvedIsActive =
      row.is_active !== undefined && row.is_active !== null
        ? Boolean(row.is_active)
        : cached.isActive !== undefined
        ? Boolean(cached.isActive)
        : true;
    const resolvedStatus =
      row.status || cached.status || (resolvedIsActive ? 'active' : 'inactive');

    return {
      id: row.id,
      email: row.email,
      role: row.role || 'kasir',
      fullName: resolvedFullName,
      outletName: row.outlet_name || cached.outletName || 'Cabang Utama - Makassar',
      isActive: resolvedIsActive,
      status: resolvedStatus,
      deactivatedAt: row.deactivated_at || cached.deactivatedAt || null,
      deactivatedReason: row.deactivated_reason || cached.deactivatedReason || ''
    };
  });

  return { success: true, data: enriched };
}

/**
 * Daftarkan akun karyawan eksklusif (1 akun = 1 karyawan, wajib full_name tanpa ID employee).
 */
export async function createSingleEmployeeAccount({
  email,
  password,
  role,
  fullName,
  outletName = 'Cabang Utama - Makassar',
  existingEmployees = []
}) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!cleanEmail || !password) {
    return { success: false, message: 'Email login dan kata sandi wajib diisi.' };
  }

  const nameValidation = validatePersonalEmployeeName(fullName, existingEmployees);
  if (!nameValidation.valid) {
    return { success: false, message: nameValidation.message };
  }

  if (
    existingEmployees.some((emp) => String(emp.email || '').toLowerCase() === cleanEmail)
  ) {
    return {
      success: false,
      message: `Email ${cleanEmail} sudah terdaftar. Setiap karyawan wajib memiliki akun unik.`
    };
  }

  const cleanName = nameValidation.cleanName;
  const resolvedOutlet = outletName || 'Cabang Utama - Makassar';

  const { data, error } = await supabaseAdminAuth.auth.signUp({
    email: cleanEmail,
    password,
    options: {
      data: {
        role,
        full_name: cleanName,
        outlet_name: resolvedOutlet,
        is_active: true
      }
    }
  });

  if (error) {
    return { success: false, message: error.message };
  }

  const localMap = readLocalJson(EMPLOYEE_PROFILES_STORAGE_KEY, {});
  localMap[cleanEmail] = {
    fullName: cleanName,
    outletName: resolvedOutlet,
    isActive: true,
    status: 'active',
    deactivatedAt: null,
    deactivatedReason: ''
  };
  writeLocalJson(EMPLOYEE_PROFILES_STORAGE_KEY, localMap);

  if (!isTableUnavailable('user_roles.extended') && data?.user?.id) {
    const { error: updErr } = await supabase
      .from('user_roles')
      .update({
        full_name: cleanName,
        outlet_name: resolvedOutlet,
        is_active: true,
        status: 'active'
      })
      .eq('id', data.user.id);

    if (isMissingResourceError(updErr)) {
      markTableUnavailable('user_roles.extended');
    }
  }

  return {
    success: true,
    data,
    employee: {
      id: data?.user?.id || cleanEmail,
      email: cleanEmail,
      role,
      fullName: cleanName,
      outletName: resolvedOutlet,
      isActive: true,
      status: 'active'
    }
  };
}

/**
 * Nonaktifkan / Aktifkan kembali akun karyawan tanpa menghapus riwayat transaksi atau mutasi stok.
 */
export async function setEmployeeActiveStatus(emp, isActive, reason = '') {
  if (!emp) return { success: false, message: 'Data karyawan tidak ditemukan.' };
  if ((emp.role || '').toLowerCase() === 'superadmin') {
    return {
      success: false,
      code: 'PROTECTED_ROLE',
      message: 'Akun Superadmin dilindungi dan tidak dapat dinonaktifkan.'
    };
  }

  const emailKey = String(emp.email || '').toLowerCase();
  const nowIso = new Date().toISOString();
  const nextStatus = isActive ? 'active' : 'inactive';
  const cleanReason =
    String(reason || '').trim() ||
    (isActive ? 'Akun diaktifkan kembali oleh Admin' : 'Karyawan resign / mutasi akses');

  const localMap = readLocalJson(EMPLOYEE_PROFILES_STORAGE_KEY, {});
  localMap[emailKey] = {
    ...(localMap[emailKey] || {}),
    fullName: emp.fullName || deriveFallbackName(emp.email),
    outletName: emp.outletName || 'Cabang Utama - Makassar',
    isActive: Boolean(isActive),
    status: nextStatus,
    deactivatedAt: isActive ? null : nowIso,
    deactivatedReason: isActive ? '' : cleanReason
  };
  writeLocalJson(EMPLOYEE_PROFILES_STORAGE_KEY, localMap);

  if (!isTableUnavailable('user_roles.extended') && emp.id) {
    const { error } = await supabase
      .from('user_roles')
      .update({
        is_active: Boolean(isActive),
        status: nextStatus,
        deactivated_at: isActive ? null : nowIso,
        deactivated_reason: isActive ? null : cleanReason
      })
      .eq('id', emp.id);

    if (isMissingResourceError(error)) {
      markTableUnavailable('user_roles.extended');
    }
  }

  return {
    success: true,
    isActive: Boolean(isActive),
    status: nextStatus,
    reason: cleanReason
  };
}

/**
 * Cek profil & status aktif akun dari sesi login Auth.
 */
export async function resolveAuthenticatedEmployeeProfile(user) {
  if (!user) return null;
  const emailKey = String(user.email || '').toLowerCase();
  const localMap = readLocalJson(EMPLOYEE_PROFILES_STORAGE_KEY, {});
  const cached = localMap[emailKey] || {};

  let dbRow = null;
  try {
    const { data } = await supabase
      .from('user_roles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    if (data) dbRow = data;
  } catch {
    // Gunakan fallback metadata/cache
  }

  const role = dbRow?.role || user.user_metadata?.role || 'superadmin';
  const fullName =
    dbRow?.full_name ||
    user.user_metadata?.full_name ||
    cached.fullName ||
    deriveFallbackName(user.email);
  const outletName =
    dbRow?.outlet_name ||
    user.user_metadata?.outlet_name ||
    cached.outletName ||
    'Cabang Utama - Makassar';

  const isActive =
    dbRow?.is_active !== undefined && dbRow?.is_active !== null
      ? Boolean(dbRow.is_active)
      : cached.isActive !== undefined
      ? Boolean(cached.isActive)
      : true;

  const hasRoleAccess =
    Boolean(dbRow?.role) ||
    (role !== 'kasir' && role !== 'stocker');

  return {
    id: user.id,
    email: user.email,
    role,
    fullName,
    outletName,
    isActive,
    hasRoleAccess
  };
}

export async function fetchEmployeeLoginSessions() {
  if (!isTableUnavailable('employee_login_sessions')) {
    try {
      const { data, error } = await supabase
        .from('employee_login_sessions')
        .select('*')
        .order('login_at', { ascending: false })
        .limit(100);

      if (isMissingResourceError(error)) {
        markTableUnavailable('employee_login_sessions');
      } else if (!error && Array.isArray(data)) {
        const mapped = data.map((row) => ({
          id: row.id,
          userId: row.user_id,
          fullName: row.full_name,
          email: row.email,
          role: row.role,
          outletName: row.outlet_name || 'Cabang Utama - Makassar',
          deviceInfo: row.device_info || 'Web Browser',
          sessionStatus: row.session_status || 'active',
          loginAt: row.login_at,
          logoutAt: row.logout_at
        }));
        writeLocalJson(EMPLOYEE_SESSIONS_STORAGE_KEY, mapped);
        return mapped;
      }
    } catch {
      markTableUnavailable('employee_login_sessions');
    }
  }

  return readLocalJson(EMPLOYEE_SESSIONS_STORAGE_KEY, []);
}

export async function recordEmployeeSessionEvent({
  sessionId,
  userId,
  fullName,
  email,
  role,
  outletName = 'Cabang Utama - Makassar',
  eventType = 'login' // 'login' | 'logout' | 'blocked_inactive'
}) {
  const nowIso = new Date().toISOString();
  const deviceInfo = getBrowserDeviceLabel();
  const currentSessions = readLocalJson(EMPLOYEE_SESSIONS_STORAGE_KEY, []);

  if (eventType === 'logout' && sessionId) {
    const updated = currentSessions.map((s) =>
      s.id === sessionId ? { ...s, logoutAt: nowIso, sessionStatus: 'logged_out' } : s
    );
    writeLocalJson(EMPLOYEE_SESSIONS_STORAGE_KEY, updated);

    if (!isTableUnavailable('employee_login_sessions')) {
      try {
        const { error } = await supabase
          .from('employee_login_sessions')
          .update({ logout_at: nowIso, session_status: 'logged_out' })
          .eq('id', sessionId);
        if (isMissingResourceError(error)) {
          markTableUnavailable('employee_login_sessions');
        }
      } catch {
        markTableUnavailable('employee_login_sessions');
      }
    }
    return { id: sessionId, sessionStatus: 'logged_out', logoutAt: nowIso };
  }

  const newSession = {
    id: sessionId || `SES-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId: userId || 'operator-active',
    fullName: fullName || 'Karyawan',
    email: email || '',
    role: role || 'kasir',
    outletName,
    deviceInfo,
    sessionStatus: eventType === 'blocked_inactive' ? 'blocked_inactive' : 'active',
    loginAt: nowIso,
    logoutAt: eventType === 'blocked_inactive' ? nowIso : null
  };

  writeLocalJson(EMPLOYEE_SESSIONS_STORAGE_KEY, [newSession, ...currentSessions].slice(0, 120));

  if (!isTableUnavailable('employee_login_sessions')) {
    try {
      const { error } = await supabase.from('employee_login_sessions').insert([
        {
          id: newSession.id,
          user_id: newSession.userId,
          full_name: newSession.fullName,
          email: newSession.email,
          role: newSession.role,
          outlet_name: newSession.outletName,
          device_info: newSession.deviceInfo,
          session_status: newSession.sessionStatus,
          login_at: newSession.loginAt,
          logout_at: newSession.logoutAt
        }
      ]);
      if (isMissingResourceError(error)) {
        markTableUnavailable('employee_login_sessions');
      }
    } catch {
      markTableUnavailable('employee_login_sessions');
    }
  }

  return newSession;
}

export { deleteEmployeeRole };
