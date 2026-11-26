import { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Search,
  Calendar,
  UserCheck,
  Filter,
  ArrowRight,
  AlertTriangle,
  Package,
  ClipboardList,
  Briefcase,
  RefreshCw
} from 'lucide-react';

const ACTION_BADGES = {
  'Stock In': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Stock Out': 'bg-sky-50 text-sky-700 border-sky-200',
  'Manual Adjustment': 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]',
  'Price Update': 'bg-zinc-100 text-[#141414] border-zinc-200',
  'Order Void/Cancelled': 'bg-red-50 text-red-700 border-red-200',
  'Order Modified': 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]',
  'Account Status': 'bg-[#141414] text-[#F59E0B] border-[#141414]'
};

const MOVEMENT_BADGES = {
  STOCK_IN: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  BOM_SALE: 'bg-sky-50 text-sky-700 border-sky-200',
  MANUAL_ADJUSTMENT: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]',
  WASTE_LOSS: 'bg-red-50 text-red-700 border-red-200',
  RESTOCK_REVERSAL: 'bg-zinc-100 text-[#141414] border-zinc-200'
};

function getRoleBadgeMeta(role) {
  const r = String(role || '').toLowerCase();
  if (r === 'kasir' || r === 'cashier') {
    return {
      label: 'Kasir',
      className: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]'
    };
  }
  if (r === 'stocker') {
    return {
      label: 'Stocker',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    };
  }
  return {
    label: 'Superadmin',
    className: 'bg-[#141414] text-[#F59E0B] border-[#141414]'
  };
}

function matchesRoleFilter(rowRole, selectedRole) {
  if (selectedRole === 'Semua') return true;
  const r = String(rowRole || '').toLowerCase();
  if (selectedRole === 'kasir') return r === 'kasir' || r === 'cashier';
  return r === selectedRole.toLowerCase();
}

