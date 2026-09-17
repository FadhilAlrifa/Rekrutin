import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

export default function SuccessScreen({ tableNumber, onReset }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center min-h-screen p-6 bg-zinc-50">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 border border-zinc-200/80 shadow-xl text-center">
        <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={50} />
        </div>
        <h2 className="text-2xl font-black text-zinc-900 mb-2">Pesanan Diterima!</h2>
        <p className="text-xs font-medium text-zinc-500 mb-8 leading-relaxed">
          Makanan Anda sedang diproses oleh dapur. Silakan bersantai di <strong>Meja {tableNumber}</strong>. Pembayaran dilakukan di kasir.
        </p>
        <button 
          onClick={onReset}
          className="w-full bg-zinc-900 text-white font-black py-4 rounded-2xl text-xs active:bg-zinc-800 transition-colors"
        >
          Kembali ke Awal
        </button>
      </div>
    </motion.div>
  );
}