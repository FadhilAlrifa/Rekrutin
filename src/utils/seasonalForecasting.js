import { calculateDeductionInStorageUnit } from './stockValidator.js';
import { cleanIngredientName, findMatchingIngredient, calculateMenuCogs } from './cogsCalculator.js';

export const DEFAULT_SEASONAL_EVENTS = [
  {
    id: 'EVT-RAMADAN',
    name: 'Ramadan & Buka Bersama',
    category: 'religious',
    startDate: '2026-02-18',
    endDate: '2026-03-19',
    expectedLiftPct: 45,
    notes: 'Lonjakan pesanan minuman manis & paket bukber sore hingga malam'
  },
  {
    id: 'EVT-IDULFITRI',
    name: 'Idulfitri & Libur Lebaran',
    category: 'holiday',
    startDate: '2026-03-20',
    endDate: '2026-03-29',
    expectedLiftPct: 60,
    notes: 'Puncak kunjungan keluarga & hampers take-away'
  },
  {
    id: 'EVT-LIBUR-SEKOLAH',
    name: 'Libur Sekolah Tengah Tahun',
    category: 'school_holiday',
    startDate: '2026-06-20',
    endDate: '2026-07-12',
    expectedLiftPct: 30,
    notes: 'Kenaikan trafik siang hari segmen keluarga & pelajar'
  },
  {
    id: 'EVT-NATARU',
    name: 'Natal & Tahun Baru',
    category: 'holiday',
    startDate: '2026-12-20',
    endDate: '2027-01-03',
    expectedLiftPct: 50,
    notes: 'Peningkatan order dine-in & delivery malam akhir tahun'
  },
  {
    id: 'EVT-WEEKEND-PROMO',
    name: 'Promo Akhir Pekan (Gajian)',
    category: 'promo',
    startDate: '2026-11-20',
    endDate: '2026-11-29',
    expectedLiftPct: 25,
    notes: 'Dorongan volume kopi & snack bundling akhir pekan'
  }
];

function isNetValidTransaction(tx) {
  const kStatus = (tx?.kitchen_status || '').toLowerCase();
  const pStatus = (tx?.payment_status || '').toLowerCase();
  if (kStatus === 'cancelled' || kStatus === 'cancelled_waste') return false;
  if (pStatus === 'refunded') return false;
  return true;
}

function getBucketKey(dateObj, granularity) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');

  if (granularity === 'daily') return `${y}-${m}-${d}`;
  if (granularity === 'weekly') {
    const startOfWeek = new Date(dateObj);
    const day = startOfWeek.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    startOfWeek.setDate(startOfWeek.getDate() + diff);
    const wy = startOfWeek.getFullYear();
    const wm = String(startOfWeek.getMonth() + 1).padStart(2, '0');
    const wd = String(startOfWeek.getDate()).padStart(2, '0');
    return `${wy}-${wm}-${wd}`;
  }
  if (granularity === 'monthly') return `${y}-${m}`;
  return String(y);
}

function formatBucketLabel(key, granularity) {
  if (granularity === 'yearly') return key;
  if (granularity === 'monthly') {
    const [y, m] = key.split('-');
    const d = new Date(Number(y), Number(m) - 1, 1);
    return d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
  }
  const d = new Date(key + 'T00:00:00');
  if (granularity === 'weekly') {
    return 'Mgg ' + d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
  }
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
}

function generateRecentBuckets(granularity, referenceDate = new Date()) {
  const buckets = [];
  if (granularity === 'daily') {
    for (let i = 13; i >= 0; i--) {
      const d = new Date(referenceDate);
      d.setDate(d.getDate() - i);
      const key = getBucketKey(d, 'daily');
      buckets.push({ key, label: formatBucketLabel(key, 'daily') });
    }
  } else if (granularity === 'weekly') {
    for (let i = 7; i >= 0; i--) {
      const d = new Date(referenceDate);
      d.setDate(d.getDate() - i * 7);
      const key = getBucketKey(d, 'weekly');
      if (!buckets.some((b) => b.key === key)) {
        buckets.push({ key, label: formatBucketLabel(key, 'weekly') });
      }
    }
  } else if (granularity === 'monthly') {
    for (let i = 5; i >= 0; i--) {
      const d = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - i, 1);
      const key = getBucketKey(d, 'monthly');
      buckets.push({ key, label: formatBucketLabel(key, 'monthly') });
    }
  } else {
    for (let i = 2; i >= 0; i--) {
      const y = String(referenceDate.getFullYear() - i);
      buckets.push({ key: y, label: y });
    }
  }
  return buckets;
}

