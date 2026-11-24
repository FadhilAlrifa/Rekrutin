import { getExpiryDays, parseLocalDate } from './inventoryStatus.js';

function roundStock(val) {
  return Math.max(0, Number((Number(val) || 0).toFixed(3)));
}

function getDateSortKey(dateStr) {
  const parsed = parseLocalDate(dateStr);
  return parsed ? parsed.getTime() : Number.MAX_SAFE_INTEGER;
}

/**
 * Mengurutkan batch sesuai aturan FEFO (First Expired, First Out):
 * 1. Tanggal kedaluwarsa paling awal lebih dulu (batch tanpa expiry date di urutan akhir).
 * 2. Jika tanggal kedaluwarsa sama, urutkan berdasarkan entryDate / createdAt paling lama (FIFO).
 */
export function sortBatchesFefo(batches = []) {
  return [...(batches || [])].sort((a, b) => {
    const expA = getDateSortKey(a?.expiryDate);
    const expB = getDateSortKey(b?.expiryDate);
    if (expA !== expB) return expA - expB;

    const entryA = getDateSortKey(a?.entryDate || a?.createdAt);
    const entryB = getDateSortKey(b?.entryDate || b?.createdAt);
    if (entryA !== entryB) return entryA - entryB;

    return String(a?.id || '').localeCompare(String(b?.id || ''));
  });
}

/**
 * Membuat 1 batch fallback yang aman apabila bahan baku lama belum memiliki array batches.
 */
export function ensureBatchesForIngredient(ingredient) {
  const existing = Array.isArray(ingredient?.batches) ? ingredient.batches : [];
  if (existing.length > 0) {
    return sortBatchesFefo(
      existing.map((b) => ({
        ...b,
        ingredientId: String(b.ingredientId ?? ingredient?.id ?? ''),
        qty: roundStock(b.qty),
        initialQty: roundStock(b.initialQty ?? b.qty)
      }))
    );
  }

  const stock = roundStock(ingredient?.stock);
  if (stock <= 0) return [];

  return [
    {
      id: `BATCH-LEGACY-${ingredient?.id || 'ITEM'}`,
      ingredientId: String(ingredient?.id || ''),
      batchCode: 'BATCH-AWAL',
      qty: stock,
      initialQty: stock,
      unit: ingredient?.unit || 'pcs',
      entryDate: ingredient?.entryDate || '',
      expiryDate: ingredient?.expiryDate || '',
      stockerName: 'Stok Awal',
      notes: 'Batch eksisting sebelum pencatatan multi-batch',
      disposedAsWaste: false,
      createdAt: ingredient?.entryDate || new Date().toISOString()
    }
  ];
}

/**
 * Ringkasan status seluruh batch milik satu bahan baku (terpisah antara batch layak pakai & batch expired).
 */
export function summarizeIngredientBatches(ingredient, referenceDate = new Date()) {
  const allBatches = ensureBatchesForIngredient(ingredient);
  const activeBatches = sortBatchesFefo(
    allBatches.filter((b) => roundStock(b.qty) > 0 && !b.disposedAsWaste)
  );

  const expiredBatches = [];
  const usableBatches = [];

  activeBatches.forEach((b) => {
    const diffDays = getExpiryDays(b.expiryDate, referenceDate);
    if (diffDays !== null && diffDays < 0) {
      expiredBatches.push({ ...b, diffDays, expiryStatus: 'expired' });
    } else {
      const expiryStatus =
        diffDays !== null && diffDays <= 30 ? 'hampir' : 'aman';
      usableBatches.push({ ...b, diffDays, expiryStatus });
    }
  });

  const totalStock = roundStock(
    activeBatches.reduce((sum, b) => sum + roundStock(b.qty), 0)
  );
  const usableStock = roundStock(
    usableBatches.reduce((sum, b) => sum + roundStock(b.qty), 0)
  );
  const expiredStock = roundStock(
    expiredBatches.reduce((sum, b) => sum + roundStock(b.qty), 0)
  );

  const earliestActive = activeBatches.find((b) => Boolean(b.expiryDate)) || activeBatches[0] || null;
  const earliestUsable = usableBatches.find((b) => Boolean(b.expiryDate)) || usableBatches[0] || null;

  return {
    allBatches,
    activeBatches,
    usableBatches,
    expiredBatches,
    totalStock,
    usableStock,
    expiredStock,
    earliestActiveExpiryDate: earliestActive?.expiryDate || ingredient?.expiryDate || '',
    earliestUsableExpiryDate: earliestUsable?.expiryDate || '',
    batchCount: activeBatches.length,
    expiredBatchCount: expiredBatches.length
  };
}

