import React, { useState } from 'react';
import { Store, Package, Bell, BarChart3, UtensilsCrossed, Zap, ArrowLeft, QrCode, Menu, X } from 'lucide-react';

export default function DashboardNavbar({ activeTab, setActiveTab, alertCount, onBackToLanding }) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'pos', label: 'POS Kasir', icon: Store },
    { id: 'self-order', label: 'Pemesanan Mandiri', icon: QrCode, badge: 'Kiosk' },
    { id: 'menu-management', label: 'Kelola Menu', icon: UtensilsCrossed },
    { id: 'inventory', label: 'Stok & BOM Gudang', icon: Package },
    { id: 'alerts', label: 'Peringatan Khusus', icon: Bell, count: alertCount },
    { id: 'reporting', label: 'Analitik Laporan', icon: BarChart3 },
  ];

  // Khusus mode Self-Order, sembunyikan sidebar total untuk pengalaman full-screen kiosk
  if (activeTab === 'self-order') {
    return null;
  }

  return (
    <>
      {/* Top Mobile Bar & Hamburger Button (Hanya tampil di layar kecil) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-zinc-200/80 px-4 flex items-center justify-between z-30 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#E87F24] to-[#FFC81E] flex items-center justify-center text-zinc-950 shadow-md">
            <Zap size={16} className="fill-zinc-950" />
          </div>
          <span className="font-black text-base text-zinc-900 tracking-tight">
            Stocko<span className="text-[#E87F24]">.</span>
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

      {/* Backdrop Overlay Gelap di Mobile saat Sidebar Terbuka */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-zinc-950/50 backdrop-blur-xs z-40 transition-opacity"
        />
      )}

      {/* Sidebar Utama: Drawer di Mobile (Slide-in), Posisi Tetap di Desktop (lg:translate-x-0) */}
      <aside className={`w-72 bg-white/95 lg:bg-white/90 backdrop-blur-xl border-r border-zinc-200/80 flex flex-col justify-between p-6 shrink-0 fixed top-0 left-0 h-screen z-50 shadow-2xl lg:shadow-[4px_0_24px_rgba(0,0,0,0.02)] select-none transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        
        {/* Bagian Atas: Brand & Navigasi */}
        <div className="space-y-6">
          
          {/* Brand Header (Desktop Only, karena Mobile sudah ada di top bar) */}
          <div className="hidden lg:flex items-center justify-between px-2 pt-2">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#E87F24] via-orange-500 to-[#FFC81E] flex items-center justify-center text-zinc-950 shadow-lg shadow-orange-500/25 ring-4 ring-orange-500/10">
                <Zap size={22} className="fill-zinc-950" />
              </div>
              <div>
                <span className="font-black text-lg text-zinc-900 tracking-tight block leading-none">
                  Stocko<span className="text-[#E87F24]">.</span>
                </span>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1 block">Enterprise POS</span>
              </div>
            </div>
          </div>

          {/* Navigasi Menu */}
          <div className="space-y-1.5 pt-12 lg:pt-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400 px-3 pb-2">Menu Utama</p>
            
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpen(false); // Otomatis menutup drawer di HP saat menu diklik
                  }}
                  className={`w-full group px-4 py-3.5 rounded-2xl text-xs font-black transition-all duration-300 flex items-center justify-between cursor-pointer relative overflow-hidden ${
                    isActive 
                      ? 'bg-zinc-900 text-white shadow-xl shadow-zinc-900/10 scale-[1.02]' 
                      : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/80'
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#FFC81E] rounded-r-full"></div>
                  )}

                  <div className="flex items-center gap-3.5 relative z-10">
                    <div className={`p-2 rounded-xl transition-colors ${
                      isActive ? 'bg-white/10 text-[#FFC81E]' : 'bg-zinc-100 text-zinc-500 group-hover:bg-white group-hover:text-zinc-900'
                    }`}>
                      <Icon size={18} />
                    </div>
                    <span className="tracking-wide">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5 relative z-10">
                    {item.badge && (
                      <span className="text-[9px] font-black bg-gradient-to-r from-orange-500 to-[#FFC81E] text-zinc-950 px-2 py-0.5 rounded-md uppercase tracking-wider shadow-xs">
                        {item.badge}
                      </span>
                    )}
                    {item.count > 0 && (
                      <span className="bg-red-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow-md shadow-red-500/30">
                        {item.count}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bagian Bawah: Tombol Keluar / Beranda */}
        <div className="pt-4 border-t border-zinc-100">
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