/**
 * Agregasi multi-periode (Harian / Mingguan / Bulanan / Tahunan) untuk Penjualan & Konsumsi Stok.
 */
export function aggregatePeriodAnalytics(
  transactions = [],
  stockMovements = [],
  granularity = 'daily',
  products = [],
  ingredients = []
) {
  const baseBuckets = generateRecentBuckets(granularity);
  const bucketMap = new Map();

  baseBuckets.forEach((b) => {
    bucketMap.set(b.key, {
      key: b.key,
      label: b.label,
      revenue: 0,
      orders: 0,
      itemsSold: 0,
      wasteCost: 0,
      stockOutQty: 0,
      stockInQty: 0
    });
  });

  const validTransactions = (transactions || []).filter(isNetValidTransaction);

  // Hitung waste dari transaksi cancelled_waste jika ada
  (transactions || []).forEach((tx) => {
    const dt = new Date(tx.created_at || Date.now());
    if (Number.isNaN(dt.getTime())) return;
    const key = getBucketKey(dt, granularity);
    const entry = bucketMap.get(key);
    if (!entry) return;
    if (tx.kitchen_status === 'cancelled_waste' && Number(tx.waste_cost) > 0) {
      entry.wasteCost += Number(tx.waste_cost) || 0;
    }
  });

  validTransactions.forEach((tx) => {
    const dt = new Date(tx.created_at || Date.now());
    if (Number.isNaN(dt.getTime())) return;
    const key = getBucketKey(dt, granularity);
    if (!bucketMap.has(key)) {
      bucketMap.set(key, {
        key,
        label: formatBucketLabel(key, granularity),
        revenue: 0,
        orders: 0,
        itemsSold: 0,
        wasteCost: 0,
        stockOutQty: 0,
        stockInQty: 0
      });
    }
    const bucket = bucketMap.get(key);
    bucket.revenue += Number(tx.total_amount) || 0;
    bucket.orders += 1;

    const items = Array.isArray(tx.items) ? tx.items : [];
    items.forEach((item) => {
      const qty = Number(item.qty) || 0;
      bucket.itemsSold += qty;

      // Hitung estimasi konsumsi bahan baku dari resep item (BOM)
      const matchedProduct =
        products.find((p) => String(p.id) === String(item.id) || p.name === item.name) || item;
      const recipe = Array.isArray(matchedProduct?.recipe) ? matchedProduct.recipe : [];
      recipe.forEach((rc) => {
        const ing = findMatchingIngredient(rc, ingredients);
        const ded = ing
          ? calculateDeductionInStorageUnit(rc.qty, rc.unit, ing.unit)
          : Number(rc.qty) || 0;
        bucket.stockOutQty += Number((ded * qty).toFixed(3));
      });
    });
  });

  // Perkaya data pergerakan stok masuk/keluar aktual dari stockMovements
  (stockMovements || []).forEach((mv) => {
    const dt = new Date(mv.createdAt || mv.created_at || Date.now());
    if (Number.isNaN(dt.getTime())) return;
    const key = getBucketKey(dt, granularity);
    const bucket = bucketMap.get(key);
    if (!bucket) return;

    const change = Number(mv.qtyChange ?? mv.qty_change ?? 0);
    if (change > 0) {
      bucket.stockInQty = Number((bucket.stockInQty + change).toFixed(2));
    } else if (change < 0 && mv.movementType !== 'BOM_SALE' && mv.movement_type !== 'BOM_SALE') {
      bucket.stockOutQty = Number((bucket.stockOutQty + Math.abs(change)).toFixed(2));
    }
  });

  const series = Array.from(bucketMap.values())
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((b) => ({
      ...b,
      revenue: Math.round(b.revenue),
      stockOutQty: Number(b.stockOutQty.toFixed(2)),
      stockInQty: Number(b.stockInQty.toFixed(2))
    }));

  const totals = series.reduce(
    (acc, row) => ({
      revenue: acc.revenue + row.revenue,
      orders: acc.orders + row.orders,
      itemsSold: acc.itemsSold + row.itemsSold,
      wasteCost: acc.wasteCost + row.wasteCost,
      stockOutQty: Number((acc.stockOutQty + row.stockOutQty).toFixed(2)),
      stockInQty: Number((acc.stockInQty + row.stockInQty).toFixed(2))
    }),
    { revenue: 0, orders: 0, itemsSold: 0, wasteCost: 0, stockOutQty: 0, stockInQty: 0 }
  );

  return { series, totals };
}

