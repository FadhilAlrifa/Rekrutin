import React from 'react';
import { motion } from 'framer-motion';
import { X, ArrowDownToLine, Tag, Calendar, Package, Check } from 'lucide-react';

export default function StockInModal({ isOpen, onClose, onSubmit, stockInData, setStockInData }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        transition={{ duration: 0.25 }}
        onClick={onClose} 
        className="fixed inset-0 bg-zinc-950/50 backdrop-blur-sm cursor-pointer"
      />

      {/* Modal Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 15 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.96, y: 15 }} 
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-lg bg-white sm:rounded-[2rem] rounded-t-[2rem] shadow-2xl border border-zinc-200/80 z-10 flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 bg-white shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-100 text-[#E87F24] flex items-center justify-center shadow-2xs">
              <ArrowDownToLine size={20} />
            </div>
            <div>
              <h3 className="font-black text-zinc-900 text-lg tracking-tight">Catat Barang Masuk</h3>
              <p className="text-xs font-medium text-zinc-500 mt-0.5">
                Tambahkan bahan baku baru atau tambah stok gudang yang ada.
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form id="stockInForm" onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto p-6 space-y-6 flex-1">
            
            {/* Bagian 1: Informasi Bahan Baku */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Package size={14} className="text-[#E87F24]" />
                <span className="text-[11px] font-black text-zinc-400 uppercase tracking-wider">Informasi Bahan Baku</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nama Barang */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-zinc-600 mb-1.5">Nama Barang Gudang</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Biji Kopi Arabika"
                    value={stockInData.name} 
                    onChange={(e) => setStockInData({...stockInData, name: e.target.value})} 
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-[#E87F24] focus:ring-3 focus:ring-[#E87F24]/15 transition-all"
                    required
                    autoFocus
                  />
                </div>

                {/* Kategori */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-zinc-600 mb-1.5">Kategori Bahan</label>
                  <select 
                    value={stockInData.category || 'Bahan Minuman'} 
                    onChange={(e) => setStockInData({...stockInData, category: e.target.value})} 
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 focus:outline-none focus:bg-white focus:border-[#E87F24] focus:ring-3 focus:ring-[#E87F24]/15 transition-all cursor-pointer"
                  >
                    <option value="Bahan Minuman">Bahan Minuman</option>
                    <option value="Bahan Makanan">Bahan Makanan</option>
                    <option value="Bahan Bakery">Bahan Bakery</option>
                    <option value="Bahan Pelengkap">Bahan Pelengkap</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                {/* Jumlah Masuk */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 mb-1.5">Jumlah Masuk</label>
                  <input 
                    type="number" 
                    step="any"
                    placeholder="0" 
                    value={stockInData.addedQty} 
                    onChange={(e) => setStockInData({...stockInData, addedQty: e.target.value})} 
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-[#E87F24] focus:ring-3 focus:ring-[#E87F24]/15 transition-all font-mono" 
                    required 
                  />
                </div>

                {/* Satuan */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 mb-1.5">Satuan</label>
                  <input 
                    type="text" 
                    placeholder="kg / liter / pcs / gram" 
                    value={stockInData.unit} 
                    onChange={(e) => setStockInData({...stockInData, unit: e.target.value})} 
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-[#E87F24] focus:ring-3 focus:ring-[#E87F24]/15 transition-all" 
                    required 
                  />
                </div>

                {/* Batas Minimum */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-zinc-600 mb-1.5">Batas Minimum Peringatan (Alert)</label>
                  <input 
                    type="number" 
                    placeholder="5" 
                    value={stockInData.minLimit} 
                    onChange={(e) => setStockInData({...stockInData, minLimit: e.target.value})} 
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-[#E87F24] focus:ring-3 focus:ring-[#E87F24]/15 transition-all font-mono" 
                  />
                </div>
              </div>
            </div>

            {/* Bagian 2: Tanggal & Kedaluwarsa (FIFO) */}
            <div className="space-y-4 pt-2 border-t border-zinc-100">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-[#E87F24]" />
                <span className="text-[11px] font-black text-zinc-400 uppercase tracking-wider">Tanggal & Kedaluwarsa (FIFO)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 mb-1.5">Tanggal Masuk</label>
                  <input 
                    type="date" 
                    value={stockInData.entryDate} 
                    onChange={(e) => setStockInData({...stockInData, entryDate: e.target.value})} 
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-bold text-zinc-900 focus:outline-none focus:bg-white focus:border-[#E87F24] focus:ring-3 focus:ring-[#E87F24]/15 transition-all cursor-pointer" 
                    required 
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 mb-1.5">Tanggal Kedaluwarsa</label>
                  <input 
                    type="date" 
                    value={stockInData.newExpiryDate} 
                    onChange={(e) => setStockInData({...stockInData, newExpiryDate: e.target.value})} 
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-bold text-zinc-900 focus:outline-none focus:bg-white focus:border-[#E87F24] focus:ring-3 focus:ring-[#E87F24]/15 transition-all cursor-pointer" 
                  />
                </div>
              </div>

              <p className="text-[11px] font-medium text-zinc-400 leading-relaxed">
                * Pastikan mengisi Tanggal Kedaluwarsa dengan benar agar sistem dapat memberi notifikasi dini sebelum bahan rusak.
              </p>
            </div>

          </div>

          {/* Footer Modal */}
          <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-end gap-3 shrink-0">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-3 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-100 text-xs font-black text-zinc-600 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#E87F24] to-[#FFC81E] hover:from-[#d6731f] hover:to-[#e6b419] text-zinc-950 text-xs font-black shadow-lg shadow-[#E87F24]/20 inline-flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Check size={16} /> Simpan Barang Masuk
            </button>
          </div>
        </form>

      </motion.div>
    </div>
  );
}
