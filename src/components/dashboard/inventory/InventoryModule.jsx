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
import {
  saveIngredientInitialPrice,
  syncIngredientBatchesToDb,
  updateIngredientStock
} from '../../../services/stockoService';
import { checkExpiryStatus, evaluateIngredientStatus } from '../../../utils/inventoryStatus';
import {
  addStockInBatch,
  deductBatchesFefo,
  disposeExpiredBatchAsWaste
} from '../../../utils/fefoBatchEngine';
import { useNotify } from '../../common/NotificationContext';

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
  onUpgradePlan,
  holidayReminders = [],
  onOpenHolidayReminder
}) {
  const { showAlert, showConfirm, showToast } = useNotify();
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
    marketPrice: '',
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

  const handleStockInSubmit = async (e) => {
    e.preventDefault();
    if (!stockInData.name || !stockInData.addedQty) {
      await showAlert({
        title: 'Data Barang Belum Lengkap',
        message: 'Nama barang dan jumlah stok masuk wajib diisi sebelum menyimpan.',
        variant: 'warning'
      });
      return;
    }

    const finalName = `${stockInData.name.trim()} | ${stockInData.category}`;
    const trimmedName = finalName.toLowerCase();
    const qtyToAdd = parseFloat(stockInData.addedQty);
    const incomingEntryDate = stockInData.entryDate || todayDate;
    const incomingBatchPrice =
      stockInData.unitPrice !== '' && stockInData.unitPrice !== undefined
        ? Math.max(0, Number(stockInData.unitPrice))
        : null;
    const incomingMarketPrice =
      stockInData.marketPrice !== '' && stockInData.marketPrice !== undefined
        ? Math.max(0, Number(stockInData.marketPrice))
        : null;

    const existingIndex = ingredients.findIndex(
      (ing) => ing.name.toLowerCase().trim() === trimmedName
    );

    if (existingIndex >= 0) {
      const targetItem = ingredients[existingIndex];
      const stockerName = currentOperator?.name || 'Petugas Gudang';
      const batchResult = addStockInBatch(targetItem, {
        addedQty: qtyToAdd,
        entryDate: incomingEntryDate,
        expiryDate: stockInData.newExpiryDate || '',
        stockerName,
        notes: 'Restock barang masuk gudang'
      });
      const updatedFromBatch = batchResult.updatedIngredient;
      const newTotalStock = updatedFromBatch.stock;
      const targetExpiry = updatedFromBatch.expiryDate || null;

      const nextMarketPrice =
        incomingMarketPrice !== null ? incomingMarketPrice : incomingBatchPrice;
      const currentStoredMarket = Number(
        targetItem.currentMarketPrice ?? targetItem.unitPrice ?? 0
      );
      const preservedInitial =
        Number(targetItem.initialPurchasePrice ?? 0) > 0
          ? Number(targetItem.initialPurchasePrice)
          : currentStoredMarket > 0
          ? currentStoredMarket
          : nextMarketPrice || 0;

      const { error } = await supabase
        .from('ingredients')
        .update({
          stock: newTotalStock,
          expiry_date: targetExpiry,
          entry_date: incomingEntryDate
        })
        .eq('id', targetItem.id);

      if (error) {
        await showAlert({
          title: 'Gagal Memperbarui Stok',
          message: `Gagal memperbarui stok di database: ${error.message}`,
          variant: 'danger'
        });
        return;
      }

      await syncIngredientBatchesToDb(targetItem.id, updatedFromBatch.batches || []);

      const resolvedUpdatedMarket =
        nextMarketPrice !== null ? nextMarketPrice : currentStoredMarket;

      const updatedIngredients = [...ingredients];
      updatedIngredients[existingIndex] = {
        ...updatedFromBatch,
        initialPurchasePrice: preservedInitial,
        currentMarketPrice: resolvedUpdatedMarket,
        unitPrice: resolvedUpdatedMarket
      };
      setIngredients(updatedIngredients);

      if (
        nextMarketPrice !== null &&
        nextMarketPrice !== currentStoredMarket &&
        onUpdateIngredientPrice
      ) {
        await onUpdateIngredientPrice({
          ingredient: { ...updatedFromBatch, initialPurchasePrice: preservedInitial },
          newPrice: nextMarketPrice,
          initialPrice: preservedInitial,
          notes: 'Update harga pasar saat barang masuk'
        });
      }

      const batchNote = `${batchResult.newBatch.batchCode} (Exp: ${
        batchResult.newBatch.expiryDate || 'Tanpa Exp'
      })`;

      onAddStockLog?.({
        id: 'LOG-' + Date.now(),
        ingredientId: targetItem.id,
        timestamp: new Date().toISOString(),
        itemName: stockInData.name.trim(),
        type: 'MASUK (Restock Supplier)',
        qty: `+${qtyToAdd} ${targetItem.unit}`,
        outlet: activeOutlet === 'Semua Cabang (Terpusat)' ? 'Cabang Utama - Makassar' : activeOutlet,
        note: `Batch baru ${batchNote} • Oleh ${stockerName}`
      });

      onRecordAudit?.({
        actionType: 'Stock In',
        entityType: 'ingredient',
        entityId: targetItem.id,
        entityName: cleanIngredientName(targetItem.name),
        beforeValue: `${targetItem.stock} ${targetItem.unit}`,
        afterValue: `${newTotalStock} ${targetItem.unit}`,
        deltaLabel: `+${qtyToAdd} ${targetItem.unit}`,
        reason: `Restock batch ${batchNote}`,
        movementType: 'STOCK_IN',
        qtyChange: qtyToAdd,
        beforeStock: targetItem.stock,
        afterStock: newTotalStock,
        unit: targetItem.unit,
        stockerName
      });
    } else {
      const resolvedInitialPrice =
        incomingBatchPrice !== null
          ? incomingBatchPrice
          : incomingMarketPrice !== null
          ? incomingMarketPrice
          : 0;
      const resolvedMarketPrice =
        incomingMarketPrice !== null ? incomingMarketPrice : resolvedInitialPrice;

      const baseRecord = {
        name: finalName,
        stock: qtyToAdd,
        unit: stockInData.unit,
        min_limit: parseFloat(stockInData.minLimit) || 5,
        expiry_date: stockInData.newExpiryDate || null,
        entry_date: incomingEntryDate
      };

      const extendedRecord = {
        ...baseRecord,
        unit_price: resolvedMarketPrice,
        initial_purchase_price: resolvedInitialPrice,
        current_market_price: resolvedMarketPrice
      };

      let insertRes = await supabase.from('ingredients').insert([extendedRecord]).select();
      if (insertRes.error) {
        insertRes = await supabase.from('ingredients').insert([baseRecord]).select();
      }
      const { data, error } = insertRes;

      if (error) {
        await showAlert({
          title: 'Gagal Menambahkan Barang',
          message: `Gagal menambahkan barang baru ke database: ${error.message}`,
          variant: 'danger'
        });
        return;
      }

      if (data && data.length > 0) {
        const stockerName = currentOperator?.name || 'Petugas Gudang';
        const baseInserted = {
          id: data[0].id,
          name: data[0].name,
          stock: 0,
          unit: data[0].unit,
          minLimit: data[0].min_stock_threshold ?? data[0].min_limit,
          unitPrice: resolvedMarketPrice,
          currentMarketPrice: resolvedMarketPrice,
          initialPurchasePrice: resolvedInitialPrice,
          expiryDate: data[0].expiry_date || '',
          entryDate: data[0].entry_date || '',
          batches: []
        };
        const { updatedIngredient: insertedItem, newBatch } = addStockInBatch(baseInserted, {
          addedQty: qtyToAdd,
          entryDate: incomingEntryDate,
          expiryDate: stockInData.newExpiryDate || '',
          stockerName,
          notes: 'Registrasi bahan baku baru'
        });

        await syncIngredientBatchesToDb(insertedItem.id, insertedItem.batches || []);
        setIngredients([insertedItem, ...ingredients]);

        if (resolvedMarketPrice > 0 && onUpdateIngredientPrice) {
          await onUpdateIngredientPrice({
            ingredient: insertedItem,
            newPrice: resolvedMarketPrice,
            initialPrice: resolvedInitialPrice,
            notes: 'Harga beli awal bahan baru'
          });
        } else if (resolvedInitialPrice > 0) {
          await saveIngredientInitialPrice(insertedItem.id, resolvedInitialPrice, resolvedMarketPrice);
        }

        onAddStockLog?.({
          id: 'LOG-' + Date.now(),
          ingredientId: insertedItem.id,
          timestamp: new Date().toISOString(),
          itemName: stockInData.name.trim(),
          type: 'MASUK (Bahan Baru)',
          qty: `+${qtyToAdd} ${stockInData.unit}`,
          outlet: activeOutlet === 'Semua Cabang (Terpusat)' ? 'Cabang Utama - Makassar' : activeOutlet,
          note: `Batch ${newBatch.batchCode} • Registrasi bahan baru`
        });

        onRecordAudit?.({
          actionType: 'Stock In',
          entityType: 'ingredient',
          entityId: insertedItem.id,
          entityName: stockInData.name.trim(),
          beforeValue: `0 ${stockInData.unit}`,
          afterValue: `${qtyToAdd} ${stockInData.unit}`,
          deltaLabel: `+${qtyToAdd} ${stockInData.unit}`,
          reason: `Registrasi bahan baku baru (${newBatch.batchCode})`,
          movementType: 'STOCK_IN',
          qtyChange: qtyToAdd,
          beforeStock: 0,
          afterStock: qtyToAdd,
          unit: stockInData.unit,
          stockerName
        });
      }
    }

    showToast({
      title: 'Stok barang masuk tercatat',
      message: `${stockInData.name.trim()} (+${qtyToAdd} ${stockInData.unit}) berhasil disimpan.`,
      variant: 'success'
    });

    setIsStockInModalOpen(false);
    setStockInData({
      name: '',
      category: 'Bahan Minuman',
      addedQty: '',
      unit: 'pcs',
      unitPrice: '',
      marketPrice: '',
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
    const stockerName = currentOperator?.name || 'Petugas Gudang';
    const { updatedIngredient: ckUpdated, newBatch } = addStockInBatch(targetIng, {
      addedQty: addAmount,
      entryDate: todayDate,
      expiryDate: targetIng.expiryDate || '',
      stockerName,
      notes: ckTransfer.notes || `Transfer Central Kitchen → ${ckTransfer.targetOutlet}`
    });
    const newTotalStock = ckUpdated.stock;

    const { error } = await supabase
      .from('ingredients')
      .update({ stock: newTotalStock, expiry_date: ckUpdated.expiryDate || null })
      .eq('id', targetIng.id);

    if (error) {
      await showAlert({
        title: 'Gagal Sinkronisasi Central Kitchen',
        message: error.message,
        variant: 'danger'
      });
      return;
    }

    await syncIngredientBatchesToDb(targetIng.id, ckUpdated.batches || []);
    setIngredients((prev) =>
      prev.map((i) => (i.id === targetIng.id ? ckUpdated : i))
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
      note: `${ckTransfer.notes || 'Pasokan Gudang Pusat'} (${newBatch.batchCode})`
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

    showToast({
      title: 'Transfer Central Kitchen berhasil',
      message: `${cleanName} (+${addAmount} ${targetIng.unit}) dikirim ke ${ckTransfer.targetOutlet}.`,
      variant: 'success'
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
    const marketPrice = Number(item.currentMarketPrice ?? item.unitPrice ?? 0);
    const initialPrice = Number(item.initialPurchasePrice ?? marketPrice);
    setEditingItem({
      ...item,
      nameOnly: nameParts[0],
      category: nameParts[1] || 'Bahan Minuman',
      originalStock: item.stock,
      initialPurchasePrice: initialPrice,
      currentMarketPrice: marketPrice,
      unitPrice: marketPrice,
      adjustmentReason: ''
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    const finalName = `${editingItem.nameOnly.trim()} | ${editingItem.category}`;
    const prevIng = ingredients.find((i) => String(i.id) === String(editingItem.id));
    const parsedMarketPrice = Math.max(
      0,
      Number(editingItem.currentMarketPrice ?? editingItem.unitPrice ?? 0)
    );
    const parsedInitialPrice = Math.max(
      0,
      Number(editingItem.initialPurchasePrice ?? prevIng?.initialPurchasePrice ?? parsedMarketPrice)
    );

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
      await showAlert({
        title: 'Gagal Memperbarui Barang',
        message: `Gagal mengedit barang: ${error.message}`,
        variant: 'danger'
      });
      return;
    }

    await saveIngredientInitialPrice(editingItem.id, parsedInitialPrice, parsedMarketPrice);

    const targetStockVal = Math.max(0, parseFloat(editingItem.stock) || 0);
    const prevStockVal = prevIng ? Number(prevIng.stock) || 0 : targetStockVal;
    const stockDiff = Number((targetStockVal - prevStockVal).toFixed(3));
    const stockerName = currentOperator?.name || 'Petugas Gudang';
    let nextBatches = prevIng?.batches || editingItem.batches || [];
    let resolvedExpiryDate = editingItem.expiryDate || '';

    if (prevIng && stockDiff > 0) {
      const addedRes = addStockInBatch(prevIng, {
        addedQty: stockDiff,
        entryDate: editingItem.entryDate || todayDate,
        expiryDate: editingItem.expiryDate || '',
        stockerName,
        notes: (editingItem.adjustmentReason || '').trim() || 'Penambahan opname manual'
      });
      nextBatches = addedRes.updatedIngredient.batches;
      resolvedExpiryDate = addedRes.updatedIngredient.expiryDate || resolvedExpiryDate;
    } else if (prevIng && stockDiff < 0) {
      const dedRes = deductBatchesFefo(prevIng, Math.abs(stockDiff));
      nextBatches = dedRes.updatedIngredient.batches;
      resolvedExpiryDate = dedRes.updatedIngredient.expiryDate || resolvedExpiryDate;
    } else if (Array.isArray(nextBatches) && nextBatches.length === 1) {
      nextBatches = [
        {
          ...nextBatches[0],
          expiryDate: editingItem.expiryDate || '',
          entryDate: editingItem.entryDate || nextBatches[0].entryDate
        }
      ];
    }

    await syncIngredientBatchesToDb(editingItem.id, nextBatches);

    setIngredients((prev) =>
      prev.map((ing) =>
        ing.id === editingItem.id
          ? {
              ...editingItem,
              name: finalName,
              stock: targetStockVal,
              minLimit: parseFloat(editingItem.minLimit),
              expiryDate: resolvedExpiryDate,
              initialPurchasePrice: parsedInitialPrice,
              currentMarketPrice: parsedMarketPrice,
              unitPrice: parsedMarketPrice,
              batches: nextBatches
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

    const prevMarketPrice = Number(prevIng?.currentMarketPrice ?? prevIng?.unitPrice ?? 0);
    if (prevIng && parsedMarketPrice !== prevMarketPrice && onUpdateIngredientPrice) {
      await onUpdateIngredientPrice({
        ingredient: { ...prevIng, initialPurchasePrice: parsedInitialPrice },
        newPrice: parsedMarketPrice,
        initialPrice: parsedInitialPrice,
        notes: 'Diperbarui dari form edit bahan'
      });
    }

    showToast({
      title: 'Data bahan baku diperbarui',
      message: `${editingItem.nameOnly.trim()} berhasil disimpan.`,
      variant: 'success'
    });

    setIsEditModalOpen(false);
    setEditingItem(null);
  };

  const handleDisposeExpiredBatch = async (item, batch) => {
    const cleanName = cleanIngredientName(item?.name);
    const confirmed = await showConfirm({
      title: `Buang Batch Expired (${batch.batchCode})?`,
      message: `Batch ${batch.batchCode} (${cleanName}, ${batch.qty} ${item.unit}, Exp: ${batch.expiryDate}) sudah kedaluwarsa dan tidak boleh dipakai POS. Tarik dari stok gudang dan catat sebagai Waste?`,
      variant: 'danger',
      confirmText: 'Ya, Catat sebagai Waste',
      cancelText: 'Batal'
    });
    if (!confirmed) return;

    const currentItem = ingredients.find((i) => String(i.id) === String(item.id)) || item;
    const { updatedIngredient, disposedQty } = disposeExpiredBatchAsWaste(currentItem, batch.id);

    await updateIngredientStock(
      currentItem.id,
      updatedIngredient.stock,
      updatedIngredient.expiryDate || null
    );
    await syncIngredientBatchesToDb(currentItem.id, updatedIngredient.batches || []);

    setIngredients((prev) =>
      prev.map((ing) => (String(ing.id) === String(currentItem.id) ? updatedIngredient : ing))
    );
    setEditingItem((prev) =>
      prev && String(prev.id) === String(currentItem.id)
        ? {
            ...prev,
            stock: updatedIngredient.stock,
            originalStock: updatedIngredient.stock,
            expiryDate: updatedIngredient.expiryDate,
            batches: updatedIngredient.batches
          }
        : prev
    );

    const stockerName = currentOperator?.name || 'Petugas Gudang';
    const unitMarket = Number(currentItem.currentMarketPrice ?? currentItem.unitPrice ?? 0);
    const wasteCostImpact = Math.round(disposedQty * unitMarket);

    onAddStockLog?.({
      id: 'WST-BATCH-' + Date.now(),
      ingredientId: currentItem.id,
      timestamp: new Date().toISOString(),
      itemName: cleanName,
      type: 'WASTE (Batch Kedaluwarsa)',
      qty: `-${disposedQty} ${currentItem.unit}`,
      outlet: activeOutlet === 'Semua Cabang (Terpusat)' ? 'Cabang Utama - Makassar' : activeOutlet,
      note: `Penarikan batch expired ${batch.batchCode} (Exp ${batch.expiryDate}) oleh ${stockerName}`
    });

    onRecordAudit?.({
      actionType: 'Waste Loss',
      entityType: 'ingredient',
      entityId: currentItem.id,
      entityName: cleanName,
      beforeValue: `${currentItem.stock} ${currentItem.unit}`,
      afterValue: `${updatedIngredient.stock} ${currentItem.unit}`,
      deltaLabel: `-${disposedQty} ${currentItem.unit}`,
      reason: `Pembuangan batch kedaluwarsa ${batch.batchCode} (Exp: ${batch.expiryDate})`,
      movementType: 'WASTE_LOSS',
      qtyChange: -disposedQty,
      beforeStock: currentItem.stock,
      afterStock: updatedIngredient.stock,
      unit: currentItem.unit,
      costImpact: wasteCostImpact,
      stockerName
    });

    showToast({
      title: `Batch ${batch.batchCode} ditarik ke Waste`,
      message: `${disposedQty} ${currentItem.unit} ${cleanName} dicatat sebagai kerugian kedaluwarsa.`,
      variant: 'warning'
    });
  };

  const handleDeleteIngredient = async (id, name) => {
    const cleanName = cleanIngredientName(name);
    const confirmed = await showConfirm({
      title: 'Hapus Bahan Baku?',
      message: `Apakah Anda yakin ingin menghapus "${cleanName}" dari gudang? Rekam jejak audit sebelumnya akan tetap tersimpan.`,
      variant: 'danger',
      confirmText: 'Ya, Hapus Bahan',
      cancelText: 'Batal'
    });
    if (!confirmed) return;

    const target = ingredients.find((ing) => ing.id === id);
    const { error } = await supabase.from('ingredients').delete().eq('id', id);

    if (error) {
      await showAlert({
        title: 'Gagal Menghapus Data',
        message: error.message,
        variant: 'danger'
      });
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
    showToast({
      title: 'Bahan baku dihapus',
      message: `"${cleanName}" telah dihapus dari daftar gudang.`,
      variant: 'info'
    });
  };

  const lowStockCount = ingredients.filter((i) => evaluateIngredientStatus(i).isBelowMin).length;
  const nearExpiryCount = ingredients.filter((i) => {
    const status = evaluateIngredientStatus(i);
    return status.isExpired || status.isNearExpiry;
  }).length;
  const missingPriceCount = ingredients.filter(
    (i) => !(Number(i.currentMarketPrice ?? i.unitPrice) > 0)
  ).length;

  const filteredIngredients = ingredients.filter((i) => {
    const matchSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase());
    const status = evaluateIngredientStatus(i);

    if (activeTab === 'Kritis') return matchSearch && status.isBelowMin;
    if (activeTab === 'Hampir Exp') return matchSearch && (status.isExpired || status.isNearExpiry);
    if (activeTab === 'Aman') return matchSearch && status.isHealthy;
    return matchSearch;
  });

  const healthyCount = ingredients.filter((i) => evaluateIngredientStatus(i).isHealthy).length;

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
          {holidayReminders.length > 0 && onOpenHolidayReminder && (
            <button
              type="button"
              onClick={() => onOpenHolidayReminder(holidayReminders[0])}
              className="bg-[#FEF3C7] hover:bg-[#FDE68A] border border-[#F59E0B] text-[#141414] font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-sm cursor-pointer flex items-center gap-1.5 transition-all"
            >
              <History size={14} className="text-[#B45309]" />
              <span>
                Referensi {holidayReminders[0].countdownBadge}: {holidayReminders[0].name}
              </span>
            </button>
          )}
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
          onDisposeExpiredBatch={handleDisposeExpiredBatch}
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
