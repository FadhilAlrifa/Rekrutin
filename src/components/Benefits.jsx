import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, FileCheck2, Check } from 'lucide-react';

export default function Benefits() {
  const hrBenefits = [
    "Seleksi CV instan tanpa membaca manual",
    "Satu dashboard untuk semua saluran masuk",
    "Notepad wawancara tersimpan di database",
    "Otomatisasi pemisahan kategori pekerjaan"
  ];

  const applicantBenefits = [
    "Transparansi penuh melalui Live Tracker",
    "Satu link mudah untuk mengunggah lamaran",
    "Notifikasi real-time via sistem",
    "Peluang direkomendasikan ke mitra B2B"
  ];

  return (
    <section id="solusi" className="py-24 bg-zinc-950 text-white border-t border-zinc-900 overflow-hidden relative">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#E87F24]/5 rounded-full blur-[120px] -z-10 translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Sinergi Dua Arah</h2>
          <p className="text-zinc-400 font-medium text-lg">Meringankan beban perusahaan, memanusiakan pelamar.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Pilar HRD */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-[2rem] p-8 lg:p-12 hover:bg-zinc-900 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8 pb-8 border-b border-zinc-800">
              <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-700">
                <ShieldCheck className="text-[#E87F24]" size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white">Untuk Tim HRD</h3>
                <p className="text-zinc-400 font-medium mt-1">Otomatisasi & Kontrol Penuh</p>
              </div>
            </div>
            <div className="space-y-4">
              {hrBenefits.map((item, i) => (
                <div key={i} className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                    <Check size={14} className="text-green-500" />
                  </div>
                  <span className="font-medium text-zinc-300 text-sm md:text-base">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Pilar Pelamar */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="bg-white rounded-[2rem] p-8 lg:p-12 border border-zinc-200 shadow-2xl hover:shadow-[#E87F24]/10 transition-shadow text-zinc-900"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8 pb-8 border-b border-zinc-100">
              <div className="w-16 h-16 rounded-2xl bg-[#FEFDDF] flex items-center justify-center shrink-0 border border-[#FFC81E]/30">
                <FileCheck2 className="text-[#E87F24]" size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-zinc-900">Untuk Pelamar</h3>
                <p className="text-zinc-500 font-medium mt-1">Transparansi & Kepastian</p>
              </div>
            </div>
            <div className="space-y-4">
              {applicantBenefits.map((item, i) => (
                <div key={i} className="flex items-center gap-4 bg-zinc-50 border border-zinc-200/60 p-4 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-[#E87F24]/10 flex items-center justify-center shrink-0">
                    <Check size={14} className="text-[#E87F24]" />
                  </div>
                  <span className="font-medium text-zinc-700 text-sm md:text-base">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}