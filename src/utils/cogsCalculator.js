import { convertToStandardBase, calculateDeductionInStorageUnit } from './stockValidator.js';

/**
 * Ekstrak nama bersih bahan baku tanpa suffix kategori ("Nama | Kategori").
 */
export function cleanIngredientName(name) {
  return String(name || '').split(' | ')[0].trim();
}

/**
 * Mencari bahan baku di daftar inventori berdasarkan item resep BOM.
 */
export function findMatchingIngredient(recipeItem, ingredients = []) {
  const target = cleanIngredientName(recipeItem?.name).toLowerCase();
  if (!target) return null;
  return (
    ingredients.find((ing) => cleanIngredientName(ing.name).toLowerCase() === target) ||
    ingredients.find((ing) => (ing.name || '').toLowerCase().includes(target)) ||
    null
  );
}

/**
 * Hitung biaya (Rp) satu komponen resep berdasarkan unitPrice bahan baku di gudang.
 * Menangani konversi satuan lintas unit (mis. gram/ml terhadap kg/liter).
 */
export function calculateRecipeItemCost(recipeItem, ingredient) {
  if (!recipeItem || !ingredient) return 0;
  const unitPrice = Number(ingredient.unitPrice ?? ingredient.unit_price ?? 0);
  if (unitPrice <= 0) return 0;

  const neededQty = Number(recipeItem.qty) || 0;
  if (neededQty <= 0) return 0;

  const storageUnit = (ingredient.unit || '').toLowerCase().trim();
  const recipeUnit = (recipeItem.unit || '').toLowerCase().trim();

  // Jika satuan identik (termasuk pcs/unit/cup), hitung langsung proporsional
  if (storageUnit === recipeUnit) {
    return neededQty * unitPrice;
  }

  // Konversi melalui standard base (kg->gram, liter->ml)
  const neededInStorageUnits = calculateDeductionInStorageUnit(neededQty, recipeUnit, storageUnit);
  // Pastikan jika recipeUnit = kg dan storageUnit = gram -> neededBase = neededQty*1000, storage = neededBase
  const baseNeeded = convertToStandardBase(neededQty, recipeUnit);
  const baseStorageUnit = convertToStandardBase(1, storageUnit);

  if (baseStorageUnit > 0) {
    return (baseNeeded / baseStorageUnit) * unitPrice;
  }

  return neededInStorageUnits * unitPrice;
}

/**
 * Kembalikan label status kesehatan margin:
 * - Sehat > 50%
 * - Waspada 30% - 50%
 * - Kritis < 30%
 */
export function getMarginStatus(marginPct) {
  if (marginPct > 50) {
    return {
      key: 'sehat',
      label: 'Sehat',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dotClass: 'bg-emerald-600',
      textClass: 'text-emerald-700'
    };
  }
  if (marginPct >= 30) {
    return {
      key: 'waspada',
      label: 'Waspada',
      badgeClass: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]',
      dotClass: 'bg-[#F59E0B]',
      textClass: 'text-[#B45309]'
    };
  }
  return {
    key: 'kritis',
    label: 'Kritis',
    badgeClass: 'bg-red-50 text-red-700 border-red-200',
    dotClass: 'bg-red-600',
    textClass: 'text-red-600'
  };
}

/**
 * Kalkulasi HPP (COGS), Laba Kotor, dan Gross Margin % sebuah menu secara otomatis.
 */
export function calculateMenuCogs(product, ingredients = []) {
  const sellingPrice = Number(product?.price) || 0;
  const recipe = Array.isArray(product?.recipe) ? product.recipe : [];

  let cogs = 0;
  const missingPriceIngredients = [];
  const breakdown = [];

  recipe.forEach((rc) => {
    if (!rc?.name) return;
    const ing = findMatchingIngredient(rc, ingredients);
    const unitPrice = Number(ing?.unitPrice ?? ing?.unit_price ?? 0);
    const itemCost = ing ? calculateRecipeItemCost(rc, ing) : 0;

    if (!ing || unitPrice <= 0) {
      missingPriceIngredients.push(cleanIngredientName(rc.name));
    }

    cogs += itemCost;
    breakdown.push({
      ingredientId: ing?.id || null,
      name: cleanIngredientName(rc.name),
      qty: Number(rc.qty) || 0,
      unit: rc.unit || 'gram',
      storageUnit: ing?.unit || rc.unit || 'pcs',
      unitPrice,
      cost: Math.round(itemCost)
    });
  });

  const roundedCogs = Math.round(cogs);
  const grossProfit = sellingPrice - roundedCogs;
  const grossMarginPct =
    sellingPrice > 0 ? Number(((grossProfit / sellingPrice) * 100).toFixed(1)) : 0;

  return {
    cogs: roundedCogs,
    sellingPrice,
    grossProfit,
    grossMarginPct,
    status: getMarginStatus(grossMarginPct),
    missingPriceIngredients,
    hasRecipe: recipe.length > 0,
    breakdown
  };
}

