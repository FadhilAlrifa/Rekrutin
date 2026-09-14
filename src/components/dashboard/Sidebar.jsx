import React from 'react';
import { Users, Bot, Calendar, Settings, LogOut, Zap } from 'lucide-react';

export default function Sidebar({ activeMenu, setActiveMenu, onLogout }) {
  return (
    <aside className="w-full md:w-64 bg-white border-r border-zinc-200 flex flex-col justify-between p-6 shrink-0">
      <div className="space-y-8">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#E87F24] to-[#FFC81E] flex items-center justify-center shadow-md shadow-[#E87F24]/20">
            <Zap className="text-white fill-white" size={16} />
          </div>
          <div>
            <span className="font-black tracking-tight text-lg text-zinc-900 block">RecruitIn<span className="text-[#E87F24]">.</span></span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Enterprise HRIS</span>
          </div>
        </div>

        <nav className="space-y-1.5">
          <button onClick={() => setActiveMenu('talent')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer ${activeMenu === 'talent' ? 'bg-[#E87F24]/10 text-[#E87F24]' : 'text-zinc-600 hover:bg-zinc-100'}`}>
            <Users size={18} /> Talent Pool
          </button>
          <button onClick={() => setActiveMenu('ai')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer ${activeMenu === 'ai' ? 'bg-[#E87F24]/10 text-[#E87F24]' : 'text-zinc-600 hover:bg-zinc-100'}`}>
            <Bot size={18} /> AI Filtration
          </button>
          <button onClick={() => setActiveMenu('schedule')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer ${activeMenu === 'schedule' ? 'bg-[#E87F24]/10 text-[#E87F24]' : 'text-zinc-600 hover:bg-zinc-100'}`}>
            <Calendar size={18} /> Jadwal Wawancara
          </button>
          <button onClick={() => setActiveMenu('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer ${activeMenu === 'settings' ? 'bg-[#E87F24]/10 text-[#E87F24]' : 'text-zinc-600 hover:bg-zinc-100'}`}>
            <Settings size={18} /> Pengaturan & Paket
          </button>
        </nav>
      </div>

      <div className="pt-6 border-t border-zinc-100">
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-600 hover:bg-red-50 font-bold text-sm transition-colors cursor-pointer">
          <LogOut size={18} /> Keluar Sistem
        </button>
      </div>
    </aside>
  );
}