import React from 'react';
import { Store, Package, Bell, BarChart3, UtensilsCrossed, Zap, ArrowLeft } from 'lucide-react';

export default function DashboardNavbar({ activeTab, setActiveTab, alertCount, onBackToLanding }) {
  return (
    // PERUBAHAN UTAMA: class md:fixed md:top-0 md:left-0 md:h-screen
    <aside className="w-full md:w-72 bg-white border-r border-zinc-200/80 flex flex-col justify-between p-6 shrink-0 md:fixed md:top-0 md:left-0 md:h-screen z-40 shadow-xs overflow-y-auto hide-scrollbar">
      
      <div className="space-y-8">
        <button 
          onClick={onBackToLanding}
          className="w-full bg-zinc-50 hover:bg-zinc-100 text-zinc-700 p-3 rounded-2xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer border border-zinc-200 shadow-2xs"
        >
          <ArrowLeft size={16} /> <span>Keluar ke Landing Page</span>
        </button>

        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#E87F24] to-[#FFC81E] flex items-center justify-center text-zinc-950 font-black shadow-md">
            <Zap size={20} className="fill-zinc-950" />
          </div>
          <div>
            <span className="font-black text-base text-zinc-900 block leading-tight">
              Stocko<span className="text-[#E87F24]">.</span>
            </span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Dashboard POS & Gudang</span>
          </div>
        </div>

        <nav className="space-y-1.5">
          <p className="text-[10px] font-black uppercase text-zinc-400 px-3 pb-2 tracking-wider">Modul Utama</p>
          
          <button onClick={() => setActiveTab('pos')} className={`w-full px-4 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-3 cursor-pointer ${activeTab === 'pos' ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'}`}>
            <Store size={18} /> POS Kasir
          </button>

          <button onClick={() => setActiveTab('menu-management')} className={`w-full px-4 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-3 cursor-pointer ${activeTab === 'menu-management' ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'}`}>
            <UtensilsCrossed size={18} /> Kelola Menu
          </button>

          <button onClick={() => setActiveTab('inventory')} className={`w-full px-4 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-3 cursor-pointer ${activeTab === 'inventory' ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'}`}>
            <Package size={18} /> Stok & BOM Gudang
          </button>

          <button onClick={() => setActiveTab('alerts')} className={`w-full px-4 py-3 rounded-2xl text-xs font-black transition-all flex items-center justify-between cursor-pointer ${activeTab === 'alerts' ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'}`}>
            <span className="flex items-center gap-3"><Bell size={18} /> Peringatan Khusus</span>
            {alertCount > 0 && (
              <span className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full animate-pulse">{alertCount}</span>
            )}
          </button>

          <button onClick={() => setActiveTab('reporting')} className={`w-full px-4 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-3 cursor-pointer ${activeTab === 'reporting' ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'}`}>
            <BarChart3 size={18} /> Analitik Laporan
          </button>
        </nav>
      </div>
    </aside>
  );
}