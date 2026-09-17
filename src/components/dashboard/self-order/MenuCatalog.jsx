import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, Search, AlertCircle, LayoutGrid, Coffee, Utensils, Croissant, Cake } from 'lucide-react';
import { checkMenuStockAvailability } from '../../../utils/stockValidator';

export default function MenuCatalog({ products = [], ingredients = [], cart = [], updateQuantity }) {
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pemetaan ikon untuk kategori menu
  const categoryIcons = {
    'Semua': LayoutGrid,
    'Minuman': Coffee,
    'Makanan': Utensils,
    'Bakery': Croissant,
    'Dessert': Cake
  };

  const categories = ['Semua', ...new Set(products.map(item => item.category))];

  const filteredProducts = products.filter(p => {
    const matchCat = activeCategory === 'Semua' || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleAddClick = (menu, isAvailable, stockCheck) => {
    if (!isAvailable) {
      alert(`Menu ${menu.name} tidak dapat ditambahkan karena ${stockCheck.message.toLowerCase()} di gudang.`);
      return;
    }

    const cartItem = cart.find(item => item.id === menu.id);
    const currentQty = cartItem ? cartItem.qty : 0;
    
    const stockCheckNext = checkMenuStockAvailability(menu, ingredients, currentQty);
    if (!stockCheckNext.isAvailable) {
      alert(`Stok bahan baku untuk ${menu.name} sudah habis!`);
      return;
    }

    updateQuantity(menu, 1);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-50/50">
      
      {/* Header Sticky dengan Desain Clean & Modern */}
      <div className="bg-white/80 backdrop-blur-md px-6 pt-6 pb-4 rounded-b-[2.5rem] shadow-sm sticky top-0 z-20 space-y-4 border-b border-zinc-200/60">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-zinc-900 tracking-tight">Katalog Menu</h2>
            <p className="text-xs text-zinc-400 font-medium mt-0.5">Pilih hidangan favorit Anda hari ini</p>
          </div>
        </div>
        
        {/* Search Bar Modern */}
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Cari makanan atau minuman..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-11 pr-4 py-3.5 text-xs font-medium focus:outline-none focus:border-[#E87F24] transition-all shadow-2xs"
          />
        </div>

        {/* Category Pills dengan Ikon */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
          {categories.map(cat => {
            const IconComponent = categoryIcons[cat] || LayoutGrid;
            const isActive = activeCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                  isActive 
                    ? 'bg-zinc-900 text-white shadow-md' 
                    : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                <IconComponent size={13} className={isActive ? 'text-[#FFC81E]' : 'text-zinc-400'} />
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Katalog Menu */}
      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-28">
        {filteredProducts.length === 0 ? (
          <div className="bg-white border border-zinc-200/80 rounded-[2.5rem] p-12 text-center text-zinc-400 text-xs font-bold shadow-xs">
            Tidak ada menu ditemukan dalam pencarian ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredProducts.map((menu, idx) => {
              const cartItem = cart.find(item => item.id === menu.id);
              const qty = cartItem ? cartItem.qty : 0;
              
              const stockCheck = checkMenuStockAvailability(menu, ingredients, qty);
              const isAvailable = stockCheck.isAvailable;

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: idx * 0.04 }} 
                  key={menu.id} 
                  className={`p-4 rounded-[2rem] border transition-all flex items-center gap-4 relative overflow-hidden group ${
                    isAvailable 
                      ? 'bg-white border-zinc-200/80 shadow-sm hover:shadow-md' 
                      : 'bg-zinc-100/90 border-zinc-200 opacity-75 grayscale-[20%]'
                  }`}
                >
                  {/* Gambar Menu */}
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-zinc-200 shrink-0">
                    <img src={menu.image} alt={menu.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {!isAvailable && (
                      <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-[2px] flex items-center justify-center p-2 text-center">
                        <span className="text-[9px] font-black uppercase text-white bg-red-600 px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                          <AlertCircle size={10} /> Habis
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Detail Informasi */}
                  <div className="flex flex-col justify-between flex-1 h-24 py-0.5">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase text-[#E87F24] tracking-wider">{menu.category}</span>
                      <h4 className="font-black text-zinc-900 text-sm leading-tight line-clamp-1">{menu.name}</h4>
                      <p className="text-xs font-black text-zinc-700 font-mono">Rp {menu.price.toLocaleString('id-ID')}</p>
                    </div>
                    
                    {/* Tombol Aksi Pesan / Counter */}
                    <div className="flex items-center justify-end">
                      {qty === 0 ? (
                        <button 
                          onClick={() => handleAddClick(menu, isAvailable, stockCheck)} 
                          disabled={!isAvailable}
                          className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                            isAvailable 
                              ? 'bg-orange-50 text-[#E87F24] hover:bg-[#E87F24] hover:text-white cursor-pointer active:scale-95 shadow-2xs' 
                              : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                          }`}
                        >
                          <Plus size={14} /> {isAvailable ? 'Tambah' : 'Stok Kosong'}
                        </button>
                      ) : (
                        <div className="flex items-center gap-3 bg-zinc-900 text-white rounded-xl p-1 shadow-md">
                          <button onClick={() => updateQuantity(menu, -1)} className="w-7 h-7 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 rounded-lg cursor-pointer transition-colors"><Minus size={12} /></button>
                          <span className="font-black text-xs w-4 text-center">{qty}</span>
                          <button 
                            onClick={() => handleAddClick(menu, isAvailable, stockCheck)} 
                            className="w-7 h-7 flex items-center justify-center bg-[#E87F24] hover:bg-orange-500 rounded-lg cursor-pointer transition-colors text-zinc-950 font-black"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}