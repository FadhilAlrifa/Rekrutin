import { calculateDeductionInStorageUnit } from './stockValidator.js';
import { cleanIngredientName, findMatchingIngredient, calculateMenuCogs } from './cogsCalculator.js';

export const ORDER_CHANNEL_LABELS = {
  dine_in: 'Dine-In',
  take_away: 'Take-Away',
  online_closed_kitchen: 'Online Order'
};

export const PAYMENT_FLOW_LABELS = {
  pay_first: 'Pay First (Bayar Awal)',
  pay_later: 'Pay Later (Open Bill)'
};

export const KITCHEN_STATUS_META = {
  queued: {
    label: 'Antrean Dapur',
    badgeClass: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]'
  },
  preparing: {
    label: 'Sedang Dimasak',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200'
  },
  ready: {
    label: 'Siap Saji',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  served: {
    label: 'Selesai Disajikan',
    badgeClass: 'bg-zinc-100 text-[#141414] border-zinc-200'
  },
  cancelled: {
    label: 'Dibatalkan (Stok Utuh)',
    badgeClass: 'bg-zinc-100 text-[#52525B] border-zinc-200'
  },
  cancelled_waste: {
    label: 'Batal Pasca-Proses (Waste)',
    badgeClass: 'bg-red-50 text-red-700 border-red-200'
  }
};

/**
 * Hitung kebutuhan bahan baku (dalam satuan gudang) untuk daftar item pesanan.
 */
export function computeBomRequirementsForItems(items = [], ingredients = []) {
  const reqMap = new Map();

  (items || []).forEach((item) => {
    const qty = Number(item?.qty) || 0;
    if (qty <= 0 || !Array.isArray(item?.recipe)) return;

    item.recipe.forEach((rc) => {
      const matched = findMatchingIngredient(rc, ingredients);
      if (!matched) return;
      const perUnit = calculateDeductionInStorageUnit(rc.qty, rc.unit, matched.unit);
      const totalAmt = perUnit * qty;
      if (totalAmt <= 0) return;

      const key = String(matched.id);
      const prev = reqMap.get(key) || {
        ingredientId: matched.id,
        ingredientName: cleanIngredientName(matched.name),
        unit: matched.unit,
        unitPrice: Number(matched.unitPrice || 0),
        amount: 0
      };
      prev.amount = Number((prev.amount + totalAmt).toFixed(3));
      reqMap.set(key, prev);
    });
  });

  return Array.from(reqMap.values());
}

/**
 * Hitung kebutuhan pengurangan stok SKU barang jadi langsung (untuk mode Ritel).
 */
export function computeRetailSkuRequirementsForItems(items = [], products = [], businessType = 'fnb') {
  const reqMap = new Map();

  (items || []).forEach((item) => {
    const qty = Number(item?.qty) || 0;
    if (qty <= 0) return;

    const matchedProd =
      products.find((p) => String(p.id) === String(item.id)) || item;
    const hasBom = Array.isArray(matchedProd?.recipe) && matchedProd.recipe.length > 0;
    const isRetailItem =
      matchedProd?.productMode === 'retail' || (businessType === 'retail' && !hasBom);

    if (!isRetailItem) return;

    const key = String(matchedProd.id);
    const prev = reqMap.get(key) || {
      productId: matchedProd.id,
      productName: matchedProd.name,
      sku: matchedProd.sku || '',
      unit: matchedProd.unit || 'pcs',
      purchasePrice: Number(matchedProd.purchasePrice || 0),
      amount: 0
    };
    prev.amount = Number((prev.amount + qty).toFixed(3));
    reqMap.set(key, prev);
  });

  return Array.from(reqMap.values());
}

/**
 * Hitung total kerugian HPP (waste_cost) dari daftar item pesanan.
 */
export function calculateOrderItemsWasteCost(items = [], ingredients = []) {
  return (items || []).reduce((sum, item) => {
    const qty = Number(item?.qty) || 0;
    if (qty <= 0) return sum;
    const { cogs } = calculateMenuCogs(item, ingredients);
    // Jika belum ada resep/harga bahan, gunakan estimasi konservatif 40% dari harga jual agar waste terpantau
    const unitCost = cogs > 0 ? cogs : Math.round((Number(item.price) || 0) * 0.4);
    return sum + unitCost * qty;
  }, 0);
}

/**
 * Hitung selisih kebutuhan bahan baku antara daftar item lama dan baru (untuk Open Bill / Nota Coret).
 * Nilai positif = perlu potong tambahan dari stok; nilai negatif = kembalikan ke stok.
 */
