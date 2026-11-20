import { motion } from 'framer-motion';
import { X, ArrowDownToLine, Calendar, Package, Check } from 'lucide-react';

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
        className="relative w-full max-w-lg bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl border border-zinc-200 z-10 flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 bg-white shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] text-[#B45309] flex items-center justify-center shadow-sm">
              <ArrowDownToLine size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-[#141414] text-lg tracking-tight">Catat Barang Masuk</h3>
              <p className="text-xs font-medium text-[#52525B] mt-0.5">
                Tambahkan bahan baku baru atau tambah stok & harga beli gudang.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#FAFAFA] hover:bg-zinc-200 border border-zinc-200 text-[#52525B] hover:text-[#141414] flex items-center justify-center transition-colors cursor-pointer"
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
                <Package size={14} className="text-[#D97706]" />
                <span className="font-mono text-[10px] font-bold text-[#52525B] uppercase tracking-wider">
                  Informasi Bahan Baku & Harga Beli
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-[#52525B] mb-1.5">Nama Barang Gudang</label>
                  <input
                    type="text"
                    placeholder="Contoh: Biji Kopi Arabika"
                    value={stockInData.name}
                    onChange={(e) => setStockInData({ ...stockInData, name: e.target.value })}
                    className="w-full bg-[#FAFAFA] border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-[#141414] placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all"
                    required
                    autoFocus
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-[#52525B] mb-1.5">Kategori Bahan</label>
                  <select
                    value={stockInData.category || 'Bahan Minuman'}
                    onChange={(e) => setStockInData({ ...stockInData, category: e.target.value })}
                    className="w-full bg-[#FAFAFA] border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-[#141414] focus:outline-none focus:bg-white focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all cursor-pointer"
                  >
                    <option value="Bahan Minuman">Bahan Minuman</option>
                    <option value="Bahan Makanan">Bahan Makanan</option>
                    <option value="Bahan Bakery">Bahan Bakery</option>
                    <option value="Bahan Pelengkap">Bahan Pelengkap</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#52525B] mb-1.5">Jumlah Masuk</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0"
                    value={stockInData.addedQty}
                    onChange={(e) => setStockInData({ ...stockInData, addedQty: e.target.value })}
                    className="w-full bg-[#FAFAFA] border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-[#141414] placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#52525B] mb-1.5">Satuan</label>
                  <input
                    type="text"
                    placeholder="kg / liter / pcs / gram"
                    value={stockInData.unit}
                    onChange={(e) => setStockInData({ ...stockInData, unit: e.target.value })}
                    className="w-full bg-[#FAFAFA] border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-[#141414] placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#52525B] mb-1.5">
                    Harga Beli (Rp / {stockInData.unit || 'satuan'})
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="Contoh: 185000"
                    value={stockInData.unitPrice ?? ''}
                    onChange={(e) => setStockInData({ ...stockInData, unitPrice: e.target.value })}
                    className="w-full bg-[#FAFAFA] border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-[#141414] placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#52525B] mb-1.5">Buffer Minimum (Alert)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="5"
                    value={stockInData.minLimit}
                    onChange={(e) => setStockInData({ ...stockInData, minLimit: e.target.value })}
                    className="w-full bg-[#FAFAFA] border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-[#141414] placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Bagian 2: Tanggal & Kedaluwarsa (FEFO) */}
            <div className="space-y-4 pt-2 border-t border-zinc-100">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-[#D97706]" />
                <span className="font-mono text-[10px] font-bold text-[#52525B] uppercase tracking-wider">
                  Tanggal & Kedaluwarsa (FEFO)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#52525B] mb-1.5">Tanggal Masuk</label>
                  <input
                    type="date"
                    value={stockInData.entryDate}
                    onChange={(e) => setStockInData({ ...stockInData, entryDate: e.target.value })}
                    className="w-full bg-[#FAFAFA] border border-zinc-200 rounded-xl px-4 py-3 text-xs font-bold text-[#141414] focus:outline-none focus:bg-white focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all cursor-pointer"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#52525B] mb-1.5">Tanggal Kedaluwarsa</label>
                  <input
                    type="date"
                    value={stockInData.newExpiryDate}
                    onChange={(e) => setStockInData({ ...stockInData, newExpiryDate: e.target.value })}
                    className="w-full bg-[#FAFAFA] border border-zinc-200 rounded-xl px-4 py-3 text-xs font-bold text-[#141414] focus:outline-none focus:bg-white focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all cursor-pointer"
                  />
                </div>
              </div>

              <p className="text-[11px] font-medium text-[#52525B] leading-relaxed">
                * Harga beli akan otomatis dipakai untuk menghitung HPP (COGS) & margin profit menu terkait.
              </p>
            </div>
          </div>

          {/* Footer Modal */}
          <div className="px-6 py-4 bg-[#FAFAFA] border-t border-zinc-200 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-100 text-xs font-bold text-[#52525B] transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#141414] text-xs font-extrabold shadow-sm inline-flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Check size={16} /> Simpan Barang Masuk
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
