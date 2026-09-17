import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, ArrowUpRight, PackageCheck } from 'lucide-react';

export default function ReportingMetrics({ metrics }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      
      {/* 1. Pendapatan Hari Ini (Dengan Tren) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="bg-white border border-zinc-200/80 rounded-[2.5rem] p-7 shadow-xl space-y-3 relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-2xs border border-emerald-100">
            <DollarSign size={24} />
          </div>
          <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1 border border-emerald-200">
            <ArrowUpRight size={13} /> {metrics.filterLabel}
          </span>
        </div>
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider pt-2">Pendapatan Kotor</p>
        <h3 className="text-3xl font-black text-zinc-900 font-mono tracking-tight">
          Rp {metrics.revenue.toLocaleString('id-ID')}
        </h3>
        
        {/* Indikator Tren (Hanya muncul jika filter adalah Hari Ini) */}
        {metrics.filterLabel === 'Hari Ini' && (
          <div className={`flex items-center gap-1.5 text-xs font-bold mt-2 ${metrics.isUp ? 'text-emerald-500' : 'text-red-500'}`}>
            {metrics.isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>
              {metrics.isUp ? 'Naik' : 'Turun'} {metrics.trendPercentage}% dari kemarin
            </span>
          </div>
        )}
      </motion.div>

      {/* 2. Total Pesanan (Dinamis sesuai Filter) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white border border-zinc-200/80 rounded-[2.5rem] p-7 shadow-xl space-y-3 relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#E87F24] flex items-center justify-center font-bold shadow-2xs border border-orange-100">
            <ShoppingBag size={24} />
          </div>
          <span className="text-[11px] font-black text-[#E87F24] bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
            {metrics.filterLabel}
          </span>
        </div>
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider pt-2">Transaksi Berhasil</p>
        <h3 className="text-3xl font-black text-zinc-900 font-mono tracking-tight">
          {metrics.transactionCount} <span className="text-base font-bold text-zinc-400">Pesanan</span>
        </h3>
      </motion.div>

      {/* 3. Total Item / Porsi Terjual (Dinamis sesuai Filter) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white border border-zinc-200/80 rounded-[2.5rem] p-7 shadow-xl space-y-3 relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shadow-2xs border border-purple-100">
            <PackageCheck size={24} />
          </div>
          <span className="text-[11px] font-black text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            {metrics.filterLabel}
          </span>
        </div>
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider pt-2">Total Item Terjual</p>
        <h3 className="text-3xl font-black text-zinc-900 font-mono tracking-tight">
          {metrics.totalItemsSold || 0} <span className="text-base font-bold text-zinc-400">Porsi</span>
        </h3>
        <p className="text-[11px] font-medium text-zinc-400 mt-2">
          Akumulasi jumlah produk keluar
        </p>
      </motion.div>

    </div>
  );
}