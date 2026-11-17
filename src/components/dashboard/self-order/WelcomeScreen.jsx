import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function WelcomeScreen({ tableNumber, setTableNumber, onNext }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
      className="flex flex-col items-center justify-center min-h-full flex-1 p-6 relative overflow-hidden bg-[#FAFAFA]"
    >
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <img src="/logo-stocko.png" alt="Stocko Logo" className="w-20 h-20 object-contain mx-auto mb-5" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#B45309] bg-[#FEF3C7] border border-[#FDE68A] px-3 py-1 rounded-full inline-block mb-3">
            QR Self-Order Kiosk
          </span>
          <h1 className="text-3xl font-extrabold text-[#141414] tracking-tight">Stocko Resto.</h1>
          <p className="text-xs font-medium text-[#52525B] mt-2">
            Pesan menu favorit Anda langsung dari meja.
          </p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#52525B] ml-1">Nomor Meja Anda</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#52525B] font-bold text-sm">Meja</span>
              <input 
                type="number" 
                placeholder="01" 
                value={tableNumber} 
                onChange={(e) => setTableNumber(e.target.value)} 
                className="w-full bg-[#FAFAFA] border border-zinc-200 rounded-xl pl-16 pr-5 py-4 text-xl font-extrabold font-mono text-[#141414] focus:outline-none focus:bg-white focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all"
              />
            </div>
          </div>

          <button 
            onClick={() => { if(tableNumber) onNext(); else alert("Mohon masukkan nomor meja Anda."); }}
            className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-[#141414] font-extrabold py-4 rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95 transition-all"
          >
            Lihat Menu <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}