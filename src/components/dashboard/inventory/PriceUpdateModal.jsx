import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, TrendingUp, TrendingDown, Check, AlertTriangle, Calculator } from 'lucide-react';
import {
  cleanIngredientName,
  analyzeIngredientPriceImpact
} from '../../../utils/cogsCalculator';

export default function PriceUpdateModal({
  isOpen,
  onClose,
  ingredient,
  allIngredients = [],
  products = [],
  onSavePrice
}) {
  const [newPrice, setNewPrice] = useState(() =>
    ingredient ? String(ingredient.unitPrice || '') : ''
  );
  const [notes, setNotes] = useState('Penyesuaian harga pasar');
  const [isSaving, setIsSaving] = useState(false);

  const oldPrice = Number(ingredient?.unitPrice ?? 0);
  const parsedNew = Math.max(0, Number(newPrice) || 0);

  const changePct =
    oldPrice > 0
      ? Number((((parsedNew - oldPrice) / oldPrice) * 100).toFixed(1))
      : parsedNew > 0
      ? 100
      : 0;

  const impactList = useMemo(() => {
    if (!ingredient) return [];
    return analyzeIngredientPriceImpact(ingredient, parsedNew, products, allIngredients);
  }, [ingredient, parsedNew, products, allIngredients]);

  if (!isOpen || !ingredient) return null;

  const cleanName = cleanIngredientName(ingredient.name);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await onSavePrice({
      ingredient,
      newPrice: parsedNew,
      notes
    });
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-zinc-950/50 backdrop-blur-sm cursor-pointer"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-xl bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl border border-zinc-200 z-10 flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 bg-white shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] text-[#B45309] flex items-center justify-center">
              <Calculator size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-[#141414] text-lg tracking-tight">
                Update Harga Pasar Bahan Baku
              </h3>
              <p className="text-xs font-medium text-[#52525B] mt-0.5">
                {cleanName} • Satuan: <strong className="text-[#141414]">{ingredient.unit}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#FAFAFA] hover:bg-zinc-200 border border-zinc-200 text-[#52525B] flex items-center justify-center cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto p-6 space-y-5 flex-1">
            {/* Perbandingan Harga Lama vs Baru */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#FAFAFA] border border-zinc-200 rounded-2xl p-4">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#52525B] block">
                  Harga Lama / {ingredient.unit}
                </span>
                <p className="font-mono text-lg font-extrabold text-[#141414] mt-1">
                  Rp {oldPrice.toLocaleString('id-ID')}
                </p>
              </div>

              <div className="bg-[#FAFAFA] border border-zinc-200 rounded-2xl p-4 flex flex-col justify-between">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#52525B] block">
                  Perubahan Pasar
                </span>
                <div className="flex items-center gap-2 mt-1">
                  {changePct > 0 ? (
                    <span className="inline-flex items-center gap-1 font-mono text-sm font-extrabold text-red-600">
                      <TrendingUp size={15} /> +{changePct}%
                    </span>
                  ) : changePct < 0 ? (
                    <span className="inline-flex items-center gap-1 font-mono text-sm font-extrabold text-emerald-700">
                      <TrendingDown size={15} /> {changePct}%
                    </span>
                  ) : (
                    <span className="font-mono text-sm font-bold text-[#52525B]">0% (Tetap)</span>
                  )}
                </div>
              </div>
            </div>

            {/* Input Harga Baru & Catatan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[#52525B] mb-1.5">
                  Harga Beli Terbaru (Rp / {ingredient.unit})
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  autoFocus
                  placeholder="Contoh: 185000"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold font-mono text-[#141414] focus:outline-none focus:bg-white focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#52525B] mb-1.5">
                  Catatan Pembaruan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kenaikan harga supplier"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-zinc-200 rounded-xl px-4 py-3 text-xs font-bold text-[#141414] focus:outline-none focus:bg-white focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20"
                />
              </div>
            </div>

            {/* Real-Time Dampak terhadap HPP & Margin Produk */}
            <div className="bg-[#FAFAFA] border border-zinc-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#52525B]">
                  Simulasi Dampak Real-Time ke HPP & Margin Menu ({impactList.length})
                </span>
              </div>

              {impactList.length === 0 ? (
                <p className="text-xs text-[#52525B] font-medium">
                  Bahan baku ini belum terhubung ke resep menu mana pun.
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {impactList.map((m) => (
                    <div
                      key={m.id}
                      className="bg-white border border-zinc-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <p className="text-xs font-bold text-[#141414]">{m.name}</p>
                        <p className="font-mono text-[11px] text-[#52525B]">
                          HPP: Rp {m.oldCogs.toLocaleString('id-ID')} →{' '}
                          <strong className={m.deltaCogs > 0 ? 'text-red-600' : 'text-emerald-700'}>
                            Rp {m.newCogs.toLocaleString('id-ID')}
                          </strong>
                          {m.deltaCogs !== 0 && (
                            <span className="ml-1.5">
                              ({m.deltaCogs > 0 ? `+Rp ${m.deltaCogs.toLocaleString('id-ID')}` : `-Rp ${Math.abs(m.deltaCogs).toLocaleString('id-ID')}`})
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-[11px] text-[#52525B]">
                          Margin {m.oldMarginPct}% →
                        </span>
                        <span className={`font-mono text-[10px] font-bold px-2.5 py-1 rounded-lg border ${m.newStatus.badgeClass}`}>
                          {m.newMarginPct}% ({m.newStatus.label})
                        </span>
                        {m.newMarginPct < 30 && (
                          <AlertTriangle size={14} className="text-red-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-[#FAFAFA] border-t border-zinc-200 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-100 text-xs font-bold text-[#52525B] cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#141414] text-xs font-extrabold inline-flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Check size={15} /> {isSaving ? 'Menyimpan...' : 'Simpan Harga & Catat Riwayat'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
