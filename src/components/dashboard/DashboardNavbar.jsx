import { useState } from 'react';
import {
  Store,
  Package,
  Bell,
  BarChart3,
  UtensilsCrossed,
  ArrowLeft,
  QrCode,
  Menu,
  X,
  Users,
  Lock,
  SlidersHorizontal,
  Sparkles,
  CalendarRange,
  ClipboardList
} from 'lucide-react';

export default function DashboardNavbar({
  activeTab,
  setActiveTab,
  alertCount,
  lowStockCount = 0,
  retailLowStockCount = 0,
  businessType = 'fnb',
  fnbServiceMode = 'dine_in_take_away',
  onBackToLanding,
  userRole = 'superadmin',
  isSimulationMode = false,
  canSwitchRole = false,
  onSwitchRole,
  subscriptionPlan = 'pro',
  setSubscriptionPlan
}) {
  const [isOpen, setIsOpen] = useState(false);
  const isStarter = subscriptionPlan === 'starter';
  const isTakeAwayOnlyFnb = businessType === 'fnb' && fnbServiceMode === 'take_away_only';

  const navSections = [
    {
      title: 'Operasional',
      items: [
        {
          id: 'pos',
          label: businessType === 'retail' ? 'Kasir Toko Ritel' : 'Kasir (POS)',
          icon: Store
        },
        {
          id: 'self-order',
          label: 'Pesan dari Meja (QR)',
          icon: QrCode,
          proOnly: true
        },
        {
          id: 'menu-management',
          label: businessType === 'retail' ? 'Daftar Produk & Kulakan' : 'Daftar Menu & Resep',
          icon: UtensilsCrossed,
          count: businessType === 'retail' && !isStarter ? retailLowStockCount : 0
        }
      ]
    },
    {
      title: 'Gudang & Stok',
      items: [
        {
          id: 'inventory',
          label: businessType === 'retail' ? 'Stok Gudang Tambahan' : 'Stok Bahan Gudang',
          icon: Package,
          count: isStarter ? 0 : lowStockCount,
          proOnly: true
        },
        {
          id: 'alerts',
          label: 'Peringatan Bahan',
          icon: Bell,
          count: isStarter ? 0 : alertCount,
          proOnly: true
        },
        {
          id: 'seasonal-analytics',
          label: 'Jadwal Musiman & Stok',
          icon: CalendarRange,
          proOnly: true
        }
      ]
    },
    {
      title: 'Analitik & Tim',
      items: [
        {
          id: 'reporting',
          label: 'Laporan Penjualan',
          icon: BarChart3
        },
        {
          id: 'profitability',
          label: 'Analisis Untung & AI',
          icon: Sparkles,
          proOnly: true
        },
        {
          id: 'employees',
          label: 'Daftar Karyawan',
          icon: Users
        },
        {
          id: 'audit-trail',
          label: 'Catatan Aktivitas',
          icon: ClipboardList,
          proOnly: true
        }
      ]
    }
  ];

  // Filter item per section berdasarkan jabatan karyawan & model layanan F&B
  const visibleSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (isTakeAwayOnlyFnb && item.id === 'self-order') return false;
        if (userRole === 'superadmin') return true;
        if (userRole === 'kasir') return ['pos', 'menu-management'].includes(item.id);
        if (userRole === 'stocker') return ['inventory', 'alerts'].includes(item.id);
        return false;
      })
    }))
    .filter((section) => section.items.length > 0);

  const planLabels = {
    starter: { name: 'Starter', desc: 'Kasir & Menu Dasar' },
    pro: { name: 'Pro / Business', desc: 'Stok Resep Otomatis' },
    enterprise: { name: 'Enterprise', desc: 'Banyak Cabang' }
  };

  const roleLabels = {
    superadmin: { label: 'Admin', badge: 'Semua Akses' },
    kasir: { label: 'Kasir', badge: 'POS & Menu' },
    stocker: { label: 'Stocker', badge: 'Gudang' }
  };

  return (
    <>
      {/* Top Mobile Bar & Hamburger Button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-zinc-200 px-4 flex items-center justify-between z-30 shadow-sm">
        <div className="flex items-center gap-2.5">
          <img src="/logo-stocko.png" alt="Stocko Logo" className="w-8 h-8 object-contain" />
          <span className="font-extrabold text-base text-[#141414] tracking-tight">
            Stocko<span className="text-[#F59E0B]">.</span>
          </span>
          <span className="font-mono text-[10px] font-bold uppercase bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] px-2 py-0.5 rounded-full">
            {planLabels[subscriptionPlan]?.name}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-11 h-11 bg-[#FAFAFA] hover:bg-zinc-100 border border-zinc-200 rounded-xl flex items-center justify-center text-[#141414] cursor-pointer active:scale-95 transition-all"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Backdrop Overlay Gelap di Mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-zinc-950/40 z-40 transition-opacity"
        />
      )}

      {/* Sidebar Utama */}
      <aside
        className={`w-72 bg-white border-r border-[#E5E5E5] flex flex-col justify-between p-4 shrink-0 fixed top-0 left-0 h-screen z-50 select-none transition-transform duration-300 ease-in-out overflow-y-auto hide-scrollbar ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-4">
          {/* Brand Header (Desktop & Mobile Drawer) */}
          <div className="flex items-center justify-between px-1.5 pt-0.5 pb-3 border-b border-zinc-100">
            <div className="flex items-center gap-2.5 min-w-0">
              <img src="/logo-stocko.png" alt="Stocko Logo" className="w-9 h-9 object-contain shrink-0" />
              <div className="min-w-0">
                <span className="font-extrabold text-lg text-[#141414] tracking-tight block leading-none">
                  Stocko<span className="text-[#F59E0B]">.</span>
                </span>
                <span className="font-mono text-[10px] font-medium text-[#52525B] mt-1 block truncate">
                  {planLabels[subscriptionPlan]?.desc}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="lg:hidden w-8 h-8 rounded-lg border border-zinc-200 bg-[#FAFAFA] flex items-center justify-center text-[#52525B] hover:text-[#141414] cursor-pointer"
              aria-label="Tutup Menu"
            >
              <X size={16} />
            </button>
          </div>

          {/* Simulasi Switcher Role (HANYA MODE SIMULASI) */}
          {isSimulationMode && canSwitchRole && onSwitchRole && (
            <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-2xl p-3 space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#52525B] flex items-center gap-1.5">
                  <Users size={12} className="text-[#D97706]" /> Tampilan Role
                </span>
                <span className="text-[9px] font-bold text-[#B45309] bg-[#FEF3C7] border border-[#FDE68A] px-2 py-0.5 rounded-full">
                  Simulasi
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 bg-zinc-200/70 p-1 rounded-xl">
                {[
                  { id: 'superadmin', label: 'Admin' },
                  { id: 'kasir', label: 'Kasir' },
                  { id: 'stocker', label: 'Stocker', lockedInStarter: isStarter }
                ].map((r) => {
                  const active = userRole === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        onSwitchRole(r.id);
                        setIsOpen(false);
                      }}
                      title={
                        r.lockedInStarter
                          ? 'Role Stocker tersedia di Paket Pro & Enterprise'
                          : undefined
                      }
                      className={`py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer inline-flex items-center justify-center gap-1 ${
                        r.lockedInStarter
                          ? 'text-zinc-400 hover:text-[#141414]'
                          : active
                          ? 'bg-[#141414] text-[#F59E0B] shadow-sm'
                          : 'text-[#52525B] hover:text-[#141414]'
                      }`}
                    >
                      {r.lockedInStarter && <Lock size={9} />}
                      <span>{r.label}</span>
                    </button>
                  );
                })}
              </div>
              {isStarter && (
                <p className="text-[10px] text-[#52525B] font-medium px-1 leading-snug">
                  Paket Starter khusus <strong>Admin &amp; Kasir</strong>. Role Stocker terbuka di Paket Pro.
                </p>
              )}
            </div>
          )}

          {/* Simulasi Switcher Paket Langganan (HANYA MODE SIMULASI) */}
          {isSimulationMode && setSubscriptionPlan && (
            <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-2xl p-3 space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#52525B] flex items-center gap-1.5">
                  <SlidersHorizontal size={12} className="text-[#D97706]" /> Paket Aktif
                </span>
                <span className="text-[9px] font-bold text-[#B45309] bg-[#FEF3C7] border border-[#FDE68A] px-2 py-0.5 rounded-full">
                  Simulasi
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 bg-zinc-200/70 p-1 rounded-xl">
                {[
                  { id: 'starter', label: 'Starter' },
                  { id: 'pro', label: 'Pro' },
                  { id: 'enterprise', label: 'Enterprise' }
                ].map((p) => {
                  const active = subscriptionPlan === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSubscriptionPlan(p.id)}
                      className={`py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        active
                          ? 'bg-[#141414] text-[#F59E0B] shadow-sm'
                          : 'text-[#52525B] hover:text-[#141414]'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Ringkasan Paket Langganan Ringkas (KHUSUS AKUN ASLI / TERDAFTAR) */}
          {!isSimulationMode && (
            <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#52525B]">
                Paket Aktif
              </span>
              <span className="font-mono text-[10px] font-extrabold uppercase bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] px-2.5 py-0.5 rounded-full shrink-0">
                {planLabels[subscriptionPlan]?.name || subscriptionPlan}
              </span>
            </div>
          )}

          {/* Navigasi Menu Terstruktur per Kategori */}
          <nav className="space-y-4 pt-0.5" aria-label="Menu Utama">
            {visibleSections.map((section) => (
              <div key={section.title} className="space-y-1">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400 px-3 pb-1">
                  {section.title}
                </p>

                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  const isLocked = isStarter && item.proOnly;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      title={item.label}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsOpen(false);
                      }}
                      className={`w-full group px-3 py-2 rounded-xl text-[13px] text-left transition-all duration-200 flex items-center justify-between gap-2 cursor-pointer relative active:scale-[0.98] ${
                        isActive
                          ? 'bg-[#141414] text-white font-bold shadow-sm'
                          : 'text-[#52525B] hover:text-[#141414] hover:bg-[#FAFAFA] font-semibold'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div
                          className={`shrink-0 transition-colors ${
                            isActive ? 'text-[#F59E0B]' : 'text-zinc-400 group-hover:text-[#141414]'
                          }`}
                        >
                          <Icon size={16} strokeWidth={isActive ? 2.4 : 2} />
                        </div>
                        <span
                          className={`tracking-tight truncate leading-snug ${
                            isLocked && !isActive ? 'opacity-70' : ''
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>

                      {(isLocked || item.count > 0) && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          {isLocked ? (
                            <span
                              className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-md inline-flex items-center gap-0.5 border ${
                                isActive
                                  ? 'bg-zinc-800 text-zinc-300 border-zinc-700'
                                  : 'bg-zinc-100 text-zinc-500 border-zinc-200'
                              }`}
                            >
                              <Lock size={9} /> PRO
                            </span>
                          ) : (
                            item.count > 0 && (
                              <span className="bg-red-600 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1.5 rounded-full flex items-center justify-center">
                                {item.count}
                              </span>
                            )
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Bagian Bawah: Info Sesi Aktif & Tombol Keluar / Beranda */}
        <div className="pt-3.5 border-t border-[#E5E5E5] mt-4 space-y-2.5">
          <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#52525B] block">
                Sesi Aktif
              </span>
              <span className="text-xs font-extrabold text-[#141414] block truncate">
                {roleLabels[userRole]?.label || userRole}
              </span>
            </div>
            <span className="font-mono text-[9px] font-bold uppercase bg-white border border-[#E5E5E5] text-[#52525B] px-2 py-0.5 rounded-md shrink-0">
              {roleLabels[userRole]?.badge || 'Staff'}
            </span>
          </div>

          <button
            type="button"
            onClick={onBackToLanding}
            className="w-full group bg-white hover:bg-[#141414] text-[#141414] hover:text-white py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer border border-[#E5E5E5]"
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
            <span>Keluar ke Beranda</span>
          </button>
        </div>
      </aside>
    </>
  );
}