/**
 * Analisis dampak perubahan harga 1 bahan baku terhadap HPP & margin semua menu terkait.
 */
export function analyzeIngredientPriceImpact(ingredient, newPrice, products = [], allIngredients = []) {
  if (!ingredient) return [];
  const cleanTarget = cleanIngredientName(ingredient.name).toLowerCase();
  const parsedNewPrice = Number(newPrice) || 0;

  const updatedIngredients = allIngredients.map((ing) =>
    String(ing.id) === String(ingredient.id)
      ? { ...ing, unitPrice: parsedNewPrice, unit_price: parsedNewPrice }
      : ing
  );

  return products
    .filter((prod) =>
      Array.isArray(prod.recipe) &&
      prod.recipe.some((rc) => {
        const rcName = cleanIngredientName(rc?.name).toLowerCase();
        return rcName === cleanTarget || (ingredient.name || '').toLowerCase().includes(rcName);
      })
    )
    .map((prod) => {
      const before = calculateMenuCogs(prod, allIngredients);
      const after = calculateMenuCogs(prod, updatedIngredients);
      return {
        id: prod.id,
        name: prod.name,
        sellingPrice: before.sellingPrice,
        oldCogs: before.cogs,
        newCogs: after.cogs,
        deltaCogs: after.cogs - before.cogs,
        oldMarginPct: before.grossMarginPct,
        newMarginPct: after.grossMarginPct,
        newStatus: after.status
      };
    });
}

/**
 * Hitung maksimal porsi tersisa & status stok detail untuk kasir POS.
 */
export function evaluateMenuStockStatus(product, ingredients = []) {
  const recipe = Array.isArray(product?.recipe) ? product.recipe : [];
  if (recipe.length === 0) {
    return {
      status: 'available',
      maxPortions: 999,
      hasLowBufferIngredient: false,
      label: 'Tersedia'
    };
  }

  let minPortions = Infinity;
  let hasLowBufferIngredient = false;

  for (const req of recipe) {
    const foundIng = findMatchingIngredient(req, ingredients);
    if (!foundIng || Number(foundIng.stock) <= 0) {
      return {
        status: 'out',
        maxPortions: 0,
        hasLowBufferIngredient: true,
        label: 'Habis'
      };
    }

    const threshold = Number(foundIng.minLimit ?? foundIng.min_stock_threshold ?? 0);
    if (Number(foundIng.stock) <= threshold) {
      hasLowBufferIngredient = true;
    }

    const perPortion = calculateDeductionInStorageUnit(req.qty, req.unit, foundIng.unit);
    if (perPortion > 0) {
      const possible = Math.floor(Number(foundIng.stock) / perPortion);
      if (possible < minPortions) minPortions = possible;
    }
  }

  if (minPortions === Infinity) minPortions = 999;

  if (minPortions <= 0) {
    return {
      status: 'out',
      maxPortions: 0,
      hasLowBufferIngredient: true,
      label: 'Habis'
    };
  }

  if (minPortions <= 5 || hasLowBufferIngredient) {
    return {
      status: 'low',
      maxPortions: minPortions,
      hasLowBufferIngredient: true,
      label: minPortions < 999 ? `Menipis • Sisa ${minPortions}` : 'Bahan Menipis'
    };
  }

  return {
    status: 'available',
    maxPortions: minPortions,
    hasLowBufferIngredient: false,
    label: minPortions < 999 ? `Maks: ${minPortions}` : 'Tersedia'
  };
}

/**
 * Mesin Smart Upselling untuk layar POS Kasir:
 * Memprioritaskan menu dengan Margin Tinggi DAN Stok Bahan Baku Aman (tidak menipis/habis).
 */
