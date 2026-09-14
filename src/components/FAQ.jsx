import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState(0); // Buka yang pertama secara default

  const faqs = [
    {
      q: "Bagaimana cara kerja AI Scoring?",
      a: "Sistem kami mengekstrak teks dari CV (PDF/Word) menggunakan algoritma khusus, lalu mencocokkan kata kunci pengalaman dan keahlian dengan deskripsi lowongan kerja Anda secara otomatis dan objektif."
    },
    {
      q: "Apakah ini menggantikan Workin by Duluin?",
      a: "Tidak. RecruitIn adalah ekosistem pra-kerja (untuk pelamar). Setelah pelamar diterima, datanya dapat disinkronkan ke Workin yang mengurus karyawan aktif (absensi, cuti, dll)."
    },
    {
      q: "Bagaimana nasib kandidat yang tidak lulus?",
      a: "Kandidat tidak dihapus, melainkan masuk ke dalam 'Talent Pool'. Mereka dapat difilter kembali di masa depan atau direkomendasikan pada perusahaan mitra jika spesifikasi mereka cocok."
    },
    {
      q: "Apakah pelamar butuh mengunduh aplikasi?",
      a: "Tidak. Seluruh proses pelamar berjalan melalui antarmuka web yang responsif (Smart Link). Pelamar dapat mengunggah CV dan melihat Live Tracker langsung dari browser HP mereka."
    }
  ];

  return (
    <section className="py-24 bg-zinc-50 border-t border-zinc-200/50">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Layout 2 Kolom untuk Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Kolom Kiri: Judul & Kontak */}
          <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit">
            <h2 className="text-3xl md:text-5xl font-black text-zinc-900 tracking-tight mb-4">Pertanyaan<br className="hidden lg:block"/> Umum.</h2>
            <p className="text-zinc-500 font-medium mb-8">
              Temukan jawaban tentang bagaimana sistem kecerdasan buatan kami bekerja.
            </p>
            <div className="bg-white p-6 rounded-2xl border border-zinc-200">
              <p className="text-sm font-bold text-zinc-900 mb-2">Masih ada keraguan?</p>
              <p className="text-sm text-zinc-500 mb-4">Tim teknis kami siap memandu Anda melakukan integrasi awal.</p>
              <button className="w-full bg-[#E87F24] hover:bg-[#c96a1a] text-white font-bold py-3 rounded-xl transition-colors">
                Hubungi Support
              </button>
            </div>
          </div>

          {/* Kolom Kanan: Daftar Pertanyaan */}
          <div className="lg:col-span-8 space-y-4">
            {faqs.map((faq, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}
                className={`border rounded-2xl transition-all duration-300 overflow-hidden ${
                  activeIndex === index ? 'bg-white border-[#E87F24]/30 shadow-md shadow-[#E87F24]/5' : 'bg-transparent border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <button 
                  onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                  className="w-full text-left p-6 md:p-8 flex justify-between items-center focus:outline-none"
                >
                  <span className={`font-bold text-lg pr-8 transition-colors ${activeIndex === index ? 'text-[#E87F24]' : 'text-zinc-900'}`}>
                    {faq.q}
                  </span>
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    activeIndex === index ? 'bg-[#E87F24]/10 text-[#E87F24]' : 'bg-zinc-100 text-zinc-400'
                  }`}>
                    {activeIndex === index ? <Minus size={16} /> : <Plus size={16} />}
                  </div>
                </button>
                
                <AnimatePresence>
                  {activeIndex === index && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 md:px-8 pb-6 md:pb-8 text-zinc-600 font-medium leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}