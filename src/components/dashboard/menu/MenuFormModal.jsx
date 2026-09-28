import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit3, X, Tag, DollarSign, Image, Layers, Trash2 } from 'lucide-react';

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
    
    // Auto-fill unit if an ingredient is selected
    if (field === 'name') {
      const selectedIngredient = ingredients.find(ing => ing.name === value);
      if (selectedIngredient) {
        // Here we could auto-fill the unit, but to be flexible we let them define the recipe unit.
        // Usually recipe units are smaller (grams instead of kg).
      }
    }

    updatedRecipe[index][field] = field === 'qty' ? (value === '' ? '' : Number(value)) : value;
    setFormData({ ...formData, recipe: updatedRecipe });
  };

  const handleRemoveRecipeRow = (index) => {
    const updatedRecipe = formData.recipe.filter((_, i) => i !== index);
    setFormData({ ...formData, recipe: updatedRecipe });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose} 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm cursor-pointer"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 15 }} 
        className="relative w-full max-w-2xl bg-[#f5f5f7] sm:rounded-[24px] rounded-t-[24px] shadow-2xl flex flex-col max-h-[90vh] z-10 overflow-hidden"
      >
        {/* iOS Style Modal Header */}
        <div className="flex justify-between items-center px-4 py-3 bg-white/80 backdrop-blur-xl border-b border-black/5 shrink-0">
          <button onClick={onClose} className="text-[#007AFF] font-medium text-[15px] px-2 py-1 active:opacity-50">Batal</button>
          <h3 className="font-semibold text-zinc-900 text-[15px]">
            {editingProduct ? 'Edit Menu' : 'Menu Baru'}
          </h3>
          <button onClick={onSubmit} className="text-[#007AFF] font-semibold text-[15px] px-2 py-1 active:opacity-50">Selesai</button>
        </div>

        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Form Group 1: Info Dasar */}
          <div>
            <p className="text-[12px] font-medium text-zinc-500 uppercase tracking-wide ml-3 mb-2">Informasi Produk</p>
            <div className="bg-white rounded-[14px] border border-black/[0.04] overflow-hidden shadow-sm">
              
              <div className="flex items-center px-4 py-3 border-b border-black/[0.04]">
                <label className="text-[15px] font-medium text-zinc-900 w-32 shrink-0">Nama</label>
                <input 
                  type="text" 
                  placeholder="Kopi Susu Aren" 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  className="w-full text-[15px] text-zinc-900 placeholder-zinc-400 focus:outline-none bg-transparent" 
                  required 
                />
              </div>

              <div className="flex items-center px-4 py-3 border-b border-black/[0.04]">
                <label className="text-[15px] font-medium text-zinc-900 w-32 shrink-0">Kategori</label>
                <select 
                  value={formData.category} 
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })} 
                  className="w-full text-[15px] text-zinc-900 focus:outline-none bg-transparent appearance-none cursor-pointer"
                >
                  <option value="Minuman">Minuman</option>
                  <option value="Makanan">Makanan</option>
                  <option value="Bakery">Bakery</option>
                  <option value="Dessert">Dessert</option>
                </select>
              </div>

              <div className="flex items-center px-4 py-3 border-b border-black/[0.04]">
                <label className="text-[15px] font-medium text-zinc-900 w-32 shrink-0">Harga</label>
                <span className="text-[15px] text-zinc-500 mr-1">Rp</span>
                <input 
                  type="number" 
                  placeholder="20000" 
                  value={formData.price} 
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })} 
                  className="w-full text-[15px] text-zinc-900 placeholder-zinc-400 focus:outline-none bg-transparent" 
                  required 
                />
              </div>

              <div className="flex items-center px-4 py-3">
                <label className="text-[15px] font-medium text-zinc-900 w-32 shrink-0">URL Foto</label>
                <input 
                  type="text" 
                  placeholder="https://..." 
                  value={formData.image} 
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })} 
                  className="w-full text-[15px] text-[#007AFF] placeholder-zinc-400 focus:outline-none bg-transparent truncate" 
                />
              </div>

            </div>
          </div>

          {/* Form Group 2: BOM Recipe */}
          <div>
            <div className="flex justify-between items-center ml-3 mb-2">
              <p className="text-[12px] font-medium text-zinc-500 uppercase tracking-wide">Komposisi (BOM)</p>
            </div>
            <div className="bg-white rounded-[14px] border border-black/[0.04] overflow-hidden shadow-sm">
              
              {formData.recipe.map((rc, index) => (
                <div key={index} className={`flex items-center px-4 py-2 ${index !== formData.recipe.length - 1 ? 'border-b border-black/[0.04]' : ''}`}>
                  <div className="flex-1">
                    <select
                      value={rc.name}
                      onChange={(e) => handleRecipeChange(index, 'name', e.target.value)}
                      className="w-full text-[15px] font-medium text-zinc-900 placeholder-zinc-400 focus:outline-none bg-transparent appearance-none cursor-pointer"
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
                  <div className="flex items-center gap-2 border-l border-black/[0.04] pl-3 ml-2 shrink-0">
                    <input 
                      type="number" 
                      step="any"
                      placeholder="Jml" 
                      value={rc.qty}
                      onChange={(e) => handleRecipeChange(index, 'qty', e.target.value)}
                      className="w-12 text-[15px] text-right text-zinc-900 placeholder-zinc-400 focus:outline-none bg-transparent"
                      required
                    />
                    <select
                      value={rc.unit}
                      onChange={(e) => handleRecipeChange(index, 'unit', e.target.value)}
                      className="w-[70px] text-[15px] text-zinc-500 focus:outline-none bg-transparent appearance-none cursor-pointer"
                      required
                    >
                      <option value="gram">gram</option>
                      <option value="kg">kg</option>
                      <option value="ml">ml</option>
                      <option value="liter">liter</option>
                      <option value="pcs">pcs</option>
                    </select>
                    {formData.recipe.length > 1 && (
                      <button type="button" onClick={() => handleRemoveRecipeRow(index)} className="ml-2 w-6 h-6 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0 active:scale-95 transition-transform hover:bg-red-100">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <div className="border-t border-black/[0.04]">
                <button type="button" onClick={handleAddRecipeRow} className="w-full flex items-center gap-2 px-4 py-3 text-[15px] font-medium text-[#007AFF] hover:bg-black/[0.02] active:bg-black/[0.04] transition-colors text-left">
                  <div className="w-5 h-5 rounded-full bg-[#007AFF] text-white flex items-center justify-center shrink-0">
                    <Plus size={14} />
                  </div>
                  Tambah Bahan Baku
                </button>
              </div>

            </div>
            <p className="text-[12px] text-zinc-400 ml-3 mt-2">Bahan yang dimasukkan akan memotong stok Gudang secara otomatis saat produk ini terjual (Real-time FEFO).</p>
          </div>

        </div>
      </motion.div>
    </div>
  );
}