export function getSmartUpsellRecommendations(cart = [], products = [], ingredients = [], limit = 3) {
  if (!Array.isArray(cart) || cart.length === 0) return [];

  const cartIds = new Set(cart.map((c) => String(c.id)));
  const cartCategories = new Set(cart.map((c) => (c.category || '').toLowerCase()));

  const candidates = products
    .filter((prod) => !cartIds.has(String(prod.id)))
    .map((prod) => {
      const cogsData = calculateMenuCogs(prod, ingredients);
      const stockInfo = evaluateMenuStockStatus(prod, ingredients);

      // Syarat ketat 2: Bahan baku harus aman (tidak habis dan tidak sedang menipis)
      const isStockSafe = stockInfo.status === 'available' && stockInfo.maxPortions >= 5;
      // Syarat ketat 1: Margin keuntungan tinggi (>= 40%, atau prioritas tertinggi bila belum semua diinput)
      const isHighMargin = cogsData.grossMarginPct >= 45 && cogsData.grossProfit > 0;

      // Boost kategori pelengkap (mis. Bakery/Dessert/Makanan ketika keranjang berisi Minuman)
      const isComplementary = !cartCategories.has((prod.category || '').toLowerCase());

      return {
        product: prod,
        ...cogsData,
        stockInfo,
        isStockSafe,
        isHighMargin,
        isComplementary,
        score:
          (isHighMargin ? 1000 : cogsData.grossMarginPct * 10) +
          (isComplementary ? 250 : 0) +
          Math.min(cogsData.grossProfit / 100, 300)
      };
    })
    .filter((c) => c.isStockSafe && c.grossProfit > 0)
    .sort((a, b) => b.score - a.score);

  return candidates.slice(0, limit);
}

/**
 * Klasifikasi Menu Engineering Matrix (Stars, Plowhorses, Puzzles, Dogs) + Tren Volume vs Profit.
 */
