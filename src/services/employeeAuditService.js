import { supabase, supabaseAdminAuth } from './supabaseClient.js';
import {
  fetchEmployees,
  deleteEmployeeRole as rawDeleteEmployeeRole,
  getActiveCompanyId,
  getActiveWorkspaceManifest,
  registerCompanyStaffEmail,
  unregisterCompanyStaffEmail,
  findWorkspaceForEmployeeEmail
} from './stockoService.js';

const EMPLOYEE_PROFILES_STORAGE_KEY = 'stocko_employee_profiles_v1';
const EMPLOYEE_SESSIONS_STORAGE_KEY = 'stocko_employee_sessions_v1';
const unavailableTablesSet = new Set();

const GENERIC_SHARED_NAME_REGEX =
  /^(kasir|cashier|stocker|gudang|admin|superadmin|staff|karyawan|team|shared|umum|bersama|shift|akun|operator|user|demo)(\s*\d*)$/i;

function getScopedEmployeeKey(key) {
  const cid = getActiveCompanyId();
  return cid ? `${key}:${cid}` : key;
}

function readLocalJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(getScopedEmployeeKey(key));
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocalJson(key, value) {
  try {
    window.localStorage.setItem(getScopedEmployeeKey(key), JSON.stringify(value));
  } catch {
    // Abaikan jika storage dibatasi
  }
}

function isTableUnavailable(table) {
  return unavailableTablesSet.has(table);
}