/**
 * Generate kode batch unik & mudah dibaca oleh Stocker/Owner.
 */
export function generateBatchCode(entryDate, existingCount = 0) {
  const d = parseLocalDate(entryDate) || new Date();
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const seq = String(existingCount + 1).padStart(2, '0');
  return `B-${yy}${mm}${dd}-${seq}`;
}

/**
 * Menambahkan batch baru saat Stock-In tanpa menimpa tanggal kedaluwarsa batch sebelumnya.
 */
export function addStockInBatch(
  ingredient,
  {
    addedQty,
    entryDate = '',
    expiryDate = '',
    stockerName = 'Petugas Gudang',
    notes = 'Penerimaan barang masuk gudang'
  },
  referenceDate = new Date()
) {
  const qtyToAdd = roundStock(addedQty);
  const baseBatches = ensureBatchesForIngredient(ingredient);

  const newBatch = {
    id: `BATCH-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    ingredientId: String(ingredient?.id || ''),
    batchCode: generateBatchCode(entryDate, baseBatches.length),
    qty: qtyToAdd,
    initialQty: qtyToAdd,
    unit: ingredient?.unit || 'pcs',
    entryDate: entryDate || new Date().toISOString().slice(0, 10),
    expiryDate: expiryDate || '',
    stockerName: stockerName || 'Petugas Gudang',
    notes,
    disposedAsWaste: false,
    createdAt: new Date().toISOString()
  };

  const nextBatches = sortBatchesFefo([...baseBatches, newBatch]);
  const updatedBase = { ...ingredient, batches: nextBatches };
  const summary = summarizeIngredientBatches(updatedBase, referenceDate);

  return {
    updatedIngredient: {
      ...ingredient,
      stock: summary.totalStock,
      expiryDate: summary.earliestActiveExpiryDate,
      entryDate: entryDate || ingredient?.entryDate || '',
      batches: nextBatches
    },
    newBatch,
    summary
  };
}

/**
 * Pemotongan stok bahan baku mengikuti aturan FEFO (First Expired, First Out):
 * - Hanya mengurangi batch yang belum kedaluwarsa (non-expired), mulai dari tanggal expired paling awal.
 * - Setelah batch terdekat habis (qty = 0), otomatis lanjut memotong batch berikutnya dan memperbarui expiryDate aktif.
 */
export function deductBatchesFefo(ingredient, deductAmount, referenceDate = new Date()) {
  const reqAmount = roundStock(deductAmount);
  const baseBatches = ensureBatchesForIngredient(ingredient);

  if (baseBatches.length === 0 || reqAmount <= 0) {
    return {
      updatedIngredient: { ...ingredient, batches: baseBatches },
      deductedTotal: 0,
      unfulfilledQty: reqAmount,
      allocations: []
    };
  }

  let remainingToDeduct = reqAmount;
  const allocations = [];

  // Urutkan FEFO; utamakan batch aktif yang belum expired
  const nextBatches = baseBatches.map((batch) => {
    const curQty = roundStock(batch.qty);
    if (curQty <= 0 || batch.disposedAsWaste || remainingToDeduct <= 0) {
      return batch;
    }

    const diffDays = getExpiryDays(batch.expiryDate, referenceDate);
    const isExpired = diffDays !== null && diffDays < 0;
    if (isExpired) {
      return batch; // Jangan pakai batch yang sudah expired untuk penjualan POS
    }

    const take = roundStock(Math.min(curQty, remainingToDeduct));
    const afterQty = roundStock(curQty - take);
    remainingToDeduct = roundStock(remainingToDeduct - take);

    allocations.push({
      batchId: batch.id,
      batchCode: batch.batchCode,
      expiryDate: batch.expiryDate || '-',
      deductedQty: take,
      remainingAfter: afterQty
    });

    return {
      ...batch,
      qty: afterQty,
      updatedAt: new Date().toISOString()
    };
  });

  const sortedNext = sortBatchesFefo(nextBatches);
  const summary = summarizeIngredientBatches({ ...ingredient, batches: sortedNext }, referenceDate);
  const deductedTotal = roundStock(reqAmount - remainingToDeduct);

  return {
    updatedIngredient: {
      ...ingredient,
      stock: summary.totalStock,
      expiryDate: summary.earliestActiveExpiryDate || ingredient?.expiryDate || '',
      batches: sortedNext
    },
    deductedTotal,
    unfulfilledQty: remainingToDeduct,
    allocations,
    summary
  };
}

/**
 * Mengembalikan stok ke batch saat pembatalan pesanan (RESTOCK_REVERSAL).
 * Mengutamakan batch non-expired aktif yang masih ada, atau membuat batch reversal bila seluruhnya kosong.
 */
export function restoreBatchesFefo(ingredient, restoreAmount, referenceDate = new Date()) {
  const addBack = roundStock(restoreAmount);
  if (addBack <= 0) return { updatedIngredient: ingredient };

  const baseBatches = ensureBatchesForIngredient(ingredient);
  const targetIdx = baseBatches.findIndex((b) => {
    const diffDays = getExpiryDays(b.expiryDate, referenceDate);
    return !b.disposedAsWaste && (diffDays === null || diffDays >= 0);
  });

  let nextBatches;
  if (targetIdx >= 0) {
    nextBatches = baseBatches.map((b, idx) =>
      idx === targetIdx
        ? { ...b, qty: roundStock(Number(b.qty) + addBack), updatedAt: new Date().toISOString() }
        : b
    );
  } else {
    nextBatches = [
      ...baseBatches,
      {
        id: `BATCH-REV-${Date.now()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
        ingredientId: String(ingredient?.id || ''),
        batchCode: generateBatchCode(new Date().toISOString().slice(0, 10), baseBatches.length),
        qty: addBack,
        initialQty: addBack,
        unit: ingredient?.unit || 'pcs',
        entryDate: new Date().toISOString().slice(0, 10),
        expiryDate: ingredient?.expiryDate || '',
        stockerName: 'Reversal Kasir',
        notes: 'Pengembalian stok dari pembatalan pesanan',
        disposedAsWaste: false,
        createdAt: new Date().toISOString()
      }
    ];
  }

  const sortedNext = sortBatchesFefo(nextBatches);
  const summary = summarizeIngredientBatches({ ...ingredient, batches: sortedNext }, referenceDate);

  return {
    updatedIngredient: {
      ...ingredient,
      stock: summary.totalStock,
      expiryDate: summary.earliestActiveExpiryDate || ingredient?.expiryDate || '',
      batches: sortedNext
    },
    summary
  };
}

/**
 * Menarik / membuang batch yang sudah kedaluwarsa sebagai Waste (tidak boleh dipakai produksi/POS).
 */
export function disposeExpiredBatchAsWaste(ingredient, batchId, referenceDate = new Date()) {
  const baseBatches = ensureBatchesForIngredient(ingredient);
  let disposedBatch = null;
  let disposedQty = 0;

  const nextBatches = baseBatches.map((b) => {
    if (String(b.id) === String(batchId)) {
      disposedQty = roundStock(b.qty);
      disposedBatch = { ...b };
      return {
        ...b,
        qty: 0,
        disposedAsWaste: true,
        updatedAt: new Date().toISOString()
      };
    }
    return b;
  });

  const sortedNext = sortBatchesFefo(nextBatches);
  const summary = summarizeIngredientBatches({ ...ingredient, batches: sortedNext }, referenceDate);

  return {
    updatedIngredient: {
      ...ingredient,
      stock: summary.totalStock,
      expiryDate: summary.earliestActiveExpiryDate,
      batches: sortedNext
    },
    disposedQty,
    disposedBatch,
    summary
  };
}
