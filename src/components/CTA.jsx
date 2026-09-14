import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CTA() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-zinc-950">
      {/* Background Glow Premium */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full bg-gradient-to-r from-[#E87F24]/20 to-[#FFC81E]/20 blur-[120px] rounded-full pointer-events-none"></div>
      
      {/* Ornamen Grid Line di Background */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
      
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} whileInView={{ opacity: 1, scale: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.5 }}
          className="bg-white/5 backdrop-blur-2xl border border-white/10 p-10 md:p-20 rounded-[3rem] shadow-2xl"
        >
          <Sparkles className="text-[#FFC81E] w-12 h-12 mx-auto mb-6 animate-pulse" />
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Siap Merevolusi <br className="hidden md:block" />Tim HR Anda?
          </h2>
          <p className="text-lg md:text-xl text-zinc-300 font-medium mb-10 max-w-2xl mx-auto leading-relaxed">
            Bergabunglah dengan perusahaan modern lainnya. Mulai gunakan otomatisasi AI hari ini dan rasakan efisiensi rekrutmen hingga 80%.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto bg-gradient-to-r from-[#E87F24] to-[#FFC81E] hover:from-[#c96a1a] hover:to-[#e6b419] text-white font-bold px-10 h-14 md:h-16 rounded-full text-lg shadow-[0_0_40px_rgba(232,127,36,0.3)] hover:shadow-[0_0_60px_rgba(232,127,36,0.6)] transition-all flex items-center justify-center gap-2 hover:-translate-y-1">
              Mulai Uji Coba Gratis <ArrowRight size={20} />
            </button>
            <button className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white border border-white/20 font-bold px-10 h-14 md:h-16 rounded-full text-lg transition-all flex items-center justify-center hover:-translate-y-1">
              Hubungi Sales
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}