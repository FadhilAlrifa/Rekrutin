import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import {
  Store,
  Bell,
  BarChart3,
  ScanLine,
  QrCode,
  Wallet,
  CreditCard,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  Smartphone
} from 'lucide-react';
import MaskedWords from './MaskedWords';
import {
  animateMaskedWordsOnScroll,
  animateSlideUpOnScroll,
  animateZoomSlideUpOnScroll
} from './headingReveal';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const WEEKLY_SALES = [
  { day: 'Sen', value: 48, label: 'Rp 4,8 Jt', orders: '142 pesanan' },
  { day: 'Sel', value: 62, label: 'Rp 6,2 Jt', orders: '185 pesanan' },
  { day: 'Rab', value: 55, label: 'Rp 5,5 Jt', orders: '164 pesanan' },
  { day: 'Kam', value: 78, label: 'Rp 7,8 Jt', orders: '231 pesanan' },
  { day: 'Jum', value: 90, label: 'Rp 9,0 Jt', orders: '274 pesanan' },
  { day: 'Sab', value: 100, label: 'Rp 10,4 Jt', orders: '312 pesanan' },
  { day: 'Min', value: 86, label: 'Rp 8,6 Jt', orders: '258 pesanan' }
];

const FEFO_ITEMS = {
  expiry: [
    { name: 'Susu Segar UHT Full Cream', batch: 'Batch #A12', meta: 'Exp: 6 Hari Lagi', status: 'Prioritas Pakai', color: 'text-[#B45309] bg-[#FEF3C7] border-[#FDE68A]' },
    { name: 'Whipped Cream Dairy', batch: 'Batch #B08', meta: 'Exp: 11 Hari Lagi', status: 'Pantau FEFO', color: 'text-[#B45309] bg-[#FEF3C7] border-[#FDE68A]' }
  ],
  stock: [
    { name: 'Sirup Karamel Premium', batch: 'Sisa: 140 ml', meta: 'Min. Batas: 500 ml', status: 'Wajib Restock', color: 'text-red-700 bg-red-50 border-red-200' },
    { name: 'Cup Paper 12oz', batch: 'Sisa: 35 pcs', meta: 'Min. Batas: 100 pcs', status: 'Stok Menipis', color: 'text-red-700 bg-red-50 border-red-200' }
  ]
};

