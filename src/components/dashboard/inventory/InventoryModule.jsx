import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Sparkles, LayoutGrid, AlertTriangle, Clock, ShieldCheck, ArrowDownToLine } from 'lucide-react';
import { supabase } from '../../../services/supabaseClient';

// Impor komponen terpisah
import InventoryTable from './InventoryTable';
import StockInModal from './StockInModal';
import EditItemModal from './EditItemModal';

export default function InventoryModule({ ingredients = [], setIngredients }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Semua');

  const todayDate = new Date().toISOString().split('T')[0];

  const [isStockInModalOpen, setIsStockInModalOpen] = useState(false);
  const [stockInData, setStockInData] = useState({
    name: '',
    category: 'Bahan Minuman',
    addedQty: '',
    unit: 'pcs',
    minLimit: '5',
    newExpiryDate: '',
    entryDate: todayDate
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const checkExpiryStatus = (dateString) => {
    if (!dateString) return 'aman';
    const expDate = new Date(dateString);
    const today = new Date();
    const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'expired';
    if (diffDays <= 30) return 'hampir'; 
    return 'aman';
  };

  const handleStockInSubmit = async (e) => {
    e.preventDefault();
    if (!stockInData.name || !stockInData.addedQty) {
      alert("Nama barang dan jumlah stok wajib diisi!");
      return;
    }

    const finalName = `${stockInData.name.trim()} | ${stockInData.category}`;
    const trimmedName = finalName.toLowerCase();
    const qtyToAdd = parseFloat(stockInData.addedQty);
    const incomingEntryDate = stockInData.entryDate || todayDate;

    const existingIndex = ingredients.findIndex(
      ing => ing.name.toLowerCase().trim() === trimmedName
    );

    if (existingIndex >= 0) {
      const targetItem = ingredients[existingIndex];
      const newTotalStock = Number((targetItem.stock + qtyToAdd).toFixed(3));
      const targetExpiry = stockInData.newExpiryDate || targetItem.expiryDate;

      const { error } = await supabase
        .from('ingredients')
        .update({ 
          stock: newTotalStock,
          expiry_date: targetExpiry,
          entry_date: incomingEntryDate
        })
        .eq('id', targetItem.id);

      if (error) {
        alert('Gagal memperbarui stok di database: ' + error.message);
        return;
      }

      const updatedIngredients = [...ingredients];
      updatedIngredients[existingIndex] = {
        ...targetItem,
        stock: newTotalStock,
        expiryDate: targetExpiry,
        entryDate: incomingEntryDate
      };
      setIngredients(updatedIngredients);

    } else {
      const newRecord = {
        name: finalName,
        stock: qtyToAdd,
        unit: stockInData.unit,
        min_limit: parseFloat(stockInData.minLimit) || 5,
        expiry_date: stockInData.newExpiryDate || null,
        entry_date: incomingEntryDate
      };

      const { data, error } = await supabase
        .from('ingredients')
        .insert([newRecord])
        .select();

      if (error) {
        alert('Gagal menambahkan barang baru ke database: ' + error.message);
        return;
      }

      if (data && data.length > 0) {
        const insertedItem = {
          id: data[0].id,
          name: data[0].name,
          stock: data[0].stock,
          unit: data[0].unit,
          minLimit: data[0].min_limit,
          expiryDate: data[0].expiry_date,
          entryDate: data[0].entry_date
        };
        setIngredients([insertedItem, ...ingredients]);
      }
    }

    setIsStockInModalOpen(false);
    setStockInData({ name: '', category: 'Bahan Minuman', addedQty: '', unit: 'pcs', minLimit: '5', newExpiryDate: '', entryDate: todayDate });
  };

  const handleOpenEdit = (item) => {
    const nameParts = (item.name || '').split(' | ');
    setEditingItem({ 
      ...item,
      nameOnly: nameParts[0],
      category: nameParts[1] || 'Bahan Minuman'
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    const finalName = `${editingItem.nameOnly.trim()} | ${editingItem.category}`;

    const { error } = await supabase
      .from('ingredients')
      .update({
        name: finalName,
        stock: parseFloat(editingItem.stock),
        unit: editingItem.unit,
        min_limit: parseFloat(editingItem.minLimit),
        expiry_date: editingItem.expiryDate || null,
        entry_date: editingItem.entryDate || null
      })
      .eq('id', editingItem.id);

    if (error) {
      alert('Gagal mengedit barang: ' + error.message);
      return;
    }

    setIngredients(prev => prev.map(ing => ing.id === editingItem.id ? { ...editingItem, name: finalName } : ing));
    setIsEditModalOpen(false);
    setEditingItem(null);
  };

  const handleDeleteIngredient = async (id, name) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus "${name}" dari gudang?`)) return;

    const { error } = await supabase
      .from('ingredients')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Gagal menghapus data: ' + error.message);
      return;
    }

    setIngredients(prev => prev.filter(ing => ing.id !== id));
  };

  const lowStockCount = ingredients.filter(i => i.stock <= i.minLimit).length;
  const nearExpiryCount = ingredients.filter(i => {
    const expStatus = checkExpiryStatus(i.expiryDate);
    const isLowStock = i.stock <= i.minLimit;
    return !isLowStock && (expStatus === 'hampir' || expStatus === 'expired');
  }).length;

  // Filter berdasarkan kategori tab & search bar
  const filteredIngredients = ingredients.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase());
    const expStatus = checkExpiryStatus(i.expiryDate);
    const isLowStock = i.stock <= i.minLimit;

    if (activeTab === 'Kritis') return matchSearch && isLowStock;
    if (activeTab === 'Hampir Exp') return matchSearch && !isLowStock && (expStatus === 'hampir' || expStatus === 'expired');
    if (activeTab === 'Aman') return matchSearch && !isLowStock && expStatus === 'aman';
    return matchSearch; // 'Semua'
  });

  const tabs = [
    { name: 'Semua', icon: LayoutGrid, activeColor: 'text-[#FFC81E]' },
    { name: 'Kritis', icon: AlertTriangle, activeColor: 'text-red-500' },
    { name: 'Hampir Exp', icon: Clock, activeColor: 'text-orange-500' },
    { name: 'Aman', icon: ShieldCheck, activeColor: 'text-emerald-500' }
  ];

  return (
    <div className="space-y-8 pb-16">
      
      {/* Banner Header Modern ala macOS / iOS */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Stok Gudang</h1>
          <p className="text-zinc-500 text-[13px] font-medium mt-1">Pantau persediaan bahan baku dan catat masuk barang.</p>
        </div>
        <button onClick={() => setIsStockInModalOpen(true)} className="bg-[#E87F24] hover:bg-[#d6731f] text-white font-medium text-[13px] px-5 py-2.5 rounded-full shadow-[0_4px_14px_rgba(232,127,36,0.25)] cursor-pointer flex items-center gap-2 shrink-0 active:scale-[0.98] transition-all">
          <ArrowDownToLine size={16} /> Catat Barang Masuk
        </button>
      </div>

      {/* Filter Tabs & Search (macOS Style) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        
        {/* Segmented Control ala Apple */}
        <div className="flex items-center p-1 bg-black/[0.04] rounded-[14px] overflow-x-auto hide-scrollbar">
          {tabs.map(tab => {
            const isActive = activeTab === tab.name;
            return (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`px-4 py-1.5 rounded-[10px] text-[13px] font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  isActive 
                    ? 'bg-white text-zinc-900 shadow-[0_1px_4px_rgba(0,0,0,0.12)] border border-black/[0.04]' 
                    : 'text-zinc-500 hover:text-zinc-700 hover:bg-black/[0.02] border border-transparent'
                }`}
              >
                <span>{tab.name}</span>
                {tab.name === 'Kritis' && <span className="opacity-80 font-semibold">({lowStockCount})</span>}
                {tab.name === 'Hampir Exp' && <span className="opacity-80 font-semibold">({nearExpiryCount})</span>}
              </button>
            );
          })}
        </div>

        {/* Search Field ala macOS */}
        <div className="relative w-full md:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Cari bahan baku..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full bg-black/[0.04] border-transparent text-zinc-900 text-[13px] rounded-[12px] pl-9 pr-4 py-2 focus:outline-none focus:bg-white focus:border-zinc-300 focus:shadow-[0_0_0_4px_rgba(232,127,36,0.1)] transition-all font-medium" 
          />
        </div>
      </div>

      {/* Area Tabel Utama */}
      <div className="bg-white border border-black/[0.04] rounded-[24px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
        <InventoryTable 
          activeSub="ingredients"
          filteredProducts={[]}
          filteredIngredients={filteredIngredients}
          checkExpiryStatus={checkExpiryStatus}
          handleOpenEdit={handleOpenEdit}
          handleDeleteIngredient={handleDeleteIngredient}
        />
      </div>

      {/* Modal Catat Barang Masuk */}
      <AnimatePresence>
        <StockInModal 
          isOpen={isStockInModalOpen}
          onClose={() => setIsStockInModalOpen(false)}
          onSubmit={handleStockInSubmit}
          stockInData={stockInData}
          setStockInData={setStockInData}
        />
      </AnimatePresence>

      {/* Modal Edit Barang Gudang */}
      <AnimatePresence>
        <EditItemModal 
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditSubmit}
          editingItem={editingItem}
          setEditingItem={setEditingItem}
        />
      </AnimatePresence>

    </div>
  );
}