export default function AuditTrailModule({
  auditLogs = [],
  stockMovements = [],
  staffProfiles = [],
  onRefresh,
  isRefreshing = false
}) {
  const [activeSubTab, setActiveSubTab] = useState('audit'); // 'audit' | 'movements'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedOperator, setSelectedOperator] = useState('Semua');
  const [selectedRole, setSelectedRole] = useState('Semua');
  const [selectedAction, setSelectedAction] = useState('Semua');

  const operatorOptions = useMemo(() => {
    const names = new Set();
    staffProfiles.forEach((emp) => emp.fullName && names.add(emp.fullName));
    auditLogs.forEach((l) => {
      if (l.userName) names.add(l.userName);
      if (l.cashierName) names.add(l.cashierName);
      if (l.stockerName) names.add(l.stockerName);
    });
    stockMovements.forEach((m) => {
      if (m.userName) names.add(m.userName);
      if (m.cashierName) names.add(m.cashierName);
      if (m.stockerName) names.add(m.stockerName);
    });
    return ['Semua', ...Array.from(names).sort((a, b) => a.localeCompare(b))];
  }, [auditLogs, stockMovements, staffProfiles]);

  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const q = searchQuery.toLowerCase();
      const actorDisplay = log.cashierName || log.stockerName || log.userName || '';
      const matchSearch =
        !q ||
        (log.entityName || '').toLowerCase().includes(q) ||
        (log.reason || '').toLowerCase().includes(q) ||
        actorDisplay.toLowerCase().includes(q) ||
        (log.userName || '').toLowerCase().includes(q);

      const matchOperator =
        selectedOperator === 'Semua' ||
        log.userName === selectedOperator ||
        log.cashierName === selectedOperator ||
        log.stockerName === selectedOperator;
      const matchRole = matchesRoleFilter(log.role, selectedRole);
      const matchAction = selectedAction === 'Semua' || log.actionType === selectedAction;

      let matchDate = true;
      if (selectedDate && log.createdAt) {
        const dt = new Date(log.createdAt);
        const iso = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
          .toISOString()
          .split('T')[0];
        matchDate = iso === selectedDate;
      }

      return matchSearch && matchOperator && matchRole && matchAction && matchDate;
    });
  }, [auditLogs, searchQuery, selectedOperator, selectedRole, selectedAction, selectedDate]);

  const filteredMovements = useMemo(() => {
    return stockMovements.filter((mv) => {
      const q = searchQuery.toLowerCase();
      const actorDisplay = mv.stockerName || mv.cashierName || mv.userName || '';
      const matchSearch =
        !q ||
        (mv.ingredientName || '').toLowerCase().includes(q) ||
        (mv.reason || '').toLowerCase().includes(q) ||
        actorDisplay.toLowerCase().includes(q) ||
        (mv.userName || '').toLowerCase().includes(q);

      const matchOperator =
        selectedOperator === 'Semua' ||
        mv.userName === selectedOperator ||
        mv.stockerName === selectedOperator ||
        mv.cashierName === selectedOperator;
      const matchRole = matchesRoleFilter(mv.role, selectedRole);

      let matchDate = true;
      if (selectedDate && mv.createdAt) {
        const dt = new Date(mv.createdAt);
        const iso = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
          .toISOString()
          .split('T')[0];
        matchDate = iso === selectedDate;
      }

      return matchSearch && matchOperator && matchRole && matchDate;
    });
  }, [stockMovements, searchQuery, selectedOperator, selectedRole, selectedDate]);

  const stats = useMemo(() => {
    const manualAdjCount = auditLogs.filter((l) => l.actionType === 'Manual Adjustment').length;
    const voidOrEditCount = auditLogs.filter(
      (l) => l.actionType === 'Order Void/Cancelled' || l.actionType === 'Order Modified'
    ).length;
    const totalWasteValue = stockMovements
      .filter((m) => m.movementType === 'WASTE_LOSS')
      .reduce((sum, m) => sum + (Number(m.costImpact) || 0), 0);
    return {
      totalLogs: auditLogs.length,
      manualAdjCount,
      voidOrEditCount,
      totalWasteValue
    };
  }, [auditLogs, stockMovements]);

  const formatTimestamp = (ts) => {
    if (!ts) return '-';
    return new Date(ts).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 pb-5 border-b border-zinc-200">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#141414]">
            Catatan Aktivitas &amp; Riwayat
          </h1>
          <p className="text-[#52525B] text-[13px] font-medium mt-1">
            Pantau setiap transaksi kasir, keluar-masuk stok gudang, revisi nota, dan pembatalan lengkap dengan <strong>nama lengkap petugasnya</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="bg-white hover:bg-zinc-100 border border-zinc-200 text-[#141414] font-bold text-xs px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-60"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              Muat Ulang
            </button>
          )}
          <div className="flex items-center bg-zinc-200/70 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveSubTab('audit')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-all ${
              activeSubTab === 'audit'
                ? 'bg-[#141414] text-[#F59E0B] shadow-sm'
                : 'text-[#52525B] hover:text-[#141414]'
            }`}
          >
            <ClipboardList size={14} /> Audit Aktivitas ({filteredAuditLogs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('movements')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-all ${
              activeSubTab === 'movements'
                ? 'bg-[#141414] text-[#F59E0B] shadow-sm'
                : 'text-[#52525B] hover:text-[#141414]'
            }`}
          >
            <Package size={14} /> Stock Movements ({filteredMovements.length})
          </button>
          </div>
        </div>
      </div>

      {/* KPI Ringkas Akuntabilitas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#52525B]">
            Total Jejak Audit
          </p>
          <p className="text-2xl font-extrabold font-mono text-[#141414] mt-1.5">
            {stats.totalLogs}
          </p>
          <p className="text-[11px] text-[#52525B] font-medium mt-1">
            Terekam atas nama karyawan pribadi
          </p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#52525B]">
            Penyesuaian Manual (Opname)
          </p>
          <p className="text-2xl font-extrabold font-mono text-[#B45309] mt-1.5">
            {stats.manualAdjCount}
          </p>
          <p className="text-[11px] text-[#52525B] font-medium mt-1">
            Perubahan stok fisik dengan catatan alasan
          </p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#52525B]">
            Nota Coret &amp; Pembatalan
          </p>
          <p className="text-2xl font-extrabold font-mono text-[#141414] mt-1.5">
            {stats.voidOrEditCount}
          </p>
          <p className="text-[11px] text-[#52525B] font-medium mt-1">
            Revisi item transparan &amp; void kasir
          </p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#52525B]">
            Nilai Waste Pasca-Produksi
          </p>
          <p className="text-2xl font-extrabold font-mono text-red-600 mt-1.5">
            Rp {stats.totalWasteValue.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-[#52525B] font-medium mt-1">
            Akumulasi biaya HPP bahan terpakai yang batal
          </p>
        </div>
      </div>

      {/* Filter Bar Berdasarkan Nama Karyawan, Role, Jenis Aktivitas, Tanggal */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Cari nama karyawan, bahan, menu, atau alasan audit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FAFAFA] border border-zinc-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-[#141414] focus:outline-none focus:bg-white focus:border-[#F59E0B]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-[#FAFAFA] border border-zinc-200 rounded-xl px-3 py-2">
              <UserCheck size={14} className="text-[#D97706]" />
              <select
                value={selectedOperator}
                onChange={(e) => setSelectedOperator(e.target.value)}
                className="bg-transparent text-xs font-bold text-[#141414] focus:outline-none cursor-pointer"
              >
                {operatorOptions.map((op) => (
                  <option key={op} value={op}>
                    {op === 'Semua' ? 'Semua Karyawan' : op}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-[#FAFAFA] border border-zinc-200 rounded-xl px-3 py-2">
              <Briefcase size={14} className="text-zinc-400" />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="bg-transparent text-xs font-bold text-[#141414] focus:outline-none cursor-pointer"
              >
                <option value="Semua">Semua Role</option>
                <option value="kasir">Kasir</option>
                <option value="stocker">Stocker</option>
                <option value="superadmin">Superadmin</option>
              </select>
            </div>

            {activeSubTab === 'audit' && (
              <div className="flex items-center gap-1.5 bg-[#FAFAFA] border border-zinc-200 rounded-xl px-3 py-2">
                <Filter size={14} className="text-zinc-400" />
                <select
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value)}
                  className="bg-transparent text-xs font-bold text-[#141414] focus:outline-none cursor-pointer"
                >
                  <option value="Semua">Semua Aktivitas</option>
                  <option value="Stock In">Stock In</option>
                  <option value="Stock Out">Stock Out</option>
                  <option value="Manual Adjustment">Manual Adjustment</option>
                  <option value="Price Update">Price Update</option>
                  <option value="Order Modified">Order Modified (Nota Coret)</option>
                  <option value="Order Void/Cancelled">Order Void/Cancelled</option>
                  <option value="Account Status">Status Akun Karyawan</option>
                </select>
              </div>
            )}

            <div className="flex items-center gap-1.5 bg-[#FAFAFA] border border-zinc-200 rounded-xl px-3 py-2">
              <Calendar size={14} className="text-zinc-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-[#141414] focus:outline-none cursor-pointer"
              />
              {selectedDate && (
                <button
                  type="button"
                  onClick={() => setSelectedDate('')}
                  className="text-[10px] font-bold text-red-600 hover:underline ml-1 cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabel Data */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
        {activeSubTab === 'audit' ? (
          filteredAuditLogs.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <ShieldCheck size={32} className="mx-auto text-zinc-300" />
              <p className="text-sm font-bold text-[#141414]">Belum ada log aktivitas yang cocok</p>
              <p className="text-xs text-[#52525B]">
                Lakukan transaksi POS, ubah stok opname, revisi nota, atau sesuaikan filter nama karyawan di atas.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 font-mono text-[10px] font-bold uppercase text-[#52525B]">
                    <th className="py-3 px-3">Waktu</th>
                    <th className="py-3 px-3">Nama Karyawan &amp; Role</th>
                    <th className="py-3 px-3">Aktivitas</th>
                    <th className="py-3 px-3">Item / Order</th>
                    <th className="py-3 px-3">Before → After</th>
                    <th className="py-3 px-3">Alasan / Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-xs">
                  {filteredAuditLogs.map((log) => {
                    const roleMeta = getRoleBadgeMeta(log.role);
                    const actorName = log.cashierName || log.stockerName || log.userName;
                    return (
                      <tr key={log.id} className="hover:bg-[#FAFAFA]">
                        <td className="py-3.5 px-3 font-mono text-[11px] text-[#52525B] whitespace-nowrap">
                          {formatTimestamp(log.createdAt)}
                        </td>
                        <td className="py-3.5 px-3">
                          <p className="font-extrabold text-[#141414]">{actorName}</p>
                          <span
                            className={`inline-block font-mono text-[9px] font-bold uppercase border px-2 py-0.5 rounded mt-0.5 ${roleMeta.className}`}
                          >
                            {roleMeta.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-block font-mono text-[10px] font-bold px-2.5 py-1 rounded-lg border whitespace-nowrap ${
                              ACTION_BADGES[log.actionType] ||
                              'bg-zinc-100 text-[#141414] border-zinc-200'
                            }`}
                          >
                            {log.actionType}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 font-bold text-[#141414]">
                          {log.entityName}
                          {log.deltaLabel && (
                            <span className="block font-mono text-[10px] text-[#B45309]">
                              {log.deltaLabel}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 font-mono text-[11px] text-[#141414]">
                          <span className="text-[#52525B]">{log.beforeValue}</span>{' '}
                          <ArrowRight size={11} className="inline text-zinc-400 mx-0.5" />{' '}
                          <span className="font-bold">{log.afterValue}</span>
                        </td>
                        <td className="py-3.5 px-3 text-[#52525B] max-w-xs">{log.reason}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : filteredMovements.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <AlertTriangle size={32} className="mx-auto text-zinc-300" />
            <p className="text-sm font-bold text-[#141414]">Belum ada mutasi stok yang cocok</p>
            <p className="text-xs text-[#52525B]">
              Mutasi stok dari penjualan BOM (Kasir) maupun restock / opname / waste (Stocker) akan tercatat dengan nama karyawan.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 font-mono text-[10px] font-bold uppercase text-[#52525B]">
                  <th className="py-3 px-3">Waktu</th>
                  <th className="py-3 px-3">Bahan Baku</th>
                  <th className="py-3 px-3">Tipe Mutasi</th>
                  <th className="py-3 px-3">Perubahan</th>
                  <th className="py-3 px-3">Dampak Biaya</th>
                  <th className="py-3 px-3">Nama Karyawan &amp; Alasan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs">
                {filteredMovements.map((mv) => {
                  const roleMeta = getRoleBadgeMeta(mv.role);
                  const actorName = mv.stockerName || mv.cashierName || mv.userName;
                  return (
                    <tr key={mv.id} className="hover:bg-[#FAFAFA]">
                      <td className="py-3.5 px-3 font-mono text-[11px] text-[#52525B] whitespace-nowrap">
                        {formatTimestamp(mv.createdAt)}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-[#141414]">{mv.ingredientName}</td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-block font-mono text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
                            MOVEMENT_BADGES[mv.movementType] ||
                            'bg-zinc-100 text-[#141414] border-zinc-200'
                          }`}
                        >
                          {mv.movementType}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold">
                        <span className={mv.qtyChange >= 0 ? 'text-emerald-700' : 'text-red-600'}>
                          {mv.qtyChange >= 0 ? `+${mv.qtyChange}` : mv.qtyChange} {mv.unit}
                        </span>
                        <span className="block text-[10px] font-normal text-[#52525B]">
                          {mv.beforeStock} → {mv.afterStock} {mv.unit}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-[#141414]">
                        {mv.costImpact > 0
                          ? `Rp ${Number(mv.costImpact).toLocaleString('id-ID')}`
                          : '-'}
                      </td>
                      <td className="py-3.5 px-3 text-[#52525B]">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-extrabold text-[#141414]">{actorName}</span>
                          <span
                            className={`inline-block font-mono text-[9px] font-bold uppercase border px-1.5 py-0.5 rounded ${roleMeta.className}`}
                          >
                            {roleMeta.label}
                          </span>
                        </div>
                        {mv.reason && <p className="text-[11px] mt-0.5">{mv.reason}</p>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
