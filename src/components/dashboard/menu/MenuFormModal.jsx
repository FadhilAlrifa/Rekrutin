import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit3, X, Tag, DollarSign, Image, Layers, Trash2, UtensilsCrossed, Check } from 'lucide-react';

export default function MenuFormModal({ isOpen, onClose, onSubmit, editingProduct, formData, setFormData, ingredients = [] }) {
  if (!isOpen) return null;

  const handleAddRecipeRow = () => {
    setFormData({
      ...formData,
      recipe: [...formData.recipe, { name: '', qty: '', unit: 'gram' }]
    });
  };

  const handleRecipeChange = (index, field, value) => {
    const updatedRecipe = [...formData.recipe];
    updatedRecipe[index][field] = field === 'qty' ? (value === '' ? '' : Number(value)) : value;
    setFormData({ ...formData, recipe: updatedRecipe });
  };

  const handleRemoveRecipeRow = (index) => {
    const updatedRecipe = formData.recipe.filter((_, i) => i !== index);
    setFormData({ ...formData, recipe: updatedRecipe });
  };

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
        className="relative w-full max-w-2xl bg-white sm:rounded-[2rem] rounded-t-[2rem] shadow-2xl border border-zinc-200/80 flex flex-col max-h-[90vh] z-10 overflow-hidden"
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 bg-white shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-100 text-[#E87F24] flex items-center justify-center shadow-2xs">
              {editingProduct ? <Edit3 size={20} /> : <UtensilsCrossed size={20} />}
            </div>
            <div>
              <h3 className="font-black text-zinc-900 text-lg tracking-tight">
                {editingProduct ? 'Edit Menu Produk' : 'Tambah Menu Baru'}
              </h3>
              <p className="text-xs font-medium text-zinc-500 mt-0.5">
                Atur detail produk dan komposisi bahan baku (BOM) secara presisi.
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900 flex items-center justify-center transition-colors cursor-pointer"
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
                <Tag size={14} className="text-[#E87F24]" />
                <span className="text-[11px] font-black text-zinc-400 uppercase tracking-wider">Informasi Produk</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nama Menu */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-zinc-600 mb-1.5">Nama Menu</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Kopi Susu Aren" 
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-[#E87F24] focus:ring-3 focus:ring-[#E87F24]/15 transition-all" 
                    required 
                  />
                </div>

                {/* Kategori */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 mb-1.5">Kategori Menu</label>
                  <select 
                    value={formData.category} 
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })} 
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 focus:outline-none focus:bg-white focus:border-[#E87F24] focus:ring-3 focus:ring-[#E87F24]/15 transition-all cursor-pointer"
                  >
                    <option value="Minuman">Minuman</option>
                    <option value="Makanan">Makanan</option>
                    <option value="Bakery">Bakery</option>
                    <option value="Dessert">Dessert</option>
                  </select>
                </div>

                {/* Harga */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 mb-1.5">Harga Jual (Rp)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-zinc-400">Rp</span>
                    <input 
                      type="number" 
                      placeholder="20000" 
                      value={formData.price} 
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })} 
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-zinc-900 placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-[#E87F24] focus:ring-3 focus:ring-[#E87F24]/15 transition-all font-mono" 
                      required 
                    />
                  </div>
                </div>

                {/* URL Foto */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-zinc-600 mb-1.5">URL Foto Produk</label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <Image size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input 
                        type="text" 
                        placeholder="https://images.unsplash.com/..." 
                        value={formData.image} 
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })} 
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-11 pr-4 py-3 text-xs font-semibold text-zinc-700 placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-[#E87F24] focus:ring-3 focus:ring-[#E87F24]/15 transition-all" 
                      />
                    </div>
                    {formData.image && (
                      <img 
                        src={formData.image} 
                        alt="Preview" 
                        onError={(e) => { e.target.style.display = 'none'; }}
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
                  <Layers size={14} className="text-[#E87F24]" />
                  <span className="text-[11px] font-black text-zinc-400 uppercase tracking-wider">Komposisi Resep (BOM)</span>
                </div>
                <button 
                  type="button" 
                  onClick={handleAddRecipeRow} 
                  className="bg-orange-50 hover:bg-orange-100 text-[#E87F24] border border-orange-200/80 px-3 py-1.5 rounded-xl text-xs font-black inline-flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95"
                >
                  <Plus size={14} /> Tambah Bahan Baku
                </button>
              </div>

              <div className="space-y-2.5">
                {formData.recipe.map((rc, index) => (
                  <div 
                    key={index} 
                    className="flex flex-col sm:flex-row sm:items-center gap-2.5 bg-zinc-50/80 border border-zinc-200/80 rounded-2xl p-3 transition-all hover:border-zinc-300"
                  >
                    {/* Pilih Bahan Gudang */}
                    <div className="flex-1">
                      <select
                        value={rc.name}
                        onChange={(e) => handleRecipeChange(index, 'name', e.target.value)}
                        className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-zinc-900 focus:outline-none focus:border-[#E87F24] cursor-pointer"
                        required
                      >
                        <option value="" disabled>Pilih Bahan Gudang...</option>
                        {ingredients.map(ing => {
                          const ingName = (ing.name || '').split(' | ')[0];
                          return (
                            <option key={ing.id} value={ing.name}>
                              {ingName} (Stok: {ing.stock} {ing.unit})
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {/* Jumlah & Satuan */}
                    <div className="flex items-center gap-2 shrink-0">
                      <input 
                        type="number" 
                        step="any"
                        placeholder="Takaran" 
                        value={rc.qty}
                        onChange={(e) => handleRecipeChange(index, 'qty', e.target.value)}
                        className="w-24 bg-white border border-zinc-200 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-900 text-right placeholder-zinc-400 focus:outline-none focus:border-[#E87F24] font-mono"
                        required
                      />
                      <select
                        value={rc.unit}
                        onChange={(e) => handleRecipeChange(index, 'unit', e.target.value)}
                        className="w-24 bg-white border border-zinc-200 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-700 focus:outline-none focus:border-[#E87F24] cursor-pointer"
                        required
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
                          className="w-9 h-9 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                          title="Hapus Bahan"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-[11px] font-medium text-zinc-400 leading-relaxed">
                * Bahan baku yang dipilih akan otomatis memotong stok Gudang setiap kali menu ini terjual di Kasir POS maupun Self-Order.
              </p>
            </div>

          </div>

          {/* Footer Modal */}
          <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-end gap-3 shrink-0">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-3 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-100 text-xs font-black text-zinc-600 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#E87F24] to-[#FFC81E] hover:from-[#d6731f] hover:to-[#e6b419] text-zinc-950 text-xs font-black shadow-lg shadow-[#E87F24]/20 inline-flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Check size={16} /> {editingProduct ? 'Simpan Perubahan' : 'Simpan Menu Baru'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
