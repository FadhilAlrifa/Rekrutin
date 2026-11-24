import { calculateMenuCogs } from './cogsCalculator.js';
import { DEFAULT_SEASONAL_EVENTS } from './seasonalForecasting.js';
import { parseLocalDate } from './inventoryStatus.js';

/**
 * Mengubah timestamp/Date menjadi tanggal lokal format YYYY-MM-DD tanpa pergeseran UTC.
 */
export function toLocalIsoDate(dateInput) {
  const parsed = parseLocalDate(dateInput);
  if (!parsed) return '';
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, '0');
  const d = String(parsed.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isNetValidTransaction(tx) {
  const kStatus = String(tx?.kitchen_status || '').toLowerCase();
  const pStatus = String(tx?.payment_status || '').toLowerCase();
  if (kStatus === 'cancelled' || kStatus === 'cancelled_waste') return false;
  if (pStatus === 'refunded') return false;
  return true;
}

function findHolidayForIsoDate(isoDate, seasonalEvents = DEFAULT_SEASONAL_EVENTS) {
  if (!isoDate) return null;
  return (
    (seasonalEvents || []).find((evt) => {
      if (!evt?.startDate) return false;
      const end = evt.endDate || evt.startDate;
      const cat = String(evt.category || '').toLowerCase();
      const isHolidayCategory =
        cat === 'holiday' || cat === 'religious' || cat === 'school_holiday';
      return isHolidayCategory && isoDate >= evt.startDate && isoDate <= end;
    }) || null
  );
}

/**
 * Membangun agregasi Riwayat Penjualan Harian per (salesDate, menu)
 * beserta ringkasan Menu Favorit & Kuota Harian untuk acuan hari besar.
 */
export function buildDailySalesHistory({
  transactions = [],
  products = [],
  ingredients = [],
  seasonalEvents = DEFAULT_SEASONAL_EVENTS,
  persistedDailyRows = [],
  businessType = 'fnb'
} = {}) {
  const dayMenuMap = new Map(); // `${salesDate}__${menuKey}` -> entry
  const datesFromTransactions = new Set();

  const productById = new Map();
  const productByName = new Map();
  (products || []).forEach((p) => {
    if (p?.id !== undefined && p?.id !== null) productById.set(String(p.id), p);
    if (p?.name) productByName.set(String(p.name).toLowerCase().trim(), p);
  });

  const cogsCache = new Map();
  const getUnitProfitForProduct = (prodOrItem) => {
    const key = prodOrItem?.id
      ? `id:${prodOrItem.id}`
      : `name:${String(prodOrItem?.name || '').toLowerCase().trim()}`;
    if (cogsCache.has(key)) return cogsCache.get(key);

    const matchedProd =
      productById.get(String(prodOrItem?.id || '')) ||
      productByName.get(String(prodOrItem?.name || '').toLowerCase().trim()) ||
      prodOrItem;

    const cogsInfo = calculateMenuCogs(matchedProd, ingredients, businessType);
    const unitProfit = cogsInfo.hasRecipe
      ? cogsInfo.grossProfit
      : Math.round((Number(matchedProd?.price ?? prodOrItem?.price) || 0) * 0.45);
    const res = {
      unitProfit,
      category: matchedProd?.category || prodOrItem?.category || 'Umum',
      menuId: matchedProd?.id ? String(matchedProd.id) : key
    };
    cogsCache.set(key, res);
    return res;
  };

  // 1. Agregasi langsung dari transaksi valid (authoritative live records)
  (transactions || []).filter(isNetValidTransaction).forEach((tx) => {
    const salesDate = toLocalIsoDate(tx.created_at || tx.createdAt || new Date());
    if (!salesDate) return;
    datesFromTransactions.add(salesDate);

    const holidayEvt = findHolidayForIsoDate(salesDate, seasonalEvents);
    const items = Array.isArray(tx.items) ? tx.items : [];
    const seenMenusInTx = new Set();

    items.forEach((item) => {
      const qty = Number(item?.qty) || 0;
      if (qty <= 0) return;

      const menuName = String(item?.name || 'Menu POS').trim();
      const profitMeta = getUnitProfitForProduct(item);
      const menuId = String(item?.id ?? profitMeta.menuId ?? menuName.toLowerCase());
      const menuKey = menuName.toLowerCase();
      const mapKey = `${salesDate}__${menuKey}`;

      const itemRevenue = Math.round(qty * (Number(item?.price) || 0));
      const itemProfit = Math.round(qty * profitMeta.unitProfit);

      const prev = dayMenuMap.get(mapKey) || {
        salesDate,
        menuId,
        menuName,
        category: profitMeta.category,
        quantitySold: 0,
        totalRevenue: 0,
        estimatedProfit: 0,
        transactionsCount: 0,
        isHoliday: Boolean(holidayEvt),
        holidayLabel: holidayEvt?.name || ''
      };

      prev.quantitySold = Number((prev.quantitySold + qty).toFixed(2));
      prev.totalRevenue += itemRevenue;
      prev.estimatedProfit += itemProfit;
      if (!seenMenusInTx.has(menuKey)) {
        prev.transactionsCount += 1;
        seenMenusInTx.add(menuKey);
      }

      dayMenuMap.set(mapKey, prev);
    });
  });

  // 2. Gabungkan persistedDailyRows untuk tanggal historis yang belum ada di raw transactions
  (persistedDailyRows || []).forEach((row) => {
    const salesDate = toLocalIsoDate(row.salesDate || row.sales_date);
    if (!salesDate || datesFromTransactions.has(salesDate)) return;

    const menuName = String(row.menuName || row.menu_name || 'Menu POS').trim();
    const menuId = String(row.menuId || row.menu_id || menuName.toLowerCase());
    const menuKey = menuName.toLowerCase();
    const mapKey = `${salesDate}__${menuKey}`;
    const qty = Number(row.quantitySold ?? row.quantity_sold ?? 0);
    if (qty <= 0) return;

    const holidayEvt = findHolidayForIsoDate(salesDate, seasonalEvents);
    dayMenuMap.set(mapKey, {
      salesDate,
      menuId,
      menuName,
      category: row.category || 'Umum',
      quantitySold: Number(qty.toFixed(2)),
      totalRevenue: Math.round(Number(row.totalRevenue ?? row.total_revenue ?? 0)),
      estimatedProfit: Math.round(Number(row.estimatedProfit ?? row.estimated_profit ?? 0)),
      transactionsCount: Number(row.transactionsCount ?? row.transactions_count ?? 1),
      isHoliday: Boolean(row.isHoliday ?? row.is_holiday ?? holidayEvt),
      holidayLabel: row.holidayLabel || row.holiday_label || holidayEvt?.name || ''
    });
  });

  const flatRows = Array.from(dayMenuMap.values());
  return summarizeDailySalesRows(flatRows);
}

/**
 * Menyusun ringkasan per tanggal (`dailyDays`) & statistik kuota menu (`menuQuotaSummary`)
 * dari array flat `(salesDate, menuName, quantitySold, ...)`.
 */
export function summarizeDailySalesRows(flatRows = []) {
  const daysMap = new Map();

  flatRows.forEach((row) => {
    if (!row?.salesDate || !(Number(row.quantitySold) > 0)) return;
    const prevDay = daysMap.get(row.salesDate) || {
      salesDate: row.salesDate,
      isHoliday: Boolean(row.isHoliday),
      holidayLabel: row.holidayLabel || '',
      totalQtySold: 0,
      totalRevenue: 0,
      totalEstimatedProfit: 0,
      totalTransactions: 0,
      items: []
    };

    prevDay.totalQtySold = Number((prevDay.totalQtySold + Number(row.quantitySold)).toFixed(2));
    prevDay.totalRevenue += Math.round(Number(row.totalRevenue || 0));
    prevDay.totalEstimatedProfit += Math.round(Number(row.estimatedProfit || 0));
    prevDay.totalTransactions = Math.max(
      prevDay.totalTransactions,
      Number(row.transactionsCount || 0)
    );
    if (row.isHoliday) {
      prevDay.isHoliday = true;
      if (!prevDay.holidayLabel && row.holidayLabel) prevDay.holidayLabel = row.holidayLabel;
    }
    prevDay.items.push(row);
    daysMap.set(row.salesDate, prevDay);
  });

  const dailyDays = Array.from(daysMap.values())
    .map((day) => {
      const sortedItems = [...day.items].sort(
        (a, b) => b.quantitySold - a.quantitySold || b.totalRevenue - a.totalRevenue
      );
      const dt = parseLocalDate(day.salesDate);
      const formattedDate = dt
        ? dt.toLocaleDateString('id-ID', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })
        : day.salesDate;

      return {
        ...day,
        formattedDate,
        items: sortedItems.map((it, idx) => ({
          ...it,
          rank: idx + 1,
          sharePct:
            day.totalQtySold > 0
              ? Number(((it.quantitySold / day.totalQtySold) * 100).toFixed(1))
              : 0
        })),
        topFavoriteMenu: sortedItems[0] || null
      };
    })
    .sort((a, b) => b.salesDate.localeCompare(a.salesDate));

  // Agregasi benchmark kuota per menu lintas hari
  const menuAgg = new Map();
  const totalObservedDays = Math.max(1, dailyDays.length);

  dailyDays.forEach((day) => {
    day.items.forEach((item) => {
      const key = item.menuName.toLowerCase();
      const prev = menuAgg.get(key) || {
        menuKey: key,
        menuId: item.menuId,
        menuName: item.menuName,
        category: item.category,
        activeDaysCount: 0,
        totalQtySold: 0,
        peakDailyQuota: 0,
        peakDate: day.salesDate,
        peakDayIsHoliday: day.isHoliday,
        peakHolidayLabel: day.holidayLabel,
        holidayQtySum: 0,
        holidayDaysCount: 0,
        normalQtySum: 0,
        normalDaysCount: 0,
        totalRevenue: 0,
        totalEstimatedProfit: 0
      };

      prev.activeDaysCount += 1;
      prev.totalQtySold = Number((prev.totalQtySold + item.quantitySold).toFixed(2));
      prev.totalRevenue += item.totalRevenue;
      prev.totalEstimatedProfit += item.estimatedProfit;

      if (item.quantitySold > prev.peakDailyQuota) {
        prev.peakDailyQuota = item.quantitySold;
        prev.peakDate = day.salesDate;
        prev.peakDayIsHoliday = day.isHoliday;
        prev.peakHolidayLabel = day.holidayLabel;
      }

      if (day.isHoliday) {
        prev.holidayQtySum += item.quantitySold;
        prev.holidayDaysCount += 1;
      } else {
        prev.normalQtySum += item.quantitySold;
        prev.normalDaysCount += 1;
      }

      menuAgg.set(key, prev);
    });
  });

  const menuQuotaSummary = Array.from(menuAgg.values())
    .map((m) => ({
      ...m,
      avgDailyQuota: Number((m.totalQtySold / totalObservedDays).toFixed(1)),
      avgActiveDayQuota: Number((m.totalQtySold / Math.max(1, m.activeDaysCount)).toFixed(1)),
      holidayAvgQuota:
        m.holidayDaysCount > 0
          ? Number((m.holidayQtySum / m.holidayDaysCount).toFixed(1))
          : null,
      normalAvgQuota:
        m.normalDaysCount > 0
          ? Number((m.normalQtySum / m.normalDaysCount).toFixed(1))
          : null
    }))
    .sort((a, b) => b.totalQtySold - a.totalQtySold || b.peakDailyQuota - a.peakDailyQuota);

  const totals = dailyDays.reduce(
    (acc, d) => ({
      daysCount: acc.daysCount + 1,
      holidayDaysCount: acc.holidayDaysCount + (d.isHoliday ? 1 : 0),
      totalQtySold: Number((acc.totalQtySold + d.totalQtySold).toFixed(2)),
      totalRevenue: acc.totalRevenue + d.totalRevenue,
      totalEstimatedProfit: acc.totalEstimatedProfit + d.totalEstimatedProfit
    }),
    {
      daysCount: 0,
      holidayDaysCount: 0,
      totalQtySold: 0,
      totalRevenue: 0,
      totalEstimatedProfit: 0
    }
  );

  return {
    flatRows,
    dailyDays,
    menuQuotaSummary,
    totals
  };
}

/**
 * Filter riwayat penjualan harian berdasarkan tanggal spesifik, rentang tanggal, atau hari libur.
 */
export function filterDailySalesHistory(
  dailyHistoryResult,
  { specificDate = '', startDate = '', endDate = '', onlyHolidayDays = false } = {}
) {
  const flatRows = dailyHistoryResult?.flatRows || [];
  const filteredRows = flatRows.filter((row) => {
    if (specificDate && row.salesDate !== specificDate) return false;
    if (!specificDate) {
      if (startDate && row.salesDate < startDate) return false;
      if (endDate && row.salesDate > endDate) return false;
    }
    if (onlyHolidayDays && !row.isHoliday) return false;
    return true;
  });

  return summarizeDailySalesRows(filteredRows);
}
