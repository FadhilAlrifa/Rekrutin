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

    const trimmedName = stockInData.name.toLowerCase().trim();
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
        name: stockInData.name.trim(),
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
    setStockInData({ name: '', addedQty: '', unit: 'pcs', minLimit: '5', newExpiryDate: '', entryDate: todayDate });
  };

  const handleOpenEdit = (item) => {
    setEditingItem({ ...item });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    const { error } = await supabase
      .from('ingredients')
      .update({
        name: editingItem.name.trim(),
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

    setIngredients(prev => prev.map(ing => ing.id === editingItem.id ? editingItem : ing));
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
      
      {/* Banner Header Modern */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 text-white rounded-[2.5rem] p-7 md:p-8 shadow-xl relative overflow-hidden border border-zinc-800">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#E87F24]/20 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="bg-[#E87F24]/20 text-[#FFC81E] border border-[#E87F24]/30 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5">
              <Sparkles size={13} /> Modul Manajemen Gudang & FIFO
            </span>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Stok & Komposisi Bahan Baku</h1>
            <p className="text-zinc-400 text-xs font-medium max-w-lg">Pantau persediaan bahan baku secara real-time dan catat barang masuk secara presisi.</p>
          </div>
          <button onClick={() => setIsStockInModalOpen(true)} className="bg-gradient-to-r from-[#E87F24] to-[#FFC81E] text-zinc-950 font-black text-xs px-6 py-3.5 rounded-2xl shadow-lg cursor-pointer flex items-center gap-2 shrink-0 active:scale-95 transition-transform">
            <ArrowDownToLine size={16} /> Catat Barang Masuk
          </button>
        </div>
      </motion.div>

      {/* Filter Tabs dengan Logika Ikon Aktif/Non-aktif */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
          {tabs.map(tab => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.name;

            return (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  isActive 
                    ? 'bg-zinc-900 text-white shadow-md' 
                    : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                <IconComponent 
                  size={14} 
                  className={isActive ? tab.activeColor : 'text-zinc-400'} 
                />
                <span>{tab.name}</span>
                {tab.name === 'Kritis' && <span className="opacity-80">({lowStockCount})</span>}
                {tab.name === 'Hampir Exp' && <span className="opacity-80">({nearExpiryCount})</span>}
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Cari bahan baku..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full bg-white border border-zinc-200 text-zinc-900 text-xs rounded-2xl pl-10 pr-4 py-3.5 focus:outline-none focus:border-[#E87F24] transition-all font-medium shadow-2xs" 
          />
        </div>
      </div>

      {/* Area Tabel Utama */}
      <div className="bg-white border border-zinc-200/80 rounded-[2.5rem] p-6 md:p-8 shadow-xl overflow-hidden">
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