import React from 'react';
import { motion } from 'framer-motion';
import { X, Save, Edit3, Tag, Layers, Calendar, AlertCircle } from 'lucide-react';

export default function EditItemModal({ isOpen, onClose, onSubmit, editingItem, setEditingItem }) {
  if (!isOpen || !editingItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop Gelap dengan Efek Blur */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose} 
        className="fixed inset-0 bg-zinc-900/60 backdrop-blur-xs cursor-pointer"
      />
      
      {/* Container Modal Utama */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 15 }} 
        className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-7 md:p-8 shadow-2xl border border-zinc-100 z-10 space-y-6 max-h-[90vh] overflow-y-auto hide-scrollbar"
      >
        
        {/* Header Modal */}
        <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#E87F24] flex items-center justify-center font-bold border border-orange-100 shadow-xs">
              <Edit3 size={18} />
            </div>
            <div>
              <h3 className="font-black text-zinc-900 text-lg">Edit Barang Gudang</h3>
              <p className="text-xs text-zinc-400 font-medium">Perbarui parameter dan batas stok inventaris.</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Input */}
        <form onSubmit={onSubmit} className="space-y-4">
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-600 flex items-center gap-1.5">
              <Tag size={14} className="text-[#E87F24]" /> Nama Barang / Bahan Baku
            </label>
            <input 
              type="text" 
              value={editingItem.name} 
              onChange={(e) => setEditingItem({...editingItem, name: e.target.value})} 
              className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 text-xs font-bold focus:outline-none focus:border-[#E87F24] transition-all" 
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-600 flex items-center gap-1.5">
                <Layers size={14} className="text-[#E87F24]" /> Total Stok
              </label>
              <input 
                type="number" 
                step="any" 
                value={editingItem.stock} 
                onChange={(e) => setEditingItem({...editingItem, stock: e.target.value})} 
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 text-xs font-mono font-black focus:outline-none focus:border-[#E87F24] transition-all" 
                required 
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-600">Satuan</label>
              <input 
                type="text" 
                value={editingItem.unit} 
                onChange={(e) => setEditingItem({...editingItem, unit: e.target.value})} 
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 text-xs font-medium focus:outline-none focus:border-[#E87F24] transition-all" 
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-600 flex items-center gap-1.5">
                <Calendar size={14} className="text-zinc-400" /> Tgl. Masuk Barang
              </label>
              <input 
                type="date" 
                value={editingItem.entryDate || ''} 
                onChange={(e) => setEditingItem({...editingItem, entryDate: e.target.value})} 
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 text-xs font-medium focus:outline-none focus:border-[#E87F24] cursor-pointer" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-600 flex items-center gap-1.5">
                <AlertCircle size={14} className="text-orange-500" /> Batas Restock (Min.)
              </label>
              <input 
                type="number" 
                value={editingItem.minLimit} 
                onChange={(e) => setEditingItem({...editingItem, minLimit: e.target.value})} 
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 text-xs font-mono font-bold focus:outline-none focus:border-[#E87F24]" 
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-600 flex items-center gap-1.5">
              <Calendar size={14} className="text-red-400" /> Tgl. Kedaluwarsa (FIFO)
            </label>
            <input 
              type="date" 
              value={editingItem.expiryDate || ''} 
              onChange={(e) => setEditingItem({...editingItem, expiryDate: e.target.value})} 
              className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 text-xs font-medium focus:outline-none focus:border-[#E87F24] cursor-pointer" 
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-3 text-xs font-black text-zinc-500 hover:bg-zinc-100 rounded-2xl cursor-pointer transition-colors"
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="px-6 py-3 bg-gradient-to-r from-[#E87F24] to-[#FFC81E] text-zinc-950 font-black text-xs rounded-2xl shadow-lg cursor-pointer flex items-center gap-2 hover:scale-[1.02] transition-transform active:scale-95"
            >
              <Save size={15} /> Simpan Perubahan
            </button>
          </div>

        </form>

      </motion.div>
    </div>
  );
}