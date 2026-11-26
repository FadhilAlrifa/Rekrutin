import { supabase, supabaseAdminAuth } from './supabaseClient.js';
import { DEFAULT_SEASONAL_EVENTS } from '../utils/seasonalForecasting.js';
import { ensureBatchesForIngredient, summarizeIngredientBatches } from '../utils/fefoBatchEngine.js';

const PRICE_MAP_STORAGE_KEY = 'stocko_ingredient_prices_v1';
const INITIAL_PRICE_MAP_STORAGE_KEY = 'stocko_ingredient_initial_prices_v1';
const PRICE_HISTORY_STORAGE_KEY = 'stocko_ingredient_price_history_v1';
const MERCHANT_SETTINGS_STORAGE_KEY = 'stocko_merchant_settings_v1';
const ORDERS_STORAGE_KEY = 'stocko_orders_v1';
const AUDIT_LOGS_STORAGE_KEY = 'stocko_audit_logs_v1';
const STOCK_MOVEMENTS_STORAGE_KEY = 'stocko_stock_movements_v1';
const SEASONAL_EVENTS_STORAGE_KEY = 'stocko_seasonal_events_v2';
const TX_META_STORAGE_KEY = 'stocko_tx_metadata_v1';
const RETAIL_PRODUCTS_META_KEY = 'stocko_retail_products_meta_v1';
const RETAIL_PRICE_HISTORY_KEY = 'stocko_retail_price_history_v1';
const DAILY_SALES_HISTORY_KEY = 'stocko_daily_sales_history_v1';
const INGREDIENT_BATCHES_KEY = 'stocko_ingredient_batches_v1';
const ACTIVE_COMPANY_STORAGE_KEY = 'stocko_active_company_id_v1';
const WORKSPACE_MANIFEST_PREFIX = 'stocko_workspace_manifest_v1:';
const unavailableTablesSet = new Set();
const inFlightTableQueries = new Map();
let activeCompanyIdMemory = null;
const workspaceManifestCache = new Map();

export function getActiveCompanyId() {
  if (activeCompanyIdMemory) return activeCompanyIdMemory;
  try {
    const stored = window.localStorage.getItem(ACTIVE_COMPANY_STORAGE_KEY);
    if (stored) {
      activeCompanyIdMemory = stored;
      return stored;
    }
  } catch {
    // Abaikan
  }
  return null;
}

export function setActiveCompanyId(companyId) {
  const clean = companyId ? String(companyId).trim() : null;
  activeCompanyIdMemory = clean;
  try {
    if (clean) {
      window.localStorage.setItem(ACTIVE_COMPANY_STORAGE_KEY, clean);
    } else {
      window.localStorage.removeItem(ACTIVE_COMPANY_STORAGE_KEY);
    }
  } catch {
    // Abaikan
  }
}

function getScopedStorageKey(baseKey) {
  if (!baseKey || baseKey.startsWith(WORKSPACE_MANIFEST_PREFIX) || baseKey === ACTIVE_COMPANY_STORAGE_KEY) {
    return baseKey;
  }
  const cid = getActiveCompanyId();
  return cid ? `${baseKey}:${cid}` : baseKey;
}

function createEmptyWorkspaceManifest({
  companyId,
  adminId = '',
  adminEmail = '',
  adminName = 'Admin',
  businessName = 'Usaha Utama',
  businessType = 'fnb',
  paymentFlow = 'pay_first',
  subscriptionPlan = 'pro'
}) {
  return {
    companyId: String(companyId),
    adminId: String(adminId || companyId),
    adminEmail: String(adminEmail || '').trim().toLowerCase(),
    adminName: String(adminName || 'Admin').trim(),
    businessName: String(businessName || 'Usaha Utama').trim(),
    businessType: businessType || 'fnb',
    paymentFlow: paymentFlow || 'pay_first',
    subscriptionPlan: subscriptionPlan || 'pro',
    staffEmails: [],
    productIds: [],
    ingredientIds: [],
    orderIds: [],
    transactionIds: [],
    createdAt: new Date().toISOString()
  };
}

