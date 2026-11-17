import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import {
  Layers,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  SlidersHorizontal,
  Store,
  Clock,
  QrCode,
  Package,
  Building2,
  TrendingUp
} from 'lucide-react';
import MaskedWords from './MaskedWords';
import {
  animateMaskedWordsOnScroll,
  animateSlideUpOnScroll,
  animateZoomSlideUpOnScroll
} from './headingReveal';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const SCROLL_STEPS = [
  {
    num: '01',
    badge: 'Front-of-House Speed',
    title: 'Transaksi Kasir & QR Meja Instan',
    desc: 'Pesanan masuk dari layar kasir utama maupun pemindaian QR mandiri dari meja pelanggan. Sistem otomatis memvalidasi kecukupan bahan baku sebelum pembayaran dikunci.',
    icon: Store
  },
  {
    num: '02',
    badge: 'Automated BOM Engine',
    title: 'Konversi & Potong Resep Real-Time',
    desc: 'Begitu transaksi selesai, mesin Bill of Materials mengonversi satuan gram/ml ke kg/liter hingga presisi 3 desimal dan memotong stok gudang detik itu juga.',
    icon: Layers
  },
  {
    num: '03',
    badge: 'FEFO & Multi-Outlet Sync',
    title: 'Peringatan Dini FEFO & Audit Terpusat',
    desc: 'Batch bahan baku yang mendekati kedaluwarsa (≤ 30 hari) diprioritaskan lebih dulu, sementara riwayat mutasi stok dan laporan omzet tersinkronisasi ke seluruh cabang.',
    icon: ShieldCheck
  }
];

