import { useState } from 'react';
import { Store, Package, Bell, BarChart3, UtensilsCrossed, ArrowLeft, QrCode, Menu, X, Users, Lock, SlidersHorizontal } from 'lucide-react';

export default function DashboardNavbar({
  activeTab,
  setActiveTab,
  alertCount,
  onBackToLanding,
  userRole = 'superadmin',
  subscriptionPlan = 'pro',
  setSubscriptionPlan
}) {
  const [isOpen, setIsOpen] = useState(false);
  const isStarter = subscriptionPlan === 'starter';

  const allNavItems = [
    { id: 'pos', label: 'POS Kasir', icon: Store },
    { id: 'self-order', label: 'Pemesanan Mandiri', icon: QrCode, badge: 'Kiosk', proOnly: true },
    { id: 'menu-management', label: 'Kelola Menu', icon: UtensilsCrossed },
    { id: 'inventory', label: 'Stok & BOM Gudang', icon: Package, proOnly: true },
    { id: 'alerts', label: 'Peringatan Khusus', icon: Bell, count: isStarter ? 0 : alertCount, proOnly: true },
    { id: 'employees', label: 'Kelola Karyawan', icon: Users, badge: 'Admin' },
    { id: 'reporting', label: 'Analitik Laporan', icon: BarChart3 },
  ];

  // Logika Penyaring (Filter) Berdasarkan Jabatan Karyawan
  const navItems = allNavItems.filter(item => {
    if (userRole === 'superadmin') return true;
    if (userRole === 'kasir') {
      return ['pos', 'menu-management'].includes(item.id);
    }
    if (userRole === 'stocker') {
      return ['inventory', 'menu-management', 'alerts'].includes(item.id);
    }
    return false;
  });

  if (activeTab === 'self-order' && !isStarter) {
    return null;
  }

  const planLabels = {
    starter: { name: 'Starter', desc: 'Basic POS • Rp79rb' },
    pro: { name: 'Pro / Business', desc: 'Smart BOM • Rp149rb' },
    enterprise: { name: 'Enterprise', desc: 'Multi-Outlet • Rp299rb' }
  };

  const roleLabels = {
    superadmin: { label: 'Pemilik / Superadmin', badge: 'Full Access' },
    kasir: { label: 'Kasir POS', badge: 'Front Office' },
    stocker: { label: 'Stocker Gudang', badge: 'Inventory' }
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
      <aside className={`w-72 bg-white border-r border-zinc-200 flex flex-col justify-between p-5 shrink-0 fixed top-0 left-0 h-screen z-50 select-none transition-transform duration-300 ease-in-out overflow-y-auto hide-scrollbar ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        
        <div className="space-y-5">
          
          {/* Brand Header */}
          <div className="hidden lg:flex items-center justify-between px-2 pt-1 pb-2 border-b border-zinc-100">
            <div className="flex items-center gap-3">
              <img src="/logo-stocko.png" alt="Stocko Logo" className="w-10 h-10 object-contain" />
              <div>
                <span className="font-extrabold text-lg text-[#141414] tracking-tight block leading-none">
                  Stocko<span className="text-[#F59E0B]">.</span>
                </span>
                <span className="font-mono text-[10px] font-semibold text-[#52525B] mt-1 block">
                  {planLabels[subscriptionPlan]?.desc}
                </span>
              </div>
            </div>
            <span className="font-mono text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
              LIVE
            </span>
          </div>

          {/* Simulasi Switcher Paket Langganan */}
          {userRole === 'superadmin' && setSubscriptionPlan && (
            <div className="bg-[#FAFAFA] border border-zinc-200 rounded-2xl p-3 space-y-2 mt-6 lg:mt-0">
              <div className="flex items-center justify-between px-1">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#52525B] flex items-center gap-1.5">
                  <SlidersHorizontal size={12} className="text-[#D97706]" /> Paket Aktif
                </span>
                <span className="font-mono text-[9px] font-bold text-[#B45309] bg-[#FEF3C7] border border-[#FDE68A] px-2 py-0.5 rounded-full">
                  Simulasi
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 bg-zinc-200/70 p-1 rounded-xl">
                {[
                  { id: 'starter', label: 'Starter' },
                  { id: 'pro', label: 'Pro' },
                  { id: 'enterprise', label: 'Enterprise' }
                ].map(p => {
                  const active = subscriptionPlan === p.id;
                  return (
                    <button
                      key={p.id}
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

          {/* Navigasi Menu */}
          <div className="space-y-1 pt-1">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#52525B] px-3 pb-2">
              Menu Operasional
            </p>
            
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isLocked = isStarter && item.proOnly;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full group px-3.5 py-2.5 rounded-xl text-[13px] transition-all duration-200 flex items-center justify-between cursor-pointer relative overflow-hidden active:scale-[0.98] ${
                    isActive 
                      ? 'bg-[#141414] text-white font-bold shadow-sm' 
                      : 'text-[#52525B] hover:text-[#141414] hover:bg-[#FAFAFA] font-semibold'
                  }`}
                >
                  <div className="flex items-center gap-3 relative z-10">
                    <div className={`transition-colors ${
                      isActive ? 'text-[#F59E0B]' : 'text-zinc-400 group-hover:text-[#141414]'
                    }`}>
                      <Icon size={17} strokeWidth={isActive ? 2.4 : 2} />
                    </div>
                    <span className={`tracking-tight ${isLocked && !isActive ? 'opacity-70' : ''}`}>
                      {item.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 relative z-10">
                    {isLocked ? (
                      <span className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-md inline-flex items-center gap-0.5 border ${
                        isActive
                          ? 'bg-zinc-800 text-zinc-300 border-zinc-700'
                          : 'bg-zinc-100 text-zinc-500 border-zinc-200'
                      }`}>
                        <Lock size={9} /> PRO
                      </span>
                    ) : (
                      <>
                        {item.badge && (
                          <span className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-md tracking-wide ${
                            isActive
                              ? 'bg-[#F59E0B] text-[#141414]'
                              : 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                        {item.count > 0 && (
                          <span className="bg-red-600 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
                            {item.count}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bagian Bawah: Info Role & Tombol Keluar / Beranda */}
        <div className="pt-4 border-t border-zinc-200 mt-4 space-y-3">
          <div className="bg-[#FAFAFA] border border-zinc-200 rounded-xl px-3.5 py-2.5 flex items-center justify-between">
            <div>
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#52525B] block">
                Sesi Aktif
              </span>
              <span className="text-xs font-bold text-[#141414]">
                {roleLabels[userRole]?.label || userRole}
              </span>
            </div>
            <span className="font-mono text-[9px] font-bold uppercase bg-white border border-zinc-200 text-[#52525B] px-2 py-0.5 rounded-md">
              {roleLabels[userRole]?.badge || 'Staff'}
            </span>
          </div>

          <button 
            onClick={onBackToLanding}
            className="w-full group bg-white hover:bg-[#141414] text-[#141414] hover:text-white p-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer border border-zinc-200"
          >
            <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-1" /> 
            <span>Keluar ke Beranda</span>
          </button>
        </div>

      </aside>
    </>
  );
}