export function getActiveWorkspaceManifest() {
  const cid = getActiveCompanyId();
  if (!cid) return null;
  if (workspaceManifestCache.has(cid)) {
    return workspaceManifestCache.get(cid);
  }
  try {
    const raw = window.localStorage.getItem(`${WORKSPACE_MANIFEST_PREFIX}${cid}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      workspaceManifestCache.set(cid, parsed);
      return parsed;
    }
  } catch {
    // Abaikan
  }
  return null;
}

function saveWorkspaceManifestLocal(manifest) {
  if (!manifest?.companyId) return;
  const cid = String(manifest.companyId);
  workspaceManifestCache.set(cid, manifest);
  try {
    window.localStorage.setItem(`${WORKSPACE_MANIFEST_PREFIX}${cid}`, JSON.stringify(manifest));
  } catch {
    // Abaikan
  }
}

async function persistWorkspaceManifestToDb(manifest) {
  if (!manifest?.companyId) return;
  saveWorkspaceManifestLocal(manifest);
  await runOptionalTableWrite('merchant_settings', async () => {
    const row = {
      id: `workspace:${manifest.companyId}`,
      default_order_channel: 'dine_in',
      payment_flow: manifest.paymentFlow || 'pay_first',
      closed_kitchen_enabled: true,
      require_cashier_shift: true,
      updated_by: JSON.stringify(manifest),
      updated_at: new Date().toISOString()
    };
    const res = await supabase
      .from('merchant_settings')
      .upsert({ ...row, business_type: manifest.businessType || 'fnb' });
    if (res.error && String(res.error.code) === 'PGRST204') {
      return supabase.from('merchant_settings').upsert(row);
    }
    return res;
  });
}

export async function fetchOrInitCompanyWorkspace({
  companyId,
  adminId = '',
  adminEmail = '',
  adminName = 'Admin',
  businessName = 'Usaha Utama',
  businessType = 'fnb',
  paymentFlow = 'pay_first',
  subscriptionPlan = 'pro',
  forceReset = false
}) {
  if (!companyId) return null;
  const cid = String(companyId).trim();
  setActiveCompanyId(cid);

  if (forceReset) {
    const fresh = createEmptyWorkspaceManifest({
      companyId: cid,
      adminId: adminId || cid,
      adminEmail,
      adminName,
      businessName,
      businessType,
      paymentFlow,
      subscriptionPlan
    });
    await persistWorkspaceManifestToDb(fresh);
    return fresh;
  }

  const res = await runOptionalTableRead('merchant_settings', () =>
    supabase
      .from('merchant_settings')
      .select('*')
      .eq('id', `workspace:${cid}`)
      .maybeSingle()
  );

  if (res && !res.error && res.data?.updated_by) {
    try {
      const parsed = JSON.parse(res.data.updated_by);
      if (parsed && parsed.companyId) {
        const merged = {
          ...createEmptyWorkspaceManifest({ companyId: cid }),
          ...parsed,
          businessType: res.data.business_type || parsed.businessType || businessType,
          paymentFlow: res.data.payment_flow || parsed.paymentFlow || paymentFlow
        };
        saveWorkspaceManifestLocal(merged);
        return merged;
      }
    } catch {
      // Gunakan fallback
    }
  }

  const existingLocal = getActiveWorkspaceManifest();
  if (existingLocal && existingLocal.companyId === cid) {
    return existingLocal;
  }

  const initial = createEmptyWorkspaceManifest({
    companyId: cid,
    adminId: adminId || cid,
    adminEmail,
    adminName,
    businessName,
    businessType,
    paymentFlow,
    subscriptionPlan
  });
  await persistWorkspaceManifestToDb(initial);
  return initial;
}

export async function findWorkspaceForEmployeeEmail(email) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!cleanEmail) return null;
  const res = await runOptionalTableRead('merchant_settings', () =>
    supabase
      .from('merchant_settings')
      .select('*')
      .like('id', 'workspace:%')
  );
  if (res && !res.error && Array.isArray(res.data)) {
    for (const row of res.data) {
      try {
        const parsed = JSON.parse(row.updated_by || '{}');
        if (
          parsed?.companyId &&
          (parsed.adminEmail === cleanEmail ||
            (Array.isArray(parsed.staffEmails) && parsed.staffEmails.includes(cleanEmail)))
        ) {
          saveWorkspaceManifestLocal(parsed);
          return parsed;
        }
      } catch {
        // Lewati baris tidak valid
      }
    }
  }
  return null;
}

export async function updateWorkspaceManifest(mutatorFn) {
  const cid = getActiveCompanyId();
  if (!cid) return null;
  const current =
    getActiveWorkspaceManifest() || createEmptyWorkspaceManifest({ companyId: cid });
  const next = mutatorFn({
    ...current,
    staffEmails: Array.isArray(current.staffEmails) ? [...current.staffEmails] : [],
    productIds: Array.isArray(current.productIds) ? [...current.productIds] : [],
    ingredientIds: Array.isArray(current.ingredientIds) ? [...current.ingredientIds] : [],
    orderIds: Array.isArray(current.orderIds) ? [...current.orderIds] : [],
    transactionIds: Array.isArray(current.transactionIds) ? [...current.transactionIds] : []
  });
  if (!next) return current;
  await persistWorkspaceManifestToDb(next);
  return next;
}

export async function registerCompanyProductId(productId) {
  if (productId === undefined || productId === null) return;
  const idStr = String(productId);
  await updateWorkspaceManifest((m) => ({
    ...m,
    productIds: Array.from(new Set([...m.productIds, idStr]))
  }));
}

export async function unregisterCompanyProductId(productId) {
  if (productId === undefined || productId === null) return;
  const idStr = String(productId);
  await updateWorkspaceManifest((m) => ({
    ...m,
    productIds: m.productIds.filter((id) => String(id) !== idStr)
  }));
}

export async function registerCompanyIngredientId(ingredientId) {
  if (ingredientId === undefined || ingredientId === null) return;
  const idStr = String(ingredientId);
  await updateWorkspaceManifest((m) => ({
    ...m,
    ingredientIds: Array.from(new Set([...m.ingredientIds, idStr]))
  }));
}

export async function unregisterCompanyIngredientId(ingredientId) {
  if (ingredientId === undefined || ingredientId === null) return;
  const idStr = String(ingredientId);
  await updateWorkspaceManifest((m) => ({
    ...m,
    ingredientIds: m.ingredientIds.filter((id) => String(id) !== idStr)
  }));
}

export async function registerCompanyStaffEmail(email) {
  const clean = String(email || '').trim().toLowerCase();
  if (!clean) return;
  await updateWorkspaceManifest((m) => ({
    ...m,
    staffEmails: Array.from(new Set([...m.staffEmails, clean]))
  }));
}

export async function unregisterCompanyStaffEmail(email) {
  const clean = String(email || '').trim().toLowerCase();
  if (!clean) return;
  await updateWorkspaceManifest((m) => ({
    ...m,
    staffEmails: m.staffEmails.filter((e) => e !== clean)
  }));
}

export async function registerCompanyOrderId(orderId) {
  if (!orderId) return;
  const idStr = String(orderId);
  await updateWorkspaceManifest((m) => ({
    ...m,
    orderIds: Array.from(new Set([...m.orderIds, idStr]))
  }));
}

export async function registerCompanyTransactionId(txId) {
  if (txId === undefined || txId === null) return;
  const idStr = String(txId);
  await updateWorkspaceManifest((m) => ({
    ...m,
    transactionIds: Array.from(new Set([...m.transactionIds, idStr]))
  }));
}

export function clearUnavailableTablesCache() {
  unavailableTablesSet.clear();
  try {
    window.sessionStorage.removeItem('stocko_unavailable_tables_v1');
  } catch {
    // Abaikan
  }
}

export function clearOperationalLocalCaches({ preserveMerchantSettings = true } = {}) {
  const keys = [
    PRICE_MAP_STORAGE_KEY,
    INITIAL_PRICE_MAP_STORAGE_KEY,
    PRICE_HISTORY_STORAGE_KEY,
    ORDERS_STORAGE_KEY,
    AUDIT_LOGS_STORAGE_KEY,
    STOCK_MOVEMENTS_STORAGE_KEY,
    SEASONAL_EVENTS_STORAGE_KEY,
    TX_META_STORAGE_KEY,
    RETAIL_PRODUCTS_META_KEY,
    RETAIL_PRICE_HISTORY_KEY,
    DAILY_SALES_HISTORY_KEY,
    INGREDIENT_BATCHES_KEY,
    ...(preserveMerchantSettings ? [] : [MERCHANT_SETTINGS_STORAGE_KEY])
  ];
  try {
    keys.forEach((k) => {
      window.localStorage.removeItem(k);
      window.localStorage.removeItem(getScopedStorageKey(k));
    });
  } catch {
    // Abaikan jika storage dibatasi
  }
}

function markTableUnavailable(table) {
  unavailableTablesSet.add(table);
}

function isTableKnownUnavailable(table) {
  return unavailableTablesSet.has(table);
}

function isMissingTableError(error) {
  if (!error) return false;
  const code = String(error.code || '');
  const msg = String(error.message || '').toLowerCase();
  return (
    code === 'PGRST205' ||
    code === '42P01' ||
    error.status === 404 ||
    msg.includes('could not find the table') ||
    msg.includes('not found')
  );
}

async function runOptionalTableRead(table, fn) {
  if (isTableKnownUnavailable(table)) return null;
  if (inFlightTableQueries.has(table)) {
    return inFlightTableQueries.get(table);
  }
  const promise = (async () => {
    try {
      const res = await fn();
      if (isMissingTableError(res?.error)) {
        markTableUnavailable(table);
        return null;
      }
      return res;
    } catch {
      markTableUnavailable(table);
      return null;
    } finally {
      inFlightTableQueries.delete(table);
    }
  })();
  inFlightTableQueries.set(table, promise);
  return promise;
}

async function runOptionalTableWrite(table, fn) {
  if (isTableKnownUnavailable(table)) return null;
  try {
    const res = await fn();
    if (isMissingTableError(res?.error)) {
      markTableUnavailable(table);
      return null;
    }
    return res;
  } catch {
    markTableUnavailable(table);
    return null;
  }
}

function readLocalJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(getScopedStorageKey(key));
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocalJson(key, value) {
  try {
    window.localStorage.setItem(getScopedStorageKey(key), JSON.stringify(value));
  } catch {
    // Abaikan jika storage dibatasi browser
  }
}

export function suggestMarketPrice(name, unit) {
  const n = (name || '').toLowerCase();
  const u = (unit || '').toLowerCase().trim();
  if (n.includes('kopi') || n.includes('espresso') || n.includes('arabika')) {
    return u === 'kg' ? 185000 : 185;
  }
  if (n.includes('susu') || n.includes('milk')) {
    return u === 'liter' || u === 'l' || u === 'kg' ? 22000 : 22;
  }
  if (n.includes('aren') || n.includes('gula') || n.includes('gulpas') || n.includes('sirup')) {
    return u === 'kg' || u === 'liter' ? 28000 : 28;
  }
  if (n.includes('keju') || n.includes('butter') || n.includes('mentega')) {
    return u === 'kg' ? 125000 : 125;
  }
  if (n.includes('ayam') || n.includes('daging') || n.includes('sapi')) {
    return u === 'kg' ? 68000 : 68;
  }
  if (n.includes('matcha') || n.includes('coklat') || n.includes('teh')) {
    return u === 'kg' ? 160000 : 160;
  }
  if (u === 'pcs' || u === 'cup' || u === 'buah') return 1200;
  if (u === 'kg' || u === 'liter' || u === 'l') return 35000;
  return 35;
}

export async function fetchIngredientBatchesMap() {
  const localMap = readLocalJson(INGREDIENT_BATCHES_KEY, {});
  const res = await runOptionalTableRead('ingredient_batches', () =>
    supabase
      .from('ingredient_batches')
      .select('*')
      .order('expiry_date', { ascending: true })
      .order('created_at', { ascending: true })
  );

  if (res && !res.error && Array.isArray(res.data)) {
    const map = {};
    res.data.forEach((row) => {
      const ingId = String(row.ingredient_id);
      if (!map[ingId]) map[ingId] = [];
      map[ingId].push({
        id: row.id,
        ingredientId: ingId,
        batchCode: row.batch_code,
        qty: Number(row.qty) || 0,
        initialQty: Number(row.initial_qty) || 0,
        unit: row.unit || 'pcs',
        entryDate: row.entry_date || '',
        expiryDate: row.expiry_date || '',
        stockerName: row.stocker_name || 'Stok Awal',
        notes: row.notes || '',
        disposedAsWaste: Boolean(row.disposed_as_waste),
        createdAt: row.created_at
      });
    });

    // Gabungkan fallback local jika ada item yang belum tersync ke DB
    Object.keys(localMap).forEach((k) => {
      if (!map[k] && Array.isArray(localMap[k]) && localMap[k].length > 0) {
        map[k] = localMap[k];
      }
    });

    writeLocalJson(INGREDIENT_BATCHES_KEY, map);
    return map;
  }

  return localMap;
}

export async function syncIngredientBatchesToDb(ingredientId, batches = []) {
  if (!ingredientId) return;
  const key = String(ingredientId);
  const localMap = readLocalJson(INGREDIENT_BATCHES_KEY, {});
  localMap[key] = batches;
  writeLocalJson(INGREDIENT_BATCHES_KEY, localMap);

  if (!Array.isArray(batches) || batches.length === 0) return;

  const payload = batches.map((b) => ({
    id: String(b.id),
    ingredient_id: key,
    batch_code: b.batchCode || 'BATCH',
    qty: Math.max(0, Number(b.qty) || 0),
    initial_qty: Math.max(0, Number(b.initialQty ?? b.qty) || 0),
    unit: b.unit || 'pcs',
    entry_date: b.entryDate || null,
    expiry_date: b.expiryDate || null,
    stocker_name: b.stockerName || '',
    notes: b.notes || '',
    disposed_as_waste: Boolean(b.disposedAsWaste),
    updated_at: new Date().toISOString()
  }));

  await runOptionalTableWrite('ingredient_batches', () =>
    supabase.from('ingredient_batches').upsert(payload, { onConflict: 'id' })
  );
}

export async function fetchIngredients() {
  const manifest = getActiveWorkspaceManifest();
  if (!manifest) return [];
  const allowedIds = new Set((manifest.ingredientIds || []).map((id) => String(id)));
  if (allowedIds.size === 0) return [];

  const [{ data, error }, batchesMap] = await Promise.all([
    supabase.from('ingredients').select('*'),
    fetchIngredientBatchesMap()
  ]);
  if (error) {
    console.error('Gagal memuat bahan baku:', error.message);
    return [];
  }

  const localPriceMap = readLocalJson(PRICE_MAP_STORAGE_KEY, {});
  const localInitialMap = readLocalJson(INITIAL_PRICE_MAP_STORAGE_KEY, {});

  return (data || [])
    .filter((item) => allowedIds.has(String(item.id)))
    .map(item => {
    const dbMarketPrice =
      item.current_market_price !== undefined && item.current_market_price !== null
        ? Number(item.current_market_price)
        : null;
    const dbUnitPrice =
      item.unit_price !== undefined && item.unit_price !== null
        ? Number(item.unit_price)
        : null;
    const resolvedMarketPrice =
      dbMarketPrice !== null && dbMarketPrice > 0
        ? dbMarketPrice
        : dbUnitPrice !== null && dbUnitPrice > 0
        ? dbUnitPrice
        : Number(localPriceMap[String(item.id)] ?? 0);

    const dbInitialPrice =
      item.initial_purchase_price !== undefined && item.initial_purchase_price !== null
        ? Number(item.initial_purchase_price)
        : null;
    const cachedInitial = Number(localInitialMap[String(item.id)] ?? 0);
    const resolvedInitialPrice =
      dbInitialPrice !== null && dbInitialPrice > 0
        ? dbInitialPrice
        : cachedInitial > 0
        ? cachedInitial
        : resolvedMarketPrice;

    const existingBatches = batchesMap[String(item.id)];
    const baseItem = {
      id: item.id,
      name: item.name,
      stock: item.stock,
      unit: item.unit,
      minLimit: item.min_stock_threshold ?? item.min_limit ?? 5,
      unitPrice: resolvedMarketPrice,
      currentMarketPrice: resolvedMarketPrice,
      initialPurchasePrice: resolvedInitialPrice,
      expiryDate: item.expiry_date || item.expiryDate || '',
      entryDate: item.entry_date || item.entryDate || '',
      batches: Array.isArray(existingBatches) ? existingBatches : []
    };

    const hydratedBatches = ensureBatchesForIngredient(baseItem);
    const batchSummary = summarizeIngredientBatches({ ...baseItem, batches: hydratedBatches });

    return {
      ...baseItem,
      stock: existingBatches && existingBatches.length > 0 ? batchSummary.totalStock : item.stock,
      expiryDate: batchSummary.earliestActiveExpiryDate || baseItem.expiryDate,
      batches: hydratedBatches
    };
  });
}

export async function updateIngredientStock(id, newStock, nextExpiryDate = null) {
  const payload = { stock: newStock };
  if (nextExpiryDate !== null && nextExpiryDate !== undefined) {
    payload.expiry_date = nextExpiryDate || null;
  }
  const { error } = await supabase
    .from('ingredients')
    .update(payload)
    .eq('id', id);
  if (error) console.error('Gagal memperbarui stok:', error);
}

export async function fetchProducts() {
  const manifest = getActiveWorkspaceManifest();
  if (!manifest) return [];
  const allowedIds = new Set((manifest.productIds || []).map((id) => String(id)));
  if (allowedIds.size === 0) return [];

  const { data, error } = await supabase.from('products').select('*');
  if (error) {
    console.error('Gagal mengambil data produk:', error);
    return [];
  }

  const localRetailMeta = readLocalJson(RETAIL_PRODUCTS_META_KEY, {});

  // Petakan properti dari database (snake_case) ke format frontend (camelCase)
  return (data || [])
    .filter((item) => allowedIds.has(String(item.id)))
    .map(item => {
    const meta = localRetailMeta[String(item.id)] || {};
    const recipeArr = Array.isArray(item.recipe) ? item.recipe : [];
    const resolvedPurchasePrice =
      item.purchase_price !== undefined && item.purchase_price !== null && Number(item.purchase_price) > 0
        ? Number(item.purchase_price)
        : Number(meta.purchasePrice ?? 0);
    const resolvedStock =
      item.stock !== undefined && item.stock !== null
        ? Number(item.stock)
        : Number(meta.stock ?? 0);

    return {
      id: item.id,
      name: item.name,
      category: item.category,
      price: item.price,
      stock: resolvedStock,
      minLimit: Number(item.min_stock_threshold ?? meta.minLimit ?? 5),
      sku: item.sku || meta.sku || '',
      unit: item.unit || meta.unit || 'pcs',
      variantLabel: item.variant_label || meta.variantLabel || '',
      purchasePrice: resolvedPurchasePrice,
      productMode: item.product_mode || meta.productMode || (recipeArr.length > 0 ? 'fnb' : 'fnb'),
      image: item.image,
      recipe: recipeArr,
      expiryDate: item.expiry_date || item.expiryDate || ''
    };
  });
}

export async function updateRetailProductStock(productId, newStock) {
  const numericStock = Math.max(0, Number(newStock) || 0);
  const localMeta = readLocalJson(RETAIL_PRODUCTS_META_KEY, {});
  localMeta[String(productId)] = {
    ...(localMeta[String(productId)] || {}),
    stock: numericStock
  };
  writeLocalJson(RETAIL_PRODUCTS_META_KEY, localMeta);

  if (!isTableKnownUnavailable('products.retail_columns')) {
    const { error } = await supabase
      .from('products')
      .update({ stock: numericStock })
      .eq('id', productId);

    if (error && (String(error.code) === 'PGRST204' || String(error.message || '').toLowerCase().includes('column'))) {
      markTableUnavailable('products.retail_columns');
    }
  }
}

export async function fetchRetailPurchasePriceHistory() {
  const manifest = getActiveWorkspaceManifest();
  if (!manifest) return [];
  const allowedProdIds = new Set((manifest.productIds || []).map((id) => String(id)));
  if (allowedProdIds.size === 0) return [];

  const res = await runOptionalTableRead('product_purchase_price_history', () =>
    supabase
      .from('product_purchase_price_history')
      .select('*')
      .order('changed_at', { ascending: false })
      .limit(60)
  );

  if (res && !res.error && Array.isArray(res.data)) {
    const mapped = res.data
      .filter((row) => allowedProdIds.has(String(row.product_id)))
      .map((row) => ({
        id: row.id,
        productId: row.product_id,
        productName: row.product_name,
        sku: row.sku || '',
        unit: row.unit || 'pcs',
        oldPrice: Number(row.old_price) || 0,
        newPrice: Number(row.new_price) || 0,
        changePct: Number(row.change_pct) || 0,
        notes: row.notes || 'Pembaruan harga kulakan supplier',
        changedBy: row.changed_by || 'Admin',
        changedAt: row.changed_at
      }));
    writeLocalJson(RETAIL_PRICE_HISTORY_KEY, mapped);
    return mapped;
  }

  return readLocalJson(RETAIL_PRICE_HISTORY_KEY, []).filter((row) =>
    allowedProdIds.has(String(row.productId))
  );
}

export async function recordRetailPurchasePriceChange({
  product,
  oldPrice,
  newPrice,
  notes = 'Pembaruan harga kulakan supplier',
  operatorName = 'Admin'
}) {
  const parsedOld = Number(oldPrice) || 0;
  const parsedNew = Math.max(0, Number(newPrice) || 0);
  const changePct =
    parsedOld > 0
      ? Number((((parsedNew - parsedOld) / parsedOld) * 100).toFixed(1))
      : parsedNew > 0
      ? 100
      : 0;

  const entry = {
    id: `RPRC-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    productId: product?.id || null,
    productName: product?.name || 'Produk Ritel',
    sku: product?.sku || '',
    unit: product?.unit || 'pcs',
    oldPrice: parsedOld,
    newPrice: parsedNew,
    changePct,
    notes: (notes || '').trim() || 'Pembaruan harga kulakan supplier',
    changedBy: operatorName,
    changedAt: new Date().toISOString()
  };

  const current = readLocalJson(RETAIL_PRICE_HISTORY_KEY, []);
  writeLocalJson(RETAIL_PRICE_HISTORY_KEY, [entry, ...current].slice(0, 60));

  await runOptionalTableWrite('product_purchase_price_history', () =>
    supabase.from('product_purchase_price_history').insert([
      {
        product_id: entry.productId,
        product_name: entry.productName,
        sku: entry.sku,
        unit: entry.unit,
        old_price: entry.oldPrice,
        new_price: entry.newPrice,
        change_pct: entry.changePct,
        notes: entry.notes,
        changed_by: entry.changedBy,
        changed_at: entry.changedAt
      }
    ])
  );

  return entry;
}

export async function saveProductWithRetailFields({
  formData,
  editingProduct,
  cleanRecipe = [],
  businessType = 'fnb',
  operatorName = 'Admin'
}) {
  const isRetailItem = businessType === 'retail' || formData.productMode === 'retail';
  const basePayload = {
    name: formData.name.trim(),
    category: formData.category,
    price: Number(formData.price),
    expiry_date: formData.expiryDate || null,
    image: formData.image || '/logo-stocko.png',
    recipe: isRetailItem ? [] : cleanRecipe
  };

  const retailPayload = {
    ...basePayload,
    sku: (formData.sku || '').trim(),
    unit: formData.unit || 'pcs',
    variant_label: (formData.variantLabel || '').trim(),
    purchase_price: Math.max(0, Number(formData.purchasePrice) || 0),
    stock: Math.max(0, Number(formData.stock) || 0),
    min_stock_threshold: Math.max(0, Number(formData.minLimit ?? 5)),
    product_mode: isRetailItem ? 'retail' : 'fnb'
  };

  let savedRow;
  let error;

  const tryWithExtended = !isTableKnownUnavailable('products.retail_columns');

  if (editingProduct) {
    const res = await supabase
      .from('products')
      .update(tryWithExtended ? retailPayload : basePayload)
      .eq('id', editingProduct.id)
      .select();

    if (res.error && tryWithExtended) {
      markTableUnavailable('products.retail_columns');
      const retry = await supabase
        .from('products')
        .update(basePayload)
        .eq('id', editingProduct.id)
        .select();
      savedRow = retry.data?.[0] || { ...basePayload, id: editingProduct.id };
      error = retry.error;
    } else {
      savedRow = res.data?.[0] || { ...basePayload, id: editingProduct.id };
      error = res.error;
    }
  } else {
    const res = await supabase
      .from('products')
      .insert([tryWithExtended ? retailPayload : basePayload])
      .select();

    if (res.error && tryWithExtended) {
      markTableUnavailable('products.retail_columns');
      const retry = await supabase
        .from('products')
        .insert([basePayload])
        .select();
      savedRow = retry.data?.[0] || null;
      error = retry.error;
    } else {
      savedRow = res.data?.[0] || null;
      error = res.error;
    }
  }

  if (error || !savedRow) {
    return { success: false, message: error?.message || 'Gagal menyimpan produk.' };
  }

  await registerCompanyProductId(savedRow.id);

  // Simpan selalu metadata ritel ke localStorage agar persisten meski kolom DB belum dimigrasi
  const localMeta = readLocalJson(RETAIL_PRODUCTS_META_KEY, {});
  localMeta[String(savedRow.id)] = {
    sku: retailPayload.sku,
    unit: retailPayload.unit,
    variantLabel: retailPayload.variant_label,
    purchasePrice: retailPayload.purchase_price,
    stock: retailPayload.stock,
    minLimit: retailPayload.min_stock_threshold,
    productMode: retailPayload.product_mode
  };
  writeLocalJson(RETAIL_PRODUCTS_META_KEY, localMeta);

  const productObj = {
    id: savedRow.id,
    name: savedRow.name,
    category: savedRow.category,
    price: savedRow.price,
    expiryDate: savedRow.expiry_date || '',
    image: savedRow.image,
    recipe: savedRow.recipe || [],
    sku: retailPayload.sku,
    unit: retailPayload.unit,
    variantLabel: retailPayload.variant_label,
    purchasePrice: retailPayload.purchase_price,
    stock: retailPayload.stock,
    minLimit: retailPayload.min_stock_threshold,
    productMode: retailPayload.product_mode
  };

  let priceHistoryEntry = null;
  const oldPurchasePrice = Number(editingProduct?.purchasePrice ?? 0);
  if (
    isRetailItem &&
    retailPayload.purchase_price !== oldPurchasePrice &&
    (editingProduct || retailPayload.purchase_price > 0)
  ) {
    priceHistoryEntry = await recordRetailPurchasePriceChange({
      product: productObj,
      oldPrice: oldPurchasePrice,
      newPrice: retailPayload.purchase_price,
      notes: formData.priceChangeNote || (editingProduct ? 'Pembaruan harga kulakan' : 'Harga kulakan awal'),
      operatorName
    });
  }

  return { success: true, product: productObj, priceHistoryEntry };
}

export async function saveTransaction(
  totalAmount,
  cartItems,
  tableNumber,
  paymentMethod = 'cash',
  metadata = {}
) {
  const createdAt = new Date().toISOString();
  const basePayload = {
    total_amount: totalAmount,
    items: cartItems,
    table_number: tableNumber || 'Takeaway / Kasir',
    payment_method: paymentMethod,
    created_at: createdAt
  };

  const extendedPayload = {
    ...basePayload,
    order_channel: metadata.orderChannel || 'dine_in',
    payment_flow: metadata.paymentFlow || 'pay_first',
    payment_status: metadata.paymentStatus || 'paid',
    kitchen_status: metadata.kitchenStatus || 'served',
    cashier_id: metadata.cashierId || null,
    cashier_name: metadata.cashierName || 'Kasir Aktif',
    waste_cost: Number(metadata.wasteCost || 0),
    cancel_reason: metadata.cancelReason || null,
    revision_history: Array.isArray(metadata.revisionHistory) ? metadata.revisionHistory : []
  };

  let { data, error } = await supabase
    .from('transactions')
    .insert([extendedPayload])
    .select();

  if (error) {
    // Fallback bila kolom migrasi Iterasi 2 belum dijalankan di Supabase
    const retry = await supabase.from('transactions').insert([basePayload]).select();
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    console.error('Gagal menyimpan transaksi:', error);
    return null;
  }

  if (Array.isArray(data) && data[0]?.id) {
    await registerCompanyTransactionId(data[0].id);
    const metaMap = readLocalJson(TX_META_STORAGE_KEY, {});
    metaMap[String(data[0].id)] = {
      order_channel: extendedPayload.order_channel,
      payment_flow: extendedPayload.payment_flow,
      payment_status: extendedPayload.payment_status,
      kitchen_status: extendedPayload.kitchen_status,
      cashier_id: extendedPayload.cashier_id,
      cashier_name: extendedPayload.cashier_name,
      waste_cost: extendedPayload.waste_cost,
      cancel_reason: extendedPayload.cancel_reason,
      revision_history: extendedPayload.revision_history
    };
    writeLocalJson(TX_META_STORAGE_KEY, metaMap);
    data[0] = { ...data[0], ...metaMap[String(data[0].id)] };
  }

  return data;
}

// --- FUNGSI BARU UNTUK REPORTING ---
export async function fetchTransactions() {
  const manifest = getActiveWorkspaceManifest();
  if (!manifest) return [];
  const allowedTxIds = new Set((manifest.transactionIds || []).map((id) => String(id)));
  if (allowedTxIds.size === 0) return [];

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Gagal mengambil data transaksi:', error.message);
    return [];
  }
  const metaMap = readLocalJson(TX_META_STORAGE_KEY, {});
  return (data || [])
    .filter((row) => allowedTxIds.has(String(row.id)))
    .map((row) => ({
      ...row,
      ...(metaMap[String(row.id)] || {})
    }));
}

