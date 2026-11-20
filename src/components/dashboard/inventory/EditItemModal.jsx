import { motion } from 'framer-motion';
import { X, Edit3, Calendar, Package, Check } from 'lucide-react';

export default function EditItemModal({ isOpen, onClose, onSubmit, editingItem, setEditingItem }) {
  if (!isOpen || !editingItem) return null;

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

      {/* Container Modal Utama */}
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
              <Edit3 size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-[#141414] text-lg tracking-tight">Edit Barang Gudang</h3>
              <p className="text-xs font-medium text-[#52525B] mt-0.5">
                Perbarui persediaan, buffer minimum, harga beli, dan tanggal FEFO.
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
        <form id="editItemForm" onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto p-6 space-y-6 flex-1">
            {/* Bagian 1: Informasi Bahan Baku */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Package size={14} className="text-[#D97706]" />
                <span className="font-mono text-[10px] font-bold text-[#52525B] uppercase tracking-wider">
                  Informasi Bahan Baku & Harga
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-[#52525B] mb-1.5">Nama Barang Gudang</label>
                  <input
                    type="text"
                    value={editingItem.nameOnly}
                    onChange={(e) => setEditingItem({ ...editingItem, nameOnly: e.target.value })}
                    className="w-full bg-[#FAFAFA] border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-[#141414] placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-[#52525B] mb-1.5">Kategori Bahan</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
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
                  <label className="block text-[11px] font-bold text-[#52525B] mb-1.5">Total Stok Saat Ini</label>
                  <input
                    type="number"
                    step="any"
                    value={editingItem.stock}
                    onChange={(e) => setEditingItem({ ...editingItem, stock: e.target.value })}
                    className="w-full bg-[#FAFAFA] border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-[#141414] placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#52525B] mb-1.5">Satuan</label>
                  <input
                    type="text"
                    placeholder="kg / liter / pcs / gram"
                    value={editingItem.unit}
                    onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                    className="w-full bg-[#FAFAFA] border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-[#141414] placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#52525B] mb-1.5">
                    Harga Beli (Rp / {editingItem.unit || 'satuan'})
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={editingItem.unitPrice ?? 0}
                    onChange={(e) => setEditingItem({ ...editingItem, unitPrice: e.target.value })}
                    className="w-full bg-[#FAFAFA] border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-[#141414] placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#52525B] mb-1.5">Buffer Minimum (Alert)</label>
                  <input
                    type="number"
                    step="any"
                    value={editingItem.minLimit}
                    onChange={(e) => setEditingItem({ ...editingItem, minLimit: e.target.value })}
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
                    value={editingItem.entryDate || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, entryDate: e.target.value })}
                    className="w-full bg-[#FAFAFA] border border-zinc-200 rounded-xl px-4 py-3 text-xs font-bold text-[#141414] focus:outline-none focus:bg-white focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#52525B] mb-1.5">Tanggal Kedaluwarsa</label>
                  <input
                    type="date"
                    value={editingItem.expiryDate || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, expiryDate: e.target.value })}
                    className="w-full bg-[#FAFAFA] border border-zinc-200 rounded-xl px-4 py-3 text-xs font-bold text-[#141414] focus:outline-none focus:bg-white focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all cursor-pointer"
                  />
                </div>
              </div>

              {editingItem.originalStock !== undefined &&
                Number(editingItem.stock) !== Number(editingItem.originalStock) && (
                  <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-2xl p-4 space-y-2">
                    <label className="block text-[11px] font-extrabold text-[#B45309]">
                      Alasan Penyesuaian Stok Manual (Audit Opname) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Selisih stock opname fisik / bahan tumpah / rusak"
                      value={editingItem.adjustmentReason || ''}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, adjustmentReason: e.target.value })
                      }
                      className="w-full bg-white border border-[#FDE68A] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#141414] focus:outline-none focus:border-[#F59E0B]"
                    />
                    <p className="text-[10px] font-mono text-[#78350F]">
                      Perubahan: {editingItem.originalStock} → {editingItem.stock} {editingItem.unit}
                    </p>
                  </div>
                )}

              <p className="text-[11px] font-medium text-[#52525B] leading-relaxed">
                * Buffer minimum memicu peringatan restock otomatis saat stok gudang menipis.
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
              <Check size={16} /> Simpan Perubahan
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
