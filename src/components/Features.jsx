import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Video, Users, Search, Scan } from 'lucide-react';

export default function Features() {
  return (
    <section id="fitur" className="py-28 bg-[#f8f9fb] relative z-20 border-t border-zinc-200/60 overflow-hidden">
      {/* Glow Latar Belakang */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[500px] bg-gradient-to-r from-[#E87F24]/10 to-[#FFC81E]/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="inline-block bg-white border border-zinc-200 px-4 py-1.5 rounded-full mb-6 shadow-sm">
            <span className="text-xs font-black bg-clip-text text-transparent bg-gradient-to-r from-[#E87F24] to-[#FFC81E] uppercase tracking-widest">
              Teknologi Inti
            </span>
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl md:text-6xl font-black text-zinc-900 tracking-tight leading-[1.1]">
            Mesin Cerdas di Balik <br />Rekrutmen Masa Depan.
          </motion.h2>
        </div>

        {/* BENTO GRID ASIMETRIS MODERN */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[320px]">
          
          {/* Card 1: AI Scoring (Lebar, Kiri Atas) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="md:col-span-8 bg-white rounded-[2.5rem] p-8 md:p-10 border border-zinc-200 shadow-xl shadow-zinc-200/40 hover:shadow-2xl hover:shadow-[#E87F24]/10 transition-all duration-500 overflow-hidden relative group"
          >
            {/* Animasi Internal: Laser Pemindai CV */}
            <div className="absolute right-10 top-1/2 -translate-y-1/2 w-48 h-64 bg-zinc-50 border border-zinc-200 rounded-2xl hidden lg:block overflow-hidden shadow-sm">
              <div className="p-4 space-y-3 opacity-30">
                <div className="w-10 h-10 bg-zinc-300 rounded-full"></div>
                <div className="h-2 w-full bg-zinc-300 rounded"></div>
                <div className="h-2 w-3/4 bg-zinc-300 rounded"></div>
                <div className="h-2 w-5/6 bg-zinc-300 rounded"></div>
              </div>
              {/* Garis Pemindai (Scan Line) */}
              <motion.div 
                animate={{ top: ['0%', '100%', '0%'] }} transition={{ duration: 3, ease: "linear", repeat: Infinity }}
                className="absolute left-0 right-0 h-1 bg-[#E87F24] shadow-[0_0_15px_#E87F24] z-10"
              ></motion.div>
            </div>

            <div className="relative z-10 max-w-sm">
              <div className="w-16 h-16 rounded-2xl bg-zinc-950 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <Bot className="text-[#FFC81E]" size={32} />
              </div>
              <h3 className="text-3xl font-black text-zinc-900 mb-4">AI CV Filtration</h3>
              <p className="text-zinc-500 font-medium leading-relaxed">
                Algoritma NLP kami membedah ribuan PDF dalam sekejap. Ekstrak data, analisis keahlian, dan hasilkan <b>Skor Kecocokan</b> absolut tanpa bias manusia.
              </p>
            </div>
          </motion.div>

          {/* Card 2: Video Interview (Kotak, Kanan Atas) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, delay: 0.1 }}
            className="md:col-span-4 bg-gradient-to-br from-[#E87F24] to-[#c96a1a] rounded-[2.5rem] p-8 md:p-10 border border-[#E87F24] text-white hover:shadow-2xl hover:shadow-[#E87F24]/30 transition-all duration-500 relative overflow-hidden group"
          >
            {/* Animasi Internal: Radar/Pulse Call */}
            <div className="absolute -right-10 -top-10 w-48 h-48 flex items-center justify-center">
              <motion.div animate={{ scale: [1, 2], opacity: [0.5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute w-24 h-24 bg-white/30 rounded-full"></motion.div>
              <motion.div animate={{ scale: [1, 2.5], opacity: [0.3, 0] }} transition={{ duration: 2, delay: 0.5, repeat: Infinity }} className="absolute w-24 h-24 bg-white/20 rounded-full"></motion.div>
            </div>

            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <Video size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-black mb-2">Live Interview</h3>
                <p className="text-white/80 font-medium leading-relaxed text-sm">Video call terintegrasi dengan split-screen CV dan notepad.</p>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Talent Pool (Kotak, Kiri Bawah) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, delay: 0.2 }}
            className="md:col-span-4 bg-zinc-950 rounded-[2.5rem] p-8 md:p-10 border border-zinc-800 text-white hover:shadow-2xl hover:shadow-zinc-900/50 transition-all duration-500 relative overflow-hidden group"
          >
            {/* Animasi Internal: Floating Avatars */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute top-10 right-10 w-8 h-8 bg-zinc-600 rounded-full"></motion.div>
              <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 1 }} className="absolute bottom-20 right-24 w-12 h-12 bg-zinc-700 rounded-full"></motion.div>
              <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 5, repeat: Infinity, delay: 2 }} className="absolute top-32 left-32 w-10 h-10 bg-zinc-800 rounded-full"></motion.div>
            </div>

            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <Users className="text-[#FFC81E]" size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-black mb-2">Talent Pool</h3>
                <p className="text-zinc-400 font-medium leading-relaxed text-sm">Simpan aset kandidat potensial untuk kebutuhan masa depan.</p>
              </div>
            </div>
          </motion.div>

          {/* Card 4: Tracker (Lebar, Kanan Bawah) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, delay: 0.3 }}
            className="md:col-span-8 bg-[#FEFDDF] rounded-[2.5rem] p-8 md:p-10 border border-[#FFC81E]/40 hover:shadow-2xl hover:shadow-[#FFC81E]/20 transition-all duration-500 relative overflow-hidden group"
          >
            {/* Animasi Internal: Progress Bar Berjalan */}
            <div className="absolute right-10 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-4 opacity-50 group-hover:opacity-100 transition-opacity duration-500 w-64 bg-white/60 backdrop-blur-sm p-5 rounded-2xl border border-white">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-500">
                <span>Status Pelamar</span>
                <span className="text-[#E87F24]">Wawancara</span>
              </div>
              <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden relative">
                <motion.div 
                  initial={{ width: "0%" }} whileInView={{ width: "75%" }} transition={{ duration: 1.5, delay: 0.5 }}
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#FFC81E] to-[#E87F24] rounded-full"
                ></motion.div>
              </div>
            </div>

            <div className="relative z-10 max-w-sm">
              <div className="w-16 h-16 rounded-2xl bg-white border border-[#FFC81E]/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                <Search className="text-[#E87F24]" size={32} />
              </div>
              <h3 className="text-3xl font-black text-zinc-900 mb-4">Live Tracker</h3>
              <p className="text-zinc-700 font-medium leading-relaxed">
                Akhiri era <i>ghosting</i>. Pelamar memiliki portal mandiri untuk melacak setiap tahapan dokumen mereka layaknya melacak pengiriman logistik premium.
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}