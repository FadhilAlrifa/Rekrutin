import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Download, Lock, Building2 } from 'lucide-react';

export default function ReportingHeader({ onDownload, currentFilter, setFilter, customDate, setCustomDate, subscriptionPlan = 'pro', activeOutlet = 'Semua Cabang (Terpusat)', onUpgradePlan }) {
  const isStarter = subscriptionPlan === 'starter';
  const isEnterprise = subscriptionPlan === 'enterprise';

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 text-white rounded-[2.5rem] p-7 md:p-8 shadow-xl relative overflow-hidden border border-zinc-800"
    >
      <div className="absolute top-0 right-0 w-72 h-72 bg-[#E87F24]/20 rounded-full blur-[80px] pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-[#E87F24]/20 text-[#FFC81E] border border-[#E87F24]/30 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5">
              <Sparkles size={13} /> {isStarter ? 'Laporan Dasar (Paket Starter)' : 'Advanced Reporting & Analitik'}
            </span>
            {isEnterprise && (
              <span className="bg-white/10 text-white border border-white/15 px-3 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5">
                <Building2 size={12} className="text-[#FFC81E]" /> {activeOutlet}
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            {isEnterprise ? 'Laporan Performa Multi-Outlet' : 'Laporan Performa Bisnis'}
          </h1>
          <p className="text-zinc-400 text-xs font-medium max-w-lg">
            Ringkasan omzet, jumlah transaksi berhasil, metode pembayaran, serta rekapitulasi riwayat pesanan berdasarkan rentang waktu.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 shrink-0">
          
          {/* TOMBOL FILTER & KALENDER */}
          <div className="bg-zinc-800/80 p-1.5 rounded-2xl flex items-center flex-wrap gap-1 border border-zinc-700/50">
            {[
              { id: 'today', label: 'Hari Ini' },
              { id: 'yesterday', label: 'Kemarin' },
              { id: 'month', label: 'Bulan Ini' },
              { id: 'all', label: 'Semua Waktu' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-2.5 sm:px-4 text-[11px] sm:text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  currentFilter === f.id 
                  ? 'bg-[#E87F24] text-zinc-950 shadow-md' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'
                }`}
              >
                {f.label}
              </button>
            ))}

            {/* Input Kalender Khusus */}
            <div className="flex items-center pl-1 sm:pl-2 ml-1 border-l border-zinc-700/60">
              <input 
                type="date"
                value={customDate}
                onChange={(e) => {
                  setCustomDate(e.target.value);
                  setFilter('custom');
                }}
                title="Pilih Tanggal Bebas"
                className={`px-2 sm:px-3 py-2 bg-zinc-900 rounded-xl text-[11px] sm:text-xs font-bold outline-none cursor-pointer transition-all ${
                  currentFilter === 'custom' 
                  ? 'text-[#E87F24] ring-1 ring-[#E87F24]/50' 
                  : 'text-zinc-400 hover:text-white'
                }`}
              />
            </div>
          </div>

          {isStarter ? (
            <button
              onClick={() => onUpgradePlan?.('pro')}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 font-black text-xs px-5 py-3.5 rounded-2xl cursor-pointer flex items-center gap-2"
              title="Ekspor CSV tersedia pada Paket Pro & Enterprise"
            >
              <Lock size={14} className="text-[#FFC81E]" /> Unduh CSV (Pro)
            </button>
          ) : (
            <motion.button 
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={onDownload}
              className="bg-gradient-to-r from-[#E87F24] to-[#FFC81E] text-zinc-950 font-black text-xs px-5 py-3.5 rounded-2xl shadow-lg cursor-pointer flex items-center gap-2"
            >
              <Download size={16} /> Unduh CSV
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
