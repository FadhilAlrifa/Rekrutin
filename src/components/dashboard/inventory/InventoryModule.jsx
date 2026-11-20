import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  LayoutGrid,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ArrowDownToLine,
  Building2,
  ArrowRightLeft,
  History,
  ArrowUpRight,
  ArrowDownLeft,
  Check,
  X,
  TrendingUp,
  TrendingDown,
  Tag
} from 'lucide-react';
import { supabase } from '../../../services/supabaseClient';
import { cleanIngredientName } from '../../../utils/cogsCalculator';

// Impor komponen terpisah
import InventoryTable from './InventoryTable';
import StockInModal from './StockInModal';
import EditItemModal from './EditItemModal';
import PriceUpdateModal from './PriceUpdateModal';

export default function InventoryModule({
  products = [],
  ingredients = [],
  setIngredients,
  priceHistory = [],
  onUpdateIngredientPrice,
  onBatchFillMarketPrices,
  subscriptionPlan = 'pro',
  activeOutlet = 'Cabang Utama - Makassar',
  stockLogs = [],
  onAddStockLog,
  onRecordAudit,
  currentOperator,
  onUpgradePlan
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Semua');
  const [logTab, setLogTab] = useState('mutations'); // 'mutations' | 'prices'
  const [isCentralKitchenOpen, setIsCentralKitchenOpen] = useState(false);

  const todayDate = new Date().toISOString().split('T')[0];
  const isEnterprise = subscriptionPlan === 'enterprise';

  const [isStockInModalOpen, setIsStockInModalOpen] = useState(false);
  const [stockInData, setStockInData] = useState({
    name: '',
    category: 'Bahan Minuman',
    addedQty: '',
    unit: 'pcs',
    unitPrice: '',
    minLimit: '5',
    newExpiryDate: '',
    entryDate: todayDate
  });

  const [ckTransfer, setCkTransfer] = useState({
    ingredientId: '',
    qty: '',
    targetOutlet: activeOutlet === 'Semua Cabang (Terpusat)' ? 'Cabang Utama - Makassar' : activeOutlet,
    notes: 'Distribusi rutin Central Kitchen'
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [priceModalItem, setPriceModalItem] = useState(null);

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
      alert('Nama barang dan jumlah stok wajib diisi!');
      return;
    }

    const finalName = `${stockInData.name.trim()} | ${stockInData.category}`;
    const trimmedName = finalName.toLowerCase();
    const qtyToAdd = parseFloat(stockInData.addedQty);
    const incomingEntryDate = stockInData.entryDate || todayDate;
    const incomingUnitPrice =
      stockInData.unitPrice !== '' && stockInData.unitPrice !== undefined
        ? Number(stockInData.unitPrice)
        : null;

    const existingIndex = ingredients.findIndex(
      (ing) => ing.name.toLowerCase().trim() === trimmedName
    );

    if (existingIndex >= 0) {
      const targetItem = ingredients[existingIndex];
      const newTotalStock = Number((Number(targetItem.stock) + qtyToAdd).toFixed(3));
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
        entryDate: incomingEntryDate,
        unitPrice: incomingUnitPrice !== null ? incomingUnitPrice : targetItem.unitPrice
      };
      setIngredients(updatedIngredients);

      if (
        incomingUnitPrice !== null &&
        incomingUnitPrice !== Number(targetItem.unitPrice || 0) &&
        onUpdateIngredientPrice
      ) {
        await onUpdateIngredientPrice({
          ingredient: targetItem,
          newPrice: incomingUnitPrice,
          notes: 'Update harga saat barang masuk'
        });
      }

      onAddStockLog?.({
        id: 'LOG-' + Date.now(),
        ingredientId: targetItem.id,
        timestamp: new Date().toISOString(),
        itemName: stockInData.name.trim(),
        type: 'MASUK (Restock Supplier)',
        qty: `+${qtyToAdd} ${targetItem.unit}`,
        outlet: activeOutlet === 'Semua Cabang (Terpusat)' ? 'Cabang Utama - Makassar' : activeOutlet,
        note: 'Pencatatan barang masuk gudang'
      });

      onRecordAudit?.({
        actionType: 'Stock In',
        entityType: 'ingredient',
        entityId: targetItem.id,
        entityName: cleanIngredientName(targetItem.name),
        beforeValue: `${targetItem.stock} ${targetItem.unit}`,
        afterValue: `${newTotalStock} ${targetItem.unit}`,
        deltaLabel: `+${qtyToAdd} ${targetItem.unit}`,
        reason: 'Restock barang masuk gudang',
        movementType: 'STOCK_IN',
        qtyChange: qtyToAdd,
        beforeStock: targetItem.stock,
        afterStock: newTotalStock,
        unit: targetItem.unit
      });
    } else {
      const newRecord = {
        name: finalName,
        stock: qtyToAdd,
        unit: stockInData.unit,
        min_limit: parseFloat(stockInData.minLimit) || 5,
        expiry_date: stockInData.newExpiryDate || null,
        entry_date: incomingEntryDate
      };

      const { data, error } = await supabase.from('ingredients').insert([newRecord]).select();

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
          minLimit: data[0].min_stock_threshold ?? data[0].min_limit,
          unitPrice: incomingUnitPrice || 0,
          expiryDate: data[0].expiry_date,
          entryDate: data[0].entry_date
        };
        setIngredients([insertedItem, ...ingredients]);

        if (incomingUnitPrice && incomingUnitPrice > 0 && onUpdateIngredientPrice) {
          await onUpdateIngredientPrice({
            ingredient: insertedItem,
            newPrice: incomingUnitPrice,
            notes: 'Harga beli awal bahan baru'
          });
        }

        onAddStockLog?.({
          id: 'LOG-' + Date.now(),
          ingredientId: insertedItem.id,
          timestamp: new Date().toISOString(),
          itemName: stockInData.name.trim(),
          type: 'MASUK (Bahan Baru)',
          qty: `+${qtyToAdd} ${stockInData.unit}`,
          outlet: activeOutlet === 'Semua Cabang (Terpusat)' ? 'Cabang Utama - Makassar' : activeOutlet,
          note: 'Registrasi bahan baku baru'
        });

        onRecordAudit?.({
          actionType: 'Stock In',
          entityType: 'ingredient',
          entityId: insertedItem.id,
          entityName: stockInData.name.trim(),
          beforeValue: `0 ${stockInData.unit}`,
          afterValue: `${qtyToAdd} ${stockInData.unit}`,
          deltaLabel: `+${qtyToAdd} ${stockInData.unit}`,
          reason: 'Registrasi bahan baku baru',
          movementType: 'STOCK_IN',
          qtyChange: qtyToAdd,
          beforeStock: 0,
          afterStock: qtyToAdd,
          unit: stockInData.unit
        });
      }
    }

    setIsStockInModalOpen(false);
    setStockInData({
      name: '',
      category: 'Bahan Minuman',
      addedQty: '',
      unit: 'pcs',
      unitPrice: '',
      minLimit: '5',
      newExpiryDate: '',
      entryDate: todayDate
    });
  };

  const handleCentralKitchenSubmit = async (e) => {
    e.preventDefault();
    const targetIng = ingredients.find((i) => String(i.id) === String(ckTransfer.ingredientId));
    if (!targetIng || !ckTransfer.qty) return;

    const addAmount = parseFloat(ckTransfer.qty);
    const newTotalStock = Number((Number(targetIng.stock) + addAmount).toFixed(3));

    const { error } = await supabase
      .from('ingredients')
      .update({ stock: newTotalStock })
      .eq('id', targetIng.id);

    if (error) {
      alert('Gagal sinkronisasi Central Kitchen: ' + error.message);
      return;
    }

    setIngredients((prev) =>
      prev.map((i) => (i.id === targetIng.id ? { ...i, stock: newTotalStock } : i))
    );

    const cleanName = cleanIngredientName(targetIng.name);
    onAddStockLog?.({
      id: 'CK-' + Date.now(),
      ingredientId: targetIng.id,
      timestamp: new Date().toISOString(),
      itemName: cleanName,
      type: 'TRANSFER CENTRAL KITCHEN',
      qty: `+${addAmount} ${targetIng.unit}`,
      outlet: ckTransfer.targetOutlet,
      note: ckTransfer.notes || 'Pasokan Gudang Pusat'
    });

    onRecordAudit?.({
      actionType: 'Stock In',
      entityType: 'ingredient',
      entityId: targetIng.id,
      entityName: cleanName,
      beforeValue: `${targetIng.stock} ${targetIng.unit}`,
      afterValue: `${newTotalStock} ${targetIng.unit}`,
      deltaLabel: `+${addAmount} ${targetIng.unit}`,
      reason: ckTransfer.notes || `Distribusi Central Kitchen → ${ckTransfer.targetOutlet}`,
      movementType: 'STOCK_IN',
      qtyChange: addAmount,
      beforeStock: targetIng.stock,
      afterStock: newTotalStock,
      unit: targetIng.unit,
      stockerName: currentOperator?.name || 'Petugas Gudang'
    });

    setIsCentralKitchenOpen(false);
    setCkTransfer({
      ingredientId: '',
      qty: '',
      targetOutlet: activeOutlet === 'Semua Cabang (Terpusat)' ? 'Cabang Utama - Makassar' : activeOutlet,
      notes: 'Distribusi rutin Central Kitchen'
    });
  };

  const handleOpenEdit = (item) => {
    const nameParts = (item.name || '').split(' | ');
    setEditingItem({
      ...item,
      nameOnly: nameParts[0],
      category: nameParts[1] || 'Bahan Minuman',
      originalStock: item.stock,
      adjustmentReason: ''
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    const finalName = `${editingItem.nameOnly.trim()} | ${editingItem.category}`;
    const prevIng = ingredients.find((i) => String(i.id) === String(editingItem.id));
    const parsedPrice = Number(editingItem.unitPrice || 0);

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

    setIngredients((prev) =>
      prev.map((ing) =>
        ing.id === editingItem.id
          ? {
              ...editingItem,
              name: finalName,
              stock: parseFloat(editingItem.stock),
              minLimit: parseFloat(editingItem.minLimit),
              unitPrice: parsedPrice
            }
          : ing
      )
    );

    if (prevIng && Number(editingItem.stock) !== Number(prevIng.stock)) {
      const diff = Number((Number(editingItem.stock) - Number(prevIng.stock)).toFixed(3));
      const adjReason = (editingItem.adjustmentReason || '').trim() || 'Penyesuaian stock opname manual';
      onAddStockLog?.({
        id: 'ADJ-' + Date.now(),
        ingredientId: editingItem.id,
        timestamp: new Date().toISOString(),
        itemName: editingItem.nameOnly.trim(),
        type: 'PENYESUAIAN MANUAL (Opname)',
        qty: `${diff >= 0 ? `+${diff}` : diff} ${editingItem.unit}`,
        outlet: activeOutlet === 'Semua Cabang (Terpusat)' ? 'Cabang Utama - Makassar' : activeOutlet,
        note: adjReason
      });

      onRecordAudit?.({
        actionType: 'Manual Adjustment',
        entityType: 'ingredient',
        entityId: editingItem.id,
        entityName: editingItem.nameOnly.trim(),
        beforeValue: `${prevIng.stock} ${prevIng.unit}`,
        afterValue: `${editingItem.stock} ${editingItem.unit}`,
        deltaLabel: `${diff >= 0 ? `+${diff}` : diff} ${editingItem.unit}`,
        reason: adjReason,
        movementType: 'MANUAL_ADJUSTMENT',
        qtyChange: diff,
        beforeStock: prevIng.stock,
        afterStock: Number(editingItem.stock),
        unit: editingItem.unit
      });
    }

    if (prevIng && parsedPrice !== Number(prevIng.unitPrice || 0) && onUpdateIngredientPrice) {
      await onUpdateIngredientPrice({
        ingredient: prevIng,
        newPrice: parsedPrice,
        notes: 'Diperbarui dari form edit bahan'
      });
    }

    setIsEditModalOpen(false);
    setEditingItem(null);
  };

  const handleDeleteIngredient = async (id, name) => {
    const cleanName = cleanIngredientName(name);
    if (!window.confirm(`Apakah Anda yakin ingin menghapus "${cleanName}" dari gudang?`)) return;

    const target = ingredients.find((ing) => ing.id === id);
    const { error } = await supabase.from('ingredients').delete().eq('id', id);

    if (error) {
      alert('Gagal menghapus data: ' + error.message);
      return;
    }

    if (target) {
      onRecordAudit?.({
        actionType: 'Manual Adjustment',
        entityType: 'ingredient',
        entityId: target.id,
        entityName: cleanName,
        beforeValue: `${target.stock} ${target.unit}`,
        afterValue: '0 (Dihapus)',
        deltaLabel: `-${target.stock} ${target.unit}`,
        reason: 'Penghapusan item bahan baku dari gudang',
        movementType: 'MANUAL_ADJUSTMENT',
        qtyChange: -Number(target.stock || 0),
        beforeStock: target.stock,
        afterStock: 0,
        unit: target.unit
      });
    }

    setIngredients((prev) => prev.filter((ing) => ing.id !== id));
  };

  const lowStockCount = ingredients.filter((i) => Number(i.stock) <= Number(i.minLimit)).length;
  const nearExpiryCount = ingredients.filter((i) => {
    const expStatus = checkExpiryStatus(i.expiryDate);
    const isLowStock = Number(i.stock) <= Number(i.minLimit);
    return !isLowStock && (expStatus === 'hampir' || expStatus === 'expired');
  }).length;
  const missingPriceCount = ingredients.filter((i) => !(Number(i.unitPrice) > 0)).length;

  const filteredIngredients = ingredients.filter((i) => {
    const matchSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase());
    const expStatus = checkExpiryStatus(i.expiryDate);
    const isLowStock = Number(i.stock) <= Number(i.minLimit);

    if (activeTab === 'Kritis') return matchSearch && isLowStock;
    if (activeTab === 'Hampir Exp') return matchSearch && !isLowStock && (expStatus === 'hampir' || expStatus === 'expired');
    if (activeTab === 'Aman') return matchSearch && !isLowStock && expStatus === 'aman';
    return matchSearch;
  });

  const healthyCount = ingredients.filter((i) => {
    const expStatus = checkExpiryStatus(i.expiryDate);
    return Number(i.stock) > Number(i.minLimit) && expStatus === 'aman';
  }).length;

  const tabs = [
    { name: 'Semua', icon: LayoutGrid },
    { name: 'Kritis', icon: AlertTriangle },
    { name: 'Hampir Exp', icon: Clock },
    { name: 'Aman', icon: ShieldCheck }
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Banner Header Modern */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 pb-5 border-b border-zinc-200">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
              {isEnterprise
                ? `[ 03 // MULTI-OUTLET • ${activeOutlet} ]`
                : '[ 03 // SMART INVENTORY, HARGA & BUFFER ]'}
            </span>
            {currentOperator?.name && (
              <span className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Petugas Aktif: {currentOperator.name}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#141414]">Stok Gudang & Harga Bahan</h1>
          <p className="text-[#52525B] text-[13px] font-medium mt-1">
            Kelola buffer persediaan minimum, tanggal kedaluwarsa FEFO, dan perbarui harga pasar bahan baku untuk kalkulasi HPP otomatis.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {missingPriceCount > 0 && onBatchFillMarketPrices && (
            <button
              type="button"
              onClick={onBatchFillMarketPrices}
              className="bg-white hover:bg-[#FEF3C7] border border-zinc-200 hover:border-[#F59E0B] text-[#141414] font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm cursor-pointer flex items-center gap-1.5 transition-all"
            >
              <Tag size={14} className="text-[#D97706]" />
              <span>Isi Estimasi Harga ({missingPriceCount})</span>
            </button>
          )}
          {isEnterprise && (
            <button
              onClick={() => {
                if (ingredients.length > 0 && !ckTransfer.ingredientId) {
                  setCkTransfer((prev) => ({ ...prev, ingredientId: ingredients[0].id }));
                }
                setIsCentralKitchenOpen(true);
              }}
              className="bg-[#141414] hover:bg-zinc-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm cursor-pointer flex items-center gap-2 shrink-0 active:scale-[0.98] transition-all"
            >
              <ArrowRightLeft size={15} className="text-[#F59E0B]" /> Pasok dari Central Kitchen
            </button>
          )}
          <button
            onClick={() => setIsStockInModalOpen(true)}
            className="bg-[#F59E0B] hover:bg-[#D97706] text-[#141414] font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-sm cursor-pointer flex items-center gap-2 shrink-0 active:scale-[0.98] transition-all"
          >
            <ArrowDownToLine size={16} /> Catat Barang Masuk
          </button>
        </div>
      </div>

      {/* Ringkasan KPI Gudang (Clickable Quick Filters) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setActiveTab('Semua')}
          className={`text-left bg-white border rounded-2xl p-4 transition-all cursor-pointer ${
            activeTab === 'Semua' ? 'border-[#141414] shadow-sm' : 'border-zinc-200 hover:border-zinc-300'
          }`}
        >
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#52525B]">
            Total Bahan Baku
          </span>
          <p className="text-2xl font-extrabold font-mono text-[#141414] mt-1">{ingredients.length}</p>
          <span className="text-[11px] font-medium text-[#52525B] block mt-0.5">
            {missingPriceCount > 0 ? `${missingPriceCount} belum punya harga` : 'Semua harga siap HPP'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('Kritis')}
          className={`text-left bg-white border rounded-2xl p-4 transition-all cursor-pointer ${
            activeTab === 'Kritis' ? 'border-red-500 shadow-sm' : 'border-zinc-200 hover:border-zinc-300'
          }`}
        >
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-red-600">
            Stok Di Bawah Buffer
          </span>
          <p className="text-2xl font-extrabold font-mono text-red-600 mt-1">{lowStockCount}</p>
          <span className="text-[11px] font-medium text-[#52525B] block mt-0.5">Perlu restock segera</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('Hampir Exp')}
          className={`text-left bg-white border rounded-2xl p-4 transition-all cursor-pointer ${
            activeTab === 'Hampir Exp' ? 'border-[#F59E0B] shadow-sm' : 'border-zinc-200 hover:border-zinc-300'
          }`}
        >
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#D97706]">
            Isu FEFO / Exp
          </span>
          <p className="text-2xl font-extrabold font-mono text-[#D97706] mt-1">{nearExpiryCount}</p>
          <span className="text-[11px] font-medium text-[#52525B] block mt-0.5">≤ 30 hari / kedaluwarsa</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('Aman')}
          className={`text-left bg-white border rounded-2xl p-4 transition-all cursor-pointer ${
            activeTab === 'Aman' ? 'border-emerald-500 shadow-sm' : 'border-zinc-200 hover:border-zinc-300'
          }`}
        >
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            Kondisi Aman
          </span>
          <p className="text-2xl font-extrabold font-mono text-emerald-700 mt-1">{healthyCount}</p>
          <span className="text-[11px] font-medium text-[#52525B] block mt-0.5">Siap operasional</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center p-1 bg-zinc-200/70 rounded-xl overflow-x-auto hide-scrollbar w-fit max-w-full">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.name;
            return (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  isActive ? 'bg-[#141414] text-white shadow-sm' : 'text-[#52525B] hover:text-[#141414]'
                }`}
              >
                <span>{tab.name}</span>
                {tab.name === 'Kritis' && (
                  <span className={`font-mono text-[10px] ${isActive ? 'text-red-400' : 'text-zinc-500'}`}>
                    ({lowStockCount})
                  </span>
                )}
                {tab.name === 'Hampir Exp' && (
                  <span className={`font-mono text-[10px] ${isActive ? 'text-[#F59E0B]' : 'text-zinc-500'}`}>
                    ({nearExpiryCount})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari bahan baku..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-zinc-200 text-[#141414] text-[13px] rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all font-medium shadow-sm"
          />
        </div>
      </div>

      {/* Area Tabel Utama */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm overflow-hidden">
        <InventoryTable
          activeSub="ingredients"
          filteredProducts={[]}
          filteredIngredients={filteredIngredients}
          checkExpiryStatus={checkExpiryStatus}
          handleOpenEdit={handleOpenEdit}
          handleDeleteIngredient={handleDeleteIngredient}
          handleOpenPriceModal={(ing) => setPriceModalItem(ing)}
        />
      </div>

      {/* TABEL LOG MUTASI STOK & RIWAYAT HARGA PASAR */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] text-[#B45309] flex items-center justify-center">
              <History size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[#141414] text-base">
                  {logTab === 'prices'
                    ? 'Riwayat Perubahan Harga Bahan Baku'
                    : isEnterprise
                    ? 'Advanced Log Mutasi Stok Antar-Cabang'
                    : 'Riwayat Keluar-Masuk Barang Gudang'}
                </h3>
              </div>
              <p className="text-xs text-[#52525B] font-medium">
                {logTab === 'prices'
                  ? 'Audit kenaikan/penurunan harga beli pasar dan persentase perubahannya.'
                  : 'Pelacakan real-time barang masuk, distribusi Central Kitchen, dan pemotongan otomatis BOM POS.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-zinc-200/70 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setLogTab('mutations')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  logTab === 'mutations' ? 'bg-[#141414] text-white shadow-sm' : 'text-[#52525B]'
                }`}
              >
                Mutasi Stok ({stockLogs.length})
              </button>
              <button
                type="button"
                onClick={() => setLogTab('prices')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  logTab === 'prices' ? 'bg-[#141414] text-white shadow-sm' : 'text-[#52525B]'
                }`}
              >
                Riwayat Harga ({priceHistory.length})
              </button>
            </div>

            {!isEnterprise && onUpgradePlan && (
              <button
                onClick={() => onUpgradePlan('enterprise')}
                className="text-xs font-bold text-[#B45309] bg-[#FEF3C7] hover:bg-[#FDE68A] border border-[#FDE68A] px-3.5 py-2 rounded-xl transition-colors cursor-pointer shrink-0"
              >
                Enterprise Multi-Outlet
              </button>
            )}
          </div>
        </div>

        {logTab === 'mutations' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b border-zinc-200 font-mono text-[10px] font-bold uppercase tracking-wider text-[#52525B]">
                  <th className="pb-3 px-3">Waktu</th>
                  <th className="pb-3 px-3">Nama Bahan Baku</th>
                  <th className="pb-3 px-3">Tipe Mutasi</th>
                  <th className="pb-3 px-3">Jumlah</th>
                  {isEnterprise && <th className="pb-3 px-3">Cabang / Lokasi</th>}
                  <th className="pb-3 px-3">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs font-medium text-[#52525B]">
                {stockLogs.map((log, i) => {
                  const isOut = log.qty.startsWith('-');
                  const isCK = log.type.includes('CENTRAL KITCHEN');
                  return (
                    <tr key={log.id || i} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="py-3 px-3 text-[#52525B] whitespace-nowrap font-mono text-[11px]">
                        {new Date(log.timestamp).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3 px-3 font-bold text-[#141414]">{log.itemName}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-mono text-[10px] font-bold ${
                            isOut
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : isCK
                              ? 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {isOut ? <ArrowUpRight size={11} /> : <ArrowDownLeft size={11} />}
                          {log.type}
                        </span>
                      </td>
                      <td className={`py-3 px-3 font-mono font-bold ${isOut ? 'text-red-600' : 'text-emerald-700'}`}>
                        {log.qty}
                      </td>
                      {isEnterprise && (
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#141414] bg-[#FAFAFA] border border-zinc-200 px-2.5 py-1 rounded-lg">
                            <Building2 size={11} className="text-[#D97706]" />{' '}
                            {log.outlet || 'Cabang Utama - Makassar'}
                          </span>
                        </td>
                      )}
                      <td className="py-3 px-3 text-[#52525B]">{log.note}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : priceHistory.length === 0 ? (
          <div className="text-center py-10 text-xs font-medium text-[#52525B] space-y-2">
            <p className="font-bold text-[#141414]">Belum ada riwayat perubahan harga bahan baku.</p>
            <p>Klik tombol <strong>Harga</strong> pada tabel bahan baku untuk mencatat pembaruan harga pasar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b border-zinc-200 font-mono text-[10px] font-bold uppercase tracking-wider text-[#52525B]">
                  <th className="pb-3 px-3">Tanggal Perubahan</th>
                  <th className="pb-3 px-3">Bahan Baku</th>
                  <th className="pb-3 px-3 text-right">Harga Lama</th>
                  <th className="pb-3 px-3 text-right">Harga Baru</th>
                  <th className="pb-3 px-3 text-center">Perubahan</th>
                  <th className="pb-3 px-3">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs font-medium text-[#52525B]">
                {priceHistory.map((h) => (
                  <tr key={h.id} className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px]">
                      {new Date(h.changedAt).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-3 font-bold text-[#141414]">
                      {h.ingredientName}{' '}
                      <span className="font-mono text-[10px] text-[#52525B]">/{h.unit}</span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      Rp {Number(h.oldPrice).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-[#141414]">
                      Rp {Number(h.newPrice).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          h.changePct > 0
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : h.changePct < 0
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-[#FAFAFA] text-[#52525B] border-zinc-200'
                        }`}
                      >
                        {h.changePct > 0 ? (
                          <TrendingUp size={11} />
                        ) : h.changePct < 0 ? (
                          <TrendingDown size={11} />
                        ) : null}
                        {h.changePct > 0 ? `+${h.changePct}%` : `${h.changePct}%`}
                      </span>
                    </td>
                    <td className="py-3 px-3">{h.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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

      {/* Modal Update Harga Bahan + Simulasi Dampak HPP Real-Time */}
      <AnimatePresence>
        {priceModalItem && (
          <PriceUpdateModal
            key={priceModalItem.id}
            isOpen={Boolean(priceModalItem)}
            onClose={() => setPriceModalItem(null)}
            ingredient={priceModalItem}
            allIngredients={ingredients}
            products={products}
            onSavePrice={onUpdateIngredientPrice}
          />
        )}
      </AnimatePresence>

      {/* Modal Central Kitchen Integration (Khusus Paket Enterprise) */}
      <AnimatePresence>
        {isCentralKitchenOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setIsCentralKitchenOpen(false)}
              className="fixed inset-0 bg-zinc-950/50 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-lg bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl border border-zinc-200 z-10 flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 bg-white">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] text-[#B45309] flex items-center justify-center">
                    <ArrowRightLeft size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-[#141414] text-lg tracking-tight">
                      Sinkronisasi Central Kitchen
                    </h3>
                    <p className="text-xs font-medium text-[#52525B] mt-0.5">
                      Distribusi pasokan bahan baku dari Gudang Pusat ke gerai cabang.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCentralKitchenOpen(false)}
                  className="w-9 h-9 rounded-full bg-[#FAFAFA] hover:bg-zinc-200 border border-zinc-200 text-[#52525B] flex items-center justify-center cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCentralKitchenSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-[11px] font-bold text-[#52525B] mb-1.5">
                    Pilih Bahan Baku dari Gudang Pusat
                  </label>
                  <select
                    value={ckTransfer.ingredientId}
                    onChange={(e) => setCkTransfer({ ...ckTransfer, ingredientId: e.target.value })}
                    className="w-full bg-[#FAFAFA] border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-[#141414] focus:outline-none focus:bg-white focus:border-[#F59E0B] cursor-pointer"
                    required
                  >
                    <option value="" disabled>
                      Pilih Bahan Baku...
                    </option>
                    {ingredients.map((ing) => (
                      <option key={ing.id} value={ing.id}>
                        {cleanIngredientName(ing.name)} (Stok Gerai: {ing.stock} {ing.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#52525B] mb-1.5">
                      Jumlah Pasokan Dikirim
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="Contoh: 10"
                      value={ckTransfer.qty}
                      onChange={(e) => setCkTransfer({ ...ckTransfer, qty: e.target.value })}
                      className="w-full bg-[#FAFAFA] border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-[#141414] focus:outline-none focus:bg-white focus:border-[#F59E0B] font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#52525B] mb-1.5">
                      Gerai Cabang Tujuan
                    </label>
                    <select
                      value={ckTransfer.targetOutlet}
                      onChange={(e) => setCkTransfer({ ...ckTransfer, targetOutlet: e.target.value })}
                      className="w-full bg-[#FAFAFA] border border-zinc-200 rounded-xl px-4 py-3 text-xs font-bold text-[#141414] focus:outline-none focus:bg-white focus:border-[#F59E0B] cursor-pointer"
                    >
                      <option value="Cabang Utama - Makassar">Cabang Utama - Makassar</option>
                      <option value="Cabang 2 - Bandung">Cabang 2 - Bandung</option>
                      <option value="Cabang 3 - Jakarta">Cabang 3 - Jakarta</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#52525B] mb-1.5">
                    Catatan Pengiriman / Surat Jalan
                  </label>
                  <input
                    type="text"
                    value={ckTransfer.notes}
                    onChange={(e) => setCkTransfer({ ...ckTransfer, notes: e.target.value })}
                    className="w-full bg-[#FAFAFA] border border-zinc-200 rounded-xl px-4 py-3 text-xs font-bold text-[#141414] focus:outline-none focus:bg-white focus:border-[#F59E0B]"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCentralKitchenOpen(false)}
                    className="px-5 py-3 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-100 text-xs font-bold text-[#52525B] cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#141414] text-xs font-extrabold shadow-sm inline-flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Check size={16} /> Kirim & Sinkronkan Stok
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
