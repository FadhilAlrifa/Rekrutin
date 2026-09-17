import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Sparkles, LayoutGrid, Coffee, Utensils, Croissant, Cake } from 'lucide-react';
import { supabase } from '../../../services/supabaseClient';
import MenuCard from './MenuCard';
import MenuFormModal from './MenuFormModal';

export default function MenuManagementModule({ products, setProducts }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
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

  // Daftar kategori lengkap dengan ikon representatifnya
  const categories = [
    { name: 'Semua', icon: LayoutGrid },
    { name: 'Minuman', icon: Coffee },
    { name: 'Makanan', icon: Utensils },
    { name: 'Bakery', icon: Croissant },
    { name: 'Dessert', icon: Cake }
  ];

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

  const handleDelete = async (id) => {
    if (confirm('Yakin ingin menghapus menu ini dari sistem?')) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        alert('Gagal menghapus menu: ' + error.message);
        return;
      }
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      alert('Mohon isi nama dan harga menu.');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      price: Number(formData.price),
      expiry_date: formData.expiryDate || null,
      image: formData.image,
      recipe: formData.recipe
    };

    if (editingProduct) {
      const { error } = await supabase.from('products').update(payload).eq('id', editingProduct.id);
      if (error) {
        alert('Gagal memperbarui menu: ' + error.message);
        return;
      }
      setProducts(products.map(p => p.id === editingProduct.id ? { ...payload, id: p.id } : p));
    } else {
      const { data, error } = await supabase.from('products').insert([payload]).select();
      if (error) {
        alert('Gagal menambahkan menu baru: ' + error.message);
        return;
      }
      if (data && data.length > 0) {
        const newProd = {
          id: data[0].id,
          name: data[0].name,
          category: data[0].category,
          price: data[0].price,
          expiryDate: data[0].expiry_date,
          image: data[0].image,
          recipe: data[0].recipe
        };
        setProducts([newProd, ...products]);
      }
    }

    setIsModalOpen(false);
  };

  const filteredProducts = products.filter(p => {
    const matchCat = activeCategory === 'Semua' || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-8 pb-16">
      
      {/* Banner Header Modern */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 text-white rounded-[2.5rem] p-7 md:p-8 shadow-xl relative overflow-hidden border border-zinc-800">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#E87F24]/20 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="bg-[#E87F24]/20 text-[#FFC81E] border border-[#E87F24]/30 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5">
              <Sparkles size={13} /> Modul Manajemen Katalog & BOM
            </span>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Kelola Daftar Menu & Resep</h1>
            <p className="text-zinc-400 text-xs font-medium max-w-lg">Atur menu makanan/minuman beserta komposisi bahan baku secara presisi.</p>
          </div>
          <button onClick={handleOpenAddModal} className="bg-gradient-to-r from-[#E87F24] to-[#FFC81E] text-zinc-950 font-black text-xs px-6 py-3.5 rounded-2xl shadow-lg cursor-pointer flex items-center gap-2 shrink-0 active:scale-95 transition-transform">
            <Plus size={16} /> Tambah Menu Baru
          </button>
        </div>
      </motion.div>

      {/* Filter Kategori dengan Ikon & Pencarian */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
          {categories.map(cat => {
            const IconComponent = cat.icon;
            const isActive = activeCategory === cat.name;

            return (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  isActive 
                    ? 'bg-zinc-900 text-white shadow-md' 
                    : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                <IconComponent size={14} className={isActive ? 'text-[#FFC81E]' : 'text-zinc-400'} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Cari nama menu..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="w-full bg-white border border-zinc-200 text-zinc-900 text-xs rounded-2xl pl-10 pr-4 py-3.5 focus:outline-none focus:border-[#E87F24] transition-all font-medium shadow-2xs" 
          />
        </div>
      </div>

      {/* Grid Kartu Menu */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white border border-zinc-200/80 rounded-[2.5rem] p-16 text-center text-zinc-400 text-xs font-bold">
          Tidak ada menu ditemukan dalam kategori ini.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((prod, idx) => (
            <MenuCard 
              key={prod.id} 
              prod={prod} 
              idx={idx} 
              onEdit={handleOpenEditModal} 
              onDelete={handleDelete} 
            />
          ))}
        </div>
      )}

      {/* Modal Form Tambah/Edit */}
      <MenuFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        editingProduct={editingProduct}
        formData={formData}
        setFormData={setFormData}
      />

    </div>
  );
}