export default function Features() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const [coffeeStock, setCoffeeStock] = useState(1000);
  const [milkStock, setMilkStock] = useState(2000);
  const [cupCount, setCupCount] = useState(0);
  const [alertFilter, setAlertFilter] = useState('expiry');
  const [hoveredDay, setHoveredDay] = useState(5);
  const [selectedPay, setSelectedPay] = useState('qris');
  const [posChannel, setPosChannel] = useState('kasir');

  useGSAP(
    () => {
      animateMaskedWordsOnScroll(headingRef.current);
      animateSlideUpOnScroll('.features-editorial-sub', sectionRef.current, {
        y: 24,
        duration: 0.85,
        stagger: 0.08
      });

      const cards = gsap.utils.toArray('.stacking-feature-card');
      cards.forEach((card, index) => {
        const copyEl = card.querySelector('.feature-copy-reveal');
        const mockupEl = card.querySelector('.feature-mockup-reveal');

        if (copyEl) {
          animateSlideUpOnScroll(copyEl, card, { y: 35, duration: 0.85 });
        }
        if (mockupEl) {
          animateZoomSlideUpOnScroll(mockupEl, card, {
            y: 30,
            scale: 0.97,
            duration: 0.9,
            delay: 0.1
          });
        }

        const nextCard = cards[index + 1];
        if (!nextCard) return;

        gsap.to(card, {
          scale: 0.94,
          opacity: 0.45,
          ease: 'none',
          scrollTrigger: {
            trigger: nextCard,
            start: 'top 75%',
            end: 'top 20%',
            scrub: true
          }
        });
      });
    },
    { scope: sectionRef }
  );

  const triggerBomDeduction = () => {
    setCoffeeStock((prev) => (prev >= 18 ? prev - 18 : 1000));
    setMilkStock((prev) => (prev >= 120 ? prev - 120 : 2000));
    setCupCount((c) => c + 1);
  };

  const resetBom = () => {
    setCoffeeStock(1000);
    setMilkStock(2000);
    setCupCount(0);
  };

  return (
    <section
      ref={sectionRef}
      id="features"
      className="py-24 md:py-32 bg-[#FAFAFA] text-[#141414] relative z-20 border-b border-zinc-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Editorial Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-16 border-b border-zinc-200 mb-14 items-end">
          <div className="lg:col-span-8 space-y-4">
            <span className="features-editorial-sub font-mono text-xs uppercase tracking-[0.2em] text-[#D97706] font-bold block gpu-accelerated">
              [ 01 // KAPABILITAS INTI ]
            </span>
            <h2
              ref={headingRef}
              className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.08] text-[#141414]"
            >
              <MaskedWords
                segments={[
                  { text: 'Sistem Operasional' },
                  { text: 'Berlapis', className: 'font-serif italic font-normal text-[#F59E0B]' },
                  { text: 'Untuk Bisnis F&B Modern.' }
                ]}
              />
            </h2>
          </div>
          <div className="lg:col-span-4 features-editorial-sub gpu-accelerated">
            <p className="text-sm text-[#52525B] leading-relaxed font-medium">
              Gulir untuk menumpuk setiap modul inti. Seluruh kartu bersifat interaktif dan dapat diuji langsung di tempat.
            </p>
          </div>
        </div>

        {/* STICKY STACKING CARDS CONTAINER */}
        <div className="space-y-8 lg:space-y-12 relative">
          
          {/* STACK CARD 01: AUTOMATED BILL OF MATERIALS */}
          <div
            data-cursor="Explore"
            style={{ top: '96px' }}
            className="stacking-feature-card lg:sticky bg-white border border-zinc-200 rounded-3xl p-6 sm:p-10 shadow-[0_-16px_44px_-12px_rgba(0,0,0,0.08)] gpu-accelerated"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="feature-copy-reveal lg:col-span-6 space-y-5 gpu-accelerated">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#141414] bg-[#F59E0B] px-3 py-1 rounded-full">
                    01 / 04
                  </span>
                  <span className="font-mono text-xs text-[#52525B] uppercase tracking-widest">
                    Automated BOM Engine
                  </span>
                </div>

                <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#141414]">
                  Pemotongan Resep{' '}
                  <span className="font-serif italic font-normal text-[#F59E0B]">Otomatis.</span>
                </h3>

                <p className="text-sm text-[#52525B] leading-relaxed max-w-lg">
                  Setiap penjualan menu di meja kasir langsung mengonversi satuan resep (gram/ml ke kg/liter) hingga presisi 3 angka desimal dan memotong stok gudang seketika.
                </p>

                <div className="flex items-center gap-2.5 pt-2">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={triggerBomDeduction}
                    className="px-5 py-3 bg-[#F59E0B] hover:bg-[#D97706] text-[#141414] text-xs font-extrabold rounded-full transition-colors cursor-pointer"
                  >
                    + Jual 1 Kopi Susu (-18g)
                  </motion.button>
                  <button
                    type="button"
                    onClick={resetBom}
                    className="p-3 bg-[#FAFAFA] hover:bg-zinc-200 border border-zinc-200 text-[#141414] rounded-full transition-colors cursor-pointer"
                    aria-label="Reset simulasi BOM"
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>
              </div>

              {/* Interactive Pipeline Showcase */}
              <div className="feature-mockup-reveal lg:col-span-6 bg-[#FAFAFA] border border-zinc-200 rounded-2xl p-5 sm:p-6 space-y-5 gpu-accelerated">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#141414] text-[#F59E0B] flex items-center justify-center font-mono font-bold text-xs">
                      {cupCount}x
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#141414]">Kopi Susu Aren Terjual</p>
                      <p className="font-mono text-[11px] text-[#52525B]">18g Kopi + 120ml Susu</p>
                    </div>
                  </div>
                  <ScanLine size={18} className="text-[#D97706]" />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-[#141414] font-semibold">Biji Kopi Arabika</span>
                      <span className="text-[#D97706] font-bold">{coffeeStock} / 1000g</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-200 rounded-full overflow-hidden">
                      <motion.div
                        animate={{ width: `${(coffeeStock / 1000) * 100}%` }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full bg-[#F59E0B] rounded-full"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-[#141414] font-semibold">Susu Segar UHT</span>
                      <span className="text-emerald-700 font-bold">{milkStock} / 2000ml</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-200 rounded-full overflow-hidden">
                      <motion.div
                        animate={{ width: `${(milkStock / 2000) * 100}%` }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full bg-emerald-600 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STACK CARD 02: EARLY WARNING FEFO */}
          <div
            data-cursor="Explore"
            style={{ top: '116px' }}
            className="stacking-feature-card lg:sticky bg-white border border-zinc-200 rounded-3xl p-6 sm:p-10 shadow-[0_-16px_44px_-12px_rgba(0,0,0,0.08)] gpu-accelerated"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="feature-copy-reveal lg:col-span-6 space-y-5 gpu-accelerated">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#141414] bg-[#F59E0B] px-3 py-1 rounded-full">
                    02 / 04
                  </span>
                  <span className="font-mono text-xs text-[#52525B] uppercase tracking-widest">
                    FIFO / FEFO Radar
                  </span>
                </div>

                <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#141414]">
                  Peringatan Dini{' '}
                  <span className="font-serif italic font-normal text-[#F59E0B]">Kedaluwarsa.</span>
                </h3>

                <p className="text-sm text-[#52525B] leading-relaxed max-w-lg">
                  Sistem memantau setiap batch tanggal masuk dan masa berlaku bahan baku. Bahan dengan masa simpan ≤ 30 hari diprioritaskan otomatis untuk mencegah food waste.
                </p>

                <div className="inline-flex bg-[#FAFAFA] p-1 rounded-full border border-zinc-200">
                  {[
                    { id: 'expiry', label: 'FEFO Kedaluwarsa' },
                    { id: 'stock', label: 'Stok Kritis' }
                  ].map((tab) => {
                    const active = alertFilter === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setAlertFilter(tab.id)}
                        className={`relative px-4 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                          active ? 'text-white' : 'text-[#52525B] hover:text-[#141414]'
                        }`}
                      >
                        {active && (
                          <motion.div
                            layoutId="fefoFilterPill"
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="absolute inset-0 bg-[#141414] rounded-full"
                          />
                        )}
                        <span className="relative z-10">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="feature-mockup-reveal lg:col-span-6 bg-[#FAFAFA] border border-zinc-200 rounded-2xl p-5 sm:p-6 space-y-3 gpu-accelerated">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                  <span className="font-mono text-xs text-[#52525B] uppercase tracking-wider flex items-center gap-2 font-semibold">
                    <Bell size={14} className="text-[#D97706]" /> Monitor Gudang Aktif
                  </span>
                  <span className="font-mono text-[11px] font-bold text-[#D97706]">2 Peringatan</span>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={alertFilter}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-3 pt-1"
                  >
                    {FEFO_ITEMS[alertFilter].map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-[#141414] truncate">{item.name}</p>
                          <p className="text-xs text-[#52525B] font-mono mt-0.5">
                            {item.batch} • {item.meta}
                          </p>
                        </div>
                        <span className={`font-mono text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${item.color}`}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* STACK CARD 03: EXECUTIVE ANALYTICS */}
          <div
            data-cursor="Explore"
            style={{ top: '136px' }}
            className="stacking-feature-card lg:sticky bg-white border border-zinc-200 rounded-3xl p-6 sm:p-10 shadow-[0_-16px_44px_-12px_rgba(0,0,0,0.08)] gpu-accelerated"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="feature-copy-reveal lg:col-span-6 space-y-5 gpu-accelerated">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#141414] bg-[#F59E0B] px-3 py-1 rounded-full">
                    03 / 04
                  </span>
                  <span className="font-mono text-xs text-[#52525B] uppercase tracking-widest">
                    Real-Time Reporting
                  </span>
                </div>

                <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#141414]">
                  Analitik Omzet &{' '}
                  <span className="font-serif italic font-normal text-[#F59E0B]">Menu Terlaris.</span>
                </h3>

                <p className="text-sm text-[#52525B] leading-relaxed max-w-lg">
                  Pantau tren pendapatan harian, perbandingan metode bayar (QRIS, Tunai, Kartu), riwayat struk digital, serta ekspor laporan CSV dalam satu klik.
                </p>

                <div className="inline-flex items-center gap-2 font-mono text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full">
                  <TrendingUp size={14} /> +18.4% Kenaikan Omzet Mingguan
                </div>
              </div>

              <div className="feature-mockup-reveal lg:col-span-6 bg-[#FAFAFA] border border-zinc-200 rounded-2xl p-5 sm:p-6 space-y-4 gpu-accelerated">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                  <div>
                    <span className="font-mono text-[10px] uppercase text-[#52525B] block">
                      Hari {WEEKLY_SALES[hoveredDay].day}
                    </span>
                    <span className="text-xl font-black text-[#141414] font-mono">
                      {WEEKLY_SALES[hoveredDay].label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 size={16} className="text-[#D97706]" />
                    <span className="font-mono text-xs text-[#141414] font-bold bg-white border border-zinc-200 px-2.5 py-1 rounded-lg">
                      {WEEKLY_SALES[hoveredDay].orders}
                    </span>
                  </div>
                </div>

                <div className="h-32 flex items-end justify-between gap-2.5 pt-2">
                  {WEEKLY_SALES.map((item, idx) => {
                    const isSelected = hoveredDay === idx;
                    return (
                      <button
                        key={item.day}
                        type="button"
                        onMouseEnter={() => setHoveredDay(idx)}
                        onClick={() => setHoveredDay(idx)}
                        className="flex-1 flex flex-col items-center gap-2 h-full justify-end cursor-pointer group"
                      >
                        <div
                          style={{ height: `${item.value}%` }}
                          className={`w-full rounded-t-lg transition-all duration-200 ${
                            isSelected
                              ? 'bg-[#F59E0B]'
                              : 'bg-zinc-200 group-hover:bg-zinc-300'
                          }`}
                        />
                        <span className={`font-mono text-[10px] font-bold ${isSelected ? 'text-[#D97706]' : 'text-[#52525B]'}`}>
                          {item.day}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* STACK CARD 04: OMNICHANNEL POS & QR SELF-ORDER KIOSK */}
          <div
            data-cursor="Explore"
            style={{ top: '156px' }}
            className="stacking-feature-card lg:sticky bg-white border border-zinc-200 rounded-3xl p-6 sm:p-10 shadow-[0_-16px_44px_-12px_rgba(0,0,0,0.08)] gpu-accelerated"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="feature-copy-reveal lg:col-span-6 space-y-5 gpu-accelerated">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#141414] bg-[#F59E0B] px-3 py-1 rounded-full">
                    04 / 04
                  </span>
                  <span className="font-mono text-xs text-[#52525B] uppercase tracking-widest">
                    Omnichannel POS & Kiosk
                  </span>
                </div>

                <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#141414]">
                  Kasir Cepat &{' '}
                  <span className="font-serif italic font-normal text-[#F59E0B]">QR Self-Order.</span>
                </h3>

                <p className="text-sm text-[#52525B] leading-relaxed max-w-lg">
                  Layani pelanggan langsung di meja kasir atau izinkan pelanggan memesan mandiri dari meja melalui QR Code tanpa perlu instal aplikasi tambahan.
                </p>

                <div className="inline-flex bg-[#FAFAFA] p-1 rounded-full border border-zinc-200">
                  {[
                    { id: 'kasir', label: 'Kasir Utama', icon: Store },
                    { id: 'kiosk', label: 'QR Meja Kiosk', icon: Smartphone }
                  ].map((ch) => {
                    const Icon = ch.icon;
                    const active = posChannel === ch.id;
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => setPosChannel(ch.id)}
                        className={`relative px-4 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                          active ? 'text-[#141414]' : 'text-[#52525B] hover:text-[#141414]'
                        }`}
                      >
                        {active && (
                          <motion.div
                            layoutId="posChannelPill"
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="absolute inset-0 bg-[#F59E0B] rounded-full"
                          />
                        )}
                        <Icon size={13} className="relative z-10" />
                        <span className="relative z-10">{ch.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="feature-mockup-reveal lg:col-span-6 bg-[#FAFAFA] border border-zinc-200 rounded-2xl p-5 sm:p-6 space-y-4 gpu-accelerated">
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'qris', label: 'QRIS', icon: QrCode },
                    { id: 'cash', label: 'Tunai', icon: Wallet },
                    { id: 'card', label: 'Kartu', icon: CreditCard }
                  ].map((m) => {
                    const Icon = m.icon;
                    const active = selectedPay === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedPay(m.id)}
                        className={`py-3 px-2 rounded-xl text-xs font-bold border flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                          active
                            ? 'bg-[#FEF3C7] border-[#F59E0B] text-[#141414]'
                            : 'bg-white border-zinc-200 text-[#52525B] hover:text-[#141414]'
                        }`}
                      >
                        <Icon size={16} className={active ? 'text-[#D97706]' : ''} /> {m.label}
                      </button>
                    );
                  })}
                </div>

                <div className="bg-white border border-zinc-200 rounded-xl p-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-[#141414]">
                    <span>{posChannel === 'kasir' ? 'Tiket Kasir #POS-104' : 'Pesanan Mandiri • Meja 08'}</span>
                    <span className="text-[#D97706] font-mono">Rp 47.000</span>
                  </div>
                  <p className="text-[11px] text-[#52525B]">
                    {selectedPay === 'qris' && 'QRIS Dinamis siap dipindai • Cetak struk senyap'}
                    {selectedPay === 'cash' && 'Tombol cepat Uang Pas, 50rb, & 100rb siap digunakan'}
                    {selectedPay === 'card' && 'Otorisasi EDC Debit & Kartu Kredit tercatat instan'}
                  </p>
                  <div className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-700 font-bold pt-1">
                    <CheckCircle2 size={12} /> Terhubung langsung ke pemotongan BOM gudang
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