export async function registerUser(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    console.error('Gagal melakukan registrasi:', error.message);
    return { success: false, message: error.message };
  }
  return { success: true, data };
}

// --- AUTHENTICATION LOGIN ---
export async function loginUser(identifier, password) {
  const raw = String(identifier || '').trim();
  const resolvedEmail = raw.includes('@')
    ? raw.toLowerCase()
    : `${raw
        .toLowerCase()
        .replace(/[^a-z0-9._-]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')}@staff.stocko.app`;

  const { data, error } = await supabase.auth.signInWithPassword({
    email: resolvedEmail,
    password
  });

  if (error) {
    console.error('Gagal login:', error.message);
    return { success: false, message: 'Username/Email atau kata sandi salah. Silakan coba lagi.' };
  }
  return { success: true, data };
}

export async function sendMagicLink(email) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email: email,
    options: {
      emailRedirectTo: window.location.origin
    }
  });

  if (error) {
    console.error('Gagal mengirim Magic Link:', error.message);
    return { success: false, message: error.message };
  }
  return { success: true, data };
}

// --- RESTOCK / CATAT BARANG MASUK ---
export async function recordRestock(ingredientId, addedQty, supplierName, notes) {
  const { error: logError } = await supabase
    .from('restock_logs')
    .insert([
      {
        ingredient_id: ingredientId,
        added_qty: addedQty,
        supplier: supplierName || 'Supplier Umum',
        notes: notes || 'Restock rutin',
        created_at: new Date()
      }
    ]);

  if (logError) {
    console.error('Gagal mencatat log restock:', logError.message);
  }

  const { data: currentIng, error: fetchError } = await supabase
    .from('ingredients')
    .select('stock')
    .eq('id', ingredientId)
    .single();

  if (fetchError) {
    return { success: false, message: fetchError.message };
  }

  const newStock = Number(currentIng.stock) + Number(addedQty);

  const { error: updateError } = await supabase
    .from('ingredients')
    .update({ stock: newStock })
    .eq('id', ingredientId);

  if (updateError) {
    return { success: false, message: updateError.message };
  }

  return { success: true, newStock };
}

