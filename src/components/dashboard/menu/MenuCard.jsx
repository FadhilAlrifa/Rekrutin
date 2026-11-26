import { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit3, Trash2, Layers, Tag, Lock, Calculator, Plus } from 'lucide-react';
import { calculateMenuCogs, evaluateMenuStockStatus } from '../../../utils/cogsCalculator';
import { getProductFallbackImage } from '../../../data/simulationCatalog';

export default function MenuCard({
  prod,
  idx,
  onEdit,
  onDelete,
  onQuickRestock,
  canEditMenu = true,
  canQuickRestock = canEditMenu,
  ingredients = [],
  subscriptionPlan = 'pro',
  businessType = 'fnb'
}) {
  const [customAddOpen, setCustomAddOpen] = useState(false);
  const [customAddQty, setCustomAddQty] = useState('10');

  const isStarter = subscriptionPlan === 'starter';
  const cogsData = calculateMenuCogs(prod, ingredients, businessType);
  const isRetailItem = cogsData.isRetailSku || businessType === 'retail';
  const displayCategory =
    isStarter && !isRetailItem && (prod.category === 'Bakery' || prod.category === 'Dessert')
      ? 'Makanan'
      : prod.category;
  const stockEval =
    isRetailItem || isStarter
      ? evaluateMenuStockStatus(prod, ingredients, businessType, isStarter)
      : null;
  const starterUnitLabel = isRetailItem ? prod.unit || 'pcs' : 'porsi';

  const handleCustomAddSubmit = (e) => {
    e.preventDefault();
    const qty = Math.max(1, Math.floor(Number(customAddQty) || 0));
    if (qty > 0) {
      onQuickRestock?.(prod, qty);
      setCustomAddOpen(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: idx * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white border border-zinc-200 hover:border-zinc-300 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
    >
      <div>
        {/* Gambar & Kategori */}
        <div className="relative w-full h-40 rounded-xl overflow-hidden bg-zinc-100 mb-4">
          <img
            src={prod.image || getProductFallbackImage(prod.name, prod.category)}
            alt={prod.name}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = getProductFallbackImage(prod.name, prod.category);
            }}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
          />
          <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2">
            <span className="bg-white/95 text-[#141414] border border-zinc-200 px-3 py-1 rounded-full font-mono text-[10px] font-bold tracking-wide shadow-sm flex items-center gap-1.5 min-w-0">
              <Tag size={11} className="text-[#D97706] shrink-0" />
              <span className="truncate">{displayCategory}</span>
            </span>
            {!isStarter && (cogsData.hasRecipe || isRetailItem) && (
              <span
                className={`px-2.5 py-1 rounded-full font-mono text-[10px] font-bold border shadow-sm inline-flex items-center gap-1 shrink-0 ${cogsData.status.badgeClass}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${cogsData.status.dotClass}`} />
                Margin {cogsData.grossMarginPct}%
              </span>
            )}
          </div>
        </div>

        {/* Informasi Utama */}
        <div className="space-y-1 px-1">
          <h4 className="font-bold text-[#141414] text-[15px] leading-tight line-clamp-1">{prod.name}</h4>
          <div className="flex items-center justify-between gap-2">
            <p className="font-extrabold text-[#D97706] font-mono text-[13px]">
              Rp {Number(prod.price).toLocaleString('id-ID')}
            </p>
            {!isStarter && (cogsData.hasRecipe || isRetailItem) && (
              <span className="font-mono text-[10px] font-bold text-[#52525B]">
                {cogsData.status.label}
              </span>
            )}
          </div>
        </div>

        {/* Ringkasan HPP (COGS) & Laba Kotor */}
        {!isStarter && (
          <div className="mt-3 grid grid-cols-2 gap-2 px-1">
            <div className="bg-[#FAFAFA] border border-zinc-200 rounded-xl px-3 py-2">
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#52525B] flex items-center gap-1">
                <Calculator size={10} className="text-[#D97706]" /> {isRetailItem ? 'Harga Beli / Unit' : 'Modal / Porsi'}
              </span>
              <p className="font-mono text-xs font-extrabold text-[#141414] mt-0.5">
                Rp {cogsData.cogs.toLocaleString('id-ID')}
              </p>
            </div>
            <div className="bg-[#FAFAFA] border border-zinc-200 rounded-xl px-3 py-2">
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#52525B] block">
                Laba Kotor
              </span>
              <p className={`font-mono text-xs font-extrabold mt-0.5 ${cogsData.status.textClass}`}>
                Rp {cogsData.grossProfit.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        )}

        {/* Stok Kuota Starter ATAU Komposisi Resep (BOM) / Stok Ritel */}
        <div className="mt-3.5 pt-3 border-t border-zinc-100 px-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#52525B] flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5">
              <Layers size={12} className="text-[#D97706]" />{' '}
              {isStarter
                ? isRetailItem
                  ? 'Stok Barang'
                  : 'Kuota Porsi Tersedia'
                : isRetailItem
                ? 'Stok & Identitas Barang'
                : 'Takaran Resep'}
            </span>
            {isStarter && !isRetailItem && (
              <span className="text-[9px] font-bold bg-zinc-100 text-zinc-500 border border-zinc-200 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                <Lock size={9} /> Resep Otomatis (Pro)
              </span>
            )}
          </p>

          {isStarter ? (
            <div className="space-y-2.5 bg-[#FAFAFA] border border-zinc-200 rounded-xl p-3">
              <div className="flex items-center justify-between gap-2 text-[11px]">
                <span className="font-bold text-[#141414]">
                  Sisa: <span className="font-mono text-sm">{Number(prod.stock ?? 0)}</span> {starterUnitLabel}
                </span>
                <span
                  className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                    stockEval?.status === 'out'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : stockEval?.status === 'low'
                      ? 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {stockEval?.status === 'out'
                    ? 'Habis'
                    : stockEval?.status === 'low'
                    ? 'Hampir Habis'
                    : 'Aman'}
                </span>
              </div>
              <p className="text-[10px] text-[#52525B] font-medium">
                Peringatan muncul jika sisa ≤ <strong>{prod.minLimit ?? 3} {starterUnitLabel}</strong>
              </p>

              {canQuickRestock && onQuickRestock && (
                <div className="pt-1.5 border-t border-zinc-200/70 space-y-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold text-[#52525B] mr-auto">
                      Tambah {starterUnitLabel}:
                    </span>
                    {[5, 10].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => onQuickRestock(prod, amt)}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#F59E0B] border border-zinc-200 hover:border-[#F59E0B] text-[10px] font-extrabold text-[#141414] cursor-pointer transition-colors"
                      >
                        +{amt}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setCustomAddOpen((v) => !v)}
                      className="px-2.5 py-1 rounded-lg bg-[#141414] hover:bg-zinc-800 text-[10px] font-bold text-[#F59E0B] cursor-pointer inline-flex items-center gap-0.5 transition-colors"
                    >
                      <Plus size={10} /> Jumlah Lain
                    </button>
                  </div>

                  {customAddOpen && (
                    <form onSubmit={handleCustomAddSubmit} className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={customAddQty}
                        onChange={(e) => setCustomAddQty(e.target.value)}
                        className="w-20 bg-white border border-zinc-300 rounded-lg px-2 py-1 text-xs font-mono font-bold text-[#141414] focus:outline-none focus:border-[#F59E0B]"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1 rounded-lg bg-[#F59E0B] hover:bg-[#D97706] text-[#141414] text-[10px] font-extrabold cursor-pointer"
                      >
                        Tambah
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          ) : isRetailItem ? (
            <div className="space-y-1.5 bg-[#FAFAFA] border border-zinc-200 rounded-xl p-3">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-mono font-bold text-[#141414]">
                  {prod.sku ? `SKU: ${prod.sku}` : 'Unit Ritel'}
                  {prod.variantLabel ? ` • ${prod.variantLabel}` : ''}
                </span>
                <span
                  className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                    stockEval?.status === 'out'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : stockEval?.status === 'low'
                      ? 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {stockEval?.label || `${prod.stock || 0} ${prod.unit || 'pcs'}`}
                </span>
              </div>
              <p className="font-mono text-[10px] text-[#52525B]">
                Stok: <strong className="text-[#141414]">{prod.stock ?? 0} {prod.unit || 'pcs'}</strong> • Batas Min: {prod.minLimit ?? 5} {prod.unit || 'pcs'}
              </p>
            </div>
          ) : prod.recipe && prod.recipe.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto hide-scrollbar">
              {prod.recipe.map((rc, i) => {
                const cleanIngName = (rc.name || '').split(' | ')[0];
                if (!cleanIngName) return null;
                return (
                  <span
                    key={i}
                    className="bg-[#FAFAFA] text-[#52525B] px-2.5 py-1 rounded-lg text-[11px] font-medium border border-zinc-200"
                  >
                    {cleanIngName}{' '}
                    <strong className="text-[#141414] font-mono font-bold ml-0.5">
                      ({rc.qty}{rc.unit})
                    </strong>
                  </span>
                );
              })}
            </div>
          ) : (
            <span className="text-zinc-400 italic text-[12px]">Tanpa resep bahan baku</span>
          )}
        </div>
      </div>

      {/* Aksi / Tombol */}
      {canEditMenu && (
        <div className="flex items-center gap-2 mt-5 pt-3 border-t border-zinc-100 px-1">
          <button
            onClick={() => onEdit(prod)}
            className="flex-1 py-2 bg-[#FAFAFA] hover:bg-[#141414] hover:text-white border border-zinc-200 text-[#141414] rounded-xl text-xs font-bold transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Edit3 size={13} /> {isStarter ? 'Edit Menu & Porsi' : isRetailItem ? 'Edit Produk & Untung' : 'Edit Menu & Modal'}
          </button>
          <button
            onClick={() => onDelete(prod.id)}
            className="py-2 px-3 bg-red-50 hover:bg-red-600 hover:text-white border border-red-200 text-red-600 rounded-xl text-xs font-bold transition-colors cursor-pointer inline-flex items-center justify-center active:scale-95"
            title="Hapus Menu"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )}
    </motion.div>
  );
}
