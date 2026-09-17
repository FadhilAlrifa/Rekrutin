import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Store } from 'lucide-react';

export default function CTA({ onOpenApp, onOpenRegister }) {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-zinc-950">
      {/* Background Glow Premium */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full bg-gradient-to-r from-[#E87F24]/20 to-[#FFC81E]/20 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          whileInView={{ opacity: 1, scale: 1, y: 0 }} 
          viewport={{ once: true }} 
          transition={{ duration: 1.5 }}
          className="bg-white/5 backdrop-blur-2xl border border-white/10 p-10 md:p-20 rounded-[3rem] shadow-2xl"
        >
          <Sparkles className="text-[#FFC81E] w-12 h-12 mx-auto mb-6 animate-pulse" />
          
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Siap Merevolusi <br className="hidden md:block" />Operasional Gerai Anda?
          </h2>
          
          <p className="text-lg md:text-xl text-zinc-300 font-medium mb-10 max-w-2xl mx-auto leading-relaxed">
            Tinggalkan pencatatan manual dan kerugian akibat bahan basi. Gunakan Stocko hari ini untuk integrasi kasir POS, resep gudang, dan peringatan FEFO dalam satu platform.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onOpenRegister}
              className="w-full sm:w-auto bg-gradient-to-r from-[#E87F24] to-[#FFC81E] hover:from-[#c96a1a] hover:to-[#e6b419] text-zinc-950 font-black px-10 h-14 md:h-16 rounded-full text-sm md:text-lg shadow-[0_0_40px_rgba(232,127,36,0.3)] hover:shadow-[0_0_60px_rgba(232,127,36,0.6)] transition-all flex items-center justify-center gap-2 hover:-translate-y-1 cursor-pointer"
            >
              Mulai Uji Coba Gratis <ArrowRight size={20} />
            </button>
            
            <button 
              onClick={onOpenApp}
              className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white border border-white/20 font-bold px-10 h-14 md:h-16 rounded-full text-sm md:text-lg transition-all flex items-center justify-center gap-2 hover:-translate-y-1 cursor-pointer"
            >
              <Store size={20} /> Buka Simulasi POS
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}