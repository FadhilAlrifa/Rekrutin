import { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Plus, Search, LayoutGrid, Coffee, Utensils, Croissant, Cake } from 'lucide-react';
import { supabase } from '../../../services/supabaseClient';
import { syncMenuRecipesToDb } from '../../../services/stockoService';
import { calculateMenuCogs } from '../../../utils/cogsCalculator';
import MenuCard from './MenuCard';
import MenuFormModal from './MenuFormModal';

export default function MenuManagementModule({
  products,
  setProducts,
  ingredients = [],
  subscriptionPlan = 'pro',
  onUpgradePlan
}) {
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

  const categories = [
    { name: 'Semua', icon: LayoutGrid },
    { name: 'Minuman', icon: Coffee },
    { name: 'Makanan', icon: Utensils },
    { name: 'Bakery', icon: Croissant },
    { name: 'Dessert', icon: Cake }
  ];

  const cogsSummary = useMemo(() => {
    const calculated = products.map((p) => calculateMenuCogs(p, ingredients));
    const avgMargin =
      calculated.length > 0
        ? Number(
            (
              calculated.reduce((sum, item) => sum + item.grossMarginPct, 0) / calculated.length
            ).toFixed(1)
          )
        : 0;
    const criticalCount = calculated.filter((item) => item.grossMarginPct < 30).length;
    const healthyCount = calculated.filter((item) => item.grossMarginPct > 50).length;
    return { avgMargin, criticalCount, healthyCount };
  }, [products, ingredients]);

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
      recipe: prod.recipe && prod.recipe.length > 0 ? prod.recipe : [{ name: '', qty: '', unit: 'gram' }]
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
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      alert('Mohon isi nama dan harga menu.');
      return;
    }

    const cleanRecipe =
      subscriptionPlan === 'starter'
        ? editingProduct?.recipe || []
        : formData.recipe.filter((r) => r.name && r.qty);

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      price: Number(formData.price),
      expiry_date: formData.expiryDate || null,
      image: formData.image,
      recipe: cleanRecipe
    };

    if (editingProduct) {
      const { error } = await supabase.from('products').update(payload).eq('id', editingProduct.id);
      if (error) {
        alert('Gagal memperbarui menu: ' + error.message);
        return;
      }
      setProducts(products.map((p) => (p.id === editingProduct.id ? { ...payload, id: p.id } : p)));
      syncMenuRecipesToDb(editingProduct.id, cleanRecipe, ingredients);
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
        syncMenuRecipesToDb(newProd.id, cleanRecipe, ingredients);
      }
    }

    setIsModalOpen(false);
  };

  const filteredProducts = products.filter((p) => {
    const matchCat = activeCategory === 'Semua' || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Banner Header Modern */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 pb-5 border-b border-zinc-200">
        <div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] inline-block mb-2">
            [ 02 // MANAJEMEN MENU, RESEP & HPP (COGS) ]
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#141414]">
            {subscriptionPlan === 'starter' ? 'Kelola Menu Dasar' : 'Kelola Menu, Resep & HPP'}
          </h1>
          <p className="text-[#52525B] text-[13px] font-medium mt-1">
            {subscriptionPlan === 'starter'
              ? 'Atur daftar produk dan harga jual untuk kasir POS mandiri (Paket Starter).'
              : 'Atur katalog produk, komposisi takaran BOM, dan pantau margin keuntungan kotor tiap porsi.'}
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="bg-[#F59E0B] hover:bg-[#D97706] text-[#141414] font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-sm cursor-pointer flex items-center gap-2 shrink-0 active:scale-[0.98] transition-all"
        >
          <Plus size={16} /> Tambah Menu Baru
        </button>
      </div>

      {/* Ringkasan HPP & Margin Katalog */}
      {subscriptionPlan !== 'starter' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white border border-zinc-200 rounded-2xl p-4">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#52525B]">
              Total Menu Aktif
            </span>
            <p className="text-2xl font-extrabold font-mono text-[#141414] mt-1">{products.length}</p>
            <span className="text-[11px] font-medium text-[#52525B] block mt-0.5">
              {cogsSummary.healthyCount} menu margin sehat (&gt; 50%)
            </span>
          </div>
          <div className="bg-white border border-zinc-200 rounded-2xl p-4">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#D97706]">
              Rata-Rata Gross Margin
            </span>
            <p className="text-2xl font-extrabold font-mono text-[#141414] mt-1">{cogsSummary.avgMargin}%</p>
            <span className="text-[11px] font-medium text-[#52525B] block mt-0.5">
              Berdasarkan harga bahan baku terbaru
            </span>
          </div>
          <div className="bg-white border border-zinc-200 rounded-2xl p-4">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-red-600">
              Margin Kritis (&lt; 30%)
            </span>
            <p className={`text-2xl font-extrabold font-mono mt-1 ${cogsSummary.criticalCount > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
              {cogsSummary.criticalCount}
            </p>
            <span className="text-[11px] font-medium text-[#52525B] block mt-0.5">
              {cogsSummary.criticalCount > 0 ? 'Perlu evaluasi harga jual' : 'Tidak ada margin kritis'}
            </span>
          </div>
        </div>
      )}

      {/* Filter Kategori & Pencarian */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center p-1 bg-zinc-200/70 rounded-xl overflow-x-auto hide-scrollbar w-fit max-w-full">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.name;
            const catCount =
              cat.name === 'Semua'
                ? products.length
                : products.filter((p) => p.category === cat.name).length;
            return (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  isActive ? 'bg-[#141414] text-white shadow-sm' : 'text-[#52525B] hover:text-[#141414]'
                }`}
              >
                <span>{cat.name}</span>
                <span className={`font-mono text-[10px] ${isActive ? 'text-[#F59E0B]' : 'text-zinc-400'}`}>
                  {catCount}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari nama menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-zinc-200 text-[#141414] text-[13px] rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all font-medium shadow-sm"
          />
        </div>
      </div>

      {/* Grid Kartu Menu */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-2xl p-16 text-center text-[#52525B] text-xs font-bold">
          Tidak ada menu ditemukan dalam kategori ini.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((prod, idx) => (
            <MenuCard
              key={prod.id}
              prod={prod}
              idx={idx}
              onEdit={handleOpenEditModal}
              onDelete={handleDelete}
              ingredients={ingredients}
              subscriptionPlan={subscriptionPlan}
            />
          ))}
        </div>
      )}

      {/* Modal Form Tambah/Edit */}
      <AnimatePresence>
        <MenuFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          editingProduct={editingProduct}
          formData={formData}
          setFormData={setFormData}
          ingredients={ingredients}
          subscriptionPlan={subscriptionPlan}
          onUpgradePlan={onUpgradePlan}
        />
      </AnimatePresence>
    </div>
  );
}
