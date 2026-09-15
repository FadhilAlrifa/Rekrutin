import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit3, Trash2, Search, Sparkles, Tag, DollarSign, Image, X, Layers } from 'lucide-react';

export default function MenuManagementModal({ products, setProducts }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Minuman',
    price: '',
    expiryDate: '25 Oct 2026',
    image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=500&q=80',
    recipe: [{ name: '', qty: '', unit: 'gram' }]
  });

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'Minuman',
      price: '',
      expiryDate: '25 Oct 2026',
      image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=500&q=80',
      recipe: [{ name: '', qty: '', unit: 'gram' }]
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod);
    setFormData({
      ...prod,
      recipe: prod.recipe || [{ name: '', qty: '', unit: 'gram' }]
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm('Yakin ingin menghapus menu ini dari sistem?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      alert('Mohon isi nama dan harga menu.');
      return;
    }

    const payload = {
      ...formData,
      price: Number(formData.price)
    };

    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...payload, id: p.id } : p));
    } else {
      const newProd = { ...payload, id: Date.now() };
      setProducts([newProd, ...products]);
    }
    setIsModalOpen(false);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-16">
      
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 text-white rounded-[2.5rem] p-7 md:p-8 shadow-xl relative overflow-hidden border border-zinc-800">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#E87F24]/20 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="bg-[#E87F24]/20 text-[#FFC81E] border border-[#E87F24]/30 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5">
              <Sparkles size={13} /> Modul Manajemen Katalog & BOM
            </span>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Kelola Daftar Menu & Resep</h1>
            <p className="text-zinc-400 text-xs font-medium max-w-lg">Atur menu makanan/minuman beserta komposisi bahan baku teks bebas.</p>
          </div>
          <button onClick={handleOpenAddModal} className="bg-gradient-to-r from-[#E87F24] to-[#FFC81E] text-zinc-950 font-black text-xs px-6 py-3.5 rounded-2xl shadow-lg cursor-pointer flex items-center gap-2 shrink-0">
            <Plus size={16} /> Tambah Menu Baru
          </button>
        </div>
      </motion.div>

      <div className="bg-white border border-zinc-200/80 rounded-[2.5rem] p-6 md:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-zinc-900">Daftar Seluruh Menu ({filteredProducts.length})</h3>
          </div>
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input type="text" placeholder="Cari nama atau kategori menu..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-xs rounded-2xl pl-10 pr-4 py-3.5 focus:outline-none focus:border-[#E87F24] transition-all font-medium" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 text-[10px] font-black uppercase text-zinc-400">
                <th className="pb-4 px-4">Menu & Foto</th>
                <th className="pb-4 px-4">Kategori</th>
                <th className="pb-4 px-4">Harga Jual</th>
                <th className="pb-4 px-4">Komposisi Resep (BOM)</th>
                <th className="pb-4 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 text-xs font-medium">
              {filteredProducts.map((prod, idx) => (
                <motion.tr initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }} key={prod.id} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="py-4 px-4 flex items-center gap-3">
                    <img src={prod.image} alt={prod.name} className="w-10 h-10 rounded-xl object-cover border border-zinc-200 shrink-0" />
                    <div>
                      <span className="font-black text-zinc-900 text-sm block">{prod.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4"><span className="bg-orange-50 text-[#E87F24] border border-orange-200 px-3 py-1 rounded-full text-[10px] font-black uppercase">{prod.category}</span></td>
                  <td className="py-4 px-4 font-mono font-bold text-emerald-600">Rp {prod.price.toLocaleString('id-ID')}</td>
                  <td className="py-4 px-4 text-zinc-600 max-w-xs">
                    {prod.recipe && prod.recipe.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {prod.recipe.map((rc, i) => (
                          <span key={i} className="bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-lg text-[10px] font-medium border border-zinc-200">
                            {rc.name} ({rc.qty} {rc.unit})
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-zinc-400 italic text-[10px]">Tanpa resep bahan baku</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right space-x-2">
                    <button onClick={() => handleOpenEditModal(prod)} className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-bold transition-colors cursor-pointer inline-flex items-center gap-1"><Edit3 size={13} /> Edit</button>
                    <button onClick={() => handleDelete(prod.id)} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold transition-colors cursor-pointer inline-flex items-center gap-1"><Trash2 size={13} /> Hapus</button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-zinc-900/50 backdrop-blur-xs cursor-pointer"></motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative w-full max-w-2xl bg-white rounded-[2.5rem] p-7 md:p-8 shadow-2xl border border-zinc-100 space-y-6 max-h-[90vh] overflow-y-auto hide-scrollbar">
              
              <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-orange-50 text-[#E87F24] flex items-center justify-center font-bold border border-orange-100">
                    {editingProduct ? <Edit3 size={18} /> : <Plus size={18} />}
                  </div>
                  <div>
                    <h3 className="font-black text-zinc-900 text-base">{editingProduct ? 'Edit Menu & Resep' : 'Tambah Menu Baru & Resep'}</h3>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 flex items-center justify-center cursor-pointer"><X size={16} /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-600">Nama Menu</label>
                  <div className="relative">
                    <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input type="text" placeholder="Contoh: Kopi Susu Aren" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-11 pr-4 py-3 text-xs font-medium focus:outline-none focus:border-[#E87F24]" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-600">Kategori</label>
                    <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-xs font-medium focus:outline-none focus:border-[#E87F24] cursor-pointer">
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
                      <input type="number" placeholder="20000" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-9 pr-4 py-3 text-xs font-medium focus:outline-none focus:border-[#E87F24]" required />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-600">URL Foto / Gambar</label>
                  <div className="relative">
                    <Image size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input type="text" placeholder="https://images.unsplash.com/..." value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-9 pr-4 py-3 text-xs font-medium focus:outline-none focus:border-[#E87F24]" />
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-zinc-100">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-black uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                      <Layers size={14} className="text-[#E87F24]" /> Komposisi Bahan Baku (BOM Resep)
                    </label>
                    <button type="button" onClick={handleAddRecipeRow} className="text-[11px] font-black text-[#E87F24] hover:underline cursor-pointer">
                      + Tambah Bahan Resep
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                    {formData.recipe.map((rc, index) => (
                      <div key={index} className="flex items-center gap-2 bg-zinc-50 p-2.5 rounded-2xl border border-zinc-200/60">
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
                          className="w-28 bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#E87F24]"
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
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-3 text-xs font-black text-zinc-500 hover:bg-zinc-100 rounded-2xl cursor-pointer">Batal</button>
                  <button type="submit" className="px-6 py-3 bg-gradient-to-r from-[#E87F24] to-[#FFC81E] text-zinc-950 text-xs font-black rounded-2xl shadow-lg cursor-pointer">Simpan Menu</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}