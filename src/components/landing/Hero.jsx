import { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import {
  PlayCircle,
  Store,
  CheckCircle2,
  Package,
  TrendingUp,
  ShieldCheck,
  Plus,
  RotateCcw,
  Layers,
  Clock,
  Building2,
  Activity
} from 'lucide-react';
import MaskedWords from './MaskedWords';

gsap.registerPlugin(ScrollTrigger, useGSAP);

function MagneticButton({ children, onClick, className, cursorLabel }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 180, damping: 22, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 180, damping: 22, mass: 0.4 });

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width / 2)) * 0.24);
    y.set((e.clientY - (rect.top + rect.height / 2)) * 0.24);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      data-cursor={cursorLabel}
      style={{ x: springX, y: springY }}
      whileTap={{ scale: 0.97 }}
      className={`${className} gpu-accelerated`}
    >
      {children}
    </motion.button>
  );
}

const DEMO_MENUS = [
  {
    id: 'kopi',
    name: 'Kopi Susu Aren',
    category: 'Signature Coffee',
    price: 22000,
    image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=400&q=80',
    recipeText: '18g Kopi • 120ml Susu • 25ml Aren',
    shortDeduct: '-18g Kopi, -120ml Susu',
    deduct: { kopi: 18, susu: 120, aren: 25 }
  },
  {
    id: 'matcha',
    name: 'Matcha Oat Latte',
    category: 'Artisan Tea',
    price: 28000,
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=400&q=80',
    recipeText: '150ml Susu • 15ml Aren',
    shortDeduct: '-150ml Susu, -15ml Aren',
    deduct: { kopi: 0, susu: 150, aren: 15 }
  },
  {
    id: 'croissant',
    name: 'Butter Croissant',
    category: 'Fresh Bakery',
    price: 25000,
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=400&q=80',
    recipeText: '10g Kopi Espresso Glaze',
    shortDeduct: '-10g Kopi',
    deduct: { kopi: 10, susu: 0, aren: 0 }
  }
];

const INITIAL_STOCK = {
  kopi: 1000,
  susu: 2000,
  aren: 500
};

