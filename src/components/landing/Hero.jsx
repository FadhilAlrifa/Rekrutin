import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, PlayCircle, Store, CheckCircle2, Package, Sparkles, TrendingUp } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 20 } }
};

export default function Hero({ onOpenApp, onOpenRegister }) {
  return (
    <section className="relative pt-32 pb-16 px-6 max-w-7xl mx-auto flex flex-col items-center text-center overflow-hidden bg-white text-zinc-900">
      
      {/* BACKGROUND ORNAMENTS */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-20"></div>
      
      <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-[#E87F24]/10 rounded-full blur-[100px] -z-10"></motion.div>
      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }} transition={{ duration: 10, repeat: Infinity, delay: 1 }} className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-[#FFC81E]/15 rounded-full blur-[100px] -z-10"></motion.div>
      
      <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }} initial="hidden" animate="show" className="relative z-10 w-full flex flex-col items-center">
        
        {/* Badge Atas */}
        <motion.div variants={fadeUp} className="flex items-center gap-2 bg-zinc-50 backdrop-blur-md px-5 py-2 rounded-full border border-zinc-200 shadow-sm mb-6 hover:shadow-md transition-shadow cursor-default">
          <Sparkles size={14} className="text-[#E87F24]" />
          <span className="text-[11px] font-black text-zinc-700 uppercase tracking-widest">Solusi Track 4.2 Duluinnovation 2026</span>
        </motion.div>

        {/* Teks Utama (Hero Title) dengan Elemen Melayang yang Diposisikan Aman */}
        <div className="relative w-full max-w-5xl py-4">
          
          {/* Elemen Melayang Kiri */}
          <motion.div 
            initial={{ opacity: 0, x: -30, y: 10 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ duration: 1, delay: 0.5, type: "spring" }}
            className="absolute -left-2 md:-left-4 top-0 lg:top-4 hidden sm:flex items-center gap-3 bg-white p-3 pr-5 rounded-2xl shadow-xl border border-zinc-200/80 z-20"
          >
            <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center"><CheckCircle2 className="text-emerald-600" size={18} /></div>
            <div className="text-left"><p className="text-[9px] font-bold text-zinc-400 uppercase">Kasir (POS)</p><p className="text-xs font-black text-zinc-900">Transaksi Super Kilat</p></div>
          </motion.div>

          {/* Elemen Melayang Kanan */}
          <motion.div 
            initial={{ opacity: 0, x: 30, y: 10 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ duration: 1, delay: 0.7, type: "spring" }}
            className="absolute -right-2 md:-right-4 top-2 lg:top-6 hidden sm:flex items-center gap-3 bg-zinc-900 p-3 pr-5 rounded-2xl shadow-xl border border-zinc-800 z-20 text-white"
          >
            <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center"><Package className="text-[#FFC81E]" size={18} /></div>
            <div className="text-left"><p className="text-[9px] font-bold text-zinc-400 uppercase">Stok Gudang & BOM</p><p className="text-xs font-black text-white">Akurasi FEFO 99.9%</p></div>
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-4xl sm:text-6xl lg:text-[5rem] font-black text-zinc-900 leading-[1.1] tracking-tighter relative z-10 px-4">
            Sistem Pintar untuk <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E87F24] via-[#f09a4d] to-[#FFC81E]">
              Masa Depan Bisnis F&B.
            </span>
          </motion.h1>
        </div>
        
        <motion.p variants={fadeUp} className="mt-6 text-base md:text-xl text-zinc-600 font-medium max-w-2xl leading-relaxed px-4">
          Tinggalkan pencatatan manual. Percepat transaksi kasir, potong stok otomatis via resep (BOM), dan pantau kedaluwarsa dalam satu layar.
        </motion.p>

        {/* Tumpukan Avatar (Social Proof) */}
        <motion.div variants={fadeUp} className="mt-6 flex flex-col items-center gap-2">
          <div className="flex -space-x-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <img key={i} src={`https://i.pravatar.cc/100?img=${i + 20}`} alt="User" className="w-9 h-9 rounded-full border-2 border-white shadow-sm" />
            ))}
            <div className="w-9 h-9 rounded-full border-2 border-white bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-600 shadow-sm z-10">+2k</div>
          </div>
          <p className="text-xs md:text-sm font-bold text-zinc-600">Dipercaya oleh 2.000+ UMKM & Pemilik Gerai</p>
        </motion.div>

        {/* Tombol Aksi (CTA) */}
        <motion.div variants={fadeUp} className="mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-6 relative z-30">
          <button 
            onClick={onOpenApp}
            className="group w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-8 h-14 rounded-full shadow-xl shadow-zinc-900/10 text-base transition-all hover:-translate-y-1 flex items-center justify-center gap-2 overflow-hidden relative cursor-pointer"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
            Buka Simulasi POS <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button 
            onClick={onOpenRegister}
            className="group w-full sm:w-auto bg-white hover:bg-zinc-50 text-zinc-900 border-2 border-zinc-200 font-bold px-8 h-14 rounded-full text-base transition-all flex items-center justify-center gap-2 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
          >
            <PlayCircle size={18} className="text-[#E87F24] group-hover:scale-110 transition-transform" /> Coba Gratis 14 Hari
          </button>
        </motion.div>
      </motion.div>

      {/* Mockup Dashboard */}
      <motion.div 
        initial={{ opacity: 0, y: 100, rotateX: 10 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: 1.2, delay: 0.4, type: "spring", bounce: 0.2 }} style={{ perspective: 1200 }}
        className="mt-14 w-full max-w-5xl mx-auto relative z-20 px-4"
      >
        <div className="rounded-t-[2rem] rounded-b-xl border-[6px] border-zinc-900 bg-zinc-900 shadow-[0_30px_60px_rgb(0,0,0,0.15)] overflow-hidden relative">
          
          <div className="h-10 bg-zinc-900 flex items-center px-4 gap-2">
            <div className="w-3 h-3 rounded-full bg-zinc-700 hover:bg-[#FF5F56] transition-colors cursor-pointer"></div>
            <div className="w-3 h-3 rounded-full bg-zinc-700 hover:bg-[#FFBD2E] transition-colors cursor-pointer"></div>
            <div className="w-3 h-3 rounded-full bg-zinc-700 hover:bg-[#27C93F] transition-colors cursor-pointer"></div>
          </div>

          <div className="bg-zinc-50 flex flex-col md:flex-row h-full rounded-b-md overflow-hidden text-left">
            <div className="w-full md:w-64 p-6 space-y-4 border-r border-zinc-200/60 bg-white">
              <div className="h-8 bg-zinc-100 rounded-lg animate-pulse mb-8"></div>
              <div className="h-10 bg-[#E87F24]/10 border border-[#E87F24]/20 rounded-lg flex items-center px-4 gap-3">
                <Store size={16} className="text-[#E87F24]" /> <span className="text-sm font-bold text-[#E87F24]">Dashboard Stocko</span>
              </div>
              <div className="h-8 bg-zinc-50 rounded-lg"></div>
              <div className="h-8 bg-zinc-50 rounded-lg w-3/4"></div>
            </div>

            <div className="flex-1 p-6 md:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                  <div className="text-xs font-bold text-zinc-400 mb-2">Total Transaksi Hari Ini</div>
                  <div className="text-3xl font-black text-zinc-900">1,248</div>
                </div>
                <div className="flex-1 bg-gradient-to-br from-[#E87F24] to-[#FFC81E] rounded-2xl p-6 shadow-lg text-white">
                  <div className="text-xs font-bold text-white/90 mb-2">Pendapatan Kotor</div>
                  <div className="text-3xl font-black">Rp 12,4 Jt</div>
                  <div className="text-xs text-white font-medium mt-2 flex items-center gap-1"><TrendingUp size={14}/> Naik 15% dari kemarin</div>
                </div>
              </div>
              
              <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm h-40">
                <div className="h-5 w-40 bg-zinc-100 rounded-md mb-4"></div>
                <div className="space-y-3">
                  <div className="h-10 bg-zinc-50 rounded-xl border border-zinc-100 flex items-center px-4"><div className="h-3 w-3/4 bg-zinc-200 rounded"></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}