import React from 'react';
import { motion } from 'framer-motion';
import { Store, Package, Bell, BarChart3, ScanLine } from 'lucide-react';

export default function Features() {
  return (
    <section id="features" className="py-28 bg-[#f8f9fb] relative z-20 border-t border-zinc-200/60 overflow-hidden">
      {/* Glow Latar Belakang */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[500px] bg-gradient-to-r from-[#E87F24]/10 to-[#FFC81E]/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="inline-block bg-white border border-zinc-200 px-4 py-1.5 rounded-full mb-6 shadow-sm">
            <span className="text-xs font-black bg-clip-text text-transparent bg-gradient-to-r from-[#E87F24] to-[#FFC81E] uppercase tracking-widest">
              Teknologi Inti Track 4.2
            </span>
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl md:text-6xl font-black text-zinc-900 tracking-tight leading-[1.1]">
            Mesin Cerdas di Balik <br />Operasional Ritel Anda.
          </motion.h2>
        </div>

        {/* BENTO GRID ASIMETRIS MODERN */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[320px]">
          
          {/* Card 1: Bill of Materials (Lebar, Kiri Atas) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="md:col-span-8 bg-white rounded-[2.5rem] p-8 md:p-10 border border-zinc-200 shadow-xl shadow-zinc-200/40 hover:shadow-2xl hover:shadow-[#E87F24]/10 transition-all duration-500 overflow-hidden relative group"
          >
            {/* Animasi Internal: Pengurangan Stok Visual */}
            <div className="absolute right-10 top-1/2 -translate-y-1/2 w-48 h-64 bg-zinc-50 border border-zinc-200 rounded-2xl hidden lg:flex flex-col justify-center px-5 gap-4 overflow-hidden shadow-sm">
              <div className="flex justify-between items-center border-b border-zinc-200 pb-2">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center"><Package size={14} className="text-[#E87F24]"/></div>
                <span className="text-xs font-bold text-zinc-500">Stok Kopi</span>
              </div>
              <div className="space-y-3 relative">
                <div className="h-4 w-full bg-zinc-200 rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ width: ['100%', '85%', '70%'] }} transition={{ duration: 4, ease: "easeInOut", repeat: Infinity, repeatType: 'reverse' }}
                    className="h-full bg-emerald-400"
                  ></motion.div>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-zinc-400">
                  <span>Sisa: 700g</span> <span>Max: 1000g</span>
                </div>
              </div>
              <motion.div 
                animate={{ opacity: [0, 1, 0], y: [10, -10] }} transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500 font-black text-sm bg-white px-2 py-1 rounded shadow-sm border border-red-100"
              >
                -15g
              </motion.div>
            </div>

            <div className="relative z-10 max-w-sm">
              <div className="w-16 h-16 rounded-2xl bg-zinc-950 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <ScanLine className="text-[#FFC81E]" size={32} />
              </div>
              <h3 className="text-3xl font-black text-zinc-900 mb-4">Integrasi BOM Real-Time</h3>
              <p className="text-zinc-500 font-medium leading-relaxed">
                Setiap penjualan "Kopi Susu" di kasir secara otomatis akan memotong stok bahan baku (bubuk kopi, susu, cup) di gudang secara presisi dan akurat.
              </p>
            </div>
          </motion.div>

          {/* Card 2: Peringatan FEFO (Kotak, Kanan Atas) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, delay: 0.1 }}
            className="md:col-span-4 bg-gradient-to-br from-[#E87F24] to-[#c96a1a] rounded-[2.5rem] p-8 md:p-10 border border-[#E87F24] text-white hover:shadow-2xl hover:shadow-[#E87F24]/30 transition-all duration-500 relative overflow-hidden group"
          >
            {/* Animasi Internal: Radar/Pulse Alert */}
            <div className="absolute -right-10 -top-10 w-48 h-48 flex items-center justify-center">
              <motion.div animate={{ scale: [1, 2], opacity: [0.5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute w-24 h-24 bg-white/30 rounded-full"></motion.div>
              <motion.div animate={{ scale: [1, 2.5], opacity: [0.3, 0] }} transition={{ duration: 2, delay: 0.5, repeat: Infinity }} className="absolute w-24 h-24 bg-white/20 rounded-full"></motion.div>
            </div>

            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <Bell size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-black mb-2">FEFO Alerts</h3>
                <p className="text-white/80 font-medium leading-relaxed text-sm">Notifikasi otomatis sebelum bahan baku kedaluwarsa atau stok menipis.</p>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Analitik Penjualan (Kotak, Kiri Bawah) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, delay: 0.2 }}
            className="md:col-span-4 bg-zinc-950 rounded-[2.5rem] p-8 md:p-10 border border-zinc-800 text-white hover:shadow-2xl hover:shadow-zinc-900/50 transition-all duration-500 relative overflow-hidden group"
          >
            {/* Animasi Internal: Grafik Batang Naik */}
            <div className="absolute inset-0 opacity-20 flex items-end justify-between px-10 pb-8 pointer-events-none gap-2">
              <motion.div animate={{ height: ['20%', '40%', '20%'] }} transition={{ duration: 3, repeat: Infinity }} className="w-8 bg-zinc-600 rounded-t-lg"></motion.div>
              <motion.div animate={{ height: ['40%', '70%', '40%'] }} transition={{ duration: 3, repeat: Infinity, delay: 0.5 }} className="w-8 bg-zinc-500 rounded-t-lg"></motion.div>
              <motion.div animate={{ height: ['30%', '90%', '30%'] }} transition={{ duration: 3, repeat: Infinity, delay: 1 }} className="w-8 bg-[#E87F24] rounded-t-lg"></motion.div>
            </div>

            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <BarChart3 className="text-[#FFC81E]" size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-black mb-2">Smart Analytics</h3>
                <p className="text-zinc-400 font-medium leading-relaxed text-sm">Pantau omzet harian dan ketahui produk mana yang paling cepat laku (Fast Moving).</p>
              </div>
            </div>
          </motion.div>

          {/* Card 4: Kasir Cepat / POS (Lebar, Kanan Bawah) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, delay: 0.3 }}
            className="md:col-span-8 bg-[#FEFDDF] rounded-[2.5rem] p-8 md:p-10 border border-[#FFC81E]/40 hover:shadow-2xl hover:shadow-[#FFC81E]/20 transition-all duration-500 relative overflow-hidden group"
          >
            {/* Animasi Internal: Loading Transaksi */}
            <div className="absolute right-10 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-4 opacity-50 group-hover:opacity-100 transition-opacity duration-500 w-64 bg-white/60 backdrop-blur-sm p-5 rounded-2xl border border-white">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-500">
                <span>Status Checkout</span>
                <span className="text-[#E87F24]">Memproses...</span>
              </div>
              <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden relative">
                <motion.div 
                  initial={{ width: "0%" }} whileInView={{ width: "100%" }} transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#FFC81E] to-[#E87F24] rounded-full"
                ></motion.div>
              </div>
            </div>

            <div className="relative z-10 max-w-sm">
              <div className="w-16 h-16 rounded-2xl bg-white border border-[#FFC81E]/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                <Store className="text-[#E87F24]" size={32} />
              </div>
              <h3 className="text-3xl font-black text-zinc-900 mb-4">Point of Sale (POS) Kilat</h3>
              <p className="text-zinc-700 font-medium leading-relaxed">
                Antarmuka kasir yang dirancang untuk kecepatan tinggi. Selesaikan pesanan pelanggan, tambahkan catatan dapur, dan proses pembayaran digital dalam hitungan detik.
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}