import { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Store, CheckCircle2 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

function MagneticCtaButton({ children, onClick, className, cursorLabel }) {
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

export default function CTA({ onOpenApp, onOpenRegister }) {
  const sectionRef = useRef(null);

  useGSAP(
    () => {
      gsap.fromTo(
        '.cta-reveal',
        { y: 36, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%'
          }
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative py-24 md:py-32 overflow-hidden bg-white"
    >
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <div className="cta-reveal bg-[#FAFAFA] border border-zinc-200 rounded-3xl p-8 sm:p-14 md:p-20 relative overflow-hidden space-y-7 gpu-accelerated">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#D97706] font-bold block">
            [ READY TO DEPLOY ]
          </span>

          <h2 className="text-4xl sm:text-6xl font-extrabold text-[#141414] tracking-tight leading-[1.04] max-w-3xl mx-auto">
            Digitalisasi Kasir &{' '}
            <span className="font-serif italic font-normal text-[#F59E0B]">
              Gudang Gerai
            </span>{' '}
            Anda Hari Ini.
          </h2>

          <p className="text-sm sm:text-base text-[#52525B] font-medium max-w-xl mx-auto leading-relaxed">
            Integrasikan pencatatan transaksi kasir, pemotongan bahan baku otomatis (BOM), dan peringatan kedaluwarsa FEFO dalam satu sistem terpadu.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <MagneticCtaButton
              onClick={onOpenRegister}
              cursorLabel="Start"
              className="w-full sm:w-auto bg-[#F59E0B] hover:bg-[#D97706] text-[#141414] font-extrabold px-9 py-4 rounded-full text-xs sm:text-sm transition-colors cursor-pointer shadow-sm"
            >
              Mulai Uji Coba Gratis 14 Hari
            </MagneticCtaButton>

            <MagneticCtaButton
              onClick={onOpenApp}
              cursorLabel="Try POS"
              className="w-full sm:w-auto bg-white hover:bg-zinc-100 text-[#141414] border border-zinc-300 font-bold px-9 py-4 rounded-full text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Store size={16} className="text-[#D97706]" /> Buka Simulasi POS
            </MagneticCtaButton>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 font-mono text-[11px] text-[#52525B]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600" /> Aktivasi Magic Link
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600" /> Simulasi Tanpa Login
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600" /> Bebas Biaya Setup
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
