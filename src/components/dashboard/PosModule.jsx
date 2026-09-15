import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, CheckCircle2, MessageSquare, Sparkles, 
  Search, Trash2, Plus, CreditCard, Wallet, QrCode, ArrowRight, AlertTriangle, X, ShieldAlert 
} from 'lucide-react';

export default function PosModule({ products, ingredients = [], onCheckout }) {
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [noteModalItem, setNoteModalItem] = useState(null);
  const [customNote, setCustomNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('qris');
  const [successMsg, setSuccessMsg] = useState(false);

  const [stockAlertModal, setStockAlertModal] = useState({
    isOpen: false,
    title: '',
    message: ''
  });

  const categories = ['Semua', ...new Set(products.map(p => p.category))];

  const getSubDescription = (prod) => {
    const name = prod.name.toLowerCase();
    if (name.includes('kopi') || name.includes('americano')) return 'Espresso shot & fresh milk';
    if (name.includes('croissant') || name.includes('pain')) return 'Freshly baked buttery pastry';
    if (name.includes('ricebowl') || name.includes('nasi') || name.includes('spaghetti')) return 'Disajikan hangat dengan saus pilihan';
    if (name.includes('matcha') || name.includes('tea')) return 'Premium Japanese leaf extract';
    if (name.includes('cake')) return 'Rich chocolate & soft sponge';
    return 'Menu pilihan favorit berkualitas';
  };

  const convertToStandardBase = (qty, unit) => {
    const u = (unit || '').toLowerCase().trim();
    const q = Number(qty) || 0;
    if (u === 'kg' || u === 'kilogram') return q * 1000;
    if (u === 'gram' || u === 'g') return q;
    if (u === 'liter' || u === 'l') return q * 1000;
    if (u === 'ml' || u === 'milliliter') return q;
    return q;
  };

  const calculateDeductionInStorageUnit = (neededQty, neededUnit, storageUnit) => {
    const neededBase = convertToStandardBase(neededQty, neededUnit);
    const storageUnitLower = (storageUnit || '').toLowerCase().trim();
    if (storageUnitLower === 'kg' || storageUnitLower === 'kilogram' || storageUnitLower === 'liter' || storageUnitLower === 'l') {
      return neededBase / 1000;
    }
    return neededBase;
  };

  // FUNGSI UTAMA: Mensimulasikan penambahan kuantitas item dan memeriksa apakah total bahan gudang mencukupi
  const validateCartWithNewItem = (currentCart, targetProduct, deltaQty) => {
    // Buat salinan keranjang dengan penyesuaian kuantitas baru
    let simulatedCart = [...currentCart];
    const existingIndex = simulatedCart.findIndex(item => item.id === targetProduct.id);

    if (existingIndex >= 0) {
      const newQty = simulatedCart[existingIndex].qty + deltaQty;
      if (newQty <= 0) {
        simulatedCart.splice(existingIndex, 1);
      } else {
        simulatedCart[existingIndex] = { ...simulatedCart[existingIndex], qty: newQty };
      }
    } else if (deltaQty > 0) {
      simulatedCart.push({ ...targetProduct, qty: 1 });
    }

    // Hitung total kebutuhan akumulasi seluruh bahan dari semua item di keranjang simulasi
    const accumulatedDemand = {}; // { "susu segar uht": total_dibutuhkan_dalam_satuan_gudang }

    simulatedCart.forEach(cartItem => {
      if (cartItem.recipe && Array.isArray(cartItem.recipe)) {
        cartItem.recipe.forEach(req => {
          const foundIng = ingredients.find(
            ing => ing.name?.toLowerCase().includes(req.name?.toLowerCase().trim())
          );
          if (foundIng) {
            const ingKey = foundIng.name.toLowerCase().trim();
            const deductionPerPortion = calculateDeductionInStorageUnit(req.qty, req.unit, foundIng.unit);
            
            if (!accumulatedDemand[ingKey]) {
              accumulatedDemand[ingKey] = {
                name: foundIng.name,
                stock: foundIng.stock,
                unit: foundIng.unit,
                required: 0
              };
            }
            accumulatedDemand[ingKey].required += deductionPerPortion * cartItem.qty;
          }
        });
      }
    });

    // Cek apakah ada bahan yang kebutuhan akumulasinya melebihi stok gudang
    for (let key in accumulatedDemand) {
      const demand = accumulatedDemand[key];
      if (demand.required > demand.stock) {
        return {
          isValid: false,
          exceededIngredient: demand.name,
          required: demand.required.toFixed(2),
          stock: demand.stock,
          unit: demand.unit
        };
      }
    }

    return { isValid: true };
  };

  // Hitung maksimal porsi tersisa untuk satu produk mandiri
  const getMaxPossiblePortions = (product) => {
    if (!product.recipe || product.recipe.length === 0) return 999;
    const safeIngredients = ingredients || [];
    let limits = [];

    for (let req of product.recipe) {
      const foundIng = safeIngredients.find(
        ing => ing.name?.toLowerCase().includes(req.name?.toLowerCase().trim())
      );
      if (!foundIng || foundIng.stock <= 0) return 0;

      const deductionPerPortion = calculateDeductionInStorageUnit(req.qty, req.unit, foundIng.unit);
      if (deductionPerPortion <= 0) continue;

      const possiblePortions = Math.floor(foundIng.stock / deductionPerPortion);
      limits.push(possiblePortions);
    }

    if (limits.length === 0) return 999;
    return Math.min(...limits);
  };

  const checkIsIngredientAvailable = (product) => {
    return getMaxPossiblePortions(product) > 0;
  };

  const addToCart = (product) => {
    // Validasi akumulasi keranjang jika produk ini ditambah 1 qty
    const validation = validateCartWithNewItem(cart, product, 1);
    
    if (!validation.isValid) {
      setStockAlertModal({
        isOpen: true,
        title: 'Stok Bahan Gudang Tidak Cukup',
        message: `Penghitungan kolektif gagal: Bahan "${validation.exceededIngredient}" di gudang tidak mencukupi untuk kombinasi pesanan ini. Stok tersedia: ${validation.stock} ${validation.unit}.`
      });
      return;
    }

    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1, note: '' }]);
    }
  };

  const updateQty = (id, delta) => {
    const targetItem = cart.find(item => item.id === id);
    if (!targetItem) return;

    // Validasi akumulasi keranjang untuk perubahan kuantitas
    const validation = validateCartWithNewItem(cart, targetItem, delta);

    if (!validation.isValid && delta > 0) {
      setStockAlertModal({
        isOpen: true,
        title: 'Batas Akumulasi Bahan Tercapai',
        message: `Tidak dapat menambah jumlah pesanan karena bahan "${validation.exceededIngredient}" telah mencapai batas maksimal kombinasi di keranjang. Stok gudang: ${validation.stock} ${validation.unit}.`
      });
      return;
    }

    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        if (newQty <= 0) return null;
        return { ...item, qty: newQty };
      }
      return item;
    }).filter(Boolean));
  };

  const removeItem = (id) => setCart(cart.filter(item => item.id !== id));

  const saveNote = () => {
    setCart(cart.map(item => item.id === noteModalItem.id ? { ...item, note: customNote } : item));
    setNoteModalItem(null);
    setCustomNote('');
  };

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const handleProcessPayment = () => {
    if (cart.length === 0) return;
    onCheckout(cart);
    setSuccessMsg(true);
    setCart([]);
    setTimeout(() => setSuccessMsg(false), 3500);
  };

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-16">
      
      <div className="lg:col-span-7 xl:col-span-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 text-white rounded-[2.5rem] p-7 md:p-8 shadow-xl relative overflow-hidden border border-zinc-800">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#E87F24]/15 rounded-full blur-[90px] pointer-events-none"></div>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="bg-[#E87F24]/20 text-[#FFC81E] border border-[#E87F24]/30 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5">
                <Sparkles size={13} /> POS Kasir Pintar (BOM Kolektif Connected)
              </span>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">Katalog Penjualan</h2>
              <p className="text-zinc-400 text-xs font-medium">Validasi stok lintas menu secara real-time di keranjang.</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input type="text" placeholder="Cari menu..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white/10 border border-white/15 text-white placeholder-zinc-400 text-xs rounded-2xl pl-10 pr-4 py-3.5 focus:outline-none focus:border-[#E87F24] transition-all font-medium backdrop-blur-md" />
            </div>
          </div>
        </motion.div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {categories.map((cat, idx) => (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} key={idx} onClick={() => setSelectedCategory(cat)} className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap shadow-xs ${selectedCategory === cat ? 'bg-zinc-900 text-white shadow-md' : 'bg-white border border-zinc-200/80 text-zinc-600 hover:bg-zinc-50'}`}>
              {cat}
            </motion.button>
          ))}
        </div>

        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((prod) => {
              const isAvailable = checkIsIngredientAvailable(prod);
              const maxPortions = getMaxPossiblePortions(prod);

              return (
                <motion.div layout initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }} transition={{ duration: 0.2 }} key={prod.id} onClick={() => isAvailable && addToCart(prod)} className={`bg-white border rounded-[2rem] overflow-hidden flex flex-col justify-between transition-all shadow-sm relative group ${!isAvailable ? 'border-red-200 bg-red-50/20 opacity-60 cursor-not-allowed' : 'border-zinc-200/80 hover:border-zinc-300 hover:shadow-xl cursor-pointer'}`}>
                  <div className="relative h-36 w-full overflow-hidden bg-zinc-100">
                    <img src={prod.image} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60"></div>
                    <div className="absolute top-3 left-3"><span className="bg-white/90 backdrop-blur-md text-zinc-900 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm">{prod.category}</span></div>
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shadow-md flex items-center gap-1.5 ${!isAvailable ? 'bg-red-600 text-white' : 'bg-zinc-900/90 backdrop-blur-md text-white border border-white/20'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${!isAvailable ? 'bg-white animate-ping' : 'bg-emerald-400'}`}></span>
                        {!isAvailable ? 'Habis' : `Maks: ${maxPortions}`}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col justify-between space-y-4 flex-1 bg-white">
                    <div className="space-y-1">
                      <h3 className="font-black text-zinc-900 text-sm leading-snug group-hover:text-[#E87F24] transition-colors line-clamp-1">{prod.name}</h3>
                      <p className="text-[11px] text-zinc-400 font-medium line-clamp-1">{getSubDescription(prod)}</p>
                    </div>
                    {!isAvailable && (
                      <div className="bg-red-50 border border-red-200 text-red-600 px-2.5 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1.5">
                        <AlertTriangle size={13} className="shrink-0" /> Bahan baku di gudang kurang
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
                      <span className="font-mono font-black text-emerald-600 text-sm">Rp {prod.price.toLocaleString('id-ID')}</span>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform shadow-sm ${!isAvailable ? 'bg-zinc-100 text-zinc-300' : 'bg-zinc-900 group-hover:bg-[#E87F24] group-hover:scale-110 text-white'}`}><Plus size={14} /></div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="lg:col-span-5 xl:col-span-4">
        <div className="bg-white border border-zinc-200/80 rounded-[2.5rem] p-6 md:p-7 shadow-xl flex flex-col h-fit sticky top-6 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-zinc-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#E87F24] flex items-center justify-center font-bold border border-orange-100 shadow-2xs">
              <ShoppingCart size={18} />
            </div>
            <div>
              <h3 className="font-black text-zinc-900 text-sm">Keranjang Pesanan</h3>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Live POS Session</p>
            </div>
            <span className="ml-auto bg-zinc-900 text-white text-xs font-black px-2.5 py-1 rounded-xl shadow-2xs">{cart.reduce((t, i) => t + i.qty, 0)} Item</span>
          </div>

          <div className="min-h-[220px] max-h-[280px] overflow-y-auto pr-1 space-y-3 hide-scrollbar">
            <AnimatePresence>
              {cart.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-48 flex flex-col items-center justify-center text-zinc-400 space-y-2">
                  <ShoppingCart size={32} className="opacity-20 animate-pulse" />
                  <p className="text-xs font-medium">Belum ada menu dipilih.</p>
                </motion.div>
              ) : (
                cart.map(item => (
                  <motion.div layout initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }} key={item.id} className="bg-zinc-50 border border-zinc-200/60 p-3 rounded-2xl space-y-2 shadow-2xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <img src={item.image} alt={item.name} className="w-10 h-10 rounded-xl object-cover shrink-0 border border-zinc-200" />
                        <div>
                          <p className="text-xs font-black text-zinc-900 leading-tight">{item.name}</p>
                          <p className="text-[11px] font-mono font-bold text-emerald-600 mt-0.5">Rp {(item.price * item.qty).toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white border border-zinc-200 rounded-xl p-1 shadow-2xs shrink-0">
                        <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 flex items-center justify-center bg-zinc-50 hover:bg-zinc-100 rounded-lg text-zinc-600 font-black text-xs cursor-pointer">-</button>
                        <span className="text-xs font-black w-5 text-center">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 flex items-center justify-center bg-zinc-50 hover:bg-zinc-100 rounded-lg text-zinc-600 font-black text-xs cursor-pointer">+</button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-zinc-200/40 text-[10px]">
                      <span className="text-zinc-500 italic truncate max-w-[140px]">{item.note ? `* ${item.note}` : 'Tanpa catatan dapur'}</span>
                      <div className="flex items-center gap-3">
                        <button onClick={() => { setNoteModalItem(item); setCustomNote(item.note); }} className="text-[#E87F24] font-black hover:underline cursor-pointer">Catatan</button>
                        <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 cursor-pointer"><Trash2 size={13} /></button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-2 pt-1">
            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Metode Pembayaran</p>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => setPaymentMethod('qris')} className={`py-2 px-3 rounded-xl text-xs font-black border transition-all flex flex-col items-center gap-1 cursor-pointer ${paymentMethod === 'qris' ? 'bg-orange-50 border-[#E87F24] text-[#E87F24] shadow-2xs' : 'bg-zinc-50 border-zinc-200 text-zinc-600'}`}>
                <QrCode size={15} /> QRIS
              </button>
              <button onClick={() => setPaymentMethod('cash')} className={`py-2 px-3 rounded-xl text-xs font-black border transition-all flex flex-col items-center gap-1 cursor-pointer ${paymentMethod === 'cash' ? 'bg-orange-50 border-[#E87F24] text-[#E87F24] shadow-2xs' : 'bg-zinc-50 border-zinc-200 text-zinc-600'}`}>
                <Wallet size={15} /> Tunai
              </button>
              <button onClick={() => setPaymentMethod('card')} className={`py-2 px-3 rounded-xl text-xs font-black border transition-all flex flex-col items-center gap-1 cursor-pointer ${paymentMethod === 'card' ? 'bg-orange-50 border-[#E87F24] text-[#E87F24] shadow-2xs' : 'bg-zinc-50 border-zinc-200 text-zinc-600'}`}>
                <CreditCard size={15} /> Kartu
              </button>
            </div>
          </div>

          <div className="border-t border-zinc-100 pt-4 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-400 font-bold">Subtotal Produk</span>
              <span className="font-mono font-bold text-zinc-700">Rp {totalPrice.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-black pt-2 border-t border-zinc-100">
              <span className="text-zinc-900">Total Pembayaran</span>
              <span className="font-mono text-lg text-emerald-600">Rp {totalPrice.toLocaleString('id-ID')}</span>
            </div>

            <AnimatePresence>
              {successMsg && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-2xl text-xs font-bold text-center flex items-center justify-center gap-2 shadow-sm">
                  <CheckCircle2 size={16} /> Transaksi Sukses! Stok gudang terpotong.
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleProcessPayment} disabled={cart.length === 0} className="w-full bg-gradient-to-r from-[#E87F24] to-[#FFC81E] disabled:opacity-40 disabled:cursor-not-allowed text-zinc-950 font-black py-4 rounded-2xl text-sm shadow-lg shadow-orange-500/20 cursor-pointer flex items-center justify-center gap-2 mt-2">
              Proses Pembayaran <ArrowRight size={16} />
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {noteModalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setNoteModalItem(null)} className="absolute inset-0 bg-zinc-900/50 backdrop-blur-xs cursor-pointer"></motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative w-full max-w-md bg-white rounded-[2.5rem] p-7 shadow-2xl border border-zinc-100 space-y-5">
              <div className="flex justify-between items-center">
                <h4 className="font-black text-zinc-900 text-base flex items-center gap-2"><MessageSquare size={18} className="text-[#E87F24]" /> Catatan Dapur</h4>
                <span className="text-xs font-bold bg-orange-50 text-[#E87F24] px-3 py-1 rounded-full">{noteModalItem.name}</span>
              </div>
              <textarea placeholder="Contoh: Kurang manis, tanpa es batu..." value={customNote} onChange={(e) => setCustomNote(e.target.value)} rows={3} className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-xs font-medium focus:outline-none focus:border-[#E87F24] focus:ring-4 focus:ring-[#E87F24]/10 resize-none transition-all" />
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setNoteModalItem(null)} className="px-5 py-2.5 text-xs font-black text-zinc-500 hover:bg-zinc-100 rounded-xl cursor-pointer">Batal</button>
                <button onClick={saveNote} className="px-6 py-2.5 bg-zinc-900 text-white text-xs font-black rounded-xl shadow-md hover:bg-zinc-800 cursor-pointer">Simpan Catatan</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {stockAlertModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setStockAlertModal({ ...stockAlertModal, isOpen: false })} className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm cursor-pointer"></motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 15 }} className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-7 shadow-2xl border border-zinc-100 text-center space-y-5">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-3xl mx-auto flex items-center justify-center border border-red-100 shadow-inner">
                <ShieldAlert size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="font-black text-zinc-900 text-lg">{stockAlertModal.title}</h3>
                <p className="text-xs text-zinc-500 font-medium leading-relaxed">{stockAlertModal.message}</p>
              </div>
              <button onClick={() => setStockAlertModal({ ...stockAlertModal, isOpen: false })} className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-black py-3.5 rounded-2xl text-xs shadow-lg cursor-pointer transition-colors">
                Mengerti
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}