export default function WhyChooseUs() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const pinWrapperRef = useRef(null);
  const progressFillRef = useRef(null);
  const [mode, setMode] = useState('stocko');
  const [mobileStep, setMobileStep] = useState(0);

  useGSAP(
    () => {
      animateMaskedWordsOnScroll(headingRef.current);
      animateSlideUpOnScroll('.why-sub-reveal', sectionRef.current, {
        y: 24,
        duration: 0.85,
        stagger: 0.08
      });
      animateZoomSlideUpOnScroll('.why-compare-card', '.why-compare-card', {
        y: 30,
        scale: 0.97,
        duration: 0.9
      });
      animateSlideUpOnScroll('.why-compare-metric', '.why-compare-card', {
        y: 30,
        duration: 0.85,
        stagger: 0.08,
        delay: 0.1
      });

      const mm = gsap.matchMedia();

      mm.add('(min-width: 1024px)', () => {
        const stepCards = gsap.utils.toArray('.scrolly-step-item');
        const visualPanels = gsap.utils.toArray('.scrolly-visual-panel');

        gsap.set(visualPanels[1], { autoAlpha: 0, y: 40, scale: 0.96 });
        gsap.set(visualPanels[2], { autoAlpha: 0, y: 40, scale: 0.96 });
        gsap.set(stepCards[1], { opacity: 0.35, x: 0 });
        gsap.set(stepCards[2], { opacity: 0.35, x: 0 });
        gsap.set(stepCards[0], { opacity: 1, x: 6 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: pinWrapperRef.current,
            start: 'top top',
            end: '+=200%',
            pin: true,
            scrub: 1,
            anticipatePin: 1
          }
        });

        tl.fromTo(
          progressFillRef.current,
          { scaleY: 0.15 },
          { scaleY: 1, duration: 2, ease: 'none' },
          0
        );

        tl.to(stepCards[0], { opacity: 0.35, x: 0, duration: 0.8, ease: 'power2.inOut' }, 0.15)
          .to(stepCards[1], { opacity: 1, x: 6, duration: 0.8, ease: 'power2.inOut' }, 0.15)
          .to(visualPanels[0], { autoAlpha: 0, y: -36, scale: 0.96, duration: 0.85, ease: 'power2.inOut' }, 0.15)
          .to(visualPanels[1], { autoAlpha: 1, y: 0, scale: 1, duration: 0.85, ease: 'power2.inOut' }, 0.2);

        tl.to(stepCards[1], { opacity: 0.35, x: 0, duration: 0.8, ease: 'power2.inOut' }, 1.15)
          .to(stepCards[2], { opacity: 1, x: 6, duration: 0.8, ease: 'power2.inOut' }, 1.15)
          .to(visualPanels[1], { autoAlpha: 0, y: -36, scale: 0.96, duration: 0.85, ease: 'power2.inOut' }, 1.15)
          .to(visualPanels[2], { autoAlpha: 1, y: 0, scale: 1, duration: 0.85, ease: 'power2.inOut' }, 1.2);
      });
    },
    { scope: sectionRef }
  );

  const comparisonData = {
    manual: {
      metrics: [
        { label: 'Akurasi Stok Fisik vs Kasir', pct: 64, val: 'Rentan Selisih (64%)' },
        { label: 'Efisiensi Waktu Rekapitulasi', pct: 35, val: 'Lambat • 1-2 Jam/Hari' },
        { label: 'Deteksi Bahan Hampir Basi', pct: 25, val: 'Cek Fisik Manual' }
      ],
      points: [
        'Rekap stok bahan baku dilakukan manual di akhir shift atau akhir bulan.',
        'Sering terjadi selisih antara jumlah penjualan kasir dan stok fisik di gudang.',
        'Bahan baku kedaluwarsa terlewat karena tidak ada sistem peringatan dini.',
        'Pemilik harus menggabungkan laporan keuangan dari beberapa file terpisah.'
      ]
    },
    stocko: {
      metrics: [
        { label: 'Akurasi Stok Fisik vs Kasir', pct: 99, val: 'Presisi 3 Desimal (99.9%)' },
        { label: 'Efisiensi Waktu Rekapitulasi', pct: 98, val: 'Instan • 0 Detik Otomatis' },
        { label: 'Deteksi Bahan Hampir Basi', pct: 96, val: 'FEFO Alert ≤ 30 Hari' }
      ],
      points: [
        'Stok bahan baku (kopi, susu, cup, sirup) terpotong otomatis saat kasir checkout.',
        'Validasi lintas menu mencegah pesanan masuk jika bahan di gudang sudah habis.',
        'Peringatan dini FEFO otomatis mendeteksi bahan yang mendekati masa kedaluwarsa.',
        'Laporan omzet, menu terlaris, dan mutasi stok tersedia langsung dalam satu layar.'
      ]
    }
  };

  const current = comparisonData[mode];

  return (
    <section
      ref={sectionRef}
      id="why-us"
      className="bg-[#111111] text-[#FAFAFA] relative border-b border-zinc-800 overflow-x-clip"
    >
      {/* PINNED SCROLLYTELLING SECTION (Solid Dark Contrast Section) */}
      <div
        ref={pinWrapperRef}
        className="lg:min-h-screen flex flex-col justify-center py-16 lg:py-12 relative z-10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full space-y-8 lg:space-y-10">
          {/* Editorial Header */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end pb-6 border-b border-zinc-800">
            <div className="lg:col-span-8 space-y-3">
              <span className="why-sub-reveal font-mono text-xs uppercase tracking-[0.2em] text-[#F59E0B] block gpu-accelerated">
                [ 02 // PINNED ARCHITECTURE & AKURASI 99.9% ]
              </span>
              <h2
                ref={headingRef}
                className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.08] text-[#FAFAFA]"
              >
                <MaskedWords
                  segments={[
                    { text: 'Bukan Sekadar Kasir.' },
                    { text: 'Kendali Penuh', className: 'font-serif italic font-normal text-[#F59E0B]' },
                    { text: 'Gudang Anda.' }
                  ]}
                />
              </h2>
            </div>
            <div className="lg:col-span-4 why-sub-reveal gpu-accelerated">
              <p className="text-zinc-400 font-medium text-xs sm:text-sm leading-relaxed">
                Gulir layar ke bawah (atau ketuk tiap tahap di mobile) untuk menelusuri alur sinkronisasi 3 tahap dari meja kasir hingga stok gudang.
              </p>
            </div>
          </div>

          {/* 2-Column Pinned Stage */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Column */}
            <div className="lg:col-span-5 relative pl-0 lg:pl-8 space-y-4">
              <div className="hidden lg:block absolute left-0 top-3 bottom-3 w-0.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  ref={progressFillRef}
                  style={{ transform: 'scaleY(0.15)' }}
                  className="w-full h-full bg-[#F59E0B] origin-top gpu-accelerated"
                />
              </div>

              {SCROLL_STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isMobileActive = mobileStep === idx;
                return (
                  <button
                    key={step.num}
                    type="button"
                    onClick={() => setMobileStep(idx)}
                    className={`scrolly-step-item w-full text-left bg-[#18181B] border rounded-2xl p-5 space-y-2 gpu-accelerated transition-colors cursor-pointer lg:cursor-default ${
                      isMobileActive ? 'border-[#F59E0B] lg:border-zinc-800' : 'border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#F59E0B]">
                        {step.num} // {step.badge}
                      </span>
                      <Icon size={15} className="text-[#F59E0B]" />
                    </div>
                    <h3 className="text-lg font-bold text-[#FAFAFA]">{step.title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{step.desc}</p>
                  </button>
                );
              })}
            </div>

            {/* Right Column: Layered GPU Visual Panels */}
            <div className="lg:col-span-7">
              <div
                data-cursor="Explore"
                className="agency-card-dark p-6 sm:p-8 min-h-[360px] sm:min-h-[390px] relative flex items-center justify-center overflow-hidden"
              >
                {/* STAGE 01 VISUAL */}
                <div className={`scrolly-visual-panel w-full space-y-5 gpu-accelerated ${mobileStep === 0 ? 'block' : 'hidden lg:block'}`}>
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#F59E0B] text-[#141414] flex items-center justify-center">
                        <QrCode size={20} />
                      </div>
                      <div>
                        <span className="font-mono text-[10px] uppercase tracking-wider text-[#F59E0B]">
                          STAGE 01 // POS & KIOSK
                        </span>
                        <h4 className="text-base font-bold text-[#FAFAFA]">Pesanan Masuk #ORD-8821</h4>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-3 py-1 rounded-full">
                      QRIS Verified
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-[#111111] border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-[#FAFAFA]">2x Kopi Susu Aren (Dingin)</p>
                        <p className="text-xs text-zinc-400">Catatan: Kurang manis • Meja 04</p>
                      </div>
                      <span className="font-mono font-bold text-[#FAFAFA] text-sm">Rp 44.000</span>
                    </div>
                    <div className="bg-[#111111] border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-[#FAFAFA]">1x Butter Croissant Artisan</p>
                        <p className="text-xs text-zinc-400">Dipanaskan • Dine-In</p>
                      </div>
                      <span className="font-mono font-bold text-[#FAFAFA] text-sm">Rp 25.000</span>
                    </div>
                  </div>

                  <div className="bg-emerald-950/40 border border-emerald-800/50 rounded-xl p-3.5 flex items-center justify-between text-xs">
                    <span className="text-emerald-300 font-semibold flex items-center gap-2">
                      <CheckCircle2 size={15} /> Cross-Menu Stock Check: Tersedia
                    </span>
                    <span className="font-mono font-bold text-[#FAFAFA]">Total: Rp 69.000</span>
                  </div>
                </div>

                {/* STAGE 02 VISUAL */}
                <div className={`scrolly-visual-panel w-full lg:w-auto lg:block lg:absolute lg:inset-8 space-y-5 gpu-accelerated ${mobileStep === 1 ? 'block' : 'hidden lg:block'}`}>
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#F59E0B] text-[#141414] flex items-center justify-center">
                        <Layers size={20} />
                      </div>
                      <div>
                        <span className="font-mono text-[10px] uppercase tracking-wider text-[#F59E0B]">
                          STAGE 02 // AUTOMATED BOM
                        </span>
                        <h4 className="text-base font-bold text-[#FAFAFA]">Kalkulasi & Pemotongan Gramasi</h4>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#141414] bg-[#F59E0B] px-3 py-1 rounded-full">
                      3 Desimal
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-[#111111] border border-zinc-800 rounded-xl p-4 space-y-2">
                      <span className="font-mono text-[10px] uppercase text-zinc-400">Biji Kopi</span>
                      <p className="text-lg font-black text-red-400 font-mono">-0.036 kg</p>
                      <p className="text-[11px] text-zinc-400">2 cup × 18g</p>
                    </div>
                    <div className="bg-[#111111] border border-zinc-800 rounded-xl p-4 space-y-2">
                      <span className="font-mono text-[10px] uppercase text-zinc-400">Susu UHT</span>
                      <p className="text-lg font-black text-red-400 font-mono">-0.240 L</p>
                      <p className="text-[11px] text-zinc-400">2 cup × 120ml</p>
                    </div>
                    <div className="bg-[#111111] border border-zinc-800 rounded-xl p-4 space-y-2">
                      <span className="font-mono text-[10px] uppercase text-zinc-400">Gula Aren</span>
                      <p className="text-lg font-black text-red-400 font-mono">-0.050 L</p>
                      <p className="text-[11px] text-zinc-400">2 cup × 25ml</p>
                    </div>
                  </div>

                  <div className="bg-[#111111] border border-zinc-800 rounded-xl p-4 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <Package size={16} className="text-[#F59E0B]" />
                      <span className="font-semibold text-zinc-200">
                        Database gudang diperbarui otomatis tanpa jeda
                      </span>
                    </div>
                    <span className="text-emerald-400 font-mono font-bold">0% Human Error</span>
                  </div>
                </div>

                {/* STAGE 03 VISUAL */}
                <div className={`scrolly-visual-panel w-full lg:w-auto lg:block lg:absolute lg:inset-8 space-y-5 gpu-accelerated ${mobileStep === 2 ? 'block' : 'hidden lg:block'}`}>
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400">
                          STAGE 03 // FEFO & MULTI-OUTLET
                        </span>
                        <h4 className="text-base font-bold text-[#FAFAFA]">Proteksi Kedaluwarsa & Sinkronisasi</h4>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-3 py-1 rounded-full">
                      99.9% Akurat
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="bg-[#111111] border border-[#F59E0B]/50 rounded-xl p-4 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-[#F59E0B]">
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} /> Prioritas FEFO
                        </span>
                        <span className="font-mono">9 Hari</span>
                      </div>
                      <p className="text-sm font-bold text-[#FAFAFA]">Susu UHT Batch #MK-14</p>
                      <p className="text-[11px] text-zinc-400">Mendahului Batch #MK-15</p>
                    </div>

                    <div className="bg-[#111111] border border-zinc-800 rounded-xl p-4 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                        <span className="flex items-center gap-1.5">
                          <Building2 size={14} /> Central Kitchen
                        </span>
                        <span className="font-mono">Live</span>
                      </div>
                      <p className="text-sm font-bold text-[#FAFAFA]">Makassar • Bandung • Jakarta</p>
                      <p className="text-[11px] text-zinc-400">Laporan & mutasi terpusat</p>
                    </div>
                  </div>

                  <div className="bg-[#111111] border border-zinc-800 rounded-xl p-4 flex items-center justify-between text-xs">
                    <span className="text-zinc-300 font-semibold flex items-center gap-2">
                      <TrendingUp size={15} className="text-emerald-400" /> Rekonsiliasi Kasir vs Gudang
                    </span>
                    <span className="font-mono font-bold text-[#F59E0B]">Selisih: Rp 0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EDITORIAL COMPARISON MATRIX */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 relative z-10">
        <div className="why-compare-card agency-card-dark p-6 sm:p-10 space-y-8 gpu-accelerated">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#111111] border border-zinc-800 flex items-center justify-center text-[#F59E0B]">
                <SlidersHorizontal size={18} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#FAFAFA]">Simulasi Dampak Operasional</h3>
                <p className="text-xs text-zinc-400">
                  Bandingkan indikator efisiensi antara pencatatan konvensional dan Stocko.
                </p>
              </div>
            </div>

            <div className="inline-flex bg-[#111111] p-1 rounded-full border border-zinc-800 self-start">
              {[
                { id: 'manual', label: 'Cara Manual' },
                { id: 'stocko', label: 'Otomatisasi Stocko' }
              ].map((tab) => {
                const active = mode === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setMode(tab.id)}
                    className={`relative px-5 py-2 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                      active ? 'text-[#141414]' : 'text-zinc-400 hover:text-[#FAFAFA]'
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="compareModePill"
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className={`absolute inset-0 rounded-full ${
                          tab.id === 'stocko' ? 'bg-[#F59E0B]' : 'bg-[#FAFAFA]'
                        }`}
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {current.metrics.map((m, idx) => (
              <div
                key={idx}
                className="why-compare-metric bg-[#111111] border border-zinc-800 rounded-2xl p-5 space-y-2.5 gpu-accelerated"
              >
                <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-400 block">
                  {m.label}
                </span>
                <p className={`text-sm font-bold font-mono ${mode === 'stocko' ? 'text-[#F59E0B]' : 'text-red-400'}`}>
                  {m.val}
                </p>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: `${m.pct}%` }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className={`h-full rounded-full ${
                      mode === 'stocko' ? 'bg-[#F59E0B]' : 'bg-red-500'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {current.points.map((text, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border flex items-start gap-3 text-xs sm:text-sm font-medium leading-relaxed ${
                    mode === 'stocko'
                      ? 'bg-[#111111] border-emerald-800/60 text-zinc-200'
                      : 'bg-[#111111] border-red-900/50 text-zinc-300'
                  }`}
                >
                  {mode === 'stocko' ? (
                    <CheckCircle2 size={17} className="text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle size={17} className="text-red-400 shrink-0 mt-0.5" />
                  )}
                  <span>{text}</span>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