export default function Hero({ onOpenApp, onOpenRegister }) {
  const heroRef = useRef(null);
  const studioWindowRef = useRef(null);

  const [previewTab, setPreviewTab] = useState('pos');
  const [demoTxCount, setDemoTxCount] = useState(1248);
  const [demoRevenue, setDemoRevenue] = useState(12420000);
  const [stock, setStock] = useState(INITIAL_STOCK);
  const [activePulseId, setActivePulseId] = useState(null);
  const [feedLogs, setFeedLogs] = useState([
    { id: 1, menu: 'Kopi Susu Aren', detail: '-18g Kopi, -120ml Susu, -25ml Aren', time: 'Baru saja' }
  ]);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // 1. Badge atas
      tl.fromTo(
        '.hero-eyebrow',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7 },
        0
      )
        // 2. Judul Utama (Masked Word Slide-Up + Slight Rotation)
        .fromTo(
          '.hero-mask-word',
          { yPercent: 110, rotate: 2, opacity: 0 },
          { yPercent: 0, rotate: 0, opacity: 1, duration: 0.9, stagger: 0.06 },
          0.1
        )
        // 3. Subjudul / Paragraf Deskripsi (delay 0.25)
        .fromTo(
          '.hero-subtitle',
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.85 },
          0.25
        )
        // 4. Tombol CTA & Bukti Sosial (stagger 0.1)
        .fromTo(
          '.hero-cta-reveal',
          { y: 22, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.1 },
          0.4
        )
        // 5. Studio Mockup Window
        .fromTo(
          studioWindowRef.current,
          { y: 30, opacity: 0, scale: 0.97 },
          { y: 0, opacity: 1, scale: 1, duration: 0.9 },
          0.55
        )
        // 6. Floating Stat Badges di dalam Studio Showcase
        .fromTo(
          '.hero-float-badge',
          { scale: 0.92, y: 20, opacity: 0 },
          { scale: 1, y: 0, opacity: 1, duration: 0.8, stagger: 0.08 },
          0.7
        );

      // Scroll-Driven Parallax pada Studio Window
      gsap.to(studioWindowRef.current, {
        y: -28,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1
        }
      });

      // Cursor-Responsive 3D Tilt (GPU-Composited quickTo)
      const rotX = gsap.quickTo(studioWindowRef.current, 'rotationX', { duration: 0.6, ease: 'power3.out' });
      const rotY = gsap.quickTo(studioWindowRef.current, 'rotationY', { duration: 0.6, ease: 'power3.out' });

      const handlePointerMove = (e) => {
        const nx = (e.clientX / window.innerWidth - 0.5) * 2;
        const ny = (e.clientY / window.innerHeight - 0.5) * 2;
        rotY(nx * 2.2);
        rotX(-ny * 1.8);
      };

      window.addEventListener('mousemove', handlePointerMove, { passive: true });
      return () => window.removeEventListener('mousemove', handlePointerMove);
    },
    { scope: heroRef }
  );

  const handleSimulateOrder = (menu) => {
    setStock((prev) => ({
      kopi: Math.max(0, prev.kopi - menu.deduct.kopi),
      susu: Math.max(0, prev.susu - menu.deduct.susu),
      aren: Math.max(0, prev.aren - menu.deduct.aren)
    }));
    setDemoTxCount((c) => c + 1);
    setDemoRevenue((r) => r + menu.price);
    setActivePulseId(menu.id);
    setTimeout(() => setActivePulseId(null), 500);

    setFeedLogs((prev) => [
      {
        id: Date.now(),
        menu: menu.name,
        detail: menu.shortDeduct,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      },
      ...prev.slice(0, 2)
    ]);
  };

  const handleResetDemo = () => {
    setStock(INITIAL_STOCK);
    setDemoTxCount(1248);
    setDemoRevenue(12420000);
    setFeedLogs([
      { id: Date.now(), menu: 'Reset Gudang', detail: 'Stok dikembalikan ke kapasitas awal', time: 'Siap' }
    ]);
  };

  const stockItems = [
    { key: 'kopi', label: 'Biji Kopi Arabika', current: stock.kopi, max: INITIAL_STOCK.kopi, unit: 'g', batch: '#KP-09' },
    { key: 'susu', label: 'Susu Segar UHT', current: stock.susu, max: INITIAL_STOCK.susu, unit: 'ml', batch: '#MK-14' },
    { key: 'aren', label: 'Gula Aren Organik', current: stock.aren, max: INITIAL_STOCK.aren, unit: 'ml', batch: '#AR-03' }
  ];

  return (
    <section
      ref={heroRef}
      style={{ perspective: '1400px' }}
      className="relative pt-28 md:pt-36 pb-20 bg-[#FAFAFA] text-[#141414] overflow-hidden"
    >
      {/* Architectural Grid Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="border-x border-zinc-200 px-4 sm:px-10 pt-6 pb-14 flex flex-col items-center text-center">
          {/* Monospace Agency Eyebrow */}
          <div className="hero-eyebrow inline-flex items-center gap-2.5 bg-white border border-zinc-200 px-4 py-1.5 rounded-full mb-8 shadow-sm gpu-accelerated">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
            <span className="font-mono text-[11px] font-semibold text-[#52525B] uppercase tracking-[0.16em]">
              Ubah transaksimu menjadi keputusan inventaris yang cerdas
            </span>
          </div>

          {/* Oversized Display Headline (Solid Deep Charcoal + Solid Amber Serif Italic) */}
          <h1 className="text-5xl sm:text-7xl lg:text-[5.75rem] font-extrabold text-[#141414] leading-[1.06] tracking-tight max-w-5xl">
            <span className="block">
              <MaskedWords
                segments={[{ text: 'Kasir Kilat,' }]}
                wordClass="hero-mask-word"
              />
            </span>
            <span className="block mt-1">
              <MaskedWords
                segments={[
                  { text: 'Gudang' },
                  { text: 'Presisi.', className: 'font-serif italic font-normal text-[#F59E0B] pr-1' }
                ]}
                wordClass="hero-mask-word"
              />
            </span>
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle mt-6 text-sm sm:text-lg text-[#52525B] font-medium max-w-2xl leading-relaxed gpu-accelerated">
            Setiap pesanan di meja kasir maupun QR Self-Order otomatis memotong stok bahan mentah (Bill of Materials) hingga 3 angka desimal dan menjaga kualitas lewat peringatan FEFO.
          </p>

          {/* Magnetic CTAs (Solid Amber + Solid White) */}
          <div className="hero-cta-reveal mt-9 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto gpu-accelerated">
            <MagneticButton
              onClick={onOpenApp}
              cursorLabel="Try POS"
              className="w-full sm:w-auto bg-[#F59E0B] hover:bg-[#D97706] text-[#141414] font-extrabold px-8 h-14 rounded-full text-sm transition-colors flex items-center justify-center gap-2.5 cursor-pointer shadow-sm"
            >
              <Store size={17} />
              <span>Buka Simulasi POS Lengkap</span>
            </MagneticButton>

            <MagneticButton
              onClick={onOpenRegister}
              cursorLabel="Start"
              className="w-full sm:w-auto bg-white hover:bg-zinc-100 text-[#141414] border border-zinc-300 font-bold px-8 h-14 rounded-full text-sm transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <PlayCircle size={17} className="text-[#D97706]" />
              <span>Mulai Uji Coba 14 Hari</span>
            </MagneticButton>
          </div>

          {/* Architectural Grid Metrics Strip */}
          <div className="hero-cta-reveal mt-12 w-full max-w-4xl grid grid-cols-1 sm:grid-cols-3 border border-zinc-200 rounded-2xl bg-white divide-y sm:divide-y-0 sm:divide-x divide-zinc-200 gpu-accelerated">
            <div className="px-6 py-4 flex items-center justify-between sm:justify-center gap-3">
              <span className="font-mono text-xs text-[#52525B] uppercase tracking-wider">Gerai Aktif</span>
              <span className="font-mono text-sm font-bold text-[#141414]">2,000+ UMKM</span>
            </div>
            <div className="px-6 py-4 flex items-center justify-between sm:justify-center gap-3">
              <span className="font-mono text-xs text-[#52525B] uppercase tracking-wider">Akurasi Stok</span>
              <span className="font-mono text-sm font-bold text-[#D97706]">99.9% Presisi</span>
            </div>
            <div className="px-6 py-4 flex items-center justify-between sm:justify-center gap-3">
              <span className="font-mono text-xs text-[#52525B] uppercase tracking-wider">Cek Kedaluwarsa</span>
              <span className="font-mono text-sm font-bold text-emerald-700">Pengingat ≤ 30 Hari</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* INTERACTIVE LIGHT EDITORIAL STUDIO SHOWCASE (POS & BOM)   */}
        {/* ========================================================= */}
        <div
          ref={studioWindowRef}
          style={{ transformStyle: 'preserve-3d' }}
          className="agency-card-light overflow-hidden text-left gpu-accelerated"
        >
          {/* Studio Top Bar */}
          <div className="h-12 bg-white flex items-center justify-between px-4 sm:px-6 border-b border-zinc-200">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
              <div className="hidden sm:flex items-center gap-2 ml-3 pl-3 border-l border-zinc-200 text-[11px] font-semibold text-[#52525B]">
                <Building2 size={13} className="text-[#D97706]" />
                <span>Cabang Utama • Makassar</span>
              </div>
            </div>

            {/* Segmented Mode Control */}
            <div className="flex items-center bg-[#FAFAFA] p-1 rounded-full border border-zinc-200">
              {[
                { id: 'pos', label: 'Kasir & BOM Live' },
                { id: 'alerts', label: 'Monitor FEFO' }
              ].map((tab) => {
                const active = previewTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setPreviewTab(tab.id)}
                    className={`relative px-3.5 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
                      active ? 'text-[#141414]' : 'text-[#52525B] hover:text-[#141414]'
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="heroPreviewTab"
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute inset-0 bg-[#F59E0B] rounded-full"
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Studio Body */}
          <div className="p-5 sm:p-8 bg-[#FAFAFA] space-y-6">
            {/* Live Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="hero-float-badge bg-white border border-zinc-200 rounded-2xl p-4 flex items-center justify-between gpu-accelerated">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-[#52525B]">
                    Transaksi Hari Ini
                  </p>
                  <AnimatePresence mode="popLayout">
                    <motion.p
                      key={demoTxCount}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="text-2xl font-black text-[#141414] font-mono mt-1"
                    >
                      {demoTxCount.toLocaleString('id-ID')}
                    </motion.p>
                  </AnimatePresence>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] text-[#D97706] flex items-center justify-center">
                  <Store size={18} />
                </div>
              </div>

              <div className="hero-float-badge bg-white border border-zinc-200 rounded-2xl p-4 flex items-center justify-between gpu-accelerated">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-[#52525B]">
                    Omzet Kotor Berjalan
                  </p>
                  <AnimatePresence mode="popLayout">
                    <motion.p
                      key={demoRevenue}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="text-2xl font-black text-emerald-700 font-mono mt-1"
                    >
                      Rp {(demoRevenue / 1000000).toFixed(3)} Jt
                    </motion.p>
                  </AnimatePresence>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
                  <TrendingUp size={18} />
                </div>
              </div>

              <div className="hero-float-badge bg-[#141414] text-[#FAFAFA] rounded-2xl p-4 border border-[#141414] flex items-center justify-between gpu-accelerated">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                    <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                      Automated BOM
                    </span>
                  </div>
                  <p className="text-sm font-bold text-[#FAFAFA] mt-1">
                    Sinkronisasi Presisi 3 Desimal
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#F59E0B] text-[#141414] flex items-center justify-center shrink-0">
                  <Layers size={18} />
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {previewTab === 'pos' ? (
                <motion.div
                  key="pos"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-5"
                >
                  {/* Left: Interactive Menu Demo */}
                  <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#141414]">
                          01 // Klik Menu Untuk Simulasi Kasir
                        </h3>
                        <p className="text-[11px] text-[#52525B] mt-0.5">
                          Setiap klik memicu pemotongan bahan baku di gudang secara langsung.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleResetDemo}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#141414] bg-[#FAFAFA] hover:bg-zinc-200 border border-zinc-200 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                      >
                        <RotateCcw size={12} /> Reset
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      {DEMO_MENUS.map((menu) => {
                        const isPulsing = activePulseId === menu.id;
                        return (
                          <motion.button
                            key={menu.id}
                            type="button"
                            data-cursor="Order"
                            whileHover={{ y: -3 }}
                            whileTap={{ scale: 0.97 }}
                            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                            onClick={() => handleSimulateOrder(menu)}
                            className={`text-left rounded-2xl border overflow-hidden flex flex-col justify-between transition-all cursor-pointer group bg-white ${
                              isPulsing
                                ? 'border-[#F59E0B] ring-2 ring-[#F59E0B]/30'
                                : 'border-zinc-200 hover:border-[#F59E0B]'
                            }`}
                          >
                            <div className="relative h-24 w-full overflow-hidden bg-zinc-100">
                              <img
                                src={menu.image}
                                alt={menu.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <span className="absolute bottom-2 left-2.5 font-mono text-[9px] uppercase tracking-wider text-[#141414] bg-white/95 px-2 py-0.5 rounded font-bold border border-zinc-200">
                                {menu.category}
                              </span>
                              <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white group-hover:bg-[#F59E0B] text-[#141414] border border-zinc-200 flex items-center justify-center transition-colors">
                                <Plus size={14} />
                              </div>
                            </div>

                            <div className="p-3 space-y-1.5">
                              <p className="text-xs font-bold text-[#141414] truncate">{menu.name}</p>
                              <p className="text-[10px] text-[#52525B] line-clamp-1">{menu.recipeText}</p>
                              <p className="text-xs font-mono font-bold text-[#D97706] pt-1 border-t border-zinc-200">
                                Rp {menu.price.toLocaleString('id-ID')}
                              </p>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Live Log Ticker */}
                    <div className="bg-[#FAFAFA] border border-zinc-200 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-[#52525B]">
                        <span className="flex items-center gap-1.5">
                          <Activity size={12} className="text-[#D97706]" /> Log Pemotongan Resep
                        </span>
                        <span>Real-Time</span>
                      </div>
                      <AnimatePresence mode="popLayout">
                        {feedLogs.slice(0, 1).map((log) => (
                          <motion.div
                            key={log.id}
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 6 }}
                            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                            className="flex items-center justify-between text-xs bg-white border border-zinc-200 rounded-lg px-3 py-2"
                          >
                            <span className="font-semibold text-[#141414] truncate">
                              {log.menu}: <span className="text-[#D97706] font-mono font-bold">{log.detail}</span>
                            </span>
                            <span className="font-mono text-[10px] text-[#52525B] shrink-0 ml-2">
                              {log.time}
                            </span>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Right: Live Warehouse Ingredient Meters */}
                  <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#141414]">
                          02 // Stok Gudang Live
                        </h3>
                        <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          SYNCED
                        </span>
                      </div>
                      <p className="text-[11px] text-[#52525B]">
                        Persediaan bahan mentah berkurang sesuai formula resep.
                      </p>
                    </div>

                    <div className="space-y-3.5 my-auto">
                      {stockItems.map((item) => {
                        const pct = Math.round((item.current / item.max) * 100);
                        return (
                          <div
                            key={item.key}
                            className="bg-[#FAFAFA] border border-zinc-200 rounded-xl p-3.5 space-y-2"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <div>
                                <span className="font-bold text-[#141414]">{item.label}</span>
                                <span className="ml-2 font-mono text-[10px] text-[#52525B] bg-white border border-zinc-200 px-1.5 py-0.5 rounded">
                                  {item.batch}
                                </span>
                              </div>
                              <span className="font-mono font-bold text-[#141414]">
                                {item.current} <span className="text-[#52525B] font-normal">/ {item.max}{item.unit}</span>
                              </span>
                            </div>
                            <div className="h-2 w-full bg-zinc-200 rounded-full overflow-hidden">
                              <motion.div
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                                className={`h-full rounded-full ${
                                  pct < 35
                                    ? 'bg-red-600'
                                    : pct < 65
                                    ? 'bg-[#F59E0B]'
                                    : 'bg-emerald-600'
                                }`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-2 border-t border-zinc-200 flex items-center justify-between font-mono text-[11px] text-[#52525B]">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-emerald-600" /> Cross-menu validation
                      </span>
                      <span className="text-[#141414] font-bold">99.9%</span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="alerts"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-3 border-l-4 border-l-emerald-600">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded">
                        Stok Aman
                      </span>
                      <Package size={16} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-[#141414]">Biji Kopi Arabika</p>
                      <p className="text-xs text-[#52525B] mt-1">
                        Sisa: <strong className="text-[#141414] font-mono">{stock.kopi}g</strong> • Exp: 120 hari
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-3 border-l-4 border-l-[#F59E0B]">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase font-bold text-[#B45309] bg-[#FEF3C7] border border-[#FDE68A] px-2.5 py-0.5 rounded">
                        Prioritas FEFO (≤ 14 Hari)
                      </span>
                      <Clock size={16} className="text-[#D97706]" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-[#141414]">Susu Segar UHT</p>
                      <p className="text-xs text-[#52525B] mt-1">
                        Sisa: <strong className="text-[#141414] font-mono">{stock.susu}ml</strong> • Pakai lebih dulu
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-3 border-l-4 border-l-[#141414]">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase font-bold text-[#141414] bg-[#FAFAFA] border border-zinc-200 px-2.5 py-0.5 rounded">
                        Terpantau Otomatis
                      </span>
                      <CheckCircle2 size={16} className="text-[#141414]" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-[#141414]">Gula Aren Organik</p>
                      <p className="text-xs text-[#52525B] mt-1">
                        Sisa: <strong className="text-[#141414] font-mono">{stock.aren}ml</strong> • Exp: 45 hari
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
