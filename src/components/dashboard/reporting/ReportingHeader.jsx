import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Download } from 'lucide-react';

export default function ReportingHeader({ onDownload }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 text-white rounded-[2.5rem] p-7 md:p-8 shadow-xl relative overflow-hidden border border-zinc-800"
    >
      <div className="absolute top-0 right-0 w-72 h-72 bg-[#E87F24]/20 rounded-full blur-[80px] pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="bg-[#E87F24]/20 text-[#FFC81E] border border-[#E87F24]/30 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5">
            <Sparkles size={13} /> Analitik & Finansial
          </span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Laporan Performa Bisnis</h1>
          <p className="text-zinc-400 text-xs font-medium max-w-lg">
            Ringkasan omzet harian, jumlah transaksi berhasil, serta rekapitulasi riwayat pesanan.
          </p>
        </div>

        <motion.button 
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={onDownload}
          className="bg-gradient-to-r from-[#E87F24] to-[#FFC81E] text-zinc-950 font-black text-xs px-6 py-3.5 rounded-2xl shadow-lg cursor-pointer flex items-center gap-2 shrink-0"
        >
          <Download size={16} /> Unduh Laporan (CSV)
        </motion.button>
      </div>
    </motion.div>
  );
}