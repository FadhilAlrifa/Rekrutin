import React from 'react';
import { motion } from 'framer-motion';
import { UtensilsCrossed, ArrowRight } from 'lucide-react';

export default function WelcomeScreen({ tableNumber, setTableNumber, onNext }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center min-h-screen p-6 relative overflow-hidden bg-white"
    >
      {/* Dekorasi Background */}
      <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-orange-50 to-transparent -z-10"></div>
      
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#E87F24] to-[#FFC81E] text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-500/20">
            <UtensilsCrossed size={40} />
          </div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Stocko Resto.</h1>
          <p className="text-xs font-medium text-zinc-500 mt-2">
            Pesan menu favorit Anda langsung dari meja.
          </p>
        </div>

        <div className="bg-zinc-50 border border-zinc-200/80 rounded-[2rem] p-6 shadow-sm space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 ml-1">Nomor Meja Anda</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 font-black">Meja</span>
              <input 
                type="number" 
                placeholder="01" 
                value={tableNumber} 
                onChange={(e) => setTableNumber(e.target.value)} 
                className="w-full bg-white border-2 border-zinc-200 rounded-2xl pl-16 pr-5 py-4 text-xl font-black text-zinc-900 focus:outline-none focus:border-[#E87F24] transition-all shadow-2xs"
              />
            </div>
          </div>

          <button 
            onClick={() => { if(tableNumber) onNext(); else alert("Mohon masukkan nomor meja Anda."); }}
            className="w-full bg-gradient-to-r from-[#E87F24] to-[#FFC81E] text-zinc-950 font-black py-4 rounded-2xl text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-transform"
          >
            Lihat Menu <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}