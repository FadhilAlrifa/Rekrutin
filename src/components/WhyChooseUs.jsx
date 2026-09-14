import React from 'react';
import { motion } from 'framer-motion';
import { Timer, Zap, CheckCircle } from 'lucide-react';

export default function WhyChooseUs() {
  const reasons = [
    {
      icon: <Timer size={36} className="text-[#E87F24]" />,
      stat: "80%",
      title: "Efisiensi Waktu",
      desc: "Pemilahan ribuan CV yang sebelumnya memakan waktu berminggu-minggu, kini dieksekusi AI dalam hitungan detik."
    },
    {
      icon: <CheckCircle size={36} className="text-[#E87F24]" />,
      stat: "0%",
      title: "Ghosting Rate",
      desc: "Sistem otomatisasi menjamin setiap kandidat mendapat notifikasi kepastian, meningkatkan reputasi perusahaan Anda."
    },
    {
      icon: <Zap size={36} className="text-[#E87F24]" />,
      stat: "100%",
      title: "Terintegrasi",
      desc: "Data kandidat yang diterima langsung terhubung ke sistem HRIS internal tanpa proses ketik ulang yang melelahkan."
    }
  ];

  return (
    <section className="py-28 bg-zinc-950 text-white relative border-t border-zinc-900 overflow-hidden">
      {/* Ornamen Grid Latar Belakang */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:64px_64px]"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl md:text-6xl font-black tracking-tight mb-6">
            Bukan Sekadar Alat. <br className="hidden md:block" />Ini <span className="text-[#E87F24]">Keunggulan Kompetitif.</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-zinc-400 font-medium text-lg md:text-xl max-w-2xl mx-auto">
            Angka tidak pernah bohong. Inilah mengapa perusahaan B2B beralih meninggalkan metode rekrutmen tradisional.
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