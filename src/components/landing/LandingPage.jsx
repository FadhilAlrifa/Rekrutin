import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';
import CustomCursor from './CustomCursor';
import Navbar from './Navbar';
import Hero from './Hero';
import OperationalStrip from './OperationalStrip';
import Features from './Features';
import WhyChooseUs from './WhyChooseUs';
import Benefits from './Benefits';
import Pricing from './Pricing';
import FAQ from './FAQ';
import CTA from './CTA';
import Footer from './Footer';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function LandingPage({ onOpenApp, onOpenRegister, onOpenLogin, onSelectPlan, onSimulatePlan }) {
  const containerRef = useRef(null);
  const progressBarRef = useRef(null);

  // 1. Integrasi Lenis Smooth Scroll Global & Sinkronisasi GSAP Ticker
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.5
    });

    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);

    const updateTicker = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 420);

    return () => {
      clearTimeout(refreshTimer);
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  // 2. Scroll Progress Indicator (Solid Amber, GPU-Composited scaleX)
  useGSAP(
    () => {
      if (!progressBarRef.current) return;
      gsap.to(progressBarRef.current, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.2
        }
      });
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#FAFAFA] text-[#141414] font-sans selection:bg-[#F59E0B] selection:text-[#141414] overflow-x-clip relative"
    >
      {/* Interactive Custom Follower Cursor */}
      <CustomCursor />

      {/* Top GPU-Composited Scroll Progress Bar (Solid Amber) */}
      <div
        ref={progressBarRef}
        style={{ transform: 'scaleX(0)' }}
        className="fixed top-0 left-0 right-0 h-[3px] bg-[#F59E0B] origin-left z-[60] pointer-events-none gpu-accelerated"
      />

      <Navbar
        onOpenApp={onOpenApp}
        onOpenRegister={onOpenRegister}
        onOpenLogin={onOpenLogin}
      />

      <Hero
        onOpenApp={onOpenApp}
        onOpenRegister={onOpenRegister}
      />

      <OperationalStrip />

      <Features />
      <WhyChooseUs />
      <Benefits />
      <Pricing
        onSelectPlan={onSelectPlan}
        onSimulatePlan={onSimulatePlan}
      />
      <FAQ />
      <CTA
        onOpenApp={onOpenApp}
        onOpenRegister={onOpenRegister}
      />
      <Footer
        onOpenApp={onOpenApp}
        onOpenRegister={onOpenRegister}
        onOpenLogin={onOpenLogin}
      />
    </div>
  );
}
