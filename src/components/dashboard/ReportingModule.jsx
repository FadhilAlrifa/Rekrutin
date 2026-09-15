import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, DollarSign, ShoppingBag, Sparkles, 
  ArrowUpRight, BarChart3, Calendar, Download 
} from 'lucide-react';

export default function ReportingModule({ totalRevenue, transactionCount }) {
  const bestSellers = [
    { name: "Kopi Susu Gula Aren", category: "Minuman", sold: 48, revenue: 864000 },
    { name: "Chicken Katsu Ricebowl", category: "Makanan", sold: 32, revenue: 1120000 },
    { name: "Croissant Butter", category: "Bakery", sold: 25, revenue: 550000 },
    { name: "Matcha Latte", category: "Minuman", sold: 19, revenue: 456000 }
  ];

  const averageBasketSize = transactionCount > 0 ? Math.round(totalRevenue / transactionCount) : 0;

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Banner SaaS Profesional */}
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
              Ringkasan omzet harian, jumlah transaksi berhasil, serta rekapitulasi produk terlaris di gerai Anda.
            </p>
          </div>

          <motion.button 
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => alert("Fitur ekspor laporan PDF/Excel sedang disiapkan.")}
            className="bg-white hover:bg-zinc-100 text-zinc-950 font-black text-xs px-6 py-3.5 rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Download size={15} /> Unduh Laporan
          </motion.button>
        </div>
      </motion.div>

      {/* Grid Statistik Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Total Pendapatan */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="bg-white border border-zinc-200/80 rounded-[2.5rem] p-7 shadow-xl space-y-3 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-2xs border border-emerald-100">
              <DollarSign size={24} />
            </div>
            <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1 border border-emerald-200">
              <ArrowUpRight size={13} /> +18.4%
            </span>
          </div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider pt-2">Total Pendapatan (Omzet)</p>
          <h3 className="text-3xl font-black text-zinc-900 font-mono tracking-tight">
            Rp {totalRevenue.toLocaleString('id-ID')}
          </h3>
        </motion.div>

        {/* Jumlah Transaksi */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white border border-zinc-200/80 rounded-[2.5rem] p-7 shadow-xl space-y-3 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#E87F24] flex items-center justify-center font-bold shadow-2xs border border-orange-100">
              <ShoppingBag size={24} />
            </div>
            <span className="text-[11px] font-black text-[#E87F24] bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
              Sesi Aktif
            </span>
          </div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider pt-2">Total Transaksi Berhasil</p>
          <h3 className="text-3xl font-black text-zinc-900 font-mono tracking-tight">
            {transactionCount} <span className="text-base font-bold text-zinc-400">Pesanan</span>
          </h3>
        </motion.div>

        {/* Rata-rata Nilai Keranjang */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white border border-zinc-200/80 rounded-[2.5rem] p-7 shadow-xl space-y-3 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-2xs border border-blue-100">
              <TrendingUp size={24} />
            </div>
            <span className="text-[11px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Rata-rata (AOV)
            </span>
          </div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider pt-2">Nilai Keranjang</p>
          <h3 className="text-3xl font-black text-zinc-900 font-mono tracking-tight">
            Rp {averageBasketSize.toLocaleString('id-ID')}
          </h3>
        </motion.div>

      </div>

      {/* Tabel Produk Terlaris (Best Sellers) */}
      <div className="bg-white border border-zinc-200/80 rounded-[2.5rem] p-6 md:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-black text-zinc-900">Produk Terlaris (Best Sellers)</h3>
            <p className="text-xs text-zinc-400 font-medium">Menu dengan jumlah penjualan tertinggi pada periode ini.</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-600 bg-zinc-50 border border-zinc-200 px-4 py-2 rounded-2xl">
            <Calendar size={14} className="text-[#E87F24]" /> Real-Time Analytics
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 text-[10px] font-black uppercase text-zinc-400">
                <th className="pb-4 px-4">Peringkat & Nama Produk</th>
                <th className="pb-4 px-4">Kategori</th>
                <th className="pb-4 px-4">Terjual</th>
                <th className="pb-4 px-4">Kontribusi Pendapatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 text-xs font-medium">
              {bestSellers.map((item, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                  key={idx} 
                  className="hover:bg-zinc-50/80 transition-colors"
                >
                  <td className="py-4 px-4 flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${idx === 0 ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-zinc-100 text-zinc-600'}`}>
                      #{idx + 1}
                    </span>
                    <span className="font-black text-zinc-900 text-sm">{item.name}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="bg-orange-50 text-[#E87F24] border border-orange-200 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-bold text-zinc-800">{item.sold} porsi</td>
                  <td className="py-4 px-4 font-mono font-bold text-emerald-600">Rp {item.revenue.toLocaleString('id-ID')}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}