function markTableUnavailable(table) {
  unavailableTablesSet.add(table);
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

export function usernameToInternalAuthEmail(usernameOrEmail) {
  const raw = String(usernameOrEmail || '').trim();
  if (!raw) return '';
  if (raw.includes('@')) return raw.toLowerCase();
  const slug = raw
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  return `${slug || 'staff'}@staff.stocko.app`;
}

export function formatDisplayUsername(emailOrUsername, fullName = '') {
  const rawEmail = String(emailOrUsername || '').trim();
  if (rawEmail.toLowerCase().endsWith('@staff.stocko.app')) {
    return rawEmail.slice(0, -'@staff.stocko.app'.length);
  }
  const cleanFull = String(fullName || '').trim();
  if (cleanFull) return cleanFull;
  return rawEmail;
}

/**
 * Validasi username karyawan (minimal 3 karakter, unik dalam perusahaan).
 */
export function validatePersonalEmployeeName(fullName, existingEmployees = [], ignoreEmail = '') {
  const clean = String(fullName || '').trim().replace(/\s+/g, ' ');
  if (clean.length < 3) {
    return {
      valid: false,
      message: 'Username karyawan wajib diisi minimal 3 karakter.'
    };
  }

  const targetEmail = usernameToInternalAuthEmail(clean);
  const duplicate = (existingEmployees || []).find((emp) => {
    const empEmail = String(emp.email || '').toLowerCase();
    if (ignoreEmail && empEmail === ignoreEmail.toLowerCase()) return false;
    const empName = String(emp.username || emp.fullName || '').trim().toLowerCase();
    return empName === clean.toLowerCase() || (empEmail && empEmail === targetEmail);
  });

  if (duplicate) {
    return {
      valid: false,
      message: `Username "${clean}" sudah terdaftar. Gunakan username lain yang unik.`
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
  const manifest = getActiveWorkspaceManifest();
  if (!manifest) {
    return { success: true, data: [] };
  }

  const adminEmail = String(manifest.adminEmail || '').trim().toLowerCase();
  const staffSet = new Set(
    (manifest.staffEmails || []).map((e) => String(e || '').trim().toLowerCase()).filter(Boolean)
  );

  const result = await fetchEmployees();
  const dbRows = result.success ? result.data || [] : [];
  const localMap = readLocalJson(EMPLOYEE_PROFILES_STORAGE_KEY, {});
  const defaultOutlet = manifest.businessName
    ? `${manifest.businessName} - Utama`
    : 'Cabang Utama - Makassar';

  const scopedRows = dbRows.filter((row) => {
    const emailKey = String(row.email || '').trim().toLowerCase();
    return (adminEmail && emailKey === adminEmail) || staffSet.has(emailKey);
  });

  const enriched = scopedRows.map((row) => {
    const emailKey = String(row.email || '').toLowerCase();
    const cached = localMap[emailKey] || localMap[String(row.id)] || {};
    const isAdminRow = adminEmail && emailKey === adminEmail;
    const resolvedFullName =
      row.full_name ||
      cached.fullName ||
      (isAdminRow ? manifest.adminName : '') ||
      deriveFallbackName(row.email);
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
      username: formatDisplayUsername(row.email, resolvedFullName),
      role: isAdminRow ? 'superadmin' : row.role || cached.role || 'kasir',
      fullName: resolvedFullName,
      outletName: row.outlet_name || cached.outletName || defaultOutlet,
      isActive: resolvedIsActive,
      status: resolvedStatus,
      deactivatedAt: row.deactivated_at || cached.deactivatedAt || null,
      deactivatedReason: row.deactivated_reason || cached.deactivatedReason || ''
    };
  });

  if (
    adminEmail &&
    !enriched.some((e) => String(e.email || '').toLowerCase() === adminEmail)
  ) {
    const cachedAdmin = localMap[adminEmail] || {};
    const adminDisplayName =
      cachedAdmin.fullName || manifest.adminName || deriveFallbackName(adminEmail);
    enriched.unshift({
      id: manifest.adminId || manifest.companyId,
      email: adminEmail,
      username: adminDisplayName,
      role: 'superadmin',
      fullName: adminDisplayName,
      outletName: cachedAdmin.outletName || defaultOutlet,
      isActive: true,
      status: 'active',
      deactivatedAt: null,
      deactivatedReason: ''
    });
  }

  for (const staffEmail of staffSet) {
    if (!enriched.some((e) => String(e.email || '').toLowerCase() === staffEmail)) {
      const cached = localMap[staffEmail];
      if (cached) {
        const staffDisplayName =
          cached.fullName || formatDisplayUsername(staffEmail) || deriveFallbackName(staffEmail);
        enriched.push({
          id: cached.id || staffEmail,
          email: staffEmail,
          username: formatDisplayUsername(staffEmail, staffDisplayName),
          role: cached.role || 'kasir',
          fullName: staffDisplayName,
          outletName: cached.outletName || defaultOutlet,
          isActive: cached.isActive !== false,
          status: cached.status || 'active',
          deactivatedAt: cached.deactivatedAt || null,
          deactivatedReason: cached.deactivatedReason || ''
        });
      }
    }
  }

  return { success: true, data: enriched };
}

/**
 * Daftarkan akun karyawan eksklusif (1 akun = 1 karyawan, wajib full_name tanpa ID employee).
 */
export async function createSingleEmployeeAccount({
  username,
  email,
  password,
  role,
  fullName,
  outletName = 'Utama',
  existingEmployees = []
}) {
  const rawNameOrUsername = String(username || fullName || email || '').trim();
  if (!rawNameOrUsername || !password) {
    return { success: false, message: 'Username dan kata sandi wajib diisi.' };
  }

  const nameValidation = validatePersonalEmployeeName(rawNameOrUsername, existingEmployees);
  if (!nameValidation.valid) {
    return { success: false, message: nameValidation.message };
  }

  const cleanName = nameValidation.cleanName;
  const cleanEmail = usernameToInternalAuthEmail(email || cleanName);

  if (
    existingEmployees.some((emp) => String(emp.email || '').toLowerCase() === cleanEmail)
  ) {
    return {
      success: false,
      message: `Username "${cleanName}" sudah terdaftar. Gunakan username lain yang unik.`
    };
  }

  const resolvedOutlet = outletName || 'Utama';
  const activeCompanyId = getActiveCompanyId() || '';
  const manifest = getActiveWorkspaceManifest();

  const { data, error } = await supabaseAdminAuth.auth.signUp({
    email: cleanEmail,
    password,
    options: {
      data: {
        role,
        username: cleanName,
        full_name: cleanName,
        outlet_name: resolvedOutlet,
        is_active: true,
        company_id: activeCompanyId,
        business_name: manifest?.businessName || '',
        business_type: manifest?.businessType || 'fnb',
        payment_flow: manifest?.paymentFlow || 'pay_first',
        subscription_plan: manifest?.subscriptionPlan || 'pro'
      }
    }
  });

  if (error) {
    const msg = String(error.message || '').toLowerCase();
    if (msg.includes('already registered') || msg.includes('already exists')) {
      return {
        success: false,
        message: `Username "${cleanName}" sudah pernah digunakan. Pilih username lain (mis. ${cleanName.replace(/\s+/g, '').toLowerCase()}2).`
      };
    }
    return { success: false, message: error.message };
  }

  await registerCompanyStaffEmail(cleanEmail);

  const localMap = readLocalJson(EMPLOYEE_PROFILES_STORAGE_KEY, {});
  localMap[cleanEmail] = {
    id: data?.user?.id || cleanEmail,
    role,
    username: cleanName,
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
      username: cleanName,
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
 * Perbarui profil nama lengkap, penempatan outlet, dan jabatan karyawan (tetap menjaga aturan 1 akun = 1 karyawan).
 */
export async function updateEmployeeProfile({
  employee,
  fullName,
  role,
  outletName = 'Cabang Utama - Makassar',
  existingEmployees = []
}) {
  if (!employee) return { success: false, message: 'Data karyawan tidak ditemukan.' };

  const isSuperadmin = (employee.role || '').toLowerCase() === 'superadmin';
  const nameValidation = validatePersonalEmployeeName(
    fullName,
    existingEmployees,
    employee.email
  );
  if (!nameValidation.valid) {
    return { success: false, message: nameValidation.message };
  }

  const cleanName = nameValidation.cleanName;
  const resolvedRole = isSuperadmin ? 'superadmin' : role || employee.role || 'kasir';
  const resolvedOutlet = outletName || employee.outletName || 'Cabang Utama - Makassar';
  const emailKey = String(employee.email || '').toLowerCase();

  const localMap = readLocalJson(EMPLOYEE_PROFILES_STORAGE_KEY, {});
  localMap[emailKey] = {
    ...(localMap[emailKey] || {}),
    fullName: cleanName,
    outletName: resolvedOutlet,
    isActive: employee.isActive !== false,
    status: employee.status || (employee.isActive !== false ? 'active' : 'inactive')
  };
  writeLocalJson(EMPLOYEE_PROFILES_STORAGE_KEY, localMap);

  let dbUpdated = false;
  if (!isTableUnavailable('user_roles.extended')) {
    const patch = {
      full_name: cleanName,
      outlet_name: resolvedOutlet,
      ...(isSuperadmin ? {} : { role: resolvedRole })
    };

    const query = employee.id
      ? supabase.from('user_roles').update(patch).eq('id', employee.id).select()
      : supabase.from('user_roles').update(patch).eq('email', employee.email).select();

    const { data, error } = await query;
    if (error) {
      if (isMissingResourceError(error)) {
        markTableUnavailable('user_roles.extended');
        // Tetap coba update role saja bila bukan superadmin dan kolom extended belum dimigrasi
        if (!isSuperadmin && employee.id) {
          await supabase.from('user_roles').update({ role: resolvedRole }).eq('id', employee.id);
        }
      } else {
        return { success: false, message: error.message };
      }
    } else if (Array.isArray(data) && data.length > 0) {
      dbUpdated = true;
    }
  }

  return {
    success: true,
    dbUpdated,
    employee: {
      ...employee,
      fullName: cleanName,
      role: resolvedRole,
      outletName: resolvedOutlet
    }
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
    Boolean(user.user_metadata?.role) ||
    (role !== 'kasir' && role !== 'stocker');

  let companyId = user.user_metadata?.company_id || null;
  if (!companyId) {
    if (role === 'superadmin') {
      companyId = user.id;
    } else {
      const matchedWorkspace = await findWorkspaceForEmployeeEmail(user.email);
      companyId = matchedWorkspace?.companyId || user.id;
    }
  }

  return {
    id: user.id,
    email: user.email,
    role,
    fullName,
    outletName,
    isActive,
    hasRoleAccess,
    companyId
  };
}

export async function fetchEmployeeLoginSessions() {
  const manifest = getActiveWorkspaceManifest();
  if (!manifest) return [];
  const adminEmail = String(manifest.adminEmail || '').trim().toLowerCase();
  const allowedEmails = new Set([
    ...(adminEmail ? [adminEmail] : []),
    ...(manifest.staffEmails || []).map((e) => String(e || '').trim().toLowerCase())
  ]);
  if (allowedEmails.size === 0) return [];

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
        const mapped = data
          .filter((row) => allowedEmails.has(String(row.email || '').trim().toLowerCase()))
          .map((row) => ({
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

  return readLocalJson(EMPLOYEE_SESSIONS_STORAGE_KEY, []).filter((row) =>
    allowedEmails.has(String(row.email || '').trim().toLowerCase())
  );
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

export async function deleteEmployeeRole(employeeId, email, role) {
  if ((role || '').toLowerCase() === 'superadmin') {
    return {
      success: false,
      code: 'PROTECTED_ROLE',
      message: 'Akun Admin utama dilindungi dan tidak dapat dihapus.'
    };
  }
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (cleanEmail) {
    await unregisterCompanyStaffEmail(cleanEmail);
    const localMap = readLocalJson(EMPLOYEE_PROFILES_STORAGE_KEY, {});
    delete localMap[cleanEmail];
    writeLocalJson(EMPLOYEE_PROFILES_STORAGE_KEY, localMap);
  }
  await rawDeleteEmployeeRole(employeeId, email, role);
  return { success: true };
}

export function clearEmployeeLocalCaches() {
  try {
    window.localStorage.removeItem(EMPLOYEE_PROFILES_STORAGE_KEY);
    window.localStorage.removeItem(EMPLOYEE_SESSIONS_STORAGE_KEY);
    window.localStorage.removeItem(getScopedEmployeeKey(EMPLOYEE_PROFILES_STORAGE_KEY));
    window.localStorage.removeItem(getScopedEmployeeKey(EMPLOYEE_SESSIONS_STORAGE_KEY));
  } catch {
    // Abaikan jika storage dibatasi
  }
}
