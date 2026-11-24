import { motion } from 'framer-motion';
import {
  X,
  Edit3,
  Calendar,
  Package,
  Check,
  TrendingUp,
  TrendingDown,
  Layers,
  Trash2
} from 'lucide-react';
import { computeIngredientPriceComparison } from '../../../utils/cogsCalculator';
import { summarizeIngredientBatches } from '../../../utils/fefoBatchEngine';

export default function EditItemModal({
  isOpen,
  onClose,
  onSubmit,
  editingItem,
  setEditingItem,
  onDisposeExpiredBatch
}) {
  if (!isOpen || !editingItem) return null;

  const priceComparison = computeIngredientPriceComparison({
    initialPurchasePrice: editingItem.initialPurchasePrice ?? 0,
    currentMarketPrice: editingItem.currentMarketPrice ?? editingItem.unitPrice ?? 0
  });
  const batchSummary = summarizeIngredientBatches(editingItem);
  const firstUsableBatchId = batchSummary.usableBatches[0]?.id;

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
                    Harga Beli Awal (Rp / {editingItem.unit || 'satuan'})
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={editingItem.initialPurchasePrice ?? 0}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, initialPurchasePrice: e.target.value })
                    }
                    className="w-full bg-[#FAFAFA] border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-[#141414] placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#52525B] mb-1.5">
                    Harga Pasar Terbaru / HPP (Rp / {editingItem.unit || 'satuan'})
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={editingItem.currentMarketPrice ?? editingItem.unitPrice ?? 0}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        currentMarketPrice: e.target.value,
                        unitPrice: e.target.value
                      })
                    }
                    className="w-full bg-[#FAFAFA] border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-[#141414] placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all font-mono"
                  />
                </div>

                <div className="sm:col-span-2 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#52525B]">
                    Selisih Harga Pasar vs Awal
                  </span>
                  {priceComparison.trend === 'up' ? (
                    <span className="inline-flex items-center gap-1 font-mono text-xs font-extrabold text-red-600">
                      <TrendingUp size={13} /> {priceComparison.formattedDiff}
                    </span>
                  ) : priceComparison.trend === 'down' ? (
                    <span className="inline-flex items-center gap-1 font-mono text-xs font-extrabold text-emerald-700">
                      <TrendingDown size={13} /> {priceComparison.formattedDiff}
                    </span>
                  ) : (
                    <span className="font-mono text-xs font-bold text-[#52525B]">
                      Sama dengan awal
                    </span>
                  )}
                </div>

                <div className="sm:col-span-2">
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

            {/* Bagian 3: Rincian Multi-Batch & Urutan FEFO */}
            <div className="space-y-3 pt-2 border-t border-zinc-100">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Layers size={14} className="text-[#D97706]" />
                  <span className="font-mono text-[10px] font-bold text-[#52525B] uppercase tracking-wider">
                    Rincian Batch Aktif — Urutan FEFO ({batchSummary.batchCount})
                  </span>
                </div>
                <span className="font-mono text-[10px] font-bold text-[#141414]">
                  Layak: {batchSummary.usableStock} {editingItem.unit}
                  {batchSummary.expiredStock > 0 ? ` • Exp: ${batchSummary.expiredStock}` : ''}
                </span>
              </div>

              {batchSummary.activeBatches.length === 0 ? (
                <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl p-3.5 text-[11px] text-[#52525B] font-medium">
                  Belum ada batch aktif (stok 0). Catat melalui menu Barang Masuk untuk membuat batch baru.
                </div>
              ) : (
                <div className="space-y-2">
                  {batchSummary.activeBatches.map((batch) => {
                    const isBatchExpired = batchSummary.expiredBatches.some((eb) => eb.id === batch.id);
                    const isFirstFefo = !isBatchExpired && batch.id === firstUsableBatchId;
                    return (
                      <div
                        key={batch.id}
                        className={`rounded-xl border p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                          isBatchExpired
                            ? 'bg-red-50/60 border-red-200'
                            : isFirstFefo
                            ? 'bg-[#FEF3C7]/60 border-[#F59E0B]'
                            : 'bg-[#FAFAFA] border-[#E5E5E5]'
                        }`}
                      >
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-mono text-xs font-extrabold text-[#141414]">
                              {batch.batchCode}
                            </span>
                            {isBatchExpired ? (
                              <span className="font-mono text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-red-600 text-white">
                                Expired • Jangan Dipakai
                              </span>
                            ) : isFirstFefo ? (
                              <span className="font-mono text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#F59E0B] text-[#141414]">
                                Prioritas FEFO #1
                              </span>
                            ) : (
                              <span className="font-mono text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-white border border-[#E5E5E5] text-[#52525B]">
                                Antrean FEFO
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#52525B] font-medium">
                            Exp: <strong className={isBatchExpired ? 'text-red-700' : 'text-[#141414]'}>{batch.expiryDate || 'Tidak ada'}</strong>
                            {batch.entryDate ? ` • Masuk: ${batch.entryDate}` : ''}
                            {batch.stockerName ? ` • Input: ${batch.stockerName}` : ''}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono text-xs font-extrabold text-[#141414] bg-white border border-[#E5E5E5] px-2.5 py-1 rounded-lg">
                            {batch.qty} {editingItem.unit}
                          </span>
                          {isBatchExpired && onDisposeExpiredBatch && (
                            <button
                              type="button"
                              onClick={() => onDisposeExpiredBatch(editingItem, batch)}
                              className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[10px] font-extrabold inline-flex items-center gap-1 cursor-pointer transition-colors"
                              title="Tarik stok batch kedaluwarsa & catat sebagai Waste"
                            >
                              <Trash2 size={11} /> Buang ke Waste
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
