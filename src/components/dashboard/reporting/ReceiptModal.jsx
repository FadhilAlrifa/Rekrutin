import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, X } from 'lucide-react';

export default function ReceiptModal({ selectedTx, onClose, formatDateTime }) {
  if (!selectedTx) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm cursor-pointer"></motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} 
          className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-zinc-100"
        >
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 flex items-center justify-center cursor-pointer">
            <X size={16}/>
          </button>

          <div className="text-center space-y-1 mb-6 mt-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E87F24] to-[#FFC81E] text-zinc-950 flex items-center justify-center mx-auto mb-3 shadow-md">
              <FileText size={20} />
            </div>
            <h3 className="font-black text-zinc-900 text-lg">Stocko. POS</h3>
            <p className="text-[10px] text-zinc-400 font-mono">ID: {selectedTx.id}</p>
            <p className="text-[10px] text-zinc-400 font-medium">{formatDateTime(selectedTx.created_at)}</p>
          </div>

          <div className="border-t border-dashed border-zinc-300 py-4 space-y-3">
            {selectedTx.items && selectedTx.items.map((item, i) => (
              <div key={i} className="flex justify-between text-xs text-zinc-700">
                <div>
                  <p className="font-bold">{item.name}</p>
                  <p className="text-[10px] text-zinc-400">{item.qty} x Rp {Number(item.price).toLocaleString('id-ID')}</p>
                </div>
                <div className="font-mono font-bold">
                  Rp {(Number(item.qty) * Number(item.price)).toLocaleString('id-ID')}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-zinc-300 pt-4 flex justify-between items-center">
            <span className="text-sm font-black text-zinc-900">Total Transaksi</span>
            <span className="text-base font-black font-mono text-[#E87F24]">
              Rp {Number(selectedTx.total_amount).toLocaleString('id-ID')}
            </span>
          </div>

          <div className="mt-8 text-center">
            <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest">Terima Kasih</p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}