export function computeBomDeltaBetweenItems(prevItems = [], nextItems = [], ingredients = []) {
  const prevReqs = computeBomRequirementsForItems(prevItems, ingredients);
  const nextReqs = computeBomRequirementsForItems(nextItems, ingredients);
  const deltaMap = new Map();

  nextReqs.forEach((r) => {
    deltaMap.set(String(r.ingredientId), {
      ...r,
      deltaAmount: r.amount
    });
  });

  prevReqs.forEach((r) => {
    const key = String(r.ingredientId);
    const cur = deltaMap.get(key);
    if (cur) {
      cur.deltaAmount = Number((cur.deltaAmount - r.amount).toFixed(3));
    } else {
      deltaMap.set(key, {
        ...r,
        deltaAmount: Number((-r.amount).toFixed(3))
      });
    }
  });

  return Array.from(deltaMap.values()).filter((d) => Math.abs(d.deltaAmount) > 0);
}

/**
 * Buat objek order awal sesuai Merchant Workflow Settings (Pay First / Pay Later / Closed Kitchen).
 */
export function createOrderPayload({
  items = [],
  orderChannel = 'dine_in',
  paymentFlow = 'pay_first',
  paymentMethod = 'cash',
  tableNumber = 'Kasir Utama',
  customerName = '',
  operator = { id: 'kasir-1', name: 'Kasir Aktif', role: 'kasir' },
  outlet = 'Cabang Utama - Makassar',
  isClosedKitchenOrder = false
}) {
  const totalAmount = items.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 0),
    0
  );
  const now = new Date().toISOString();
  const orderNum = `ORD-${Date.now().toString().slice(-6)}`;

  const resolvedChannel = isClosedKitchenOrder ? 'online_closed_kitchen' : orderChannel;
  const isPayLater = paymentFlow === 'pay_later' && !isClosedKitchenOrder;

  return {
    id: `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    orderNumber: orderNum,
    orderChannel: resolvedChannel,
    paymentFlow: isClosedKitchenOrder ? 'pay_first' : paymentFlow,
    orderStatus: isPayLater ? 'open' : 'active',
    paymentStatus: isPayLater ? 'unpaid' : 'paid',
    kitchenStatus: isPayLater ? 'preparing' : 'queued',
    paymentMethod: isPayLater ? 'open_bill' : paymentMethod,
    tableNumber:
      resolvedChannel === 'online_closed_kitchen'
        ? 'Online Order'
        : tableNumber || 'Kasir Utama',
    customerName: customerName.trim(),
    totalAmount,
    wasteCost: 0,
    cashierId: operator?.id || 'kasir-shift',
    cashierName: operator?.name || 'Kasir Aktif',
    cashierRole: operator?.role || 'kasir',
    stockDeducted: false,
    items: items.map((item) => ({
      ...item,
      qty: Number(item.qty) || 1
    })),
    revisionHistory: [],
    cancelReason: '',
    outlet,
    createdAt: now,
    updatedAt: now
  };
}

/**
 * Resolusi aturan Pembatalan Pesanan:
 * - Kondisi A ('before_cooking'): Dibatalkan sebelum dimasak -> status 'cancelled', refund, stok utuh/dikembalikan.
 * - Kondisi B ('after_cooking'): Dibatalkan sesudah diproses dapur -> status 'cancelled_waste', hitung waste_cost, stok tetap terpotong.
 */
export function resolveOrderCancellation({
  order,
  condition = 'before_cooking',
  reason = '',
  operator = { id: 'kasir-1', name: 'Kasir Aktif', role: 'kasir' },
  ingredients = []
}) {
  const now = new Date().toISOString();
  const isAlreadyProcessed =
    order?.kitchenStatus === 'preparing' ||
    order?.kitchenStatus === 'ready' ||
    order?.kitchenStatus === 'served';
  const isPostProduction = isAlreadyProcessed || condition === 'after_cooking';

  const wasteCost = isPostProduction
    ? calculateOrderItemsWasteCost(order.items, ingredients)
    : 0;

  let stockAction;
  if (isPostProduction) {
    stockAction = order.stockDeducted ? 'keep_as_waste' : 'deduct_as_waste';
  } else {
    stockAction = order.stockDeducted ? 'restore' : 'none';
  }

  const nextPaymentStatus = order.paymentStatus === 'paid' ? 'refunded' : 'unpaid';

  const updatedOrder = {
    ...order,
    orderStatus: isPostProduction ? 'cancelled_waste' : 'cancelled',
    kitchenStatus: isPostProduction ? 'cancelled_waste' : 'cancelled',
    paymentStatus: nextPaymentStatus,
    wasteCost,
    stockDeducted: isPostProduction ? true : false,
    cancelReason: reason.trim() || (isPostProduction ? 'Batal setelah diproses dapur' : 'Batal sebelum dimasak'),
    revisionHistory: [
      {
        id: `REV-${Date.now()}`,
        type: isPostProduction ? 'CANCEL_WASTE' : 'CANCEL_BEFORE_COOK',
        timestamp: now,
        operatorName: operator?.name || 'Kasir Aktif',
        operatorRole: operator?.role || 'kasir',
        reason: reason.trim() || 'Pembatalan pesanan',
        beforeTotal: Number(order.totalAmount) || 0,
        afterTotal: 0,
        wasteCost,
        summary: isPostProduction
          ? `Order dibatalkan pasca-produksi (Waste HPP: Rp ${wasteCost.toLocaleString('id-ID')})`
          : 'Order dibatalkan sebelum masuk proses dapur (Stok bahan aman/dikembalikan)'
      },
      ...(order.revisionHistory || [])
    ],
    updatedAt: now
  };

  return {
    updatedOrder,
    stockAction,
    wasteCost,
    bomRequirements: computeBomRequirementsForItems(order.items, ingredients)
  };
}

/**
 * Resolusi "Nota Coret" (Modifikasi / Pengurangan / Penambahan Item pada Order Aktif).
 * Mencatat revisi secara transparan di revisionHistory tanpa menghapus jejak nota lama.
 */
export function resolveOrderModification({
  order,
  nextItems = [],
  reason = '',
  operator = { id: 'kasir-1', name: 'Kasir Aktif', role: 'kasir' },
  ingredients = [],
  treatRemovedAsWaste = false
}) {
  const now = new Date().toISOString();
  const sanitizedNextItems = (nextItems || []).filter((i) => Number(i.qty) > 0);
  const removedOrReduced = [];

  (order.items || []).forEach((oldItem) => {
    const matched = sanitizedNextItems.find((n) => String(n.id) === String(oldItem.id));
    if (!matched) {
      removedOrReduced.push({
        name: oldItem.name,
        oldQty: oldItem.qty,
        newQty: 0,
        price: oldItem.price
      });
    } else if (Number(matched.qty) < Number(oldItem.qty)) {
      removedOrReduced.push({
        name: oldItem.name,
        oldQty: oldItem.qty,
        newQty: matched.qty,
        price: oldItem.price
      });
    }
  });

  const beforeTotal = Number(order.totalAmount) || 0;
  const afterTotal = sanitizedNextItems.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 0),
    0
  );

  // Jika item yang dicoret sudah sempat dimasak, hitung wasteCost tambahan
  let addedWasteCost = 0;
  if (treatRemovedAsWaste && removedOrReduced.length > 0) {
    const wasteItems = removedOrReduced.map((r) => {
      const orig = (order.items || []).find((o) => o.name === r.name);
      return {
        ...orig,
        qty: Math.max(0, Number(r.oldQty) - Number(r.newQty))
      };
    });
    addedWasteCost = calculateOrderItemsWasteCost(wasteItems, ingredients);
  }

  const bomDeltas = computeBomDeltaBetweenItems(order.items, sanitizedNextItems, ingredients);

  const revisionEntry = {
    id: `CORET-${Date.now()}`,
    type: 'NOTA_CORET',
    timestamp: now,
    operatorName: operator?.name || 'Kasir Aktif',
    operatorRole: operator?.role || 'kasir',
    reason: reason.trim() || 'Revisi pesanan pelanggan (Nota Coret)',
    beforeTotal,
    afterTotal,
    removedOrReduced,
    wasteCost: addedWasteCost,
    summary:
      removedOrReduced.length > 0
        ? `Dicoret: ${removedOrReduced.map((r) => `${r.name} (${r.oldQty}→${r.newQty})`).join(', ')}`
        : `Penyesuaian item pesanan (Rp ${beforeTotal.toLocaleString('id-ID')} → Rp ${afterTotal.toLocaleString('id-ID')})`
  };

  return {
    updatedOrder: {
      ...order,
      items: sanitizedNextItems,
      totalAmount: afterTotal,
      wasteCost: (Number(order.wasteCost) || 0) + addedWasteCost,
      revisionHistory: [revisionEntry, ...(order.revisionHistory || [])],
      updatedAt: now
    },
    revisionEntry,
    bomDeltas,
    addedWasteCost
  };
}
