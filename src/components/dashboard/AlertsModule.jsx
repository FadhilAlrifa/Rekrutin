import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock, Sparkles, BellRing, AlertOctagon, PackageCheck } from 'lucide-react';

export default function AlertsModule({ ingredients = [] }) {
  
  const getExpiryStatus = (dateString) => {
    if (!dateString) return 'aman';
    const expDate = new Date(dateString);
    const today = new Date();
    const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'expired';
    if (diffDays <= 30) return 'hampir'; 
    return 'aman';
  };

  // Filter KHUSUS: Hanya bahan baku dengan stok <= minLimit ATAU expired/hampir expired
  const alertItems = ingredients.filter(ing => ing.stock <= ing.minLimit || getExpiryStatus(ing.expiryDate) !== 'aman');

  return (
    <div className="space-y-8 pb-16">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 text-white rounded-[2.5rem] p-7 md:p-8 shadow-xl relative overflow-hidden border border-zinc-800">
        <div className="absolute top-0 right-0 w-72 h-72 bg-red-500/15 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="bg-[#E87F24]/20 text-[#FFC81E] border border-[#E87F24]/30 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5">
              <Sparkles size={13} /> Sistem Cerdas Track
            </span>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Pusat Peringatan & Kritis Gudang</h1>
            <p className="text-zinc-400 text-xs font-medium max-w-lg">
              Hanya menampilkan bahan baku yang membutuhkan tindakan segera (stok menipis atau tenggat waktu kedaluwarsa).
            </p>
          </div>
          <div className="bg-white/10 border border-white/15 backdrop-blur-md p-4 rounded-2xl flex items-center gap-4 shrink-0 shadow-sm">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold border ${alertItems.length > 0 ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>
              <BellRing size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Perhatian Sistem</p>
              <p className="text-base font-black text-white">{alertItems.length} Masalah Terdeteksi</p>
            </div>
          </div>
        </div>
      </motion.div>

      {alertItems.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white border border-zinc-200/80 rounded-[2.5rem] p-16 text-center shadow-sm flex flex-col items-center justify-center space-y-4">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
            <PackageCheck size={40} />
          </div>
          <div>
            <h3 className="font-black text-zinc-900 text-lg">Semua Stok & FIFO Gudang Aman!</h3>
            <p className="text-sm text-zinc-500 font-medium mt-1">Sistem tidak mendeteksi adanya bahan baku gudang yang kritis maupun yang hampir kedaluwarsa.</p>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence>
            {alertItems.map((item, idx) => {
              const isLowStock = item.stock <= item.minLimit;
              const expStatus = getExpiryStatus(item.expiryDate);
              const isExpired = expStatus === 'expired';
              const isNearExp = expStatus === 'hampir';

              const cardBorder = isExpired || (isLowStock && isExpired) ? 'border-red-400 bg-red-50/10' : 'border-orange-300 bg-orange-50/10';

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: idx * 0.1 }}
                  key={item.id} 
                  className={`bg-white border rounded-[2.5rem] p-7 shadow-xl flex flex-col justify-between space-y-5 relative overflow-hidden ${cardBorder}`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black uppercase bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full border border-zinc-200">
                        Bahan Baku Gudang
                      </span>
                    </div>
                    
                    <h3 className="font-black text-zinc-900 text-lg">{item.name}</h3>
                    
                    <div className="flex flex-col gap-2 text-xs font-medium pt-1">
                      <div className="flex items-center justify-between bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
                        <span className="text-zinc-500 font-bold">Sisa Stok:</span>
                        <strong className={`font-mono text-sm ${isLowStock ? 'text-red-600 font-black animate-pulse' : 'text-zinc-900 font-bold'}`}>
                          {item.stock} {item.unit} (Min: {item.minLimit} {item.unit})
                        </strong>
                      </div>
                      <div className="flex items-center justify-between bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
                        <span className="text-zinc-500 font-bold">Tanggal FIFO:</span>
                        <strong className={`font-mono text-sm flex items-center gap-1 ${isExpired ? 'text-red-600 font-black' : isNearExp ? 'text-orange-600 font-black' : 'text-zinc-900 font-bold'}`}>
                          <Clock size={14} /> {item.expiryDate || 'N/A'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mt-2">
                    {isLowStock && (
                      <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-2xl text-[11px] font-black flex items-start gap-3">
                        <AlertTriangle size={16} className="text-red-600 shrink-0" />
                        Peringatan: Stok bahan baku di bawah batas minimum (Reorder Point). Segera restock.
                      </div>
                    )}
                    
                    {isExpired && (
                      <div className="bg-red-600 border border-red-700 text-white p-3 rounded-2xl text-[11px] font-black flex items-start gap-3 shadow-md">
                        <AlertOctagon size={16} className="text-white shrink-0" />
                        Kritis: Bahan baku ini telah melewati masa kedaluwarsa! Tarik dari gudang.
                      </div>
                    )}

                    {isNearExp && !isExpired && (
                      <div className="bg-orange-50 border border-orange-200 text-orange-700 p-3 rounded-2xl text-[11px] font-black flex items-start gap-3">
                        <Clock size={16} className="text-orange-600 shrink-0" />
                        Peringatan FIFO: Bahan baku ini akan kedaluwarsa dalam kurang dari 30 hari.
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}