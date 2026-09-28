import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Sparkles, LayoutGrid, Coffee, Utensils, Croissant, Cake } from 'lucide-react';
import { supabase } from '../../../services/supabaseClient';
import MenuCard from './MenuCard';
import MenuFormModal from './MenuFormModal';

export default function MenuManagementModule({ products, setProducts, ingredients = [] }) {
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
      
      {/* Banner Header Modern ala macOS / iOS */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Kelola Menu & Resep</h1>
          <p className="text-zinc-500 text-[13px] font-medium mt-1">Atur katalog produk dan komposisi bahan baku (BOM).</p>
        </div>
        <button onClick={handleOpenAddModal} className="bg-[#E87F24] hover:bg-[#d6731f] text-white font-medium text-[13px] px-5 py-2.5 rounded-full shadow-[0_4px_14px_rgba(232,127,36,0.25)] cursor-pointer flex items-center gap-2 shrink-0 active:scale-[0.98] transition-all">
          <Plus size={16} /> Tambah Menu Baru
        </button>
      </div>

      {/* Filter Kategori & Pencarian (macOS Style) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        
        {/* Segmented Control ala Apple */}
        <div className="flex items-center p-1 bg-black/[0.04] rounded-[14px] overflow-x-auto hide-scrollbar">
          {categories.map(cat => {
            const isActive = activeCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`px-4 py-1.5 rounded-[10px] text-[13px] font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  isActive 
                    ? 'bg-white text-zinc-900 shadow-[0_1px_4px_rgba(0,0,0,0.12)] border border-black/[0.04]' 
                    : 'text-zinc-500 hover:text-zinc-700 hover:bg-black/[0.02] border border-transparent'
                }`}
              >
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Search Field ala macOS */}
        <div className="relative w-full md:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Cari nama menu..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="w-full bg-black/[0.04] border-transparent text-zinc-900 text-[13px] rounded-[12px] pl-9 pr-4 py-2 focus:outline-none focus:bg-white focus:border-zinc-300 focus:shadow-[0_0_0_4px_rgba(232,127,36,0.1)] transition-all font-medium" 
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
        ingredients={ingredients}
      />

    </div>
  );
}