import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit3, X, Tag, DollarSign, Image, Layers, Trash2 } from 'lucide-react';

export default function MenuFormModal({ isOpen, onClose, onSubmit, editingProduct, formData, setFormData }) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose} 
        className="fixed inset-0 bg-zinc-900/60 backdrop-blur-xs cursor-pointer"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 15 }} 
        className="relative w-full max-w-2xl bg-white rounded-[2.5rem] p-7 md:p-8 shadow-2xl border border-zinc-100 space-y-6 max-h-[90vh] overflow-y-auto hide-scrollbar z-10"
      >
        <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#E87F24] flex items-center justify-center font-bold border border-orange-100 shadow-xs">
              {editingProduct ? <Edit3 size={18} /> : <Plus size={18} />}
            </div>
            <div>
              <h3 className="font-black text-zinc-900 text-lg">
                {editingProduct ? 'Edit Menu & Resep' : 'Tambah Menu Baru'}
              </h3>
              <p className="text-xs text-zinc-400 font-medium">Lengkapi informasi katalog dan komposisi bahan.</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 flex items-center justify-center cursor-pointer transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-600">Nama Menu</label>
            <div className="relative">
              <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Contoh: Kopi Susu Aren" 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-11 pr-4 py-3.5 text-xs font-medium focus:outline-none focus:border-[#E87F24]" 
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-600">Kategori</label>
              <select 
                value={formData.category} 
                onChange={(e) => setFormData({ ...formData, category: e.target.value })} 
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 text-xs font-medium focus:outline-none focus:border-[#E87F24] cursor-pointer"
              >
                <option value="Minuman">Minuman</option>
                <option value="Makanan">Makanan</option>
                <option value="Bakery">Bakery</option>
                <option value="Dessert">Dessert</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-600">Harga Jual (Rp)</label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input 
                  type="number" 
                  placeholder="20000" 
                  value={formData.price} 
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })} 
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-9 pr-4 py-3.5 text-xs font-medium focus:outline-none focus:border-[#E87F24]" 
                  required 
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-600">URL Foto / Gambar</label>
            <div className="relative">
              <Image size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input 
                type="text" 
                placeholder="https://images.unsplash.com/..." 
                value={formData.image} 
                onChange={(e) => setFormData({ ...formData, image: e.target.value })} 
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-9 pr-4 py-3.5 text-xs font-medium focus:outline-none focus:border-[#E87F24]" 
              />
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-zinc-100">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                <Layers size={14} className="text-[#E87F24]" /> Komposisi Bahan Baku (BOM Resep)
              </label>
              <button type="button" onClick={handleAddRecipeRow} className="text-xs font-black text-[#E87F24] hover:underline cursor-pointer">
                + Tambah Bahan
              </button>
            </div>

            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {formData.recipe.map((rc, index) => (
                <div key={index} className="flex items-center gap-2 bg-zinc-50 p-2.5 rounded-2xl border border-zinc-200/60 shadow-2xs">
                  <input 
                    type="text" 
                    placeholder="Nama Bahan" 
                    value={rc.name}
                    onChange={(e) => handleRecipeChange(index, 'name', e.target.value)}
                    className="flex-1 bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#E87F24]"
                    required
                  />
                  <input 
                    type="number" 
                    step="any"
                    placeholder="Jumlah" 
                    value={rc.qty}
                    onChange={(e) => handleRecipeChange(index, 'qty', e.target.value)}
                    className="w-20 bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#E87F24]"
                    required
                  />
                  <input 
                    type="text" 
                    placeholder="Satuan" 
                    value={rc.unit}
                    onChange={(e) => handleRecipeChange(index, 'unit', e.target.value)}
                    className="w-24 bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#E87F24]"
                    required
                  />
                  {formData.recipe.length > 1 && (
                    <button type="button" onClick={() => handleRemoveRecipeRow(index)} className="w-8 h-8 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center shrink-0 cursor-pointer">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
            <button type="button" onClick={onClose} className="px-5 py-3 text-xs font-black text-zinc-500 hover:bg-zinc-100 rounded-2xl cursor-pointer">Batal</button>
            <button type="submit" className="px-6 py-3 bg-gradient-to-r from-[#E87F24] to-[#FFC81E] text-zinc-950 text-xs font-black rounded-2xl shadow-lg cursor-pointer">Simpan Menu</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}