import React, { useState } from 'react';
import { Store, Package, Bell, BarChart3, UtensilsCrossed, Zap, ArrowLeft, QrCode, Menu, X, Users } from 'lucide-react';

export default function DashboardNavbar({ activeTab, setActiveTab, alertCount, onBackToLanding, userRole = 'superadmin' }) {
  const [isOpen, setIsOpen] = useState(false);

  const allNavItems = [
    { id: 'pos', label: 'POS Kasir', icon: Store },
    { id: 'self-order', label: 'Pemesanan Mandiri', icon: QrCode, badge: 'Kiosk' },
    { id: 'menu-management', label: 'Kelola Menu', icon: UtensilsCrossed },
    { id: 'inventory', label: 'Stok & BOM Gudang', icon: Package },
    { id: 'alerts', label: 'Peringatan Khusus', icon: Bell, count: alertCount },
    { id: 'employees', label: 'Kelola Karyawan', icon: Users, badge: 'Admin' },
    { id: 'reporting', label: 'Analitik Laporan', icon: BarChart3 },
  ];

  // Logika Penyaring (Filter) Berdasarkan Jabatan Karyawan
  const navItems = allNavItems.filter(item => {
    if (userRole === 'superadmin') return true; // Bos bisa lihat semua menu
    
    if (userRole === 'kasir') {
      // Kasir hanya boleh melihat POS dan Kelola Menu
      return ['pos', 'menu-management'].includes(item.id);
    }
    
    if (userRole === 'stocker') {
      // Stocker hanya boleh melihat Stok Gudang dan Peringatan
      return ['inventory', 'alerts'].includes(item.id);
    }
    
    return false;
  });

  // Khusus mode Self-Order, sembunyikan sidebar total untuk pengalaman full-screen kiosk
  if (activeTab === 'self-order') {
    return null;
  }

  return (
    <>
      {/* Top Mobile Bar & Hamburger Button (Hanya tampil di layar kecil) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-zinc-200/80 px-4 flex items-center justify-between z-30 shadow-xs">
        <div className="flex items-center gap-2.5">
          <img src="/logo-stocko.png" alt="Stocko Logo" className="w-8 h-8 object-contain" />
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

      {/* Sidebar Utama: Liquid Glass Sidebar ala iPadOS/macOS */}
      <aside className={`w-72 bg-white/70 backdrop-blur-2xl border-r border-black/[0.04] flex flex-col justify-between p-5 shrink-0 fixed top-0 left-0 h-screen z-50 shadow-none select-none transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        
        {/* Bagian Atas: Brand & Navigasi */}
        <div className="space-y-6">
          
          {/* Brand Header */}
          <div className="hidden lg:flex items-center justify-between px-3 pt-2">
            <div className="flex items-center gap-3">
              <img src="/logo-stocko.png" alt="Stocko Logo" className="w-10 h-10 object-contain drop-shadow-sm" />
              <div>
                <span className="font-bold text-lg text-zinc-900 tracking-tight block leading-none">
                  Stocko
                </span>
                <span className="text-[10px] font-medium text-zinc-400 mt-1 block">Enterprise POS</span>
              </div>
            </div>
          </div>

          {/* Navigasi Menu */}
          <div className="space-y-1 pt-8 lg:pt-4">
            <p className="text-[11px] font-semibold text-zinc-400 px-4 pb-2">Menu Utama</p>
            
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full group px-3 py-2.5 rounded-[14px] text-[13px] font-medium transition-all duration-200 flex items-center justify-between cursor-pointer relative overflow-hidden active:scale-[0.98] ${
                    isActive 
                      ? 'bg-white text-black shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-black/[0.02]' 
                      : 'text-zinc-500 hover:text-zinc-900 hover:bg-black/[0.03] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 relative z-10">
                    <div className={`transition-colors ${
                      isActive ? 'text-[#E87F24]' : 'text-zinc-400 group-hover:text-zinc-600'
                    }`}>
                      <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                    </div>
                    <span className={`tracking-tight ${isActive ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5 relative z-10">
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