// --- KELOLA KARYAWAN (ADMIN ONLY) ---

export async function fetchEmployees() {
  const { data, error } = await supabase.from('user_roles').select('*').order('email');
  if (error) {
    console.error('Gagal memuat karyawan:', error.message);
    return { success: false, message: error.message, data: [] };
  }
  return { success: true, data: data || [] };
}

export async function addEmployee(email, password, role) {
  // 1. Buat user di Auth (Trigger otomatis menulis ke user_roles berkat data.role)
  const { data, error } = await supabaseAdminAuth.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: role
      }
    }
  });

  if (error) {
    console.error('Gagal membuat akun karyawan:', error.message);
    return { success: false, message: error.message };
  }
  return { success: true, data };
}

export async function deleteEmployeeRole(employeeId, email, role) {
  if ((role || '').toLowerCase() === 'superadmin') {
    return {
      success: false,
      code: 'PROTECTED_ROLE',
      message: 'Akun dengan role Superadmin dilindungi dan tidak dapat dihapus.'
    };
  }

  // 1. Hapus berdasarkan id (kecuali role superadmin) dan gunakan .select() untuk verifikasi
  if (employeeId) {
    const { data, error } = await supabase
      .from('user_roles')
      .delete()
      .eq('id', employeeId)
      .neq('role', 'superadmin')
      .select();

    if (error) {
      return { success: false, message: error.message };
    }
    if (data && data.length > 0) {
      return { success: true, deletedCount: data.length };
    }
  }

  // 2. Fallback: coba hapus berdasarkan email (kecuali role superadmin)
  if (email) {
    const { data: byEmailData, error: byEmailError } = await supabase
      .from('user_roles')
      .delete()
      .eq('email', email)
      .neq('role', 'superadmin')
      .select();

    if (byEmailError) {
      return { success: false, message: byEmailError.message };
    }
    if (byEmailData && byEmailData.length > 0) {
      return { success: true, deletedCount: byEmailData.length };
    }
  }

  // 3. Jika error null namun 0 baris terhapus, kemungkinan besar terblokir RLS atau belum login
  const { data: sessionData } = await supabase.auth.getSession();
  const hasSession = Boolean(sessionData?.session);

  return {
    success: false,
    code: hasSession ? 'RLS_BLOCKED' : 'NO_SESSION',
    message: hasSession
      ? 'Database Supabase menolak penghapusan (0 baris terhapus). Tabel user_roles belum memiliki RLS policy DELETE untuk Admin.'
      : 'Penghapusan gagal (0 baris terhapus). Anda belum login sebagai Admin atau kebijakan RLS DELETE pada tabel user_roles di Supabase belum diaktifkan.'
  };
}

