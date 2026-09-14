import React from 'react';
import { motion } from 'framer-motion';

export default function TrustedBy() {
  return (
    <section className="py-12 border-b border-zinc-200/50 bg-white/50 backdrop-blur-sm relative z-20">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <p className="text-xs md:text-sm font-bold text-zinc-400 uppercase tracking-[0.2em] mb-8">
          Dirancang khusus untuk terintegrasi mulus dengan
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-20 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
          {/* Logo Ekosistem */}
          <div className="text-xl md:text-2xl font-black flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm">W</span> Workin
          </div>
          <div className="text-xl md:text-2xl font-black flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center text-white text-sm">M</span> Margin
          </div>
          <div className="text-xl md:text-2xl font-black flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white text-sm">D</span> Duluin
          </div>
          <div className="text-xl md:text-2xl font-black flex items-center gap-2 text-zinc-800">
            Google Workspace
          </div>
        </div>
      </div>
    </section>
  );
}