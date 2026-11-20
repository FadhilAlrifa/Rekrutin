import { motion } from 'framer-motion';
import {
  Plus,
  Edit3,
  X,
  Tag,
  Image,
  Layers,
  Trash2,
  UtensilsCrossed,
  Check,
  Lock,
  Calculator,
  AlertTriangle
} from 'lucide-react';
import { calculateMenuCogs } from '../../../utils/cogsCalculator';

export default function MenuFormModal({
  isOpen,
  onClose,
  onSubmit,
  editingProduct,
  formData,
  setFormData,
  ingredients = [],
  subscriptionPlan = 'pro',
  onUpgradePlan
}) {
  if (!isOpen) return null;

  const isStarter = subscriptionPlan === 'starter';

  const handleAddRecipeRow = () => {
    setFormData({
      ...formData,
      recipe: [...formData.recipe, { name: '', qty: '', unit: 'gram' }]
    });
  };

  const handleRecipeChange = (index, field, value) => {
    const updatedRecipe = formData.recipe.map((row, idx) =>
      idx === index
        ? { ...row, [field]: field === 'qty' ? (value === '' ? '' : Number(value)) : value }
        : row
    );
    setFormData({ ...formData, recipe: updatedRecipe });
  };

  const handleRemoveRecipeRow = (index) => {
    const updatedRecipe = formData.recipe.filter((_, i) => i !== index);
    setFormData({ ...formData, recipe: updatedRecipe });
  };

  // Live Kalkulasi COGS (HPP) & Margin Profit saat admin mengetik harga atau takaran resep
  const liveCogs = calculateMenuCogs(
    {
      price: Number(formData.price) || 0,
      recipe: formData.recipe || []
    },
    ingredients
  );

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

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-2xl bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl border border-zinc-200 flex flex-col max-h-[90vh] z-10 overflow-hidden"
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 bg-white shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] text-[#B45309] flex items-center justify-center shadow-sm">
              {editingProduct ? <Edit3 size={20} /> : <UtensilsCrossed size={20} />}
            </div>
            <div>
              <h3 className="font-extrabold text-[#141414] text-lg tracking-tight">
                {editingProduct ? 'Edit Menu, Resep & HPP' : 'Tambah Menu Baru'}
              </h3>
              <p className="text-xs font-medium text-[#52525B] mt-0.5">
                {isStarter
                  ? 'Manajemen Menu Dasar (Paket Starter).'
                  : 'Atur komposisi BOM dan pantau kalkulasi HPP (COGS) & margin profit otomatis.'}
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
        <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto p-6 space-y-6 flex-1">
            {/* Bagian 1: Informasi Produk */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Tag size={14} className="text-[#D97706]" />
                <span className="font-mono text-[10px] font-bold text-[#52525B] uppercase tracking-wider">
                  Informasi Produk & Harga Jual
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-[#52525B] mb-1.5">Nama Menu</label>
                  <input
                    type="text"
                    placeholder="Contoh: Kopi Susu Aren"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#FAFAFA] border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-[#141414] placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#52525B] mb-1.5">Kategori Menu</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#FAFAFA] border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-[#141414] focus:outline-none focus:bg-white focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all cursor-pointer"
                  >
                    <option value="Minuman">Minuman</option>
                    <option value="Makanan">Makanan</option>
                    <option value="Bakery">Bakery</option>
                    <option value="Dessert">Dessert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#52525B] mb-1.5">Harga Jual (Rp)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-extrabold text-[#52525B]">
                      Rp
                    </span>
                    <input
                      type="number"
                      placeholder="20000"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full bg-[#FAFAFA] border border-zinc-200 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-[#141414] placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-[#52525B] mb-1.5">URL Foto Produk</label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <Image size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="https://images.unsplash.com/..."
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        className="w-full bg-[#FAFAFA] border border-zinc-200 rounded-xl pl-11 pr-4 py-3 text-xs font-semibold text-[#141414] placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all"
                      />
                    </div>
                    {formData.image && (
                      <img
                        src={formData.image}
                        alt="Preview"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                        className="w-11 h-11 rounded-xl object-cover border border-zinc-200 shrink-0 bg-zinc-100"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bagian 2: Komposisi Resep (BOM) */}
            <div className="space-y-3 pt-2 border-t border-zinc-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers size={14} className="text-[#D97706]" />
                  <span className="font-mono text-[10px] font-bold text-[#52525B] uppercase tracking-wider">
                    Komposisi Resep (BOM)
                  </span>
                </div>
                {!isStarter && (
                  <button
                    type="button"
                    onClick={handleAddRecipeRow}
                    className="bg-[#FEF3C7] hover:bg-[#F59E0B] text-[#B45309] hover:text-[#141414] border border-[#FDE68A] px-3 py-1.5 rounded-xl text-xs font-extrabold inline-flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95"
                  >
                    <Plus size={14} /> Tambah Bahan Baku
                  </button>
                )}
              </div>

              {isStarter ? (
                <div className="bg-[#FEF3C7]/60 border border-[#FDE68A] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#B45309] bg-white px-2.5 py-0.5 rounded-full border border-[#FDE68A]">
                      <Lock size={10} /> Fitur Paket Pro & Enterprise
                    </span>
                    <h4 className="text-xs font-extrabold text-[#141414] pt-1">
                      Kalkulator HPP (COGS) & Pemotongan Resep Otomatis
                    </h4>
                    <p className="text-[11px] font-medium text-[#52525B] leading-relaxed">
                      Upgrade ke <strong>Paket Pro</strong> untuk menghubungkan menu dengan pemotongan gramasi bahan baku gudang dan kalkulasi margin profit otomatis.
                    </p>
                  </div>
                  {onUpgradePlan && (
                    <button
                      type="button"
                      onClick={() => onUpgradePlan('pro')}
                      className="px-4 py-2.5 rounded-xl bg-[#141414] hover:bg-zinc-800 text-white text-[11px] font-bold shrink-0 inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Layers size={13} className="text-[#F59E0B]" /> Aktifkan Mode Pro
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="space-y-2.5">
                    {formData.recipe.map((rc, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row sm:items-center gap-2.5 bg-[#FAFAFA] border border-zinc-200 rounded-2xl p-3 transition-all hover:border-zinc-300"
                      >
                        <div className="flex-1">
                          <select
                            value={rc.name}
                            onChange={(e) => handleRecipeChange(index, 'name', e.target.value)}
                            className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#141414] focus:outline-none focus:border-[#F59E0B] cursor-pointer"
                            required={!isStarter}
                          >
                            <option value="" disabled>
                              Pilih Bahan Gudang...
                            </option>
                            {ingredients.map((ing) => {
                              const ingName = (ing.name || '').split(' | ')[0];
                              return (
                                <option key={ing.id} value={ing.name}>
                                  {ingName} ({ing.stock} {ing.unit} • Rp {Number(ing.unitPrice || 0).toLocaleString('id-ID')}/{ing.unit})
                                </option>
                              );
                            })}
                          </select>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <input
                            type="number"
                            step="any"
                            placeholder="Takaran"
                            value={rc.qty}
                            onChange={(e) => handleRecipeChange(index, 'qty', e.target.value)}
                            className="w-24 bg-white border border-zinc-200 rounded-xl px-3 py-2.5 text-xs font-bold text-[#141414] text-right placeholder-zinc-400 focus:outline-none focus:border-[#F59E0B] font-mono"
                            required={!isStarter}
                          />
                          <select
                            value={rc.unit}
                            onChange={(e) => handleRecipeChange(index, 'unit', e.target.value)}
                            className="w-24 bg-white border border-zinc-200 rounded-xl px-3 py-2.5 text-xs font-bold text-[#141414] focus:outline-none focus:border-[#F59E0B] cursor-pointer"
                            required={!isStarter}
                          >
                            <option value="gram">gram</option>
                            <option value="kg">kg</option>
                            <option value="ml">ml</option>
                            <option value="liter">liter</option>
                            <option value="pcs">pcs</option>
                          </select>

                          {formData.recipe.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveRecipeRow(index)}
                              className="w-9 h-9 rounded-xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                              title="Hapus Bahan"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* LIVE COGS & MARGIN CALCULATOR */}
                  <div className="bg-[#FAFAFA] border border-zinc-200 rounded-2xl p-4 space-y-3 mt-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#52525B] flex items-center gap-1.5">
                        <Calculator size={13} className="text-[#D97706]" />
                        Kalkulator HPP (COGS) & Margin Profit Otomatis
                      </span>
                      <span
                        className={`font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${liveCogs.status.badgeClass}`}
                      >
                        Status: {liveCogs.status.label} ({liveCogs.grossMarginPct}%)
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="bg-white border border-zinc-200 rounded-xl p-3">
                        <span className="font-mono text-[9px] font-bold uppercase text-[#52525B] block">
                          HPP / Porsi
                        </span>
                        <span className="font-mono text-sm font-extrabold text-[#141414]">
                          Rp {liveCogs.cogs.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="bg-white border border-zinc-200 rounded-xl p-3">
                        <span className="font-mono text-[9px] font-bold uppercase text-[#52525B] block">
                          Laba Kotor
                        </span>
                        <span className={`font-mono text-sm font-extrabold ${liveCogs.status.textClass}`}>
                          Rp {liveCogs.grossProfit.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="bg-white border border-zinc-200 rounded-xl p-3">
                        <span className="font-mono text-[9px] font-bold uppercase text-[#52525B] block">
                          Gross Margin
                        </span>
                        <span className={`font-mono text-sm font-extrabold ${liveCogs.status.textClass}`}>
                          {liveCogs.grossMarginPct}%
                        </span>
                      </div>
                    </div>

                    {liveCogs.breakdown.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        {liveCogs.breakdown.map((b, idx) => (
                          <div key={idx} className="flex items-center justify-between text-[11px] font-mono text-[#52525B]">
                            <span>
                              • {b.name} ({b.qty} {b.unit})
                            </span>
                            <span className="font-bold text-[#141414]">
                              {b.unitPrice > 0 ? `Rp ${b.cost.toLocaleString('id-ID')}` : 'Harga bahan Rp 0'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {liveCogs.missingPriceIngredients.length > 0 && (
                      <p className="text-[11px] font-semibold text-[#B45309] flex items-center gap-1.5 pt-1">
                        <AlertTriangle size={13} className="shrink-0" />
                        Isi harga beli untuk: {liveCogs.missingPriceIngredients.join(', ')} di modul Stok Gudang agar HPP akurat.
                      </p>
                    )}
                  </div>
                </>
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
              <Check size={16} /> {editingProduct ? 'Simpan Perubahan' : 'Simpan Menu Baru'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
