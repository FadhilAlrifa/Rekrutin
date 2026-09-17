import React from 'react';
import { motion } from 'framer-motion';
import { X, Save, ArrowDownToLine, Tag, Calendar, Layers, Hash } from 'lucide-react';

export default function StockInModal({ isOpen, onClose, onSubmit, stockInData, setStockInData }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop dengan Efek Blur */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose} 
        className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs cursor-pointer"
      />

      {/* Modal Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 15 }} 
        className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-7 md:p-8 shadow-2xl border border-zinc-100 z-10 max-h-[90vh] overflow-y-auto hide-scrollbar"
      >
        
        {/* Header Modal */}
        <div className="flex justify-between items-center border-b border-zinc-100 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-orange-50 text-[#E87F24] flex items-center justify-center font-bold border border-orange-100 shadow-xs">
              <ArrowDownToLine size={20} />
            </div>
            <div>
              <h3 className="font-black text-zinc-900 text-lg tracking-tight">Catat Barang Masuk</h3>
              <p className="text-[10px] text-zinc-400 font-black uppercase tracking-wider mt-0.5">Gudang & Inventaris Baru</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-9 h-9 rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Input */}
        <form onSubmit={onSubmit} className="space-y-4">
          
          {/* Nama Barang */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-600">Nama Barang / Bahan Baku</label>
            <div className="relative">
              <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Ketik nama barang (Misal: Gula Pasir)"
                value={stockInData.name} 
                onChange={(e) => setStockInData({...stockInData, name: e.target.value})} 
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-11 pr-4 py-3.5 text-xs font-bold text-zinc-900 focus:outline-none focus:border-[#E87F24] transition-all"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Jumlah & Satuan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-600">Jumlah Masuk</label>
              <div className="relative">
                <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input 
                  type="number" 
                  step="any"
                  placeholder="Misal: 50" 
                  value={stockInData.addedQty} 
                  onChange={(e) => setStockInData({...stockInData, addedQty: e.target.value})} 
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-11 pr-4 py-3.5 text-xs font-mono font-black text-zinc-900 focus:outline-none focus:border-[#E87F24] transition-all" 
                  required 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-600">Satuan</label>
              <div className="relative">
                <Layers size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input 
                  type="text" 
                  placeholder="kg / liter / pcs" 
                  value={stockInData.unit} 
                  onChange={(e) => setStockInData({...stockInData, unit: e.target.value})} 
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-11 pr-4 py-3.5 text-xs font-bold text-zinc-900 focus:outline-none focus:border-[#E87F24] transition-all" 
                  required 
                />
              </div>
            </div>
          </div>

          {/* Tanggal Masuk & Batas Min */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-600">Tgl. Masuk Barang</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <input 
                  type="date" 
                  value={stockInData.entryDate} 
                  onChange={(e) => setStockInData({...stockInData, entryDate: e.target.value})} 
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-11 pr-4 py-3.5 text-xs font-bold text-zinc-900 focus:outline-none focus:border-[#E87F24] cursor-pointer transition-all" 
                  required 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-600">Batas Restock (Min.)</label>
              <input 
                type="number" 
                placeholder="Misal: 5" 
                value={stockInData.minLimit} 
                onChange={(e) => setStockInData({...stockInData, minLimit: e.target.value})} 
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 text-xs font-bold text-zinc-900 focus:outline-none focus:border-[#E87F24] transition-all" 
              />
            </div>
          </div>

          {/* Tanggal Kedaluwarsa */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-600">Tgl. Kedaluwarsa (FIFO)</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              <input 
                type="date" 
                value={stockInData.newExpiryDate} 
                onChange={(e) => setStockInData({...stockInData, newExpiryDate: e.target.value})} 
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-11 pr-4 py-3.5 text-xs font-bold text-zinc-900 focus:outline-none focus:border-[#E87F24] cursor-pointer transition-all" 
              />
            </div>
          </div>

          {/* Tombol Simpan */}
          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-[#E87F24] to-[#FFC81E] text-zinc-950 font-black text-xs py-4 rounded-2xl shadow-lg cursor-pointer flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-95 mt-6"
          >
            <Save size={16} /> Simpan ke Gudang
          </button>
        </form>

      </motion.div>
    </div>
  );
}