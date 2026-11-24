import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ChevronDown, MessageSquare } from 'lucide-react';
import MaskedWords from './MaskedWords';
import {
  animateMaskedWordsOnScroll,
  animateSlideUpOnScroll
} from './headingReveal';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function FAQ() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const faqs = [
    {
      tag: '01 // KEDALUWARSA',
      q: 'Bagaimana sistem FEFO (First Expired, First Out) bekerja di Stocko?',
      a: 'Saat Anda mencatat stok masuk (restock), sistem mencatat tanggal kedaluwarsa setiap bahan baku. Stocko secara otomatis memprioritaskan bahan yang masa simpannya paling dekat (≤ 30 hari) dan menampilkan peringatan visual di modul Peringatan Gudang.'
    },
    {
      tag: '02 // STOK RESEP',
      q: 'Apakah modul POS langsung terhubung dengan stok bahan mentah di gudang?',
      a: 'Ya. Setiap transaksi penjualan di meja kasir maupun QR Self-Order langsung mengonversi satuan (gram/ml ke kg/liter) dan memotong jumlah bahan baku di database melalui mesin Bill of Materials secara real-time.'
    },
    {
      tag: '03 // CEK BAHAN',
      q: 'Apa yang terjadi jika bahan baku di gudang tidak cukup saat kasir menginput pesanan?',
      a: 'Mesin Cross-Menu Validation Stocko menghitung akumulasi kebutuhan bahan dari seluruh item di keranjang secara kolektif. Jika ada bahan yang tidak mencukupi, sistem otomatis mengunci penambahan porsi sebelum transaksi terjadi.'
    },
    {
      tag: '04 // HAK AKSES',
      q: 'Bisakah saya memisahkan akses antara Kasir dan Staf Gudang?',
      a: 'Tentu. Melalui sistem pembagian hak akses, pemilik gerai dapat membuat akun khusus Kasir yang hanya membuka layar penjualan dan akun Stocker yang khusus mengelola inventaris gudang.'
    }
  ];

  useGSAP(
    () => {
      animateMaskedWordsOnScroll(headingRef.current);
      animateSlideUpOnScroll('.faq-reveal', sectionRef.current, {
        y: 35,
        duration: 0.85,
        stagger: 0.08
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="faq"
      className="py-24 md:py-32 bg-[#FAFAFA] text-[#141414] border-b border-zinc-200 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Column */}
          <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
            <div className="space-y-3">
              <span className="faq-reveal font-mono text-xs uppercase tracking-[0.2em] text-[#D97706] font-bold block gpu-accelerated">
                [ 05 // TANYA JAWAB ]
              </span>
              <h2
                ref={headingRef}
                className="text-3xl sm:text-5xl font-extrabold text-[#141414] tracking-tight leading-[1.08]"
              >
                <MaskedWords
                  segments={[
                    { text: 'Pertanyaan' },
                    { text: 'Umum.', className: 'font-serif italic font-normal text-[#F59E0B]' }
                  ]}
                />
              </h2>
              <p className="faq-reveal text-[#52525B] text-sm font-medium leading-relaxed gpu-accelerated">
                Pelajari cara kerja otomatisasi resep BOM, peringatan dini FEFO, dan manajemen operasional di Stocko.
              </p>
            </div>

            <div className="faq-reveal bg-white border border-zinc-200 rounded-3xl p-6 space-y-4 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.06)] gpu-accelerated">
              <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] text-[#D97706] flex items-center justify-center">
                <MessageSquare size={18} />
              </div>
              <div className="space-y-1">
                <p className="text-base font-bold text-[#141414]">Butuh konsultasi implementasi?</p>
                <p className="text-xs text-[#52525B] font-medium leading-relaxed">
                  Tim teknis kami siap memandu migrasi katalog menu dan takaran resep gerai Anda.
                </p>
              </div>
              <a
                href="mailto:hello@duluin.com"
                data-cursor="Email"
                className="w-full bg-[#141414] hover:bg-zinc-800 text-white font-bold text-xs py-3 rounded-full transition-colors flex items-center justify-center cursor-pointer"
              >
                Hubungi Tim Teknis
              </a>
            </div>
          </div>

          {/* Right Column: Editorial Accordion */}
          <div className="lg:col-span-8 space-y-3.5">
            {faqs.map((faq, index) => {
              const isOpen = activeIndex === index;
              return (
                <div
                  key={index}
                  className={`faq-reveal rounded-2xl border transition-colors duration-200 overflow-hidden gpu-accelerated ${
                    isOpen
                      ? 'bg-white border-[#F59E0B] shadow-[0_12px_30px_-10px_rgba(245,158,11,0.12)]'
                      : 'bg-white border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setActiveIndex(isOpen ? null : index)}
                    className="w-full text-left p-5 sm:p-6 flex justify-between items-center gap-4 focus:outline-none cursor-pointer"
                  >
                    <div className="space-y-1.5 pr-2">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#D97706] block">
                        {faq.tag}
                      </span>
                      <p className="font-bold text-sm sm:text-base text-[#141414]">{faq.q}</p>
                    </div>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center border transition-colors ${
                        isOpen
                          ? 'bg-[#F59E0B] text-[#141414] border-[#F59E0B]'
                          : 'bg-[#FAFAFA] text-[#52525B] border-zinc-200'
                      }`}
                    >
                      <ChevronDown size={17} />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 sm:px-6 pb-6 pt-3 text-[#52525B] text-xs sm:text-sm font-medium leading-relaxed border-t border-zinc-200">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
