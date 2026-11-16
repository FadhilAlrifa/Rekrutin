import React, { useState } from 'react';
import { Store, Package, Bell, BarChart3, UtensilsCrossed, ArrowLeft, QrCode, Menu, X, Users, Lock, Sparkles } from 'lucide-react';

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

  return (
    <>
      {/* Top Mobile Bar & Hamburger Button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/85 backdrop-blur-xl border-b border-zinc-200/80 px-4 flex items-center justify-between z-30 shadow-xs">
        <div className="flex items-center gap-2.5">
          <img src="/logo-stocko.png" alt="Stocko Logo" className="w-8 h-8 object-contain" />
          <span className="font-black text-base text-zinc-900 tracking-tight">
            Stocko<span className="text-[#E87F24]">.</span>
          </span>
          <span className="text-[10px] font-black uppercase bg-orange-50 text-[#E87F24] border border-orange-200 px-2 py-0.5 rounded-full">
            {planLabels[subscriptionPlan]?.name}
          </span>
        </div>

        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 bg-zinc-100 hover:bg-zinc-200 rounded-xl flex items-center justify-center text-zinc-800 cursor-pointer active:scale-95 transition-all"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Backdrop Overlay Gelap di Mobile */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-zinc-950/50 backdrop-blur-xs z-40 transition-opacity"
        />
      )}

      {/* Sidebar Utama */}
      <aside className={`w-72 bg-white/80 backdrop-blur-2xl border-r border-black/[0.04] flex flex-col justify-between p-5 shrink-0 fixed top-0 left-0 h-screen z-50 shadow-none select-none transition-transform duration-300 ease-in-out overflow-y-auto hide-scrollbar ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        
        {/* Bagian Atas: Brand, Paket Langganan & Navigasi */}
        <div className="space-y-5">
          
          {/* Brand Header */}
          <div className="hidden lg:flex items-center justify-between px-3 pt-1">
            <div className="flex items-center gap-3">
              <img src="/logo-stocko.png" alt="Stocko Logo" className="w-10 h-10 object-contain drop-shadow-sm" />
              <div>
                <span className="font-bold text-lg text-zinc-900 tracking-tight block leading-none">
                  Stocko<span className="text-[#E87F24]">.</span>
                </span>
                <span className="text-[10px] font-semibold text-zinc-400 mt-1 block">
                  {planLabels[subscriptionPlan]?.desc}
                </span>
              </div>
            </div>
          </div>

          {/* Simulasi Switcher Paket Langganan */}
          {userRole === 'superadmin' && setSubscriptionPlan && (
            <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-3 space-y-2 mt-6 lg:mt-0">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                  <Sparkles size={11} className="text-[#E87F24]" /> Paket Langganan
                </span>
                <span className="text-[9px] font-black text-[#E87F24] bg-orange-50 border border-orange-200/60 px-2 py-0.5 rounded-full">
                  Mode Simulasi
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 bg-zinc-200/60 p-1 rounded-xl">
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
                      className={`py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                        active
                          ? 'bg-zinc-900 text-[#FFC81E] shadow-xs'
                          : 'text-zinc-500 hover:text-zinc-900'
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
          <div className="space-y-1 pt-2">
            <p className="text-[11px] font-semibold text-zinc-400 px-3 pb-1.5">Menu Operasional</p>
            
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
                  className={`w-full group px-3 py-2.5 rounded-[14px] text-[13px] font-medium transition-all duration-200 flex items-center justify-between cursor-pointer relative overflow-hidden active:scale-[0.98] ${
                    isActive 
                      ? 'bg-white text-black shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-black/[0.04]' 
                      : 'text-zinc-500 hover:text-zinc-900 hover:bg-black/[0.03] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 relative z-10">
                    <div className={`transition-colors ${
                      isActive ? 'text-[#E87F24]' : 'text-zinc-400 group-hover:text-zinc-600'
                    }`}>
                      <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                    </div>
                    <span className={`tracking-tight ${isActive ? 'font-semibold' : 'font-medium'} ${isLocked ? 'opacity-70' : ''}`}>
                      {item.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 relative z-10">
                    {isLocked ? (
                      <span className="text-[9px] font-black bg-zinc-100 text-zinc-500 border border-zinc-200 px-1.5 py-0.5 rounded-md inline-flex items-center gap-0.5">
                        <Lock size={9} /> PRO
                      </span>
                    ) : (
                      <>
                        {item.badge && (
                          <span className="text-[9px] font-semibold bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-md tracking-wide">
                            {item.badge}
                          </span>
                        )}
                        {item.count > 0 && (
                          <span className="bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
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

        {/* Bagian Bawah: Tombol Keluar / Beranda */}
        <div className="pt-4 border-t border-zinc-100 mt-4">
          <button 
            onClick={onBackToLanding}
            className="w-full group bg-zinc-50 hover:bg-zinc-900 text-zinc-600 hover:text-white p-3.5 rounded-2xl text-xs font-black transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer border border-zinc-200/60 shadow-2xs hover:shadow-lg"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> 
            <span>Keluar ke Beranda</span>
          </button>
        </div>

      </aside>
    </>
  );
}
