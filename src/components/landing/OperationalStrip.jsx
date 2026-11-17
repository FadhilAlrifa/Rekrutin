import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Layers, Clock, ShieldCheck, Zap, ArrowUpRight } from 'lucide-react';
import { animateSlideUpOnScroll } from './headingReveal';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const OPERATIONAL_PILLARS = [
  {
    code: '01 // BOM ENGINE',
    metric: '0.001 kg/L',
    title: 'Konversi Resep Presisi',
    desc: 'Setiap penjualan otomatis memotong gramasi & mililiter bahan baku di gudang.',
    target: 'features',
    icon: Layers
  },
  {
    code: '02 // FEFO GUARD',
    metric: '≤ 30 Hari',
    title: 'Deteksi Dini Kedaluwarsa',
    desc: 'Prioritaskan pemakaian batch bahan tertua sebelum melewati tanggal simpan.',
    target: 'why-us',
    icon: Clock
  },
  {
    code: '03 // ANTI-MINUS',
    metric: 'Real-Time',
    title: 'Validasi Porsi Otomatis',
    desc: 'Menu dengan bahan baku kosong langsung terkunci di kasir & QR Self-Order.',
    target: 'features',
    icon: ShieldCheck
  },
  {
    code: '04 // CHECKOUT',
    metric: '< 3 Detik',
    title: 'Kasir & Struk Senyap',
    desc: 'Pembayaran QRIS, Tunai, Kartu, dan cetak struk thermal tanpa hambatan.',
    target: 'benefits',
    icon: Zap
  }
];

export default function OperationalStrip() {
  const sectionRef = useRef(null);

  useGSAP(
    () => {
      animateSlideUpOnScroll('.op-strip-card', sectionRef.current, {
        y: 35,
        duration: 0.85,
        stagger: 0.08
      });
    },
    { scope: sectionRef }
  );

  const handleJump = (targetId) => {
    const el = document.getElementById(targetId);
    if (!el) return;
    if (window.__lenis) {
      window.__lenis.scrollTo(el, { offset: -72, duration: 1.05 });
    } else {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={sectionRef}
      aria-label="Standar Operasional Stocko"
      className="w-full bg-white border-y border-zinc-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-200 border-x border-zinc-200">
          {OPERATIONAL_PILLARS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => handleJump(item.target)}
                data-cursor="Lihat"
                className="op-strip-card group text-left bg-white hover:bg-[#FAFAFA] transition-colors p-6 sm:p-7 flex flex-col justify-between gap-5 gpu-accelerated cursor-pointer"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#D97706]">
                    {item.code}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-[#FAFAFA] border border-zinc-200 group-hover:border-[#F59E0B] group-hover:bg-[#FEF3C7] flex items-center justify-center text-[#52525B] group-hover:text-[#B45309] transition-colors">
                    <Icon size={15} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#141414]">
                      {item.metric}
                    </p>
                    <ArrowUpRight
                      size={16}
                      className="text-zinc-400 group-hover:text-[#D97706] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0"
                    />
                  </div>
                  <h3 className="text-sm font-bold text-[#141414]">{item.title}</h3>
                  <p className="text-xs text-[#52525B] leading-relaxed">{item.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
