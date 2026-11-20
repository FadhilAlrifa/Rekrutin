import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  ShieldCheck,
  Mail,
  Lock,
  X,
  Trash2,
  CheckCircle2,
  UserCog,
  Briefcase,
  Store,
  Package,
  UserPlus,
  AlertTriangle,
  RefreshCw,
  Loader2,
  Copy,
  Check,
  User,
  UserX,
  UserCheck,
  Search,
  Monitor,
  Clock,
  MapPin
} from 'lucide-react';
import {
  fetchStaffProfiles,
  createSingleEmployeeAccount,
  setEmployeeActiveStatus,
  deleteEmployeeRole,
  fetchEmployeeLoginSessions
} from '../../../services/employeeAuditService';

const OUTLET_OPTIONS = [
  'Cabang Utama - Makassar',
  'Cabang 2 - Bandung',
  'Cabang 3 - Jakarta',
  'Central Kitchen (Gudang Pusat)'
];

export default function EmployeeModule({
  subscriptionPlan = 'pro',
  onUpgradePlan,
  onRecordAudit
}) {
  const [employees, setEmployees] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState('accounts'); // 'accounts' | 'sessions'
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteEmp, setConfirmDeleteEmp] = useState(null);
  const [statusModalEmp, setStatusModalEmp] = useState(null);
  const [statusReason, setStatusReason] = useState('');

  // Filter daftar karyawan berdasarkan nama, role, dan status
  const [searchName, setSearchName] = useState('');
  const [roleFilter, setRoleFilter] = useState('Semua');
  const [statusFilter, setStatusFilter] = useState('Semua');

  const [newEmployee, setNewEmployee] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'kasir',
    outletName: 'Cabang Utama - Makassar'
  });

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [deleteError, setDeleteError] = useState(null);
  const [copiedSql, setCopiedSql] = useState(false);

  const RLS_DELETE_SQL = `CREATE POLICY "Allow delete user_roles" ON public.user_roles\nFOR DELETE TO anon, authenticated USING (role <> 'superadmin');`;

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(RLS_DELETE_SQL);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    } catch {
      setCopiedSql(false);
    }
  };

  const isStarter = subscriptionPlan === 'starter';
  const activeKasirCount = employees.filter(
    (e) => e.role === 'kasir' && e.isActive !== false
  ).length;
  const activeStockerCount = employees.filter(
    (e) => e.role === 'stocker' && e.isActive !== false
  ).length;
  const inactiveCount = employees.filter((e) => e.isActive === false).length;
  const starterLimitReached = isStarter && activeKasirCount >= 1;

  const refreshEmployees = async () => {
    setIsLoading(true);
    const [empRes, sessionList] = await Promise.all([
      fetchStaffProfiles(),
      fetchEmployeeLoginSessions()
    ]);
    if (empRes.success) setEmployees(empRes.data || []);
    setSessions(sessionList || []);
    setIsLoading(false);
  };

  useEffect(() => {
    let active = true;
    Promise.all([fetchStaffProfiles(), fetchEmployeeLoginSessions()]).then(
      ([empRes, sessionList]) => {
        if (!active) return;
        if (empRes.success) {
          setEmployees(empRes.data || []);
        }
        setSessions(sessionList || []);
        setIsLoading(false);
      }
    );
    return () => {
      active = false;
    };
  }, []);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const q = searchName.trim().toLowerCase();
      const matchName =
        !q ||
        (emp.fullName || '').toLowerCase().includes(q) ||
        (emp.email || '').toLowerCase().includes(q);
      const matchRole = roleFilter === 'Semua' || emp.role === roleFilter;
      const matchStatus =
        statusFilter === 'Semua' ||
        (statusFilter === 'active' ? emp.isActive !== false : emp.isActive === false);
      return matchName && matchRole && matchStatus;
    });
  }, [employees, searchName, roleFilter, statusFilter]);

  const filteredSessions = useMemo(() => {
    return sessions.filter((ses) => {
      const q = searchName.trim().toLowerCase();
      const matchName =
        !q ||
        (ses.fullName || '').toLowerCase().includes(q) ||
        (ses.email || '').toLowerCase().includes(q);
      const matchRole = roleFilter === 'Semua' || ses.role === roleFilter;
      return matchName && matchRole;
    });
  }, [sessions, searchName, roleFilter]);

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (isStarter && newEmployee.role === 'stocker') {
      setErrorMessage('Peran Stocker Gudang hanya tersedia pada Paket Pro & Enterprise.');
      return;
    }

    if (starterLimitReached) {
      setErrorMessage(
        'Paket Starter dibatasi maksimal 1 akun Kasir aktif. Upgrade ke Paket Pro untuk menambah lebih banyak karyawan.'
      );
      return;
    }

    setIsSubmitting(true);
    const result = await createSingleEmployeeAccount({
      email: newEmployee.email,
      password: newEmployee.password,
      role: newEmployee.role,
      fullName: newEmployee.fullName,
      outletName: newEmployee.outletName,
      existingEmployees: employees
    });

    if (result.success) {
      await onRecordAudit?.({
        actionType: 'Account Status',
        entityType: 'employee',
        entityId: result.employee?.id || newEmployee.email,
        entityName: result.employee?.fullName || newEmployee.fullName,
        beforeValue: 'Belum Terdaftar',
        afterValue: `Aktif (${newEmployee.role === 'kasir' ? 'Kasir' : 'Stocker'})`,
        deltaLabel: '1 Akun = 1 Karyawan',
        reason: `Registrasi akun pribadi ${newEmployee.fullName.trim()} (${newEmployee.outletName})`
      });

      await refreshEmployees();
      setSuccessMsg(
        `Akun pribadi atas nama "${result.employee?.fullName || newEmployee.fullName}" berhasil didaftarkan!`
      );
      setNewEmployee({
        fullName: '',
        email: '',
        password: '',
        role: 'kasir',
        outletName: 'Cabang Utama - Makassar'
      });
      setIsModalOpen(false);
      setTimeout(() => setSuccessMsg(''), 3500);
    } else {
      setErrorMessage(result.message || 'Gagal menambahkan karyawan. Periksa nama atau email.');
    }

    setIsSubmitting(false);
  };

  const handleConfirmToggleStatus = async (e) => {
    e.preventDefault();
    if (!statusModalEmp) return;
    const emp = statusModalEmp;
    const targetActive = emp.isActive === false;

    const result = await setEmployeeActiveStatus(emp, targetActive, statusReason);
    if (!result.success) {
      setDeleteError({
        email: emp.email,
        code: result.code,
        message: result.message
      });
      setStatusModalEmp(null);
      return;
    }

    await onRecordAudit?.({
      actionType: 'Account Status',
      entityType: 'employee',
      entityId: emp.id || emp.email,
      entityName: emp.fullName || emp.email,
      beforeValue: targetActive ? 'Nonaktif' : 'Aktif',
      afterValue: targetActive ? 'Aktif' : 'Nonaktif / Resign',
      deltaLabel: emp.role === 'kasir' ? 'Kasir' : emp.role === 'stocker' ? 'Stocker' : emp.role,
      reason: result.reason
    });

    await refreshEmployees();
    setStatusModalEmp(null);
    setStatusReason('');
    setSuccessMsg(
      targetActive
        ? `Akun ${emp.fullName} telah diaktifkan kembali.`
        : `Akun ${emp.fullName} dinonaktifkan. Seluruh riwayat audit & transaksi tetap tersimpan aman.`
    );
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteEmp) return;
    const emp = confirmDeleteEmp;

    if ((emp.role || '').toLowerCase() === 'superadmin') {
      setConfirmDeleteEmp(null);
      setDeleteError({
        email: emp.email,
        code: 'PROTECTED_ROLE',
        message: 'Akun Superadmin dilindungi dan tidak dapat dihapus.'
      });
      return;
    }

    setDeletingId(emp.id || emp.email);
    setDeleteError(null);

    const result = await deleteEmployeeRole(emp.id, emp.email, emp.role);

    if (result.success) {
      await onRecordAudit?.({
        actionType: 'Account Status',
        entityType: 'employee',
        entityId: emp.id || emp.email,
        entityName: emp.fullName || emp.email,
        beforeValue: emp.isActive === false ? 'Nonaktif' : 'Aktif',
        afterValue: 'Akses Dihapus',
        reason: 'Penghapusan akun role oleh Admin'
      });
      await refreshEmployees();
      setConfirmDeleteEmp(null);
      setSuccessMsg(`Akses akun ${emp.fullName} (${emp.email}) berhasil dihapus permanen.`);
      setTimeout(() => setSuccessMsg(''), 3500);
    } else {
      setDeleteError({
        email: emp.email,
        code: result.code,
        message: result.message || 'Gagal menghapus karyawan dari database.'
      });
    }

    setDeletingId(null);
  };

  const formatDateTime = (iso) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 pb-16">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 pb-5 border-b border-zinc-200">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="font-mono bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.14em] inline-flex items-center gap-1.5">
              <ShieldCheck size={12} />{' '}
              {isStarter ? 'Akses Terbatas (Paket Starter)' : '[ 05 // 1 AKUN = 1 KARYAWAN (RBAC) ]'}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#141414]">
            Kelola Karyawan &amp; Sesi
          </h1>
          <p className="text-xs font-medium text-[#52525B] max-w-xl">
            Setiap akun Kasir dan Stocker wajib terikat pada <strong>nama lengkap pribadi</strong> (tanpa akun bersama &amp; tanpa perlu ID employee) untuk kesiapan Audit Trail.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-zinc-200/70 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveSubTab('accounts')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                activeSubTab === 'accounts'
                  ? 'bg-[#141414] text-[#F59E0B]'
                  : 'text-[#52525B] hover:text-[#141414]'
              }`}
            >
              Daftar Akun ({employees.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('sessions')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                activeSubTab === 'sessions'
                  ? 'bg-[#141414] text-[#F59E0B]'
                  : 'text-[#52525B] hover:text-[#141414]'
              }`}
            >
              Sesi Login ({sessions.length})
            </button>
          </div>

          <button
            type="button"
            onClick={refreshEmployees}
            disabled={isLoading}
            className="bg-white hover:bg-zinc-100 border border-zinc-200 text-[#141414] font-bold text-xs px-3.5 py-2.5 rounded-xl inline-flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-60"
            title="Sinkronkan ulang daftar akun & sesi dari database"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Muat Ulang</span>
          </button>

          {starterLimitReached && onUpgradePlan ? (
            <button
              onClick={() => onUpgradePlan('pro')}
              className="bg-[#F59E0B] hover:bg-[#D97706] text-[#141414] font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-sm flex items-center gap-2 cursor-pointer transition-colors"
            >
              <UserPlus size={15} /> Upgrade ke Pro (Tambah Staf)
            </button>
          ) : (
            <button
              onClick={() => {
                setErrorMessage('');
                setIsModalOpen(true);
              }}
              className="bg-[#F59E0B] hover:bg-[#D97706] text-[#141414] font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Plus size={16} /> Tambah Karyawan
            </button>
          )}
        </div>
      </div>

      {/* Ringkasan Kuota & Peran Staf */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-zinc-200 rounded-2xl p-4">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#52525B]">
            Total Akun Terdaftar
          </span>
          <p className="text-2xl font-extrabold font-mono text-[#141414] mt-1">
            {employees.length}
          </p>
        </div>
        <div className="bg-white border border-zinc-200 rounded-2xl p-4">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#D97706]">
            Kasir Aktif
          </span>
          <p className="text-2xl font-extrabold font-mono text-[#141414] mt-1">
            {activeKasirCount}
          </p>
        </div>
        <div className="bg-white border border-zinc-200 rounded-2xl p-4">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#52525B]">
            Stocker Aktif
          </span>
          <p className="text-2xl font-extrabold font-mono text-[#141414] mt-1">
            {activeStockerCount}
          </p>
        </div>
        <div className="bg-white border border-zinc-200 rounded-2xl p-4">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            Nonaktif / Resign (Arsip Audit)
          </span>
          <p className="text-2xl font-extrabold font-mono text-zinc-600 mt-1">{inactiveCount}</p>
        </div>
      </div>

      {/* Filter Bar Karyawan */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama lengkap karyawan atau email..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="w-full bg-[#FAFAFA] border border-zinc-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-[#141414] focus:outline-none focus:bg-white focus:border-[#F59E0B]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-[#FAFAFA] border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold text-[#141414] cursor-pointer"
          >
            <option value="Semua">Semua Role</option>
            <option value="kasir">Kasir</option>
            <option value="stocker">Stocker</option>
            <option value="superadmin">Superadmin</option>
          </select>

          {activeSubTab === 'accounts' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#FAFAFA] border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold text-[#141414] cursor-pointer"
            >
              <option value="Semua">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif / Resign</option>
            </select>
          )}
        </div>
      </div>

      {/* BANNER KUOTA STARTER */}
      {isStarter && (
        <div className="bg-[#FEF3C7]/60 border border-[#FDE68A] rounded-2xl px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs font-bold text-[#141414]">
            <Lock size={15} className="text-[#D97706] shrink-0" />
            <span>
              Kuota Akun Kasir Paket Starter:{' '}
              <strong className="text-[#B45309]">{activeKasirCount} / 1 Kasir</strong> (Peran Stocker
              Gudang terkunci di Paket Starter).
            </span>
          </div>
          {onUpgradePlan && (
            <button
              onClick={() => onUpgradePlan('pro')}
              className="text-[11px] font-extrabold text-[#B45309] hover:underline cursor-pointer shrink-0"
            >
              Buka Full RBAC di Paket Pro →
            </button>
          )}
        </div>
      )}

      {/* SUCCESS & ERROR ALERTS */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-2xl flex items-center gap-3 text-sm font-bold shadow-sm"
          >
            <CheckCircle2 size={20} className="text-emerald-600 shrink-0" /> {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 text-red-900 p-5 rounded-2xl space-y-3 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-extrabold">
                    Akun {deleteError.email} tidak berubah di database
                  </p>
                  <p className="text-xs font-medium text-red-800 leading-relaxed">
                    {deleteError.message}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeleteError(null)}
                className="text-red-600 hover:text-red-800 p-1 cursor-pointer"
                aria-label="Tutup pesan error"
              >
                <X size={16} />
              </button>
            </div>

            {(deleteError.code === 'RLS_BLOCKED' || deleteError.code === 'NO_SESSION') && (
              <div className="bg-white border border-red-200 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-red-700">
                    Jalankan di SQL Editor Supabase agar hapus permanen berfungsi:
                  </p>
                  <button
                    type="button"
                    onClick={handleCopySql}
                    className="font-mono text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[#141414] text-white inline-flex items-center gap-1 cursor-pointer"
                  >
                    {copiedSql ? <Check size={11} className="text-[#F59E0B]" /> : <Copy size={11} />}
                    {copiedSql ? 'Tersalin' : 'Salin SQL'}
                  </button>
                </div>
                <pre className="font-mono text-[11px] text-[#141414] bg-[#FAFAFA] border border-zinc-200 rounded-lg p-2.5 overflow-x-auto select-all">
                  {RLS_DELETE_SQL}
                </pre>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* KONTEN TAB: DAFTAR AKUN VS LOG SESI LOGIN */}
      {activeSubTab === 'accounts' ? (
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAFAFA] border-b border-zinc-200 font-mono text-[10px] font-bold text-[#52525B] uppercase tracking-wider">
                  <th className="p-4 pl-6 w-12">#</th>
                  <th className="p-4">Nama Karyawan (1 Akun = 1 Orang)</th>
                  <th className="p-4">Jabatan (Role) &amp; Outlet</th>
                  <th className="p-4">Status Akun</th>
                  <th className="p-4 text-right pr-6">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-[#52525B] text-xs font-bold">
                      <span className="inline-flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin text-[#D97706]" />
                        Memuat daftar karyawan dari database...
                      </span>
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp, index) => {
                    const rowKey = emp.id || emp.email || index;
                    const isRowDeleting = deletingId === (emp.id || emp.email);
                    const isSuperadmin = (emp.role || '').toLowerCase() === 'superadmin';
                    const isActive = emp.isActive !== false;
                    const roleLabel = isSuperadmin
                      ? 'Superadmin'
                      : emp.role === 'kasir'
                      ? 'Kasir'
                      : 'Stocker';

                    return (
                      <tr
                        key={rowKey}
                        className={`transition-colors group ${
                          isActive ? 'hover:bg-[#FAFAFA]' : 'bg-zinc-50/70 opacity-80'
                        }`}
                      >
                        <td className="p-4 pl-6 font-mono text-xs font-bold text-[#52525B]">
                          {index + 1}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                                isActive
                                  ? 'bg-[#FAFAFA] border-zinc-200 text-[#141414]'
                                  : 'bg-zinc-100 border-zinc-200 text-zinc-400'
                              }`}
                            >
                              <UserCog size={18} />
                            </div>
                            <div>
                              <p className="font-extrabold text-[#141414] text-sm">
                                {emp.fullName || emp.email}
                              </p>
                              <p className="text-[11px] font-mono text-[#52525B]">{emp.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 space-y-1">
                          <span
                            className={`px-2.5 py-0.5 rounded-lg font-mono text-[11px] font-bold inline-flex items-center gap-1.5 ${
                              isSuperadmin
                                ? 'bg-[#141414] text-[#F59E0B] border border-[#141414]'
                                : emp.role === 'kasir'
                                ? 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]'
                                : 'bg-[#FAFAFA] text-[#141414] border border-zinc-200'
                            }`}
                          >
                            <Briefcase size={12} />
                            {roleLabel}
                          </span>
                          <p className="text-[11px] text-[#52525B] font-medium flex items-center gap-1">
                            <MapPin size={11} className="text-zinc-400" />
                            {emp.outletName || 'Cabang Utama - Makassar'}
                          </p>
                        </td>
                        <td className="p-4">
                          {isActive ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-[10px] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> AKTIF
                            </span>
                          ) : (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 border border-zinc-300 text-zinc-600 font-mono text-[10px] font-bold">
                                NONAKTIF / RESIGN
                              </span>
                              {emp.deactivatedReason && (
                                <p className="text-[10px] text-[#52525B] max-w-[180px] truncate">
                                  {emp.deactivatedReason}
                                </p>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-right pr-6">
                          {isSuperadmin ? (
                            <span
                              title="Akun Superadmin tidak dapat dinonaktifkan atau dihapus"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAFAFA] border border-zinc-200 font-mono text-[10px] font-bold text-[#52525B] ml-auto select-none"
                            >
                              <Lock size={11} className="text-[#D97706]" /> Dilindungi
                            </span>
                          ) : (
                            <div className="inline-flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setStatusReason('');
                                  setStatusModalEmp(emp);
                                }}
                                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                                  isActive
                                    ? 'bg-[#FEF3C7] hover:bg-[#FDE68A] border-[#FDE68A] text-[#B45309]'
                                    : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700'
                                }`}
                                title={
                                  isActive
                                    ? 'Nonaktifkan akun tanpa menghapus riwayat audit'
                                    : 'Aktifkan kembali akun karyawan'
                                }
                              >
                                {isActive ? <UserX size={13} /> : <UserCheck size={13} />}
                                {isActive ? 'Nonaktifkan' : 'Aktifkan'}
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setDeleteError(null);
                                  setConfirmDeleteEmp(emp);
                                }}
                                disabled={isRowDeleting}
                                className="w-8 h-8 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
                                title="Hapus Permanen"
                              >
                                {isRowDeleting ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <Trash2 size={14} />
                                )}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
                {!isLoading && filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-[#52525B] text-sm font-medium">
                      Tidak ada karyawan yang sesuai filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAFAFA] border-b border-zinc-200 font-mono text-[10px] font-bold text-[#52525B] uppercase tracking-wider">
                  <th className="p-4 pl-6">Nama Karyawan</th>
                  <th className="p-4">Role &amp; Outlet</th>
                  <th className="p-4">Perangkat / Browser</th>
                  <th className="p-4">Login → Logout</th>
                  <th className="p-4 text-right pr-6">Status Sesi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs">
                {filteredSessions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-[#52525B] font-medium">
                      Belum ada riwayat sesi login/logout karyawan yang tercatat.
                    </td>
                  </tr>
                ) : (
                  filteredSessions.map((ses) => (
                    <tr key={ses.id} className="hover:bg-[#FAFAFA]">
                      <td className="p-4 pl-6">
                        <p className="font-extrabold text-[#141414]">{ses.fullName}</p>
                        <p className="text-[11px] font-mono text-[#52525B]">{ses.email}</p>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                            ses.role === 'kasir'
                              ? 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]'
                              : 'bg-[#FAFAFA] text-[#141414] border-zinc-200'
                          }`}
                        >
                          {ses.role === 'kasir'
                            ? 'Kasir'
                            : ses.role === 'stocker'
                            ? 'Stocker'
                            : 'Superadmin'}
                        </span>
                        <span className="block text-[11px] text-[#52525B] mt-1">
                          {ses.outletName}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-[11px] text-[#141414]">
                        <span className="inline-flex items-center gap-1.5">
                          <Monitor size={13} className="text-[#D97706]" />
                          {ses.deviceInfo}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-[11px] text-[#52525B]">
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} className="text-zinc-400" />
                          <span>{formatDateTime(ses.loginAt)}</span>
                        </div>
                        <div className="text-[10px] text-zinc-400 mt-0.5">
                          Logout: {ses.logoutAt ? formatDateTime(ses.logoutAt) : 'Masih Aktif'}
                        </div>
                      </td>
                      <td className="p-4 text-right pr-6">
                        <span
                          className={`inline-block font-mono text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
                            ses.sessionStatus === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : ses.sessionStatus === 'blocked_inactive'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-zinc-100 text-[#52525B] border-zinc-200'
                          }`}
                        >
                          {ses.sessionStatus === 'active'
                            ? 'SEDANG AKTIF'
                            : ses.sessionStatus === 'blocked_inactive'
                            ? 'DITOLAK (NONAKTIF)'
                            : 'LOGOUT'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL NONAKTIFKAN / AKTIFKAN KARYAWAN (ARSIp AUDIT AMAN) */}
      <AnimatePresence>
        {statusModalEmp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setStatusModalEmp(null)}
              className="fixed inset-0 bg-zinc-950/50 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="relative w-full max-w-md bg-white rounded-2xl p-6 border border-zinc-200 shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] text-[#B45309] flex items-center justify-center shrink-0">
                  {statusModalEmp.isActive === false ? <UserCheck size={18} /> : <UserX size={18} />}
                </div>
                <div>
                  <h3 className="font-extrabold text-[#141414] text-base">
                    {statusModalEmp.isActive === false
                      ? `Aktifkan Kembali "${statusModalEmp.fullName}"?`
                      : `Nonaktifkan Akun "${statusModalEmp.fullName}"?`}
                  </h3>
                  <p className="text-xs text-[#52525B] mt-1 leading-relaxed">
                    {statusModalEmp.isActive === false
                      ? 'Karyawan akan diizinkan kembali masuk menggunakan akun pribadinya.'
                      : 'Karyawan tidak dapat lagi login, namun seluruh riwayat transaksi POS dan mutasi stok atas nama karyawan ini tetap terjaga di Audit Trail.'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleConfirmToggleStatus} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#141414] mb-1">
                    Alasan / Catatan Status <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      statusModalEmp.isActive === false
                        ? 'Contoh: Kembali bertugas di shift kasir'
                        : 'Contoh: Karyawan resign / mutasi cabang'
                    }
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value)}
                    className="w-full bg-[#FAFAFA] border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#141414] focus:outline-none focus:border-[#F59E0B]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setStatusModalEmp(null)}
                    className="px-4 py-2.5 rounded-xl bg-white border border-zinc-200 text-xs font-bold text-[#52525B] cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#141414] text-xs font-extrabold cursor-pointer"
                  >
                    {statusModalEmp.isActive === false ? 'Aktifkan Akun' : 'Nonaktifkan Akun'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL KONFIRMASI HAPUS AKUN */}
      <AnimatePresence>
        {confirmDeleteEmp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !deletingId && setConfirmDeleteEmp(null)}
              className="fixed inset-0 bg-zinc-950/50 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-md bg-white rounded-2xl p-6 border border-zinc-200 shadow-2xl z-10 space-y-5"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-extrabold text-[#141414] text-base">
                    Cabut Akses &amp; Hapus Akun?
                  </h3>
                  <p className="text-xs text-[#52525B] font-medium leading-relaxed">
                    Untuk karyawan resign/mutasi, disarankan gunakan tombol{' '}
                    <strong>Nonaktifkan</strong>. Menghapus permanen{' '}
                    <strong className="text-[#141414]">
                      {confirmDeleteEmp.fullName} ({confirmDeleteEmp.email})
                    </strong>{' '}
                    akan menghapus kredensial role dari daftar aktif.
                  </p>
                </div>
              </div>

              {deleteError && deleteError.email === confirmDeleteEmp.email && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 space-y-2.5">
                  <p className="text-xs font-bold text-red-800 leading-relaxed">
                    {deleteError.message}
                  </p>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] font-bold uppercase text-red-700">
                        SQL Editor Supabase
                      </span>
                      <button
                        type="button"
                        onClick={handleCopySql}
                        className="font-mono text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[#141414] text-white inline-flex items-center gap-1 cursor-pointer"
                      >
                        {copiedSql ? (
                          <Check size={11} className="text-[#F59E0B]" />
                        ) : (
                          <Copy size={11} />
                        )}
                        {copiedSql ? 'Tersalin' : 'Salin SQL'}
                      </button>
                    </div>
                    <pre className="font-mono text-[10px] text-[#141414] bg-white border border-red-200 rounded-lg p-2 overflow-x-auto select-all">
                      {RLS_DELETE_SQL}
                    </pre>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  disabled={Boolean(deletingId)}
                  onClick={() => setConfirmDeleteEmp(null)}
                  className="px-4 py-2.5 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-100 text-xs font-bold text-[#52525B] cursor-pointer transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={Boolean(deletingId)}
                  onClick={handleConfirmDelete}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold inline-flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-60"
                >
                  {deletingId ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Menghapus...
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} /> Hapus Permanen
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL TAMBAH KARYAWAN (WAJIB NAMA LENGKAP PRIBADI, TANPA ID EMPLOYEE) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-zinc-950/50 backdrop-blur-sm cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white w-full max-w-lg sm:rounded-[2rem] rounded-t-[2rem] shadow-2xl border border-zinc-200/80 relative z-10 flex flex-col max-h-[90vh] overflow-hidden"
            >
              {/* Header Modal */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 bg-white shrink-0">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] text-[#B45309] flex items-center justify-center shadow-sm">
                    <Users size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-zinc-900 text-lg tracking-tight">
                      Tambah Akun Karyawan Pribadi
                    </h3>
                    <p className="text-xs font-medium text-zinc-500 mt-0.5">
                      Kebijakan 1 akun = 1 karyawan (wajib nama lengkap, tanpa ID employee).
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddEmployee} className="flex flex-col flex-1 overflow-hidden">
                <div className="overflow-y-auto p-6 space-y-4 flex-1">
                  {errorMessage && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold p-3.5 rounded-xl">
                      {errorMessage}
                    </div>
                  )}

                  <div className="bg-[#FEF3C7]/70 border border-[#FDE68A] rounded-xl p-3 text-[11px] text-[#78350F] font-semibold">
                    Dilarang membuat akun bersama (seperti &ldquo;Kasir 1&rdquo; atau &ldquo;Stocker Gudang&rdquo;). Gunakan nama lengkap karyawan yang bertanggung jawab.
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 mb-1.5">
                      Nama Lengkap Karyawan <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <User
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Siti Rahmawati"
                        value={newEmployee.fullName}
                        onChange={(e) =>
                          setNewEmployee({ ...newEmployee, fullName: e.target.value })
                        }
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 pl-11 text-sm text-zinc-900 font-bold placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 mb-1.5">
                      Email Login Pribadi <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <Mail
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
                      />
                      <input
                        type="email"
                        required
                        placeholder="siti.rahma@toko.com"
                        value={newEmployee.email}
                        onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 pl-11 text-sm text-zinc-900 font-bold placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-600 mb-1.5">
                        Kata Sandi <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <Lock
                          size={16}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
                        />
                        <input
                          type="text"
                          required
                          placeholder="Minimal 6 karakter"
                          value={newEmployee.password}
                          onChange={(e) =>
                            setNewEmployee({ ...newEmployee, password: e.target.value })
                          }
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 pl-11 text-sm text-zinc-900 font-bold placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-600 mb-1.5">
                        Penempatan Outlet
                      </label>
                      <select
                        value={newEmployee.outletName}
                        onChange={(e) =>
                          setNewEmployee({ ...newEmployee, outletName: e.target.value })
                        }
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-3 text-xs text-zinc-900 font-bold focus:outline-none focus:bg-white focus:border-[#F59E0B]"
                      >
                        {OUTLET_OPTIONS.map((out) => (
                          <option key={out} value={out}>
                            {out}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 mb-2">
                      Pilih Jabatan (Hak Akses Sistem)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setNewEmployee({ ...newEmployee, role: 'kasir' })}
                        className={`p-4 rounded-2xl border text-xs font-extrabold transition-all flex flex-col items-center gap-2 cursor-pointer ${
                          newEmployee.role === 'kasir'
                            ? 'bg-[#FEF3C7] border-[#F59E0B] text-[#B45309] ring-2 ring-[#F59E0B]/20'
                            : 'bg-[#FAFAFA] border-zinc-200 text-[#52525B] hover:bg-zinc-100'
                        }`}
                      >
                        <Store
                          size={22}
                          className={
                            newEmployee.role === 'kasir' ? 'text-[#D97706]' : 'text-zinc-400'
                          }
                        />
                        <span>Kasir POS</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (isStarter) {
                            setErrorMessage(
                              'Jabatan Stocker Gudang memerlukan Paket Pro / Business.'
                            );
                            return;
                          }
                          setNewEmployee({ ...newEmployee, role: 'stocker' });
                        }}
                        className={`p-4 rounded-2xl border text-xs font-extrabold transition-all flex flex-col items-center gap-2 cursor-pointer relative ${
                          newEmployee.role === 'stocker'
                            ? 'bg-[#FEF3C7] border-[#F59E0B] text-[#B45309] ring-2 ring-[#F59E0B]/20'
                            : 'bg-[#FAFAFA] border-zinc-200 text-[#52525B] hover:bg-zinc-100'
                        }`}
                      >
                        {isStarter && (
                          <span className="absolute top-2 right-2 bg-[#141414] text-[#F59E0B] text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Lock size={9} /> PRO
                          </span>
                        )}
                        <Package
                          size={22}
                          className={
                            newEmployee.role === 'stocker' ? 'text-[#D97706]' : 'text-zinc-400'
                          }
                        />
                        <span>Stocker Gudang</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer Modal */}
                <div className="px-6 py-4 bg-[#FAFAFA] border-t border-zinc-200 flex items-center justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-3 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-100 text-xs font-bold text-[#52525B] transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#141414] text-xs font-extrabold shadow-sm inline-flex items-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Memproses...' : 'Simpan & Daftarkan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
