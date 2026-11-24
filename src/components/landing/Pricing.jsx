import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Check, X, Award } from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '../../data/subscriptionPlans';
import MaskedWords from './MaskedWords';
import {
  animateMaskedWordsOnScroll,
  animateSlideUpOnScroll,
  animateZoomSlideUpOnScroll
} from './headingReveal';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Pricing({ onSelectPlan, onSimulatePlan }) {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const [billingCycle, setBillingCycle] = useState('monthly');

  const annualPrices = {
    starter: 'Rp63.000',
    pro: 'Rp119.000',
    enterprise: 'Rp239.000'
  };

  useGSAP(
    () => {
      animateMaskedWordsOnScroll(headingRef.current);
      animateSlideUpOnScroll('.pricing-sub-reveal', sectionRef.current, {
        y: 24,
        duration: 0.85,
        stagger: 0.08
      });
      animateZoomSlideUpOnScroll('.pricing-card-reveal', '.pricing-grid-trigger', {
        y: 35,
        scale: 0.97,
        duration: 0.9,
        stagger: 0.08
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="harga"
      className="py-24 md:py-32 bg-white text-[#141414] relative border-b border-zinc-200 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Editorial Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end pb-12 border-b border-zinc-200 mb-14">
          <div className="lg:col-span-7 space-y-3">
            <span className="pricing-sub-reveal font-mono text-xs uppercase tracking-[0.2em] text-[#D97706] font-bold block gpu-accelerated">
              [ 04 // PILIHAN PAKET ]
            </span>
            <h2
              ref={headingRef}
              className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.08] text-[#141414]"
            >
              <MaskedWords
                segments={[
                  { text: 'Pilih Paket' },
                  { text: 'Sesuai', className: 'font-serif italic font-normal text-[#F59E0B]' },
                  { text: 'Kebutuhan Usaha.' }
                ]}
              />
            </h2>
          </div>

          <div className="pricing-sub-reveal lg:col-span-5 flex flex-col lg:items-end gap-4 gpu-accelerated">
            <p className="text-[#52525B] font-medium text-sm lg:text-right">
              Mulai dari satu kasir sampai kelola stok resep dan banyak cabang sekaligus.
            </p>

            {/* Billing Cycle Switcher */}
            <div className="inline-flex items-center bg-[#FAFAFA] p-1 rounded-full border border-zinc-200 self-start lg:self-end">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`relative px-5 py-2 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                  billingCycle === 'monthly' ? 'text-white' : 'text-[#52525B] hover:text-[#141414]'
                }`}
              >
                {billingCycle === 'monthly' && (
                  <motion.div
                    layoutId="billingTogglePill"
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 bg-[#141414] rounded-full"
                  />
                )}
                <span className="relative z-10">Bulanan</span>
              </button>

              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`relative px-5 py-2 rounded-full text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
                  billingCycle === 'annual' ? 'text-white' : 'text-[#52525B] hover:text-[#141414]'
                }`}
              >
                {billingCycle === 'annual' && (
                  <motion.div
                    layoutId="billingTogglePill"
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 bg-[#141414] rounded-full"
                  />
                )}
                <span className="relative z-10">Tahunan</span>
                <span className="relative z-10 font-mono bg-[#F59E0B] text-[#141414] text-[10px] font-bold px-2 py-0.5 rounded-full">
                  -20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 3-Column Editorial Pricing Grid */}
        <div className="pricing-grid-trigger grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const Icon = plan.icon;
            const displayPrice = billingCycle === 'annual' ? annualPrices[plan.id] : plan.price;

            return (
              <div
                key={plan.id}
                data-cursor="Select"
                className={`pricing-card-reveal relative rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-colors duration-200 gpu-accelerated ${
                  plan.highlight
                    ? 'bg-white border-2 border-[#F59E0B] shadow-[0_24px_60px_-15px_rgba(245,158,11,0.18)]'
                    : 'bg-[#FAFAFA] border border-zinc-200 hover:border-zinc-300'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#F59E0B] text-[#141414] font-mono text-[10px] font-extrabold uppercase tracking-wider px-4 py-1 rounded-full whitespace-nowrap inline-flex items-center gap-1.5 shadow-sm">
                    <Award size={12} /> Paling Populer
                  </div>
                )}

                <div className="space-y-6">
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-4 pt-1">
                    <div>
                      <span
                        className={`inline-block font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-2.5 border ${
                          plan.highlight
                            ? 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]'
                            : 'bg-white text-[#52525B] border-zinc-200'
                        }`}
                      >
                        {plan.badge}
                      </span>
                      <h3 className="text-2xl font-extrabold tracking-tight text-[#141414]">{plan.name}</h3>
                      <p className="text-xs font-bold mt-0.5 text-[#D97706]">{plan.subtitle}</p>
                    </div>
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                        plan.highlight
                          ? 'bg-[#F59E0B] text-[#141414] border-[#F59E0B]'
                          : 'bg-white text-[#D97706] border-zinc-200'
                      }`}
                    >
                      <Icon size={20} />
                    </div>
                  </div>

                  {/* Price */}
                  <div className="pb-6 border-b border-zinc-200">
                    <div className="flex items-baseline gap-2 overflow-hidden">
                      <AnimatePresence mode="popLayout">
                        <motion.span
                          key={displayPrice}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -12 }}
                          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                          className="text-3xl md:text-4xl font-black tracking-tight font-mono text-[#141414] inline-block"
                        >
                          {displayPrice}
                        </motion.span>
                      </AnimatePresence>
                      <span className="text-xs font-mono text-[#52525B]">{plan.period}</span>
                    </div>

                    {billingCycle === 'annual' && (
                      <p className="font-mono text-[11px] font-bold text-emerald-700 mt-1.5">
                        Hemat 20% dari {plan.price}
                      </p>
                    )}

                    <p className="text-xs font-medium mt-3 leading-relaxed text-[#52525B]">
                      {plan.target}
                    </p>
                  </div>

                  {/* Included */}
                  <div className="space-y-3">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#52525B]">
                      Fitur Utama:
                    </p>
                    {plan.included.map((feat, i) => (
                      <div key={i} className="flex items-start gap-3 text-xs font-medium leading-relaxed">
                        <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Check size={12} />
                        </div>
                        <span className="text-[#141414]">{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Excluded */}
                  {plan.excluded.length > 0 && (
                    <div className="space-y-2.5 pt-4 border-t border-zinc-200">
                      <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#52525B]">
                        Tidak Termasuk:
                      </p>
                      {plan.excluded.map((ex, i) => (
                        <div key={i} className="flex items-start gap-3 text-xs font-medium leading-relaxed opacity-75">
                          <div className="w-5 h-5 rounded-full bg-zinc-200 text-[#52525B] flex items-center justify-center shrink-0 mt-0.5">
                            <X size={11} />
                          </div>
                          <span className="text-[#52525B]">{ex}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* CTAs */}
                <div className="pt-8 mt-6 space-y-2.5">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelectPlan?.(plan.id)}
                    className={`w-full py-3.5 px-6 rounded-full text-xs font-extrabold transition-colors cursor-pointer ${
                      plan.highlight
                        ? 'bg-[#F59E0B] hover:bg-[#D97706] text-[#141414]'
                        : 'bg-[#141414] hover:bg-zinc-800 text-white'
                    }`}
                  >
                    Pilih {plan.name}
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => onSimulatePlan?.(plan.id)}
                    className="w-full py-2.5 px-4 rounded-full text-[11px] font-semibold text-[#52525B] hover:text-[#141414] hover:bg-zinc-200/70 transition-colors cursor-pointer"
                  >
                    Simulasikan Mode {plan.name.replace('Paket ', '')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
