import React from 'react';
import { motion } from 'framer-motion';
import { X, Save, ArrowDownToLine, Tag, Calendar, Layers, Hash } from 'lucide-react';

export default function StockInModal({ isOpen, onClose, onSubmit, stockInData, setStockInData }) {
  if (!isOpen) return null;

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

      {/* Modal Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 15 }} 
        className="relative w-full max-w-lg bg-[#f5f5f7] sm:rounded-[24px] rounded-t-[24px] shadow-2xl z-10 flex flex-col max-h-[90vh] overflow-hidden"
      >
        
        {/* iOS Style Modal Header */}
        <div className="flex justify-between items-center px-4 py-3 bg-white/80 backdrop-blur-xl border-b border-black/5 shrink-0">
          <button onClick={onClose} className="text-[#007AFF] font-medium text-[15px] px-2 py-1 active:opacity-50">Batal</button>
          <h3 className="font-semibold text-zinc-900 text-[15px]">Catat Barang Masuk</h3>
          <button onClick={onSubmit} className="text-[#007AFF] font-semibold text-[15px] px-2 py-1 active:opacity-50">Simpan</button>
        </div>

        {/* Form Input Group */}
        <div className="overflow-y-auto p-4 sm:p-6">
          <form id="stockInForm" onSubmit={onSubmit} className="space-y-6">
            
            {/* Group 1: Informasi Barang */}
            <div>
              <p className="text-[12px] font-medium text-zinc-500 uppercase tracking-wide ml-3 mb-2">Informasi Barang Baku</p>
              <div className="bg-white rounded-[14px] border border-black/[0.04] overflow-hidden shadow-sm">
                
                <div className="flex items-center px-4 py-3 border-b border-black/[0.04]">
                  <label className="text-[15px] font-medium text-zinc-900 w-32 shrink-0">Nama Barang</label>
                  <input 
                    type="text" 
                    placeholder="Biji Kopi Arabika"
                    value={stockInData.name} 
                    onChange={(e) => setStockInData({...stockInData, name: e.target.value})} 
                    className="w-full text-[15px] text-zinc-900 placeholder-zinc-400 focus:outline-none bg-transparent"
                    required
                    autoFocus
                  />
                </div>

                <div className="flex items-center px-4 py-3 border-b border-black/[0.04]">
                  <label className="text-[15px] font-medium text-zinc-900 w-32 shrink-0">Kategori</label>
                  <select 
                    value={stockInData.category || 'Bahan Minuman'} 
                    onChange={(e) => setStockInData({...stockInData, category: e.target.value})} 
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
                  <label className="text-[15px] font-medium text-zinc-900 w-32 shrink-0">Jumlah</label>
                  <input 
                    type="number" 
                    step="any"
                    placeholder="0" 
                    value={stockInData.addedQty} 
                    onChange={(e) => setStockInData({...stockInData, addedQty: e.target.value})} 
                    className="w-full text-[15px] text-zinc-900 placeholder-zinc-400 focus:outline-none bg-transparent" 
                    required 
                  />
                </div>

                <div className="flex items-center px-4 py-3 border-b border-black/[0.04]">
                  <label className="text-[15px] font-medium text-zinc-900 w-32 shrink-0">Satuan</label>
                  <input 
                    type="text" 
                    placeholder="kg / liter / pcs" 
                    value={stockInData.unit} 
                    onChange={(e) => setStockInData({...stockInData, unit: e.target.value})} 
                    className="w-full text-[15px] text-zinc-900 placeholder-zinc-400 focus:outline-none bg-transparent" 
                    required 
                  />
                </div>

                <div className="flex items-center px-4 py-3">
                  <label className="text-[15px] font-medium text-zinc-900 w-32 shrink-0">Batas Min.</label>
                  <input 
                    type="number" 
                    placeholder="5" 
                    value={stockInData.minLimit} 
                    onChange={(e) => setStockInData({...stockInData, minLimit: e.target.value})} 
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
                  <label className="text-[15px] font-medium text-zinc-900">Tgl Masuk</label>
                  <input 
                    type="date" 
                    value={stockInData.entryDate} 
                    onChange={(e) => setStockInData({...stockInData, entryDate: e.target.value})} 
                    className="text-[15px] text-[#007AFF] font-medium focus:outline-none bg-transparent cursor-pointer text-right" 
                    required 
                  />
                </div>

                <div className="flex items-center justify-between px-4 py-3">
                  <label className="text-[15px] font-medium text-zinc-900">Kedaluwarsa</label>
                  <input 
                    type="date" 
                    value={stockInData.newExpiryDate} 
                    onChange={(e) => setStockInData({...stockInData, newExpiryDate: e.target.value})} 
                    className="text-[15px] text-[#007AFF] font-medium focus:outline-none bg-transparent cursor-pointer text-right" 
                  />
                </div>

              </div>
              <p className="text-[12px] text-zinc-400 ml-3 mt-2">Pastikan mengisi Tanggal Kedaluwarsa dengan benar agar sistem dapat melacak secara akurat berdasarkan sistem FIFO.</p>
            </div>

            {/* Tombol Button (Tergantikan oleh tombol Selesai di Header, tapi tetap butuh trigger submit submit button tersembunyi) */}
            <button type="submit" className="hidden">Simpan</button>
          </form>
        </div>

      </motion.div>
    </div>
  );
}