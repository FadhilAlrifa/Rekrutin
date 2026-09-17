import { supabase } from './supabaseClient';

export async function fetchIngredients() {
  const { data, error } = await supabase.from('ingredients').select('*');
  if (error) {
    console.error('Gagal memuat bahan baku:', error.message);
    return [];
  }

  return data.map(item => ({
    id: item.id,
    name: item.name,
    stock: item.stock,
    unit: item.unit,
    minLimit: item.min_limit,
    expiryDate: item.expiry_date || item.expiryDate || '',
    entryDate: item.entry_date || item.entryDate || '' 
  }));
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

export async function saveTransaction(totalAmount, cartItems, tableNumber) {
  const { data, error } = await supabase
    .from('transactions')
    .insert([
      {
        total_amount: totalAmount,
        items: cartItems,
        table_number: tableNumber || 'Takeaway / Kasir',
        created_at: new Date().toISOString()
      }
    ])
    .select();

  if (error) {
    console.error('Gagal menyimpan transaksi:', error);
    return null;
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
  return data;
}

export async function registerUser(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
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
    password,
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
      emailRedirectTo: window.location.origin, 
    },
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