import { supabase, supabaseAdminAuth } from './supabaseClient.js';
import { DEFAULT_SEASONAL_EVENTS } from '../utils/seasonalForecasting.js';

const PRICE_MAP_STORAGE_KEY = 'stocko_ingredient_prices_v1';
const PRICE_HISTORY_STORAGE_KEY = 'stocko_ingredient_price_history_v1';
const MERCHANT_SETTINGS_STORAGE_KEY = 'stocko_merchant_settings_v1';
const ORDERS_STORAGE_KEY = 'stocko_orders_v1';
const AUDIT_LOGS_STORAGE_KEY = 'stocko_audit_logs_v1';
const STOCK_MOVEMENTS_STORAGE_KEY = 'stocko_stock_movements_v1';
const SEASONAL_EVENTS_STORAGE_KEY = 'stocko_seasonal_events_v1';
const TX_META_STORAGE_KEY = 'stocko_tx_metadata_v1';
const UNAVAILABLE_TABLES_KEY = 'stocko_unavailable_tables_v1';
const unavailableTablesSet = new Set();
const inFlightTableQueries = new Map();

function markTableUnavailable(table) {
  unavailableTablesSet.add(table);
  try {
    const existing = JSON.parse(window.sessionStorage.getItem(UNAVAILABLE_TABLES_KEY) || '[]');
    if (!existing.includes(table)) {
      window.sessionStorage.setItem(UNAVAILABLE_TABLES_KEY, JSON.stringify([...existing, table]));
    }
  } catch {
    // Abaikan jika sessionStorage dibatasi browser
  }
}