// --- HARGA BAHAN BAKU, RIWAYAT HARGA, & LOG MUTASI ---

export async function fetchPriceHistory() {
  const manifest = getActiveWorkspaceManifest();
  if (!manifest) {
    return { success: true, persistedInDb: false, data: [] };
  }
  const allowedIngIds = new Set((manifest.ingredientIds || []).map((id) => String(id)));
  if (allowedIngIds.size === 0) {
    return { success: true, persistedInDb: false, data: [] };
  }

  const res = await runOptionalTableRead('ingredient_price_history', () =>
    supabase
      .from('ingredient_price_history')
      .select('*')
      .order('changed_at', { ascending: false })
      .limit(50)
  );

  if (res && !res.error && Array.isArray(res.data)) {
    return {
      success: true,
      persistedInDb: true,
      data: res.data
        .filter((row) => allowedIngIds.has(String(row.ingredient_id)))
        .map(row => ({
          id: row.id,
          ingredientId: row.ingredient_id,
          ingredientName: row.ingredient_name,
          unit: row.unit,
          oldPrice: Number(row.old_price) || 0,
          newPrice: Number(row.new_price) || 0,
          changePct: Number(row.change_pct) || 0,
          notes: row.notes || 'Pembaruan harga pasar',
          changedAt: row.changed_at
        }))
    };
  }

  return {
    success: true,
    persistedInDb: false,
    data: readLocalJson(PRICE_HISTORY_STORAGE_KEY, []).filter((row) =>
      allowedIngIds.has(String(row.ingredientId))
    )
  };
}

