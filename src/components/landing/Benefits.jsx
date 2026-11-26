import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Package, Store, Check } from 'lucide-react';
import MaskedWords from './MaskedWords';
import {
  animateMaskedWordsOnScroll,
  animateSlideUpOnScroll
} from './headingReveal';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Benefits() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const [activeOwnerIdx, setActiveOwnerIdx] = useState(0);
  const [activeCashierIdx, setActiveCashierIdx] = useState(0);

  const ownerBenefits = [
    {
      title: 'Pemantauan pergerakan stok secara real-time',
      metric: 'Pantau Langsung',
      detail: 'Stok bahan mentah langsung berkurang mengikuti gramasi resep setiap menu yang terjual.'
    },
    {
      title: 'Peringatan dini bahan baku hampir basi (FEFO)',
      metric: 'Kurangi Terbuang',
      detail: 'Notifikasi otomatis ≤ 30 hari sebelum tanggal kedaluwarsa untuk rotasi stok yang tertib.'
    },
    {
      title: 'Otomatisasi laporan omzet & analitik produk terlaris',
      metric: 'Download Laporan',
      detail: 'Rekapitulasi transaksi harian, bulanan, dan metode pembayaran tanpa olah spreadsheet manual.'
    },
    {
      title: 'Mencegah kebocoran dan selisih stok fisik vs sistem',
      metric: 'Akses Terpisah',
      detail: 'Akses akun dipisah antara Pemilik, Kasir, dan Petugas Gudang.'
    }
  ];

  const cashierBenefits = [
    {
      title: 'Proses pembayaran di kasir lebih cepat',
      metric: '< 3 Detik / Order',
      detail: 'Dilengkapi tombol cepat Uang Pas, 50rb, dan 100rb untuk mempercepat antrean kasir.'
    },
    {
      title: 'Pencatatan kustomisasi pesanan (catatan dapur) akurat',
      metric: 'Minim Salah Catat',
      detail: 'Tambahkan instruksi khusus seperti kurang manis atau tanpa es langsung pada item keranjang.'
    },
    {
      title: 'Pencetakan struk instan & dukungan pembayaran digital',
      metric: 'QRIS • Tunai • Kartu',
      detail: 'Langsung cetak struk tanpa membuka tab baru yang mengganggu layar kasir.'
    },
    {
      title: 'Validasi stok otomatis sebelum pesanan dibuat',
      metric: 'Anti Stok Minus',
      detail: 'Kasir langsung mengetahui jumlah porsi maksimal yang bisa dijual berdasarkan sisa bahan gudang.'
    }
  ];

  useGSAP(
    () => {
      animateMaskedWordsOnScroll(headingRef.current);
      animateSlideUpOnScroll('.benefits-reveal', sectionRef.current, {
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
      id="benefits"
      className="py-24 md:py-32 bg-[#FAFAFA] text-[#141414] border-b border-zinc-200 overflow-hidden relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
        {/* Editorial Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end pb-10 border-b border-zinc-200">
          <div className="lg:col-span-8 space-y-3">
            <span className="benefits-reveal text-xs text-[#D97706] font-bold block gpu-accelerated">
              Manfaat
            </span>
            <h2
              ref={headingRef}
              className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.08] text-[#141414]"
            >
              <MaskedWords
                segments={[
                  { text: 'Dirancang Untuk Pemilik &' },
                  { text: 'Tim Operasional.', className: 'font-serif italic font-normal text-[#F59E0B]' }
                ]}
              />
            </h2>
          </div>
          <div className="lg:col-span-4 benefits-reveal gpu-accelerated">
            <p className="text-[#52525B] font-medium text-sm leading-relaxed">
              Klik atau arahkan kursor ke tiap poin untuk melihat manfaatnya bagi pemilik, gudang, dan kasir.
            </p>
          </div>
        </div>

        {/* Architectural Grid 2-Column Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 border border-zinc-200 rounded-3xl overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-zinc-200 bg-white shadow-[0_16px_44px_-16px_rgba(0,0,0,0.06)]">
          {/* Back-of-House */}
          <div data-cursor="Explore" className="benefits-reveal p-6 sm:p-10 space-y-7 gpu-accelerated">
            <div className="flex items-center gap-4 pb-6 border-b border-zinc-200">
              <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center shrink-0 text-[#D97706]">
                <Package size={24} />
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#D97706] font-bold">
                  PEMILIK & GUDANG
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#141414]">
                  Untuk Pemilik & Gudang
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              {ownerBenefits.map((item, i) => {
                const isActive = activeOwnerIdx === i;
                return (
                  <div
                    key={i}
                    onClick={() => setActiveOwnerIdx(i)}
                    onMouseEnter={() => setActiveOwnerIdx(i)}
                    className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-[#FEF3C7]/45 border-[#F59E0B]'
                        : 'bg-[#FAFAFA] border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                            isActive ? 'bg-[#F59E0B] text-[#141414]' : 'bg-zinc-200 text-[#52525B]'
                          }`}
                        >
                          <Check size={13} strokeWidth={2.5} />
                        </div>
                        <span className="font-bold text-[#141414] text-xs sm:text-sm">{item.title}</span>
                      </div>
                      <span className="font-mono text-[10px] font-bold text-[#B45309] bg-[#FEF3C7] border border-[#FDE68A] px-2.5 py-0.5 rounded-full shrink-0">
                        {item.metric}
                      </span>
                    </div>
                    {isActive && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="text-xs text-[#52525B] font-medium pl-9 pt-2 leading-relaxed"
                      >
                        {item.detail}
                      </motion.p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Front-of-House */}
          <div data-cursor="Explore" className="benefits-reveal p-6 sm:p-10 space-y-7 gpu-accelerated">
            <div className="flex items-center gap-4 pb-6 border-b border-zinc-200">
              <div className="w-12 h-12 rounded-2xl bg-[#141414] flex items-center justify-center shrink-0 text-[#F59E0B]">
                <Store size={24} />
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#52525B] font-bold">
                  KASIR & PELAYAN
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#141414]">
                  Untuk Kasir & Pramusaji
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              {cashierBenefits.map((item, i) => {
                const isActive = activeCashierIdx === i;
                return (
                  <div
                    key={i}
                    onClick={() => setActiveCashierIdx(i)}
                    onMouseEnter={() => setActiveCashierIdx(i)}
                    className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-[#FEF3C7]/45 border-[#F59E0B]'
                        : 'bg-[#FAFAFA] border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                            isActive ? 'bg-[#F59E0B] text-[#141414]' : 'bg-zinc-200 text-[#52525B]'
                          }`}
                        >
                          <Check size={13} strokeWidth={2.5} />
                        </div>
                        <span className="font-bold text-[#141414] text-xs sm:text-sm">{item.title}</span>
                      </div>
                      <span className="font-mono text-[10px] font-bold text-[#141414] bg-white border border-zinc-200 px-2.5 py-0.5 rounded-full shrink-0">
                        {item.metric}
                      </span>
                    </div>
                    {isActive && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="text-xs text-[#52525B] font-medium pl-9 pt-2 leading-relaxed"
                      >
                        {item.detail}
                      </motion.p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
