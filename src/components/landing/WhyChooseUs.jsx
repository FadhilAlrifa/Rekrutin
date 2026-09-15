import React from 'react';
import { motion } from 'framer-motion';
import { Layers, ShieldCheck, Zap } from 'lucide-react';

export default function WhyChooseUs() {
  const reasons = [
    {
      icon: <Layers size={36} className="text-[#E87F24]" />,
      stat: "100%",
      title: "Otomasi BOM & Stok",
      desc: "Setiap pesanan di POS kasir otomatis memotong persediaan bahan baku di gudang secara presisi tanpa perlu rekap manual yang melelahkan."
    },
    {
      icon: <ShieldCheck size={36} className="text-[#E87F24]" />,
      stat: "0%",
      title: "Human Error",
      desc: "Sistem cerdas memantau batas minimum restock dan masa kedaluwarsa secara real-time, menjaga kualitas bahan selalu prima."
    },
    {
      icon: <Zap size={36} className="text-[#E87F24]" />,
      stat: "24/7",
      title: "Kontrol Terintegrasi",
      desc: "Manajemen inventaris, pengelolaan menu, hingga analitik laporan keuangan terhubung dalam satu dasbor yang cepat dan responsif."
    }
  ];

  return (
    <section className="py-28 bg-zinc-950 text-white relative border-t border-zinc-900 overflow-hidden">
      {/* Ornamen Grid Latar Belakang */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:64px_64px]"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl md:text-6xl font-black tracking-tight mb-6">
            Bukan Sekadar POS. <br className="hidden md:block" />Ini <span className="text-[#E87F24]">Solusi Gudang Cerdas.</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-zinc-400 font-medium text-lg md:text-xl max-w-2xl mx-auto">
            Tinggalkan pencatatan manual yang rentan selisih. Inilah mengapa Stocko menjadi standar baru operasional F&B modern.
          </motion.p>
        </div>

        {/* INTERACTIVE CARDS DENGAN EFEK DIM/BLUR SAAT DI HOVER */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 group">
          {reasons.map((item, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.15 }}
              className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-[2rem] p-10 hover:bg-zinc-800/80 hover:border-[#E87F24]/50 hover:-translate-y-4 hover:shadow-[0_0_40px_rgba(232,127,36,0.15)] transition-all duration-500 cursor-default
              /* Efek redup untuk kartu lain saat salah satu di hover */
              group-hover:opacity-40 group-hover:blur-[2px] hover:!opacity-100 hover:!blur-0"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="w-16 h-16 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shadow-inner">
                  {item.icon}
                </div>
                {/* Animasi Floating Teks Transparan */}
                <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-zinc-700 to-transparent opacity-50 select-none">
                  {item.stat}
                </span>
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
              <p className="text-zinc-400 font-medium leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}