/**
 * Bandingkan Baseline Hari Normal vs. Event Musiman (Seasonal Lift %).
 */
export function analyzeSeasonalPerformance(
  transactions = [],
  seasonalEvents = DEFAULT_SEASONAL_EVENTS
) {
  const validTx = (transactions || []).filter(isNetValidTransaction);
  const dailyMap = new Map();

  validTx.forEach((tx) => {
    const iso = new Date(tx.created_at || Date.now()).toISOString().slice(0, 10);
    const prev = dailyMap.get(iso) || { revenue: 0, orders: 0 };
    dailyMap.set(iso, {
      revenue: prev.revenue + (Number(tx.total_amount) || 0),
      orders: prev.orders + 1
    });
  });

  const activeDays = Math.max(1, dailyMap.size);
  const totalRevenue = Array.from(dailyMap.values()).reduce((s, d) => s + d.revenue, 0);
  const baselineDailyRevenue = totalRevenue > 0 ? Math.round(totalRevenue / activeDays) : 450000;

  return (seasonalEvents || []).map((evt) => {
    const matchingTx = validTx.filter((tx) => {
      const iso = new Date(tx.created_at || Date.now()).toISOString().slice(0, 10);
      return iso >= evt.startDate && iso <= evt.endDate;
    });

    const eventDaysSet = new Set(
      matchingTx.map((tx) => new Date(tx.created_at || Date.now()).toISOString().slice(0, 10))
    );
    const actualRev = matchingTx.reduce((s, t) => s + (Number(t.total_amount) || 0), 0);
    const actualDailyRev =
      eventDaysSet.size > 0 ? Math.round(actualRev / eventDaysSet.size) : null;

    const observedLiftPct =
      actualDailyRev !== null && baselineDailyRevenue > 0
        ? Number((((actualDailyRev - baselineDailyRevenue) / baselineDailyRevenue) * 100).toFixed(1))
        : null;

    const effectiveLiftPct = observedLiftPct !== null ? observedLiftPct : Number(evt.expectedLiftPct || 25);
    const projectedDailyRevenue =
      actualDailyRev !== null
        ? actualDailyRev
        : Math.round(baselineDailyRevenue * (1 + Number(evt.expectedLiftPct || 25) / 100));

    return {
      ...evt,
      hasActualData: matchingTx.length > 0,
      actualOrdersCount: matchingTx.length,
      baselineDailyRevenue,
      projectedDailyRevenue,
      effectiveLiftPct,
      observedLiftPct
    };
  });
}

/**
 * Kalkulasi Proyeksi Kebutuhan Stok Bahan Baku (Demand Forecasting) & Saran Aksi.
 */
