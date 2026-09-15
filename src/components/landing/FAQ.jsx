import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Sparkles } from 'lucide-react';

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState(0); // Buka yang pertama secara default

  const faqs = [
    {
      q: "Bagaimana sistem FEFO (First Expired, First Out) bekerja di Stocko?",
      a: "Saat Anda mencatat stok masuk (restock), sistem akan meminta tanggal kedaluwarsa. Stocko secara otomatis mengurutkan bahan mana yang harus dipakai lebih dulu, dan memberikan notifikasi visual jika ada barang yang mendekati batas simpannya."
    },
    {
      q: "Apakah modul POS langsung terhubung dengan stok gudang?",
      a: "Ya. Setiap transaksi penjualan di meja kasir akan langsung mengurangi jumlah bahan baku di database (melalui integrasi Bill of Materials) secara real-time. Tidak ada lagi selisih antara laporan penjualan dan fisik gudang."
    },
    {
      q: "Bagaimana jika koneksi internet terputus di gerai kami?",
      a: "Sistem kasir Stocko dilengkapi arsitektur offline-first. Anda tetap bisa memproses pesanan dan mencetak struk. Data penjualan akan otomatis disinkronkan ke cloud begitu koneksi internet Anda kembali stabil."
    },
    {
      q: "Apakah aplikasi ini dirancang khusus untuk Track 4.2 Duluinnovation?",
      a: "Benar. Stocko dikembangkan sebagai vertical SaaS yang berfokus pada Smart Inventory & POS untuk F&B/Retail, sebagai bentuk perluasan ekosistem teknologi B2B Duluin."
    }
  ];

  return (
    <section id="faq" className="py-24 bg-zinc-50 border-t border-zinc-200/60 relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-[#E87F24]/5 rounded-full blur-[100px] -z-0 -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Layout 2 Kolom untuk Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Kolom Kiri: Judul & Kontak */}
          <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit">
            <motion.div 
              initial={{ opacity: 0, y: -20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-orange-50 text-[#E87F24] border border-orange-200 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-6"
            >
              <Sparkles size={14} /> Bantuan Terpusat
            </motion.div>
            
            <h2 className="text-3xl md:text-5xl font-black text-zinc-900 tracking-tight mb-6">Pertanyaan<br className="hidden lg:block"/> Umum.</h2>
            <p className="text-zinc-500 font-medium mb-8 leading-relaxed">
              Temukan jawaban tentang bagaimana sistem kasir dan otomatisasi inventaris kami bekerja.
            </p>
            
            <div className="bg-white border border-zinc-200 p-8 rounded-[2rem] shadow-sm">
              <p className="text-base font-black text-zinc-900 mb-2">Masih ada keraguan?</p>
              <p className="text-sm text-zinc-500 mb-6">Tim teknis kami siap memandu Anda melakukan integrasi awal untuk gerai Anda.</p>
              <button className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-black text-sm py-4 rounded-2xl transition-colors shadow-md cursor-pointer">
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
                className={`border rounded-3xl transition-all duration-300 overflow-hidden ${
                  activeIndex === index ? 'bg-white border-[#E87F24]/40 shadow-lg shadow-[#E87F24]/5' : 'bg-transparent border-zinc-200 hover:border-zinc-300 hover:bg-white/50'
                }`}
              >
                <button 
                  onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                  className="w-full text-left p-6 md:p-8 flex justify-between items-center focus:outline-none cursor-pointer"
                >
                  <span className={`font-black text-base md:text-lg pr-8 transition-colors ${activeIndex === index ? 'text-[#E87F24]' : 'text-zinc-700 hover:text-zinc-900'}`}>
                    {faq.q}
                  </span>
                  <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    activeIndex === index ? 'bg-orange-50 text-[#E87F24]' : 'bg-zinc-100 text-zinc-400'
                  }`}>
                    {activeIndex === index ? <Minus size={18} /> : <Plus size={18} />}
                  </div>
                </button>
                
                <AnimatePresence>
                  {activeIndex === index && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 md:px-8 pb-6 md:pb-8 text-zinc-600 text-sm font-medium leading-relaxed border-t border-zinc-100 pt-4 mt-2">
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