export async function updateIngredientPrice({
  ingredient,
  newPrice,
  initialPrice,
  notes = 'Pembaruan harga pasar'
}) {
  if (!ingredient) return { success: false, message: 'Bahan baku tidak ditemukan.' };

  const cleanName = String(ingredient.name || '').split(' | ')[0].trim();
  const oldPrice = Number(
    ingredient.currentMarketPrice ?? ingredient.unitPrice ?? ingredient.unit_price ?? 0
  );
  const parsedNewPrice = Math.max(0, Number(newPrice) || 0);

  const existingInitial = Number(
    ingredient.initialPurchasePrice ?? ingredient.initial_purchase_price ?? 0
  );
  const resolvedInitialPrice =
    initialPrice !== undefined && initialPrice !== null && initialPrice !== ''
      ? Math.max(0, Number(initialPrice) || 0)
      : existingInitial > 0
      ? existingInitial
      : oldPrice > 0
      ? oldPrice
      : parsedNewPrice;

  const changePct =
    oldPrice > 0
      ? Number((((parsedNewPrice - oldPrice) / oldPrice) * 100).toFixed(1))
      : parsedNewPrice > 0
      ? 100
      : 0;

  const historyEntry = {
    id: `PRC-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    ingredientId: ingredient.id,
    ingredientName: cleanName,
    unit: ingredient.unit || 'pcs',
    oldPrice,
    newPrice: parsedNewPrice,
    changePct,
    notes: notes.trim() || 'Pembaruan harga pasar',
    changedAt: new Date().toISOString()
  };

  // Simpan selalu di cache lokal agar persisten meski kolom Supabase belum dimigrasi
  const localMap = readLocalJson(PRICE_MAP_STORAGE_KEY, {});
  localMap[String(ingredient.id)] = parsedNewPrice;
  writeLocalJson(PRICE_MAP_STORAGE_KEY, localMap);

  const localInitialMap = readLocalJson(INITIAL_PRICE_MAP_STORAGE_KEY, {});
  localInitialMap[String(ingredient.id)] = resolvedInitialPrice;
  writeLocalJson(INITIAL_PRICE_MAP_STORAGE_KEY, localInitialMap);

  const localHistory = readLocalJson(PRICE_HISTORY_STORAGE_KEY, []);
  const nextLocalHistory = [historyEntry, ...localHistory].slice(0, 60);
  writeLocalJson(PRICE_HISTORY_STORAGE_KEY, nextLocalHistory);

  // Coba tulis ke kolom & tabel PostgreSQL/Supabase
  let persistedInDb = false;
  if (!isTableKnownUnavailable('ingredients.unit_price')) {
    const splitPayload = {
      unit_price: parsedNewPrice,
      current_market_price: parsedNewPrice,
      initial_purchase_price: resolvedInitialPrice
    };
    const useSplitCols = !isTableKnownUnavailable('ingredients.price_split');
    let ingRes = await supabase
      .from('ingredients')
      .update(useSplitCols ? splitPayload : { unit_price: parsedNewPrice })
      .eq('id', ingredient.id);

    if (ingRes.error && useSplitCols) {
      markTableUnavailable('ingredients.price_split');
      ingRes = await supabase
        .from('ingredients')
        .update({ unit_price: parsedNewPrice })
        .eq('id', ingredient.id);
    }

    if (ingRes.error) {
      markTableUnavailable('ingredients.unit_price');
    } else {
      const histRes = await runOptionalTableWrite('ingredient_price_history', () =>
        supabase.from('ingredient_price_history').insert([
          {
            ingredient_id: ingredient.id,
            ingredient_name: cleanName,
            unit: ingredient.unit || 'pcs',
            old_price: oldPrice,
            new_price: parsedNewPrice,
            change_pct: changePct,
            notes: historyEntry.notes
          }
        ])
      );
      if (histRes && !histRes.error) {
        persistedInDb = true;
      }
    }
  }

  return {
    success: true,
    persistedInDb,
    entry: historyEntry,
    initialPurchasePrice: resolvedInitialPrice,
    currentMarketPrice: parsedNewPrice
  };
}

export async function saveIngredientInitialPrice(ingredientId, initialPrice, currentMarketPrice = null) {
  if (!ingredientId) return;
  const parsedInitial = Math.max(0, Number(initialPrice) || 0);
  const localInitialMap = readLocalJson(INITIAL_PRICE_MAP_STORAGE_KEY, {});
  localInitialMap[String(ingredientId)] = parsedInitial;
  writeLocalJson(INITIAL_PRICE_MAP_STORAGE_KEY, localInitialMap);

  const payload = { initial_purchase_price: parsedInitial };
  if (currentMarketPrice !== null && currentMarketPrice !== undefined) {
    const parsedMarket = Math.max(0, Number(currentMarketPrice) || 0);
    payload.current_market_price = parsedMarket;
    payload.unit_price = parsedMarket;
    const localMap = readLocalJson(PRICE_MAP_STORAGE_KEY, {});
    localMap[String(ingredientId)] = parsedMarket;
    writeLocalJson(PRICE_MAP_STORAGE_KEY, localMap);
  }

  if (!isTableKnownUnavailable('ingredients.price_split')) {
    const { error } = await supabase.from('ingredients').update(payload).eq('id', ingredientId);
    if (error) {
      markTableUnavailable('ingredients.price_split');
    }
  }
}

export async function seedMarketPricesForMissing(ingredients = []) {
  const missing = ingredients.filter(
    i => !(Number(i.currentMarketPrice ?? i.unitPrice) > 0)
  );
  if (missing.length === 0) return { updated: [...ingredients], entries: [] };

  const updated = [...ingredients];
  const entries = [];

  for (const ing of missing) {
    const suggested = suggestMarketPrice(ing.name, ing.unit);
    const res = await updateIngredientPrice({
      ingredient: ing,
      newPrice: suggested,
      initialPrice: Number(ing.initialPurchasePrice || 0) > 0 ? ing.initialPurchasePrice : suggested,
      notes: 'Inisialisasi harga referensi pasar'
    });
    if (res.success) {
      const idx = updated.findIndex(x => String(x.id) === String(ing.id));
      if (idx >= 0) {
        updated[idx] = {
          ...updated[idx],
          unitPrice: suggested,
          currentMarketPrice: suggested,
          initialPurchasePrice: res.initialPurchasePrice
        };
      }
      entries.push(res.entry);
    }
  }

  return { updated, entries };
}

export async function syncMenuRecipesToDb(productId, recipe = [], ingredients = []) {
  if (!productId || !Array.isArray(recipe) || isTableKnownUnavailable('menu_recipes')) return;
  const delRes = await runOptionalTableWrite('menu_recipes', () =>
    supabase.from('menu_recipes').delete().eq('product_id', productId)
  );
  if (!delRes || recipe.length === 0) return;

  const rows = recipe
    .filter(r => r?.name && Number(r.qty) > 0)
    .map(r => {
      const clean = String(r.name).split(' | ')[0].toLowerCase().trim();
      const found = ingredients.find(i => (i.name || '').toLowerCase().includes(clean));
      return {
        product_id: productId,
        ingredient_id: found?.id || null,
        ingredient_name: String(r.name).split(' | ')[0].trim(),
        qty: Number(r.qty),
        unit: r.unit || 'gram'
      };
    });

  if (rows.length > 0) {
    await runOptionalTableWrite('menu_recipes', () => supabase.from('menu_recipes').insert(rows));
  }
}

export async function recordStockMutationLog(entry) {
  await runOptionalTableWrite('stock_logs', () =>
    supabase.from('stock_logs').insert([
      {
        ingredient_id: entry.ingredientId || null,
        item_name: entry.itemName,
        mutation_type: entry.type,
        qty_label: entry.qty,
        outlet: entry.outlet || 'Cabang Utama - Makassar',
        note: entry.note || ''
      }
    ])
  );
}


// =========================================================================
// ITERASI 2: WORKFLOW SETTINGS, ORDERS/KDS, AUDIT TRAIL & SEASONAL EVENTS
// =========================================================================

export const DEFAULT_MERCHANT_SETTINGS = {
  businessType: 'fnb', // 'fnb' | 'retail'
  defaultOrderChannel: 'dine_in',
  paymentFlow: 'pay_first',
  closedKitchenEnabled: true,
  requireCashierShift: true
};

export async function fetchMerchantSettings() {
  const manifest = getActiveWorkspaceManifest();
  if (manifest) {
    return {
      ...DEFAULT_MERCHANT_SETTINGS,
      businessType: manifest.businessType || 'fnb',
      paymentFlow: manifest.paymentFlow || 'pay_first'
    };
  }
  return readLocalJson(MERCHANT_SETTINGS_STORAGE_KEY, DEFAULT_MERCHANT_SETTINGS);
}

export async function saveMerchantSettings(settings, operatorName = 'Admin') {
  const normalized = {
    ...DEFAULT_MERCHANT_SETTINGS,
    ...settings
  };
  writeLocalJson(MERCHANT_SETTINGS_STORAGE_KEY, normalized);

  const cid = getActiveCompanyId();
  if (cid) {
    await updateWorkspaceManifest((m) => ({
      ...m,
      businessType: normalized.businessType,
      paymentFlow: normalized.paymentFlow
    }));
  }
  return normalized;
}

function mapDbOrderToClient(row) {
  return {
    id: row.id,
    orderNumber: row.order_number,
    orderChannel: row.order_channel || 'dine_in',
    paymentFlow: row.payment_flow || 'pay_first',
    orderStatus: row.order_status || 'open',
    paymentStatus: row.payment_status || 'unpaid',
    kitchenStatus: row.kitchen_status || 'queued',
    paymentMethod: row.payment_method || 'cash',
    tableNumber: row.table_number || 'Kasir Utama',
    customerName: row.customer_name || '',
    totalAmount: Number(row.total_amount) || 0,
    wasteCost: Number(row.waste_cost) || 0,
    cashierId: row.cashier_id || 'kasir-shift',
    cashierName: row.cashier_name || 'Kasir Aktif',
    stockDeducted: Boolean(row.stock_deducted),
    items: Array.isArray(row.items) ? row.items : [],
    revisionHistory: Array.isArray(row.revision_history) ? row.revision_history : [],
    cancelReason: row.cancel_reason || '',
    outlet: row.outlet || 'Cabang Utama - Makassar',
    createdAt: row.created_at,
    updatedAt: row.updated_at || row.created_at
  };
}

function mapClientOrderToDb(order) {
  return {
    id: order.id,
    order_number: order.orderNumber,
    order_channel: order.orderChannel,
    payment_flow: order.paymentFlow,
    order_status: order.orderStatus,
    payment_status: order.paymentStatus,
    kitchen_status: order.kitchenStatus,
    payment_method: order.paymentMethod,
    table_number: order.tableNumber,
    customer_name: order.customerName || '',
    total_amount: Number(order.totalAmount) || 0,
    waste_cost: Number(order.wasteCost) || 0,
    cashier_id: order.cashierId || null,
    cashier_name: order.cashierName || 'Kasir Aktif',
    stock_deducted: Boolean(order.stockDeducted),
    items: order.items || [],
    revision_history: order.revisionHistory || [],
    cancel_reason: order.cancelReason || '',
    outlet: order.outlet || 'Cabang Utama - Makassar',
    created_at: order.createdAt || new Date().toISOString(),
    updated_at: order.updatedAt || new Date().toISOString()
  };
}

export async function fetchOrders() {
  const manifest = getActiveWorkspaceManifest();
  if (!manifest) return [];
  const allowedOrderIds = new Set((manifest.orderIds || []).map((id) => String(id)));
  if (allowedOrderIds.size === 0) return [];

  const res = await runOptionalTableRead('orders', () =>
    supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(100)
  );

  if (res && !res.error && Array.isArray(res.data)) {
    const mapped = res.data
      .filter((row) => allowedOrderIds.has(String(row.id)))
      .map(mapDbOrderToClient);
    writeLocalJson(ORDERS_STORAGE_KEY, mapped);
    return mapped;
  }
  return readLocalJson(ORDERS_STORAGE_KEY, []).filter((o) =>
    allowedOrderIds.has(String(o.id))
  );
}

export async function createOrderRecord(order) {
  await registerCompanyOrderId(order.id);
  const local = readLocalJson(ORDERS_STORAGE_KEY, []);
  const nextLocal = [order, ...local.filter((o) => o.id !== order.id)].slice(0, 100);
  writeLocalJson(ORDERS_STORAGE_KEY, nextLocal);

  await runOptionalTableWrite('orders', () =>
    supabase.from('orders').upsert(mapClientOrderToDb(order))
  );
  return order;
}

export async function updateOrderRecord(order) {
  const local = readLocalJson(ORDERS_STORAGE_KEY, []);
  const nextLocal = local.map((o) => (o.id === order.id ? order : o));
  if (!nextLocal.some((o) => o.id === order.id)) {
    nextLocal.unshift(order);
  }
  writeLocalJson(ORDERS_STORAGE_KEY, nextLocal.slice(0, 100));

  await runOptionalTableWrite('orders', () =>
    supabase.from('orders').upsert(mapClientOrderToDb(order))
  );
  return order;
}

export async function fetchAuditLogs() {
  const manifest = getActiveWorkspaceManifest();
  if (!manifest) return [];
  return readLocalJson(AUDIT_LOGS_STORAGE_KEY, []);
}

export async function recordAuditLog(entry) {
  const actorName = entry.userName || 'Admin Operasional';
  const actorRole = entry.role || 'superadmin';
  const resolvedCashierName =
    entry.cashierName || (actorRole === 'kasir' || entry.entityType === 'order' ? actorName : '');
  const resolvedStockerName =
    entry.stockerName || (actorRole === 'stocker' || (entry.entityType === 'ingredient' && actorRole !== 'kasir') ? actorName : '');

  const record = {
    id: `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId: entry.userId || 'operator-active',
    userName: actorName,
    role: actorRole,
    cashierName: resolvedCashierName,
    stockerName: resolvedStockerName,
    actionType: entry.actionType || 'Manual Adjustment',
    entityType: entry.entityType || 'ingredient',
    entityId: entry.entityId ? String(entry.entityId) : '',
    entityName: entry.entityName || '-',
    beforeValue: entry.beforeValue !== undefined ? String(entry.beforeValue) : '-',
    afterValue: entry.afterValue !== undefined ? String(entry.afterValue) : '-',
    deltaLabel: entry.deltaLabel || '',
    reason: entry.reason || '-',
    outlet: entry.outlet || 'Cabang Utama - Makassar',
    createdAt: new Date().toISOString()
  };

  const local = readLocalJson(AUDIT_LOGS_STORAGE_KEY, []);
  writeLocalJson(AUDIT_LOGS_STORAGE_KEY, [record, ...local].slice(0, 250));

  await runOptionalTableWrite('audit_logs', () =>
    supabase.from('audit_logs').insert([
      {
        user_id: record.userId,
        user_name: record.userName,
        role: record.role,
        action_type: record.actionType,
        entity_type: record.entityType,
        entity_id: record.entityId,
        entity_name: record.entityName,
        before_value: record.beforeValue,
        after_value: record.afterValue,
        delta_label: record.deltaLabel,
        reason: record.reason,
        outlet: record.outlet,
        created_at: record.createdAt
      }
    ])
  );

  return record;
}

