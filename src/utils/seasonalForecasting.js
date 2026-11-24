import { calculateDeductionInStorageUnit } from './stockValidator.js';
import {
  cleanIngredientName,
  findMatchingIngredient,
  calculateMenuCogs,
  resolveIngredientMarketPrice,
  resolveIngredientInitialPrice
} from './cogsCalculator.js';
import { parseLocalDate } from './inventoryStatus.js';

export const HOLIDAY_REMINDER_WINDOW_DAYS = 14;

export const DEFAULT_SEASONAL_EVENTS = [
  {
    id: 'EVT-IMLEK',
    name: 'Tahun Baru Imlek',
    category: 'holiday',
    startDate: '2026-02-17',
    endDate: '2026-02-18',
    expectedLiftPct: 35,
    notes: 'Persiapan bahan minuman & bingkisan keluarga menjelang Imlek'
  },
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
    notes: 'Puncak kunjungan keluarga & supplier banyak libur saat lebaran'
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
    id: 'EVT-HUT-RI',
    name: 'Hari Kemerdekaan RI (17 Agustus)',
    category: 'holiday',
    startDate: '2026-08-17',
    endDate: '2026-08-18',
    expectedLiftPct: 35,
    notes: 'Promo spesial kemerdekaan & peningkatan order komunitas'
  },
  {
    id: 'EVT-HARBOLNAS',
    name: 'Libur & Promo Akhir Tahun (12.12)',
    category: 'holiday',
    startDate: '2026-12-08',
    endDate: '2026-12-13',
    expectedLiftPct: 40,
    notes: 'Persiapan stok & update daftar harga sebelum pengiriman akhir tahun padat'
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
    const unitPrice = resolveIngredientMarketPrice(ing);
    const totalObservedUsage = usageMap.get(String(ing.id)) || 0;

    // Jika belum ada transaksi pada bahan ini, estimasikan baseline konservatif dari 15% buffer per hari
    const baselineDailyUsage =
      totalObservedUsage > 0
        ? totalObservedUsage / observationDays
        : Math.max(0.15, minLimit * 0.15);

    const projectedNeed = Number((baselineDailyUsage * horizonDays * liftMultiplier).toFixed(2));
    // Acuan Buffer Stock TETAP berbasis data riwayat historis (tidak diubah oleh event/hari besar)
    const recommendedBuffer = Number(minLimit.toFixed(2));
    const targetStock = Number((projectedNeed + recommendedBuffer).toFixed(2));
    const deficitQty = Number(Math.max(0, targetStock - currentStock).toFixed(2));

    let bufferAction = 'Stok & Buffer Aman';
    if (seasonMode === 'low' && currentStock > targetStock * 1.4) {
      bufferAction = 'Pantau Stok (Low-Season)';
    } else if (deficitQty > 0 || seasonMode === 'peak') {
      bufferAction = 'Siapkan Restock (Buffer Tetap)';
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
      bufferBasis: 'historical_fixed',
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
    (f) => f.bufferAction === 'Siapkan Restock (Buffer Tetap)'
  ).length;
  const reduceStockCount = ingredientForecasts.filter(
    (f) => f.bufferAction === 'Pantau Stok (Low-Season)'
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

function parseQtyFromLogText(qtyLabel) {
  const match = String(qtyLabel || '').match(/[-+]?\d+(?:[.,]\d+)?/);
  if (!match) return 0;
  return Math.abs(Number(match[0].replace(',', '.')) || 0);
}

/**
 * Hitung daftar reminder H-14 sebelum hari besar/event terdaftar.
 * Reminder aktif ketika 0 <= hari menuju startDate <= windowDays (default H-14).
 */
export function getUpcomingHolidayReminders(
  seasonalEvents = DEFAULT_SEASONAL_EVENTS,
  referenceDate = new Date(),
  windowDays = HOLIDAY_REMINDER_WINDOW_DAYS
) {
  const today = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate(),
    0,
    0,
    0,
    0
  );

  const enriched = (seasonalEvents || [])
    .map((evt) => {
      const startDt = parseLocalDate(evt?.startDate);
      if (!startDt) return null;
      const endDt = parseLocalDate(evt?.endDate) || startDt;
      const daysUntilStart = Math.round((startDt.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const isReminderActive = daysUntilStart >= 0 && daysUntilStart <= windowDays;
      const isOngoing = daysUntilStart < 0 && today.getTime() <= endDt.getTime();
      const triggerDate = new Date(startDt);
      triggerDate.setDate(triggerDate.getDate() - windowDays);

      const countdownBadge =
        daysUntilStart === 0
          ? 'Hari H'
          : daysUntilStart > 0
          ? `H-${daysUntilStart}`
          : 'Berlangsung';

      return {
        ...evt,
        daysUntilStart,
        isReminderActive,
        isOngoing,
        triggerDateIso: `${triggerDate.getFullYear()}-${String(triggerDate.getMonth() + 1).padStart(
          2,
          '0'
        )}-${String(triggerDate.getDate()).padStart(2, '0')}`,
        countdownBadge,
        headline:
          daysUntilStart === 0
            ? `Hari H: ${evt.name}`
            : `H-${daysUntilStart} Menuju ${evt.name}`,
        actionMessage:
          'Harap update daftar harga bahan baku dan siapkan pembelian stok sebelum supplier libur atau harga naik menjelang hari besar.',
        bufferNote:
          'Acuan Stok Buffer Minimum tetap berbasis riwayat historis (tidak diubah otomatis).'
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.daysUntilStart - b.daysUntilStart);

  return {
    windowDays,
    activeReminders: enriched.filter((e) => e.isReminderActive),
    upcomingEvents: enriched.filter((e) => e.daysUntilStart >= 0),
    allEventsWithStatus: enriched
  };
}

/**
 * Ambil referensi data riwayat pembelian & harga bahan baku dari momen hari besar tahun lalu
 * (atau data historis serupa jika riwayat usaha belum genap 1 tahun).
 */
export function getHistoricalPurchaseReferenceForEvent(
  event,
  { stockMovements = [], stockLogs = [], priceHistory = [], ingredients = [] } = {}
) {
  const startDt = parseLocalDate(event?.startDate) || new Date();
  const endDt = parseLocalDate(event?.endDate) || startDt;
  const eventYear = startDt.getFullYear();
  const referenceYear = eventYear - 1;

  const lastYearWindowStart = new Date(
    referenceYear,
    startDt.getMonth(),
    startDt.getDate() - 14,
    0,
    0,
    0,
    0
  );
  const lastYearWindowEnd = new Date(
    referenceYear,
    endDt.getMonth(),
    endDt.getDate() + 3,
    23,
    59,
    59,
    999
  );

  const isInLastYearWindow = (ts) => {
    const d = parseLocalDate(ts);
    if (!d) return false;
    return d.getTime() >= lastYearWindowStart.getTime() && d.getTime() <= lastYearWindowEnd.getTime();
  };

  // Kumpulkan semua catatan pembelian / barang masuk aktual
  const allRestockMovements = (stockMovements || []).filter((mv) => {
    const qty = Number(mv.qtyChange ?? mv.qty_change ?? 0);
    const mType = mv.movementType || mv.movement_type || '';
    return qty > 0 && mType !== 'RESTOCK_REVERSAL';
  });

  const allRestockLogs = (stockLogs || []).filter((log) => {
    const t = String(log.type || '').toUpperCase();
    return t.includes('MASUK') || t.includes('TRANSFER');
  });

  const lastYearMovements = allRestockMovements.filter((mv) =>
    isInLastYearWindow(mv.createdAt || mv.created_at)
  );
  const lastYearLogs = allRestockLogs.filter((log) => isInLastYearWindow(log.timestamp));
  const lastYearPrices = (priceHistory || []).filter((ph) =>
    isInLastYearWindow(ph.changedAt || ph.changed_at)
  );

  let sourceScope = 'last_year_event';
  let sourceLabel = `Riwayat Pembelian Momen Sama Tahun Lalu (${referenceYear})`;
  let activeMovements = lastYearMovements;
  let activeLogs = lastYearLogs;
  let activePrices = lastYearPrices;

  if (
    lastYearMovements.length === 0 &&
    lastYearLogs.length === 0 &&
    lastYearPrices.length === 0
  ) {
    if (
      allRestockMovements.length > 0 ||
      allRestockLogs.length > 0 ||
      (priceHistory || []).length > 0
    ) {
      sourceScope = 'recent_historical';
      sourceLabel = 'Referensi Pembelian Historis Serupa (Data Usaha < 1 Tahun)';
      activeMovements = allRestockMovements;
      activeLogs = allRestockLogs;
      activePrices = priceHistory || [];
    } else {
      sourceScope = 'baseline_catalog';
      sourceLabel = 'Referensi Harga Awal & Stok Masuk Bahan Baku Saat Ini';
    }
  }

  const refMap = new Map();
  const findCatalogIngredient = (nameOrId) =>
    (ingredients || []).find(
      (i) =>
        String(i.id) === String(nameOrId) ||
        cleanIngredientName(i.name).toLowerCase() === cleanIngredientName(nameOrId).toLowerCase()
    );

  const ensureEntry = (rawName, ingId, unitFallback = 'pcs') => {
    const matched = findCatalogIngredient(ingId || rawName);
    const cleanName = cleanIngredientName(matched?.name || rawName || 'Bahan Baku');
    const key = matched ? String(matched.id) : cleanName.toLowerCase();

    if (!refMap.has(key)) {
      const currentMarket = matched ? resolveIngredientMarketPrice(matched) : 0;
      const initialPrice = matched ? resolveIngredientInitialPrice(matched) : 0;
      refMap.set(key, {
        ingredientKey: key,
        ingredientId: matched?.id || ingId || null,
        ingredientName: cleanName,
        unit: matched?.unit || unitFallback || 'pcs',
        totalPurchasedQty: 0,
        purchaseCount: 0,
        lastPurchaseDate: matched?.entryDate || null,
        historicalPrice: initialPrice,
        currentMarketPrice: currentMarket,
        notes: []
      });
    }
    return refMap.get(key);
  };

  activeMovements.forEach((mv) => {
    const entry = ensureEntry(
      mv.ingredientName || mv.ingredient_name,
      mv.ingredientId || mv.ingredient_id,
      mv.unit
    );
    const qty = Math.abs(Number(mv.qtyChange ?? mv.qty_change ?? 0));
    entry.totalPurchasedQty = Number((entry.totalPurchasedQty + qty).toFixed(3));
    entry.purchaseCount += 1;
    const ts = mv.createdAt || mv.created_at;
    if (ts && (!entry.lastPurchaseDate || new Date(ts) > new Date(entry.lastPurchaseDate))) {
      entry.lastPurchaseDate = ts;
    }
    if (mv.reason && !entry.notes.includes(mv.reason)) {
      entry.notes.push(mv.reason);
    }
  });

  // Lengkapi dari stockLogs apabila belum ada record movement untuk item terkait
  activeLogs.forEach((log) => {
    const entry = ensureEntry(log.itemName, log.ingredientId);
    if (entry.purchaseCount === 0) {
      const qty = parseQtyFromLogText(log.qty);
      entry.totalPurchasedQty = Number((entry.totalPurchasedQty + qty).toFixed(3));
      entry.purchaseCount += 1;
    }
    if (
      log.timestamp &&
      (!entry.lastPurchaseDate || new Date(log.timestamp) > new Date(entry.lastPurchaseDate))
    ) {
      entry.lastPurchaseDate = log.timestamp;
    }
    if (log.note && !entry.notes.includes(log.note)) {
      entry.notes.push(log.note);
    }
  });

  activePrices.forEach((ph) => {
    const entry = ensureEntry(
      ph.ingredientName || ph.ingredient_name,
      ph.ingredientId || ph.ingredient_id,
      ph.unit
    );
    const histP = Number(ph.newPrice ?? ph.new_price ?? ph.oldPrice ?? ph.old_price ?? 0);
    if (histP > 0) {
      entry.historicalPrice = histP;
    }
    if (ph.notes && !entry.notes.includes(ph.notes)) {
      entry.notes.push(ph.notes);
    }
  });

  // Jika masih kosong (baseline_catalog), tampilkan bahan baku aktif sebagai referensi dasar
  if (refMap.size === 0) {
    (ingredients || []).slice(0, 8).forEach((ing) => {
      const entry = ensureEntry(ing.name, ing.id, ing.unit);
      entry.totalPurchasedQty = Number(ing.stock) || 0;
      entry.purchaseCount = 1;
      entry.notes.push('Stok & harga awal tercatat di gudang');
    });
  }

  const items = Array.from(refMap.values())
    .map((item) => {
      const histPrice = Number(item.historicalPrice || 0);
      const curPrice = Number(item.currentMarketPrice || 0);
      const priceDiffPct =
        histPrice > 0 && curPrice > 0
          ? Number((((curPrice - histPrice) / histPrice) * 100).toFixed(1))
          : 0;
      return {
        ...item,
        priceDiffPct,
        noteSummary: item.notes[0] || 'Pembelian stok bahan baku'
      };
    })
    .sort((a, b) => b.totalPurchasedQty - a.totalPurchasedQty)
    .slice(0, 10);

  const rangeFormatter = (d) =>
    d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

  return {
    event,
    sourceScope,
    sourceLabel,
    eventYear,
    referenceYear,
    lastYearRangeLabel: `${rangeFormatter(lastYearWindowStart)} – ${rangeFormatter(
      lastYearWindowEnd
    )}`,
    items,
    totalRestockEvents: items.reduce((sum, i) => sum + i.purchaseCount, 0)
  };
}