export function computeMenuEngineering(products = [], ingredients = [], transactions = []) {
  const salesMap = {};
  const dailyTrendMap = {};

  const cogsByProdId = {};
  const cogsByProdName = {};
  products.forEach((prod) => {
    const info = calculateMenuCogs(prod, ingredients);
    cogsByProdId[String(prod.id)] = info;
    cogsByProdName[(prod.name || '').toLowerCase().trim()] = info;
  });

  transactions.forEach((tx) => {
    const dateKey = tx.created_at
      ? new Date(tx.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
      : 'Hari Ini';
    const rawSortDate = tx.created_at ? new Date(tx.created_at).setHours(0, 0, 0, 0) : 0;

    if (!dailyTrendMap[dateKey]) {
      dailyTrendMap[dateKey] = {
        dateLabel: dateKey,
        sortTs: rawSortDate,
        qtySold: 0,
        revenue: 0,
        totalProfit: 0
      };
    }

    const items = Array.isArray(tx.items) ? tx.items : [];
    items.forEach((item) => {
      const qty = Number(item.qty) || 0;
      const price = Number(item.price) || 0;
      const nameKey = (item.name || '').toLowerCase().trim();
      const cogsInfo = cogsByProdId[String(item.id)] || cogsByProdName[nameKey];
      const unitCogs = cogsInfo ? cogsInfo.cogs : Math.round(price * 0.45);
      const itemProfit = (price - unitCogs) * qty;

      if (!salesMap[nameKey]) {
        salesMap[nameKey] = { qtySold: 0, revenue: 0 };
      }
      salesMap[nameKey].qtySold += qty;
      salesMap[nameKey].revenue += price * qty;

      dailyTrendMap[dateKey].qtySold += qty;
      dailyTrendMap[dateKey].revenue += price * qty;
      dailyTrendMap[dateKey].totalProfit += itemProfit;
    });
  });

  const rows = products.map((prod) => {
    const cogsInfo = cogsByProdId[String(prod.id)] || calculateMenuCogs(prod, ingredients);
    const sales = salesMap[(prod.name || '').toLowerCase().trim()] || { qtySold: 0, revenue: 0 };
    const totalProfit = sales.qtySold * cogsInfo.grossProfit;

    return {
      id: prod.id,
      name: prod.name,
      category: prod.category,
      image: prod.image,
      qtySold: sales.qtySold,
      revenue: sales.revenue,
      sellingPrice: cogsInfo.sellingPrice,
      unitCogs: cogsInfo.cogs,
      unitProfit: cogsInfo.grossProfit,
      marginPct: cogsInfo.grossMarginPct,
      marginStatus: cogsInfo.status,
      totalProfit,
      missingPriceIngredients: cogsInfo.missingPriceIngredients,
      hasRecipe: cogsInfo.hasRecipe
    };
  });

  const activeRows = rows.filter((r) => r.qtySold > 0);
  const avgVolume =
    activeRows.length > 0
      ? activeRows.reduce((s, r) => s + r.qtySold, 0) / rows.length
      : 1;
  const avgMargin =
    rows.length > 0
      ? Math.max(
          45,
          Math.min(
            65,
            rows.reduce((s, r) => s + r.marginPct, 0) / rows.length
          )
        )
      : 50;

  const classified = rows.map((row) => {
    const highVolume = row.qtySold >= avgVolume && row.qtySold > 0;
    const highMargin = row.marginPct >= avgMargin;

    let quadrant = 'dogs';
    if (highVolume && highMargin) quadrant = 'stars';
    else if (highVolume && !highMargin) quadrant = 'plowhorses';
    else if (!highVolume && highMargin) quadrant = 'puzzles';

    return {
      ...row,
      quadrant
    };
  });

  const trendSeries = Object.values(dailyTrendMap)
    .sort((a, b) => a.sortTs - b.sortTs)
    .slice(-7);

  return {
    items: classified,
    benchmarks: {
      avgVolume: Number(avgVolume.toFixed(1)),
      avgMargin: Number(avgMargin.toFixed(1))
    },
    counts: {
      stars: classified.filter((i) => i.quadrant === 'stars').length,
      plowhorses: classified.filter((i) => i.quadrant === 'plowhorses').length,
      puzzles: classified.filter((i) => i.quadrant === 'puzzles').length,
      dogs: classified.filter((i) => i.quadrant === 'dogs').length
    },
    trendSeries
  };
}

/**
 * Stocko AI Insights Engine:
 * Menghasilkan 5 rekomendasi bisnis terstruktur & actionable dari data aktual.
 */
export function generateAiInsights({
  products = [],
  ingredients = [],
  transactions = [],
  priceHistory = [],
  seasonalForecast = null
}) {
  const engineering = computeMenuEngineering(products, ingredients, transactions);
  const items = engineering.items;

  // 1. Analisis Margin
  const sortedByMargin = [...items].sort((a, b) => b.marginPct - a.marginPct);
  const topMargin = sortedByMargin[0];
  const lowestMargin = sortedByMargin[sortedByMargin.length - 1];

  // 2. Analisis Popularitas
  const sortedByVolume = [...items].sort((a, b) => b.qtySold - a.qtySold);
  const mostPopular = sortedByVolume[0];
  const leastPopular = sortedByVolume[sortedByVolume.length - 1];

  // 3. Peluang Upselling (Puzzles / High Margin + Safe Stock)
  const upsellCandidates = items
    .filter((row) => {
      const prodObj = products.find((p) => String(p.id) === String(row.id));
      const stockEval = evaluateMenuStockStatus(prodObj, ingredients);
      return row.marginPct >= 45 && stockEval.status === 'available';
    })
    .sort((a, b) => (a.quadrant === 'puzzles' ? -1 : 1) || b.marginPct - a.marginPct);

  // 4. Evaluasi Harga Jual (lonjakan harga bahan atau margin < 40%)
  const recentHikes = priceHistory.filter((h) => Number(h.changePct) > 0);
  const vulnerableMenus = items.filter((r) => r.marginPct < 40 && r.sellingPrice > 0);
  const targetFixMenu = vulnerableMenus[0] || lowestMargin;
  const recommendedPrice =
    targetFixMenu && targetFixMenu.unitCogs > 0
      ? Math.ceil((targetFixMenu.unitCogs / 0.45) / 500) * 500 // Target margin ~55% dibulatkan ke Rp500
      : null;

  // 5. Prediksi & Saran Stok berdasarkan burn rate harian transaksi
  const timestamps = transactions
    .map((t) => new Date(t.created_at).getTime())
    .filter((ms) => !Number.isNaN(ms));
  const spanDays =
    timestamps.length >= 2
      ? Math.max(1, Math.ceil((Math.max(...timestamps) - Math.min(...timestamps)) / 86400000))
      : 7;

  const usageByIngId = {};
  transactions.forEach((tx) => {
    (tx.items || []).forEach((cartItem) => {
      const prod =
        products.find((p) => String(p.id) === String(cartItem.id)) ||
        products.find((p) => (p.name || '').toLowerCase() === (cartItem.name || '').toLowerCase());
      if (!prod?.recipe) return;

      prod.recipe.forEach((rc) => {
        const ing = findMatchingIngredient(rc, ingredients);
        if (!ing) return;
        const perUnit = calculateDeductionInStorageUnit(rc.qty, rc.unit, ing.unit);
        usageByIngId[ing.id] = (usageByIngId[ing.id] || 0) + perUnit * (Number(cartItem.qty) || 0);
      });
    });
  });

  const restockPredictions = ingredients
    .map((ing) => {
      const totalUsed = usageByIngId[ing.id] || 0;
      const dailyRate = totalUsed / spanDays;
      const currentStock = Number(ing.stock) || 0;
      const minLimit = Number(ing.minLimit) || 1;
      const daysLeft = dailyRate > 0 ? Math.floor(currentStock / dailyRate) : currentStock <= minLimit ? 1 : 30;
      const suggestedRestock =
        dailyRate > 0 ? Math.max(minLimit * 2, Math.ceil(dailyRate * 7 - currentStock)) : Math.max(minLimit * 2, 5);

      return {
        id: ing.id,
        name: cleanIngredientName(ing.name),
        stock: currentStock,
        unit: ing.unit,
        minLimit,
        dailyRate: Number(dailyRate.toFixed(3)),
        daysLeft,
        suggestedRestock: Number(suggestedRestock.toFixed(2)),
        isUrgent: currentStock <= minLimit || daysLeft <= 5
      };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const urgentStock = restockPredictions.filter((r) => r.isUrgent);

  return [
    {
      id: 'margin',
      code: '01 // ANALISIS MARGIN',
      title: 'Rentang Profitabilitas Menu',
      status: lowestMargin && lowestMargin.marginPct < 30 ? 'critical' : 'healthy',
      headline: topMargin
        ? `Margin tertinggi: ${topMargin.name} (${topMargin.marginPct}%)`
        : 'Belum ada data menu untuk dihitung',
      detail:
        topMargin && lowestMargin
          ? `${topMargin.name} menyumbang laba Rp ${topMargin.unitProfit.toLocaleString('id-ID')}/porsi. Sebaliknya, ${lowestMargin.name} memiliki margin terendah (${lowestMargin.marginPct}% • Rp ${lowestMargin.unitProfit.toLocaleString('id-ID')}/porsi).`
          : 'Tambahkan menu dan harga bahan baku agar AI dapat memetakan margin keuntungan.',
      action: lowestMargin && lowestMargin.marginPct < 40 ? `Audit resep atau harga ${lowestMargin.name}` : 'Pertahankan konsistensi takaran BOM'
    },
    {
      id: 'popularity',
      code: '02 // ANALISIS POPULARITAS',
      title: 'Pergerakan Volume Penjualan',
      status: 'neutral',
      headline:
        mostPopular && mostPopular.qtySold > 0
          ? `Terlaris: ${mostPopular.name} (${mostPopular.qtySold} porsi)`
          : 'Menunggu riwayat transaksi penjualan',
      detail:
        mostPopular && leastPopular && mostPopular.qtySold > 0
          ? `Volume penjualan ${mostPopular.name} mendominasi omzet sebesar Rp ${mostPopular.revenue.toLocaleString('id-ID')}. Menu paling jarang dipesan adalah ${leastPopular.name} (${leastPopular.qtySold} porsi).`
          : 'Lakukan transaksi di POS Kasir atau QR Self-Order untuk melihat peringkat popularitas menu.',
      action:
        leastPopular && leastPopular.qtySold === 0
          ? `Evaluasi promosi atau bundling untuk ${leastPopular.name}`
          : 'Pastikan stok bahan menu terlaris selalu di atas buffer minimum'
    },
    {
      id: 'upselling',
      code: '03 // PELUANG UPSELLING',
      title: 'Kandidat Menu Profit Maksimal',
      status: 'amber',
      headline:
        upsellCandidates.length > 0
          ? `Dorong ${upsellCandidates[0].name} (Margin ${upsellCandidates[0].marginPct}%)`
          : 'Lengkapi harga bahan untuk membuka target upsell',
      detail:
        upsellCandidates.length > 0
          ? `${upsellCandidates
              .slice(0, 2)
              .map((u) => `${u.name} (+Rp ${u.unitProfit.toLocaleString('id-ID')})`)
              .join(' dan ')} memiliki margin tebal sekaligus stok bahan aman untuk ditawarkan otomatis di layar kasir.`
          : 'Pastikan minimal satu menu memiliki margin di atas 45% dengan status stok aman.',
      action: 'Aktif di panel Smart Upsell POS Kasir'
    },
    {
      id: 'pricing',
      code: '04 // EVALUASI HARGA JUAL',
      title: 'Deteksi Erosi Margin & Kenaikan Pasar',
      status: vulnerableMenus.length > 0 || recentHikes.length > 0 ? 'critical' : 'healthy',
      headline:
        vulnerableMenus.length > 0
          ? `${vulnerableMenus.length} menu di bawah batas margin aman 40%`
          : recentHikes.length > 0
          ? `Terdeteksi ${recentHikes.length} kenaikan harga bahan baku`
          : 'Seluruh harga jual berada di zona sehat',
      detail:
        vulnerableMenus.length > 0 && recommendedPrice
          ? `${targetFixMenu.name} saat ini bermargin ${targetFixMenu.marginPct}% (HPP Rp ${targetFixMenu.unitCogs.toLocaleString('id-ID')}). Pertimbangkan penyesuaian harga jual menuju Rp ${recommendedPrice.toLocaleString('id-ID')} untuk memulihkan margin ±55%.`
          : recentHikes.length > 0
          ? `Kenaikan harga terakhir tercatat pada ${recentHikes[0].ingredientName} (+${recentHikes[0].changePct}%). Pantau dampaknya di Menu Engineering.`
          : 'Belum ada tekanan kenaikan biaya bahan yang menggerus margin di bawah batas aman.',
      action: vulnerableMenus.length > 0 ? 'Sesuaikan harga jual di Kelola Menu' : 'Pantau tren harga supplier mingguan'
    },
    {
      id: 'stock',
      code: '05 // PREDIKSI & SARAN STOK',
      title: 'Estimasi Ketahanan Persediaan Gudang',
      status: urgentStock.length > 0 ? 'critical' : 'healthy',
      headline:
        urgentStock.length > 0
          ? `${urgentStock.length} bahan perlu restock segera`
          : 'Ketahanan stok gudang aman (> 5 hari)',
      detail:
        urgentStock.length > 0
          ? `Prioritas restock: ${urgentStock
              .slice(0, 2)
              .map((u) => `${u.name} (sisa ${u.stock} ${u.unit}, saran beli +${u.suggestedRestock} ${u.unit})`)
              .join('; ')}.`
          : restockPredictions.length > 0
          ? `Laju pemakaian rata-rata harian masih tertutup aman oleh sisa stok saat ini pada ${restockPredictions.length} bahan baku.`
          : 'Belum ada bahan baku terdaftar di gudang.',
      action: urgentStock.length > 0 ? 'Catat barang masuk di Stok & BOM Gudang' : 'Stok siap melayani proyeksi penjualan 7 hari'
    },
    ...(seasonalForecast
      ? [
          {
            id: 'seasonal',
            code: '06 // SEASONAL DEMAND FORECAST',
            title: `Proyeksi Periode: ${seasonalForecast.selectedEvent?.name || 'Baseline'}`,
            status: seasonalForecast.summary?.raiseBufferCount > 0 ? 'amber' : 'healthy',
            headline:
              seasonalForecast.summary?.raiseBufferCount > 0
                ? `${seasonalForecast.summary.raiseBufferCount} bahan perlu kenaikan buffer (+${seasonalForecast.liftPct}% lift)`
                : `Stok siap menghadapi ${seasonalForecast.selectedEvent?.name || 'periode mendatang'}`,
            detail:
              seasonalForecast.ingredientForecasts?.length > 0
                ? `Proyeksi ${seasonalForecast.horizonDays} hari ke depan merekomendasikan penyesuaian buffer pada ${seasonalForecast.ingredientForecasts
                    .slice(0, 2)
                    .map((f) => `${f.name} (butuh ~${f.projectedNeed} ${f.unit}, buffer saran ${f.recommendedBuffer} ${f.unit})`)
                    .join(' dan ')}.`
                : 'Tambahkan bahan baku untuk melihat proyeksi stok musiman.',
            action: 'Buka tab Seasonal & Forecast untuk rencana restock'
          }
        ]
      : [])
  ];
}
