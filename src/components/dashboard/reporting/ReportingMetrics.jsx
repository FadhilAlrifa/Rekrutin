import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, ArrowUpRight, PackageCheck, CreditCard, QrCode, Wallet } from 'lucide-react';

export default function ReportingMetrics({ metrics }) {
  const breakdown = metrics.paymentBreakdown || { qris: 0, cash: 0, card: 0 };
  const totalPay = (breakdown.qris || 0) + (breakdown.cash || 0) + (breakdown.card || 0);
  const qrisPct = totalPay > 0 ? Math.round(((breakdown.qris || 0) / totalPay) * 100) : 0;
  const cashPct = totalPay > 0 ? Math.round(((breakdown.cash || 0) / totalPay) * 100) : 0;
  const cardPct = totalPay > 0 ? Math.max(0, 100 - qrisPct - cashPct) : 0;
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      
      {/* 1. Pendapatan Hari Ini (Dengan Tren) */}
      <motion.div 
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
        className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-3 relative overflow-hidden flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold border border-emerald-200">
              <DollarSign size={20} />
            </div>
            <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-200">
              <ArrowUpRight size={12} /> {metrics.filterLabel}
            </span>
          </div>
          <p className="font-mono text-[10px] font-bold text-[#52525B] uppercase tracking-wider pt-2">Pendapatan Kotor</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#141414] font-mono tracking-tight break-all mt-1">
            Rp {metrics.revenue.toLocaleString('id-ID')}
          </h3>
        </div>
        
        {/* Indikator Tren (Hanya muncul jika filter adalah Hari Ini) */}
        {metrics.filterLabel === 'Hari Ini' && (
          <div className={`flex items-center gap-1.5 text-[11px] font-bold mt-3 ${metrics.isUp ? 'text-emerald-600' : 'text-red-600'}`}>
            {metrics.isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>
              {metrics.isUp ? 'Naik' : 'Turun'} {metrics.trendPercentage}% dari kemarin
            </span>
          </div>
        )}
      </motion.div>

      {/* 2. Total Pesanan (Dinamis sesuai Filter) */}
      <motion.div 
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.08 }}
        className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-3 relative overflow-hidden flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="w-11 h-11 rounded-xl bg-[#FEF3C7] text-[#B45309] flex items-center justify-center font-bold border border-[#FDE68A]">
              <ShoppingBag size={20} />
            </div>
            <span className="font-mono text-[10px] font-bold text-[#B45309] bg-[#FEF3C7] px-2.5 py-1 rounded-full border border-[#FDE68A]">
              {metrics.filterLabel}
            </span>
          </div>
          <p className="font-mono text-[10px] font-bold text-[#52525B] uppercase tracking-wider pt-2">Transaksi Berhasil</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#141414] font-mono tracking-tight mt-1">
            {metrics.transactionCount} <span className="text-sm font-bold text-[#52525B]">Pesanan</span>
          </h3>
        </div>
        <p className="text-[11px] font-medium text-[#52525B] mt-3">
          Total struk selesai tervalidasi
        </p>
      </motion.div>

      {/* 3. Total Item / Porsi Terjual */}
      <motion.div 
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.16 }}
        className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-3 relative overflow-hidden flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="w-11 h-11 rounded-xl bg-[#FAFAFA] text-[#141414] flex items-center justify-center font-bold border border-zinc-200">
              <PackageCheck size={20} />
            </div>
            <span className="font-mono text-[10px] font-bold text-[#141414] bg-[#FAFAFA] px-2.5 py-1 rounded-full border border-zinc-200">
              {metrics.filterLabel}
            </span>
          </div>
          <p className="font-mono text-[10px] font-bold text-[#52525B] uppercase tracking-wider pt-2">Total Item Terjual</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#141414] font-mono tracking-tight mt-1">
            {metrics.totalItemsSold || 0} <span className="text-sm font-bold text-[#52525B]">Porsi</span>
          </h3>
        </div>
        <p className="text-[11px] font-medium text-[#52525B] mt-3">
          Akumulasi jumlah produk keluar
        </p>
      </motion.div>

      {/* 4. Distribusi Metode Pembayaran */}
      <motion.div 
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.24 }}
        className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-3 relative overflow-hidden flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="w-11 h-11 rounded-xl bg-[#141414] text-[#F59E0B] flex items-center justify-center font-bold">
              <CreditCard size={20} />
            </div>
            <span className="font-mono text-[10px] font-bold text-[#52525B] bg-[#FAFAFA] px-2.5 py-1 rounded-full border border-zinc-200">
              {metrics.filterLabel}
            </span>
          </div>
          <p className="font-mono text-[10px] font-bold text-[#52525B] uppercase tracking-wider pt-2 mb-2">Metode Bayar</p>

          {totalPay > 0 && (
            <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden flex mb-3">
              {qrisPct > 0 && <div style={{ width: `${qrisPct}%` }} className="bg-[#F59E0B] h-full" />}
              {cashPct > 0 && <div style={{ width: `${cashPct}%` }} className="bg-emerald-600 h-full" />}
              {cardPct > 0 && <div style={{ width: `${cardPct}%` }} className="bg-[#141414] h-full" />}
            </div>
          )}
          
          <div className="space-y-2 mt-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-[#52525B]"><QrCode size={14} className="text-[#D97706]" /> QRIS</span>
              <span className="font-mono bg-[#FAFAFA] border border-zinc-200 px-2 py-0.5 rounded-md text-[#141414]">{breakdown.qris || 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-[#52525B]"><Wallet size={14} className="text-emerald-600" /> Tunai</span>
              <span className="font-mono bg-[#FAFAFA] border border-zinc-200 px-2 py-0.5 rounded-md text-[#141414]">{breakdown.cash || 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-[#52525B]"><CreditCard size={14} className="text-[#141414]" /> Kartu</span>
              <span className="font-mono bg-[#FAFAFA] border border-zinc-200 px-2 py-0.5 rounded-md text-[#141414]">{breakdown.card || 0}</span>
            </div>
          </div>
        </div>
      </motion.div>

    </div>
  );
}