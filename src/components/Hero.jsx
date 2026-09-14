import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, PlayCircle, Users, CheckCircle2, Bot, Sparkles } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 20 } }
};

export default function Hero() {
  return (
    <section className="relative pt-36 pb-12 px-6 max-w-7xl mx-auto flex flex-col items-center text-center overflow-hidden">
      
      {/* 1. BACKGROUND ORNAMENTS (Grid & Glowing Orbs) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-20"></div>
      
      {/* Bola cahaya melayang di belakang */}
      <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#E87F24]/10 rounded-full blur-[100px] -z-10"></motion.div>
      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 10, repeat: Infinity, delay: 1 }} className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-[#FFC81E]/15 rounded-full blur-[100px] -z-10"></motion.div>
      
      <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }} initial="hidden" animate="show" className="relative z-10 w-full flex flex-col items-center">
        
        {/* Badge Atas */}
        <motion.div variants={fadeUp} className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-5 py-2 rounded-full border border-zinc-200 shadow-sm mb-8 hover:shadow-md transition-shadow cursor-default">
          <Sparkles size={14} className="text-[#E87F24]" />
          <span className="text-[11px] font-black text-zinc-700 uppercase tracking-widest">RecruitIn by Duluin Systems</span>
        </motion.div>

        {/* Teks Utama (Hero Title) dengan Elemen Melayang di Sisinya */}
        <div className="relative w-full max-w-5xl">
          
          {/* Elemen Melayang Kiri (Hanya muncul di Desktop) */}
          <motion.div 
            initial={{ opacity: 0, x: -50, rotate: -10 }} animate={{ opacity: 1, x: 0, rotate: -6 }} transition={{ duration: 1, delay: 0.5, type: "spring" }}
            className="absolute -left-10 top-10 hidden lg:flex items-center gap-3 bg-white p-3 pr-5 rounded-2xl shadow-xl border border-zinc-100 z-20"
          >
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center"><CheckCircle2 className="text-green-600" size={20} /></div>
            <div className="text-left"><p className="text-[10px] font-bold text-zinc-400 uppercase">Akurasi AI</p><p className="text-sm font-black text-zinc-900">99.8% Presisi</p></div>
          </motion.div>

          {/* Elemen Melayang Kanan (Hanya muncul di Desktop) */}
          <motion.div 
            initial={{ opacity: 0, x: 50, rotate: 10 }} animate={{ opacity: 1, x: 0, rotate: 6 }} transition={{ duration: 1, delay: 0.7, type: "spring" }}
            className="absolute -right-4 top-24 hidden lg:flex items-center gap-3 bg-zinc-900 p-3 pr-5 rounded-2xl shadow-xl border border-zinc-800 z-20"
          >
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center"><Bot className="text-[#FFC81E]" size={20} /></div>
            <div className="text-left"><p className="text-[10px] font-bold text-zinc-400 uppercase">Penyaringan</p><p className="text-sm font-black text-white">1000+ CV / Detik</p></div>
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl lg:text-[5.5rem] font-black text-zinc-900 leading-[1.05] tracking-tighter relative z-10">
            Satu Platform untuk <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E87F24] via-[#f09a4d] to-[#FFC81E]">
              Masa Depan Rekrutmen.
            </span>
          </motion.h1>
        </div>
        
        <motion.p variants={fadeUp} className="mt-8 text-lg md:text-xl text-zinc-500 font-medium max-w-2xl leading-relaxed">
          Akhiri budaya <i>ghosting</i>. Saring ribuan CV dengan AI, lakukan wawancara virtual, dan berikan transparansi penuh kepada pelamar.
        </motion.p>

        {/* Tumpukan Avatar (Social Proof) */}
        <motion.div variants={fadeUp} className="mt-8 flex flex-col items-center gap-3">
          <div className="flex -space-x-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <img key={i} src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
            ))}
            <div className="w-10 h-10 rounded-full border-2 border-white bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-600 shadow-sm z-10">+2k</div>
          </div>
          <p className="text-sm font-bold text-zinc-500">Dipercaya oleh 2.000+ Tim HR Cerdas</p>
        </motion.div>

        {/* Tombol Aksi (CTA) */}
        <motion.div variants={fadeUp} className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 sm:px-0 relative z-30">
          <button className="group w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-8 h-14 md:h-16 rounded-full shadow-xl shadow-zinc-900/20 text-base md:text-lg transition-all hover:-translate-y-1 flex items-center justify-center gap-2 overflow-hidden relative">
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
            Jadwalkan Demo <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="group w-full sm:w-auto bg-white hover:bg-zinc-50 text-zinc-900 border-2 border-zinc-200 font-bold px-8 h-14 md:h-16 rounded-full text-base md:text-lg transition-all flex items-center justify-center gap-2 hover:-translate-y-1 hover:shadow-lg">
            <PlayCircle size={20} className="text-[#E87F24] group-hover:scale-110 transition-transform" /> Cara Kerja AI
          </button>
        </motion.div>
      </motion.div>

      {/* Mockup Dashboard dengan Efek Bayangan Premium */}
      <motion.div 
        initial={{ opacity: 0, y: 150, rotateX: 15 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: 1.2, delay: 0.4, type: "spring", bounce: 0.2 }} style={{ perspective: 1200 }}
        className="mt-16 w-full max-w-5xl mx-auto relative z-20"
      >
        <div className="rounded-t-[2rem] rounded-b-xl border-[6px] border-zinc-900 bg-zinc-900 shadow-[0_30px_60px_rgb(0,0,0,0.2)] overflow-hidden relative">
          
          <div className="h-10 bg-zinc-900 flex items-center px-4 gap-2">
            <div className="w-3 h-3 rounded-full bg-zinc-700 hover:bg-[#FF5F56] transition-colors cursor-pointer"></div>
            <div className="w-3 h-3 rounded-full bg-zinc-700 hover:bg-[#FFBD2E] transition-colors cursor-pointer"></div>
            <div className="w-3 h-3 rounded-full bg-zinc-700 hover:bg-[#27C93F] transition-colors cursor-pointer"></div>
          </div>

          <div className="bg-zinc-50 flex flex-col md:flex-row h-full rounded-b-md overflow-hidden">
            <div className="w-full md:w-64 p-6 space-y-4 border-r border-zinc-200/60 bg-white">
              <div className="h-8 bg-zinc-100 rounded-lg animate-pulse mb-8"></div>
              <div className="h-10 bg-[#E87F24]/10 border border-[#E87F24]/20 rounded-lg flex items-center px-4 gap-3">
                <Users size={16} className="text-[#E87F24]" /> <span className="text-sm font-bold text-[#E87F24]">Dashboard HR</span>
              </div>
              <div className="h-8 bg-zinc-50 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"></div>
              <div className="h-8 bg-zinc-50 rounded-lg w-3/4 hover:bg-zinc-100 transition-colors cursor-pointer"></div>
            </div>

            <div className="flex-1 p-6 md:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-sm font-bold text-zinc-400 mb-2">Total Pelamar Masuk</div>
                  <div className="text-4xl font-black text-zinc-900">1,248</div>
                </div>
                <div className="flex-1 bg-gradient-to-br from-[#E87F24] to-[#FFC81E] rounded-2xl p-6 shadow-lg text-white transform hover:scale-[1.02] transition-transform">
                  <div className="text-sm font-bold text-white/80 mb-2">Lolos Seleksi AI</div>
                  <div className="text-4xl font-black">342</div>
                  <div className="text-sm text-white/90 font-medium mt-2 flex items-center gap-1"><CheckCircle2 size={14}/> Siap diwawancara</div>
                </div>
              </div>
              
              <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm h-48">
                <div className="h-6 w-48 bg-zinc-100 rounded-md mb-6"></div>
                <div className="space-y-3">
                  <div className="h-12 bg-zinc-50 rounded-xl border border-zinc-100"></div>
                  <div className="h-12 bg-zinc-50 rounded-xl border border-zinc-100 w-11/12"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}