export async function fetchStockMovements() {
  const manifest = getActiveWorkspaceManifest();
  if (!manifest) return [];
  return readLocalJson(STOCK_MOVEMENTS_STORAGE_KEY, []);
}

export async function recordStockMovement(entry) {
  const actorName = entry.userName || 'Admin Operasional';
  const actorRole = entry.role || 'superadmin';
  const resolvedCashierName =
    entry.cashierName || (actorRole === 'kasir' || entry.movementType === 'BOM_SALE' ? actorName : '');
  const resolvedStockerName =
    entry.stockerName || (actorRole === 'stocker' || entry.movementType !== 'BOM_SALE' ? actorName : '');

  const record = {
    id: `MOV-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    ingredientId: entry.ingredientId ? String(entry.ingredientId) : null,
    ingredientName: entry.ingredientName || 'Bahan Baku',
    movementType: entry.movementType || 'MANUAL_ADJUSTMENT',
    qtyChange: Number(entry.qtyChange) || 0,
    beforeStock: Number(entry.beforeStock) || 0,
    afterStock: Number(entry.afterStock) || 0,
    unit: entry.unit || 'pcs',
    costImpact: Number(entry.costImpact) || 0,
    orderId: entry.orderId || null,
    userId: entry.userId || 'operator-active',
    userName: actorName,
    role: actorRole,
    cashierName: resolvedCashierName,
    stockerName: resolvedStockerName,
    reason: entry.reason || '',
    createdAt: new Date().toISOString()
  };

  const local = readLocalJson(STOCK_MOVEMENTS_STORAGE_KEY, []);
  writeLocalJson(STOCK_MOVEMENTS_STORAGE_KEY, [record, ...local].slice(0, 250));

  await runOptionalTableWrite('stock_movements', () =>
    supabase.from('stock_movements').insert([
      {
        ingredient_id: record.ingredientId,
        ingredient_name: record.ingredientName,
        movement_type: record.movementType,
        qty_change: record.qtyChange,
        before_stock: record.beforeStock,
        after_stock: record.afterStock,
        unit: record.unit,
        cost_impact: record.costImpact,
        order_id: record.orderId,
        user_id: record.userId,
        user_name: record.userName,
        role: record.role,
        reason: record.reason,
        created_at: record.createdAt
      }
    ])
  );

  return record;
}

export async function fetchSeasonalEvents() {
  const res = await runOptionalTableRead('seasonal_events', () =>
    supabase.from('seasonal_events').select('*').order('start_date', { ascending: true })
  );

  if (res && !res.error && Array.isArray(res.data) && res.data.length > 0) {
    const mapped = res.data.map((row) => ({
      id: row.id,
      name: row.name,
      category: row.category || 'holiday',
      startDate: row.start_date,
      endDate: row.end_date,
      expectedLiftPct: Number(row.expected_lift_pct) || 0,
      notes: row.notes || ''
    }));
    writeLocalJson(SEASONAL_EVENTS_STORAGE_KEY, mapped);
    return mapped;
  }

  const cached = readLocalJson(SEASONAL_EVENTS_STORAGE_KEY, null);
  if (Array.isArray(cached) && cached.length > 0) return cached;
  writeLocalJson(SEASONAL_EVENTS_STORAGE_KEY, DEFAULT_SEASONAL_EVENTS);
  return DEFAULT_SEASONAL_EVENTS;
}

export async function createSeasonalEvent(evt, operatorName = 'Owner') {
  const newEvt = {
    id: `EVT-${Date.now()}`,
    name: evt.name.trim(),
    category: evt.category || 'holiday',
    startDate: evt.startDate,
    endDate: evt.endDate,
    expectedLiftPct: Number(evt.expectedLiftPct) || 0,
    notes: (evt.notes || '').trim()
  };

  const current = readLocalJson(SEASONAL_EVENTS_STORAGE_KEY, DEFAULT_SEASONAL_EVENTS);
  const next = [...current, newEvt];
  writeLocalJson(SEASONAL_EVENTS_STORAGE_KEY, next);

  await runOptionalTableWrite('seasonal_events', () =>
    supabase.from('seasonal_events').insert([
      {
        name: newEvt.name,
        category: newEvt.category,
        start_date: newEvt.startDate,
        end_date: newEvt.endDate,
        expected_lift_pct: newEvt.expectedLiftPct,
        notes: newEvt.notes,
        created_by: operatorName
      }
    ])
  );

  return newEvt;
}

export async function deleteSeasonalEvent(eventId) {
  const current = readLocalJson(SEASONAL_EVENTS_STORAGE_KEY, DEFAULT_SEASONAL_EVENTS);
  const next = current.filter((e) => String(e.id) !== String(eventId));
  writeLocalJson(SEASONAL_EVENTS_STORAGE_KEY, next);

  await runOptionalTableWrite('seasonal_events', () =>
    supabase.from('seasonal_events').delete().eq('id', eventId)
  );
  return next;
}

export async function fetchDailySalesHistory() {
  const manifest = getActiveWorkspaceManifest();
  if (!manifest) return [];
  return readLocalJson(DAILY_SALES_HISTORY_KEY, []);
}

export async function syncDailySalesHistoryEntries(entries = [], outlet = 'Semua Cabang (Terpusat)') {
  if (!Array.isArray(entries) || entries.length === 0) return;

  writeLocalJson(DAILY_SALES_HISTORY_KEY, entries.slice(0, 400));

  const payload = entries.slice(0, 200).map((e) => ({
    sales_date: e.salesDate,
    menu_id: String(e.menuId || e.menuName || '').toLowerCase(),
    menu_name: e.menuName,
    category: e.category || 'Umum',
    quantity_sold: Number(e.quantitySold) || 0,
    total_revenue: Math.round(Number(e.totalRevenue) || 0),
    estimated_profit: Math.round(Number(e.estimatedProfit) || 0),
    transactions_count: Number(e.transactionsCount) || 1,
    holiday_label: e.holidayLabel || '',
    is_holiday: Boolean(e.isHoliday),
    outlet,
    updated_at: new Date().toISOString()
  }));

  await runOptionalTableWrite('daily_sales_history', () =>
    supabase.from('daily_sales_history').upsert(payload, {
      onConflict: 'sales_date,menu_id'
    })
  );
}