export function computeSeasonalDemandForecast(
  ingredients = [],
  products = [],
  transactions = [],
  stockMovements = [],
  seasonalEvents = DEFAULT_SEASONAL_EVENTS,
  selectedEventId = '',
  horizonDays = 14,
  seasonMode = 'peak' // 'peak' | 'normal' | 'low'
) {
  const validTx = (transactions || []).filter(isNetValidTransaction);
  const selectedEvent =
    seasonalEvents.find((e) => e.id === selectedEventId) || seasonalEvents[0] || null;

  const liftPct =
    seasonMode === 'low'
      ? -20
      : seasonMode === 'normal'
      ? 0
      : Number(selectedEvent?.expectedLiftPct ?? 30);

  const liftMultiplier = Math.max(0.4, 1 + liftPct / 100);

  // Hitung total hari observasi historis
  const daySet = new Set(
    validTx.map((tx) => new Date(tx.created_at || Date.now()).toISOString().slice(0, 10))
  );
  const observationDays = Math.max(1, daySet.size);

  // Agregasi pemakaian aktual per ingredient dari transaksi POS + mutasi keluar
  const usageMap = new Map();
  validTx.forEach((tx) => {
    const items = Array.isArray(tx.items) ? tx.items : [];
    items.forEach((item) => {
      const qty = Number(item.qty) || 0;
      const prod =
        products.find((p) => String(p.id) === String(item.id) || p.name === item.name) || item;
      const recipe = Array.isArray(prod?.recipe) ? prod.recipe : [];
      recipe.forEach((rc) => {
        const ing = findMatchingIngredient(rc, ingredients);
        if (!ing) return;
        const ded = calculateDeductionInStorageUnit(rc.qty, rc.unit, ing.unit);
        const key = String(ing.id);
        usageMap.set(key, (usageMap.get(key) || 0) + ded * qty);
      });
    });
  });

  (stockMovements || []).forEach((mv) => {
    const change = Number(mv.qtyChange ?? mv.qty_change ?? 0);
    if (change < 0 && mv.ingredientId) {
      const key = String(mv.ingredientId);
      // Hindari double-count jika berasal dari BOM_SALE yang sudah dihitung dari transaksi
      if (mv.movementType !== 'BOM_SALE' && mv.movement_type !== 'BOM_SALE') {
        usageMap.set(key, (usageMap.get(key) || 0) + Math.abs(change));
      }
    }
  });

  const ingredientForecasts = (ingredients || []).map((ing) => {
    const currentStock = Number(ing.stock) || 0;
    const minLimit = Number(ing.minLimit ?? 5);
    const unitPrice = Number(ing.unitPrice || 0);
    const totalObservedUsage = usageMap.get(String(ing.id)) || 0;

    // Jika belum ada transaksi pada bahan ini, estimasikan baseline konservatif dari 15% buffer per hari
    const baselineDailyUsage =
      totalObservedUsage > 0
        ? totalObservedUsage / observationDays
        : Math.max(0.15, minLimit * 0.15);

    const projectedNeed = Number((baselineDailyUsage * horizonDays * liftMultiplier).toFixed(2));
    const recommendedBuffer = Number(
      Math.max(minLimit, projectedNeed * (seasonMode === 'peak' ? 0.35 : 0.2)).toFixed(2)
    );
    const targetStock = Number((projectedNeed + recommendedBuffer * 0.4).toFixed(2));
    const deficitQty = Number(Math.max(0, targetStock - currentStock).toFixed(2));

    let bufferAction = 'Pertahankan Buffer';
    if (seasonMode === 'low' && currentStock > targetStock * 1.4) {
      bufferAction = 'Kurangi Order (Low-Season)';
    } else if (deficitQty > 0 || (seasonMode === 'peak' && recommendedBuffer > minLimit)) {
      bufferAction = 'Naikkan Buffer & Restock';
    }

    return {
      ingredientId: ing.id,
      name: cleanIngredientName(ing.name),
      unit: ing.unit || 'pcs',
      currentStock,
      minLimit,
      unitPrice,
      baselineDailyUsage: Number(baselineDailyUsage.toFixed(2)),
      projectedNeed,
      recommendedBuffer,
      deficitQty,
      restockBudgetEstimate: Math.round(deficitQty * unitPrice),
      bufferAction,
      hasActualUsage: totalObservedUsage > 0
    };
  });

  const menuRecommendations = (products || [])
    .map((p) => {
      const cogsRes = calculateMenuCogs(p, ingredients);
      let strategy = 'Pertahankan di Menu';
      if (seasonMode === 'peak' && cogsRes.grossMarginPct >= 50) {
        strategy = 'Dorong Promo & Upsell Musiman';
      } else if (cogsRes.grossMarginPct < 35) {
        strategy = 'Evaluasi HPP / Paket Bundling';
      }
      return {
        id: p.id,
        name: p.name,
        category: p.category,
        grossMarginPct: cogsRes.grossMarginPct,
        grossProfit: cogsRes.grossProfit,
        strategy
      };
    })
    .sort((a, b) => b.grossMarginPct - a.grossMarginPct)
    .slice(0, 6);

  const raiseBufferCount = ingredientForecasts.filter(
    (f) => f.bufferAction === 'Naikkan Buffer & Restock'
  ).length;
  const reduceStockCount = ingredientForecasts.filter(
    (f) => f.bufferAction === 'Kurangi Order (Low-Season)'
  ).length;
  const priorityRestockCost = ingredientForecasts.reduce(
    (sum, f) => sum + f.restockBudgetEstimate,
    0
  );

  return {
    selectedEvent,
    horizonDays,
    seasonMode,
    liftPct,
    liftMultiplier: Number(liftMultiplier.toFixed(2)),
    ingredientForecasts: ingredientForecasts.sort((a, b) => b.deficitQty - a.deficitQty),
    menuRecommendations,
    summary: {
      raiseBufferCount,
      reduceStockCount,
      priorityRestockCost
    }
  };
}
