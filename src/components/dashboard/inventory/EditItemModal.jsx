import React from 'react';
import { motion } from 'framer-motion';
import { X, Save, Edit3, Tag, Layers, Calendar, AlertCircle } from 'lucide-react';

export default function EditItemModal({ isOpen, onClose, onSubmit, editingItem, setEditingItem }) {
  if (!isOpen || !editingItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose} 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm cursor-pointer"
      />
      
      {/* Container Modal Utama */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 15 }} 
        className="relative w-full max-w-lg bg-[#f5f5f7] sm:rounded-[24px] rounded-t-[24px] shadow-2xl z-10 flex flex-col max-h-[90vh] overflow-hidden"
      >
        
        {/* iOS Style Modal Header */}
        <div className="flex justify-between items-center px-4 py-3 bg-white/80 backdrop-blur-xl border-b border-black/5 shrink-0">
          <button type="button" onClick={onClose} className="text-[#007AFF] font-medium text-[15px] px-2 py-1 active:opacity-50">Batal</button>
          <h3 className="font-semibold text-zinc-900 text-[15px]">Edit Barang Gudang</h3>
          <button type="button" onClick={onSubmit} className="text-[#007AFF] font-semibold text-[15px] px-2 py-1 active:opacity-50">Simpan</button>
        </div>

        {/* Form Input Group */}
        <div className="overflow-y-auto p-4 sm:p-6">
          <form id="editItemForm" onSubmit={onSubmit} className="space-y-6">
            
            {/* Group 1: Informasi Barang */}
            <div>
              <p className="text-[12px] font-medium text-zinc-500 uppercase tracking-wide ml-3 mb-2">Informasi Bahan Baku</p>
              <div className="bg-white rounded-[14px] border border-black/[0.04] overflow-hidden shadow-sm">
                
                <div className="flex items-center px-4 py-3 border-b border-black/[0.04]">
                  <label className="text-[15px] font-medium text-zinc-900 w-32 shrink-0">Nama Barang</label>
                  <input 
                    type="text" 
                    value={editingItem.nameOnly} 
                    onChange={(e) => setEditingItem({...editingItem, nameOnly: e.target.value})} 
                    className="w-full text-[15px] text-zinc-900 placeholder-zinc-400 focus:outline-none bg-transparent"
                    required
                  />
                </div>

                <div className="flex items-center px-4 py-3 border-b border-black/[0.04]">
                  <label className="text-[15px] font-medium text-zinc-900 w-32 shrink-0">Kategori</label>
                  <select 
                    value={editingItem.category} 
                    onChange={(e) => setEditingItem({...editingItem, category: e.target.value})} 
                    className="w-full text-[15px] text-zinc-900 focus:outline-none bg-transparent appearance-none cursor-pointer"
                  >
                    <option value="Bahan Minuman">Bahan Minuman</option>
                    <option value="Bahan Makanan">Bahan Makanan</option>
                    <option value="Bahan Bakery">Bahan Bakery</option>
                    <option value="Bahan Pelengkap">Bahan Pelengkap</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div className="flex items-center px-4 py-3 border-b border-black/[0.04]">
                  <label className="text-[15px] font-medium text-zinc-900 w-32 shrink-0">Total Stok</label>
                  <input 
                    type="number" 
                    step="any"
                    value={editingItem.stock} 
                    onChange={(e) => setEditingItem({...editingItem, stock: e.target.value})} 
                    className="w-full text-[15px] text-zinc-900 placeholder-zinc-400 focus:outline-none bg-transparent" 
                    required 
                  />
                </div>

                <div className="flex items-center px-4 py-3 border-b border-black/[0.04]">
                  <label className="text-[15px] font-medium text-zinc-900 w-32 shrink-0">Satuan</label>
                  <input 
                    type="text" 
                    placeholder="kg / liter / pcs" 
                    value={editingItem.unit} 
                    onChange={(e) => setEditingItem({...editingItem, unit: e.target.value})} 
                    className="w-full text-[15px] text-zinc-900 placeholder-zinc-400 focus:outline-none bg-transparent" 
                    required 
                  />
                </div>

                <div className="flex items-center px-4 py-3">
                  <label className="text-[15px] font-medium text-zinc-900 w-32 shrink-0">Batas Min.</label>
                  <input 
                    type="number" 
                    value={editingItem.minLimit} 
                    onChange={(e) => setEditingItem({...editingItem, minLimit: e.target.value})} 
                    className="w-full text-[15px] text-zinc-900 placeholder-zinc-400 focus:outline-none bg-transparent" 
                  />
                </div>

              </div>
            </div>

            {/* Group 2: Tanggal & Kedaluwarsa */}
            <div>
              <p className="text-[12px] font-medium text-zinc-500 uppercase tracking-wide ml-3 mb-2">Tanggal & Expired (FIFO)</p>
              <div className="bg-white rounded-[14px] border border-black/[0.04] overflow-hidden shadow-sm">
                
                <div className="flex items-center justify-between px-4 py-3 border-b border-black/[0.04]">
                  <label className="text-[15px] font-medium text-zinc-900 shrink-0">Tgl. Masuk</label>
                  <input 
                    type="date" 
                    value={editingItem.entryDate || ''} 
                    onChange={(e) => setEditingItem({...editingItem, entryDate: e.target.value})} 
                    className="text-[15px] text-[#007AFF] focus:outline-none bg-transparent text-right"
                  />
                </div>

                <div className="flex items-center justify-between px-4 py-3">
                  <label className="text-[15px] font-medium text-zinc-900 shrink-0">Tgl. Kedaluwarsa</label>
                  <input 
                    type="date" 
                    value={editingItem.expiryDate || ''} 
                    onChange={(e) => setEditingItem({...editingItem, expiryDate: e.target.value})} 
                    className="text-[15px] text-[#007AFF] focus:outline-none bg-transparent text-right"
                  />
                </div>

              </div>
              <p className="text-[12px] text-zinc-400 ml-3 mt-2">Batas minimum digunakan untuk memicu notifikasi peringatan stok menipis (restock alert).</p>
            </div>

          </form>
        </div>
      </motion.div>
    </div>
  );
}