import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Edit3,
  X,
  Tag,
  Image,
  Upload,
  Layers,
  Trash2,
  UtensilsCrossed,
  Check,
  Lock,
  Calculator,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { calculateMenuCogs } from '../../../utils/cogsCalculator';

function compressImageToDataUrl(file, maxDimension = 640, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = () => reject(new Error('Format gambar tidak valid atau rusak.'));
      img.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(String(reader.result));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

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
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const isStarter = subscriptionPlan === 'starter';

  const handleImageFileSelect = async (file) => {
    if (!file) return;
    setUploadError('');

    if (!file.type.startsWith('image/')) {
      setUploadError('File harus berupa gambar (JPG, PNG, atau WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Ukuran file maksimal 10 MB.');
      return;
    }

    setIsUploadingImage(true);
    try {
      const compressedDataUrl = await compressImageToDataUrl(file);
      setFormData((prev) => ({ ...prev, image: compressedDataUrl }));
    } catch (err) {
      setUploadError(err.message || 'Gagal memproses foto produk.');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

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
                  <label className="block text-[11px] font-bold text-[#52525B] mb-1.5">
                    Foto Produk (Upload Gambar)
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/*"
                    onChange={(e) => handleImageFileSelect(e.target.files?.[0])}
                    className="hidden"
                  />

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-[#FAFAFA] border border-dashed border-zinc-300 rounded-2xl p-3.5">
                    <div className="w-16 h-16 rounded-xl bg-white border border-zinc-200 overflow-hidden shrink-0 flex items-center justify-center">
                      {formData.image ? (
                        <img
                          src={formData.image}
                          alt="Preview Menu"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Image size={22} className="text-zinc-300" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-xs font-bold text-[#141414]">
                        {formData.image ? 'Foto menu siap digunakan' : 'Belum ada foto menu dipilih'}
                      </p>
                      <p className="text-[11px] text-[#52525B] font-medium">
                        Unggah gambar JPG, PNG, atau WebP (otomatis dikompres agar cepat di POS &amp; Kiosk).
                      </p>
                      {uploadError && (
                        <p className="text-[11px] font-bold text-red-600">{uploadError}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        disabled={isUploadingImage}
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-2 rounded-xl bg-[#141414] hover:bg-zinc-800 text-[#F59E0B] text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
                      >
                        {isUploadingImage ? (
                          <>
                            <Loader2 size={14} className="animate-spin" /> Memproses...
                          </>
                        ) : (
                          <>
                            <Upload size={14} /> {formData.image ? 'Ganti Foto' : 'Upload Foto'}
                          </>
                        )}
                      </button>

                      {formData.image && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, image: '' })}
                          className="px-2.5 py-2 rounded-xl bg-white hover:bg-red-50 border border-zinc-200 hover:border-red-200 text-[#52525B] hover:text-red-600 text-xs font-bold cursor-pointer transition-colors"
                          title="Hapus foto"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
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
