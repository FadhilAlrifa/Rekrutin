import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

export default function SuccessScreen({ tableNumber, onReset }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center min-h-full flex-1 p-6 bg-[#FAFAFA]">
      <div className="bg-white w-full max-w-sm rounded-2xl p-8 border border-zinc-200 shadow-sm text-center">
        <div className="w-20 h-20 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={42} />
        </div>
        <h2 className="text-2xl font-extrabold text-[#141414] mb-2">Pesanan Diterima!</h2>
        <p className="text-xs font-medium text-[#52525B] mb-8 leading-relaxed">
          Makanan Anda sedang diproses oleh dapur. Silakan bersantai di <strong className="text-[#141414]">Meja {tableNumber}</strong>. Pembayaran dilakukan di kasir.
        </p>
        <button 
          onClick={onReset}
          className="w-full bg-[#141414] hover:bg-zinc-800 text-white font-bold py-3.5 rounded-xl text-xs transition-colors cursor-pointer"
        >
          Kembali ke Awal
        </button>
      </div>
    </motion.div>
  );
}