function isTableKnownUnavailable(table) {
  if (unavailableTablesSet.has(table)) return true;
  try {
    const existing = JSON.parse(window.sessionStorage.getItem(UNAVAILABLE_TABLES_KEY) || '[]');
    if (existing.includes(table)) {
      unavailableTablesSet.add(table);
      return true;
    }
  } catch {
    // Abaikan
  }
  return false;
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
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocalJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
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

export async function fetchIngredients() {
  const { data, error } = await supabase.from('ingredients').select('*');
  if (error) {
    console.error('Gagal memuat bahan baku:', error.message);
    return [];
  }

  const localPriceMap = readLocalJson(PRICE_MAP_STORAGE_KEY, {});

  return data.map(item => {
    const dbUnitPrice =
      item.unit_price !== undefined && item.unit_price !== null
        ? Number(item.unit_price)
        : null;
    const resolvedPrice =
      dbUnitPrice !== null && dbUnitPrice > 0
        ? dbUnitPrice
        : Number(localPriceMap[String(item.id)] ?? 0);

    return {
      id: item.id,
      name: item.name,
      stock: item.stock,
      unit: item.unit,
      minLimit: item.min_stock_threshold ?? item.min_limit ?? 5,
      unitPrice: resolvedPrice,
      expiryDate: item.expiry_date || item.expiryDate || '',
      entryDate: item.entry_date || item.entryDate || ''
    };
  });
}

export async function updateIngredientStock(id, newStock) {
  const { error } = await supabase
    .from('ingredients')
    .update({ stock: newStock })
    .eq('id', id);
  if (error) console.error('Gagal memperbarui stok:', error);
}

export async function fetchProducts() {
  const { data, error } = await supabase.from('products').select('*');
  if (error) {
    console.error('Gagal mengambil data produk:', error);
    return [];
  }

  // Petakan properti dari database (snake_case) ke format frontend (camelCase)
  return data.map(item => ({
    id: item.id,
    name: item.name,
    category: item.category,
    price: item.price,
    stock: item.stock || 0,
    image: item.image,
    recipe: item.recipe || [],
    expiryDate: item.expiry_date || item.expiryDate || ''
  }));
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
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Gagal mengambil data transaksi:', error.message);
    return [];
  }
  const metaMap = readLocalJson(TX_META_STORAGE_KEY, {});
  return (data || []).map((row) => ({
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
export async function loginUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.error('Gagal login:', error.message);
    return { success: false, message: error.message };
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
      data: res.data.map(row => ({
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
    data: readLocalJson(PRICE_HISTORY_STORAGE_KEY, [])
  };
}

export async function updateIngredientPrice({ ingredient, newPrice, notes = 'Pembaruan harga pasar' }) {
  if (!ingredient) return { success: false, message: 'Bahan baku tidak ditemukan.' };

  const cleanName = String(ingredient.name || '').split(' | ')[0].trim();
  const oldPrice = Number(ingredient.unitPrice ?? ingredient.unit_price ?? 0);
  const parsedNewPrice = Math.max(0, Number(newPrice) || 0);
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

  const localHistory = readLocalJson(PRICE_HISTORY_STORAGE_KEY, []);
  const nextLocalHistory = [historyEntry, ...localHistory].slice(0, 60);
  writeLocalJson(PRICE_HISTORY_STORAGE_KEY, nextLocalHistory);

  // Coba tulis ke kolom & tabel PostgreSQL/Supabase
  let persistedInDb = false;
  if (!isTableKnownUnavailable('ingredients.unit_price')) {
    const { error: ingErr } = await supabase
      .from('ingredients')
      .update({ unit_price: parsedNewPrice })
      .eq('id', ingredient.id);

    if (ingErr) {
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
    entry: historyEntry
  };
}

export async function seedMarketPricesForMissing(ingredients = []) {
  const missing = ingredients.filter(i => !(Number(i.unitPrice) > 0));
  if (missing.length === 0) return { updated: [...ingredients], entries: [] };

  const updated = [...ingredients];
  const entries = [];

  for (const ing of missing) {
    const suggested = suggestMarketPrice(ing.name, ing.unit);
    const res = await updateIngredientPrice({
      ingredient: ing,
      newPrice: suggested,
      notes: 'Inisialisasi harga referensi pasar'
    });
    if (res.success) {
      const idx = updated.findIndex(x => String(x.id) === String(ing.id));
      if (idx >= 0) {
        updated[idx] = { ...updated[idx], unitPrice: suggested };
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
  defaultOrderChannel: 'dine_in',
  paymentFlow: 'pay_first',
  closedKitchenEnabled: true,
  requireCashierShift: true
};

export async function fetchMerchantSettings() {
  const res = await runOptionalTableRead('merchant_settings', () =>
    supabase.from('merchant_settings').select('*').eq('id', 'default').maybeSingle()
  );

  if (res && !res.error && res.data) {
    const mapped = {
      defaultOrderChannel: res.data.default_order_channel || 'dine_in',
      paymentFlow: res.data.payment_flow || 'pay_first',
      closedKitchenEnabled: res.data.closed_kitchen_enabled ?? true,
      requireCashierShift: res.data.require_cashier_shift ?? true
    };
    writeLocalJson(MERCHANT_SETTINGS_STORAGE_KEY, mapped);
    return mapped;
  }
  return readLocalJson(MERCHANT_SETTINGS_STORAGE_KEY, DEFAULT_MERCHANT_SETTINGS);
}

export async function saveMerchantSettings(settings, operatorName = 'Owner') {
  const normalized = {
    ...DEFAULT_MERCHANT_SETTINGS,
    ...settings
  };
  writeLocalJson(MERCHANT_SETTINGS_STORAGE_KEY, normalized);

  await runOptionalTableWrite('merchant_settings', () =>
    supabase.from('merchant_settings').upsert({
      id: 'default',
      default_order_channel: normalized.defaultOrderChannel,
      payment_flow: normalized.paymentFlow,
      closed_kitchen_enabled: normalized.closedKitchenEnabled,
      require_cashier_shift: normalized.requireCashierShift,
      updated_by: operatorName,
      updated_at: new Date().toISOString()
    })
  );
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
  const res = await runOptionalTableRead('orders', () =>
    supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(100)
  );

  if (res && !res.error && Array.isArray(res.data)) {
    const mapped = res.data.map(mapDbOrderToClient);
    writeLocalJson(ORDERS_STORAGE_KEY, mapped);
    return mapped;
  }
  return readLocalJson(ORDERS_STORAGE_KEY, []);
}

export async function createOrderRecord(order) {
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
  const res = await runOptionalTableRead('audit_logs', () =>
    supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(200)
  );

  if (res && !res.error && Array.isArray(res.data)) {
    const mapped = res.data.map((row) => ({
      id: row.id,
      userId: row.user_id,
      userName: row.user_name,
      role: row.role,
      cashierName: row.cashier_name || (row.role === 'kasir' ? row.user_name : ''),
      stockerName: row.stocker_name || (row.role === 'stocker' ? row.user_name : ''),
      actionType: row.action_type,
      entityType: row.entity_type,
      entityId: row.entity_id,
      entityName: row.entity_name,
      beforeValue: row.before_value,
      afterValue: row.after_value,
      deltaLabel: row.delta_label,
      reason: row.reason,
      outlet: row.outlet,
      createdAt: row.created_at
    }));
    writeLocalJson(AUDIT_LOGS_STORAGE_KEY, mapped);
    return mapped;
  }
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
  const res = await runOptionalTableRead('stock_movements', () =>
    supabase.from('stock_movements').select('*').order('created_at', { ascending: false }).limit(200)
  );

  if (res && !res.error && Array.isArray(res.data)) {
    const mapped = res.data.map((row) => ({
      id: row.id,
      ingredientId: row.ingredient_id,
      ingredientName: row.ingredient_name,
      movementType: row.movement_type,
      qtyChange: Number(row.qty_change) || 0,
      beforeStock: Number(row.before_stock) || 0,
      afterStock: Number(row.after_stock) || 0,
      unit: row.unit || 'pcs',
      costImpact: Number(row.cost_impact) || 0,
      orderId: row.order_id || null,
      userId: row.user_id,
      userName: row.user_name,
      role: row.role,
      cashierName: row.cashier_name || (row.role === 'kasir' ? row.user_name : ''),
      stockerName: row.stocker_name || (row.role === 'stocker' ? row.user_name : ''),
      reason: row.reason || '',
      createdAt: row.created_at
    }));
    writeLocalJson(STOCK_MOVEMENTS_STORAGE_KEY, mapped);
    return mapped;
  }
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
