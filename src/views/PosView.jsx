import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, CheckCircle2, MessageSquare, Sparkles, Store, AlertCircle, X } from 'lucide-react';

export default function PosView({ products, onCheckout }) {
  const [cart, setCart] = useState([]);
  const [noteModalItem, setNoteModalItem] = useState(null);
  const [customNote, setCustomNote] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Logika Tambah ke Keranjang
  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    
    // Cek apakah stok mencukupi
    if (existing && existing.qty >= product.stock) {
      alert(`Stok ${product.name} tidak mencukupi! Sisa stok: ${product.stock}`);
      return;
    }
    
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1, note: '' }]);
    }
  };

  // 2. Logika Ubah Kuantitas (+ / -)
  const updateQty = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        
        // Mencegah minus atau melebihi stok
        if (newQty <= 0) return null; // Hapus item jika qty 0
        if (newQty > item.stock) {
          alert(`Maksimal stok ${item.name} adalah ${item.stock}`);
          return item;
        }
        
        return { ...item, qty: newQty };
      }
      return item;
    }).filter(Boolean)); // .filter(Boolean) untuk menghapus item yang bernilai null
  };

  // 3. Logika Catatan Dapur
  const saveNote = () => {
    setCart(cart.map(item => item.id === noteModalItem.id ? { ...item, note: customNote } : item));
    setNoteModalItem(null);
    setCustomNote('');
  };

  // 4. Proses Pembayaran
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  
  const handleProcessPayment = () => {
    if (cart.length === 0) return;
    onCheckout(cart); // Panggil fungsi checkout dari App.jsx
    setSuccessMsg(true);
    setCart([]); // Kosongkan keranjang
    
    // Hilangkan pesan sukses setelah 3 detik
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  // 5. Fitur Pencarian Produk
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header POS */}
      <div className="relative bg-white border border-zinc-200 rounded-[2.5rem] p-8 md:p-10 shadow-sm overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#E87F24]/10 to-transparent blur-[50px] pointer-events-none"></div>
        
        <div className="relative z-10 space-y-2">
          <span className="bg-orange-50 text-[#E87F24] border border-orange-200 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5">
            <Sparkles size={13} /> Sesi Kasir Aktif
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight">Point of Sale (POS)</h1>
          <p className="text-zinc-500 text-xs md:text-sm font-medium max-w-md leading-relaxed">
            Pilih menu pesanan di bawah. Transaksi akan langsung memotong stok di sistem BOM secara real-time.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative z-10 w-full md:w-72">
          <input 
            type="text" 
            placeholder="Cari menu atau kategori..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-2xl px-5 py-3.5 focus:outline-none focus:border-[#E87F24] focus:ring-4 focus:ring-[#E87F24]/10 transition-all font-medium"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* === AREA KIRI: KATALOG PRODUK === */}
        <div className="lg:col-span-8 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-zinc-900 flex items-center gap-2">
              <Store size={20} className="text-[#E87F24]" /> Katalog Menu
            </h2>
            <span className="text-xs font-bold text-zinc-400 bg-white border border-zinc-200 px-3 py-1 rounded-lg">
              {filteredProducts.length} Produk
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-[2rem] p-10 text-center flex flex-col items-center justify-center">
              <AlertCircle size={40} className="text-zinc-300 mb-3" />
              <p className="text-zinc-500 font-bold">Produk tidak ditemukan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredProducts.map(prod => {
                const isOutOfStock = prod.stock <= 0;
                const cartItem = cart.find(c => c.id === prod.id);
                const isMaxReached = cartItem && cartItem.qty >= prod.stock;

                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    key={prod.id} 
                    className={`bg-white border rounded-[2rem] p-5 flex flex-col justify-between space-y-5 transition-all shadow-sm ${isOutOfStock ? 'border-red-200 bg-red-50/30 opacity-70' : 'border-zinc-200 hover:border-[#E87F24]/50'}`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-black uppercase bg-zinc-100 text-zinc-600 px-2.5 py-1 rounded-full border border-zinc-200">
                          {prod.category}
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                          Rp {prod.price.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <h3 className="font-black text-zinc-900 text-base leading-tight">{prod.name}</h3>
                      <p className={`text-xs font-bold mt-1.5 ${isOutOfStock ? 'text-red-500' : 'text-zinc-400'}`}>
                        Stok Tersedia: {prod.stock} unit
                      </p>
                    </div>

                    <button 
                      onClick={() => addToCart(prod)}
                      disabled={isOutOfStock || isMaxReached}
                      className={`w-full font-black py-3 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-2 ${
                        isOutOfStock || isMaxReached
                          ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed' 
                          : 'bg-zinc-900 hover:bg-zinc-800 text-white hover:-translate-y-0.5 cursor-pointer'
                      }`}
                    >
                      {isOutOfStock ? 'Stok Habis' : isMaxReached ? 'Maksimal Stok' : '+ Ke Keranjang'}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* === AREA KANAN: KERANJANG & CHECKOUT === */}
        <div className="lg:col-span-4">
          <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-6 shadow-sm flex flex-col h-fit sticky top-24">
            
            <div className="flex items-center gap-2 border-b border-zinc-100 pb-4 mb-4">
              <div className="w-8 h-8 rounded-full bg-orange-50 text-[#E87F24] flex items-center justify-center">
                <ShoppingCart size={16} />
              </div>
              <h3 className="font-black text-zinc-900 text-base">Keranjang Transaksi</h3>
              {cart.length > 0 && (
                <span className="ml-auto bg-zinc-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {cart.reduce((total, item) => total + item.qty, 0)} Item
                </span>
              )}
            </div>

            {/* List Item Keranjang */}
            <div className="flex-1 min-h-[200px] max-h-[350px] overflow-y-auto pr-2 space-y-3">
              <AnimatePresence>
                {cart.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-zinc-400 py-10 space-y-2">
                    <ShoppingCart size={32} className="opacity-20" />
                    <p className="text-xs font-medium">Belum ada pesanan.</p>
                  </motion.div>
                ) : (
                  cart.map(item => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                      key={item.id} 
                      className="bg-zinc-50 border border-zinc-200/80 p-3.5 rounded-2xl space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-black text-zinc-900 leading-tight">{item.name}</p>
                          <p className="text-[11px] font-mono font-bold text-emerald-600 mt-0.5">
                            Rp {(item.price * item.qty).toLocaleString('id-ID')}
                          </p>
                        </div>
                        
                        {/* Kuantitas Control */}
                        <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-lg p-1 shadow-sm shrink-0">
                          <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 flex items-center justify-center bg-zinc-50 hover:bg-zinc-100 rounded text-zinc-600 font-black cursor-pointer">-</button>
                          <span className="text-xs font-black w-4 text-center">{item.qty}</span>
                          <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 flex items-center justify-center bg-zinc-50 hover:bg-zinc-100 rounded text-zinc-600 font-black cursor-pointer">+</button>
                        </div>
                      </div>

                      {/* Catatan Dapur */}
                      <div className="flex justify-between items-center pt-2 border-t border-zinc-200/50">
                        <span className="text-[10px] text-zinc-500 italic truncate max-w-[150px]">
                          {item.note ? `* ${item.note}` : 'Tanpa catatan'}
                        </span>
                        <button 
                          onClick={() => { setNoteModalItem(item); setCustomNote(item.note); }} 
                          className="text-[#E87F24] font-black hover:underline flex items-center gap-1 text-[10px] cursor-pointer bg-orange-50 px-2 py-1 rounded"
                        >
                          <MessageSquare size={10} /> Catatan
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Total & Tombol Bayar */}
            <div className="border-t border-zinc-100 pt-5 mt-4 space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-zinc-500 uppercase">Total Tagihan</span>
                <span className="text-2xl font-black text-zinc-900 font-mono tracking-tight">
                  Rp {totalPrice.toLocaleString('id-ID')}
                </span>
              </div>

              <AnimatePresence>
                {successMsg && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-sm">
                    <CheckCircle2 size={16} /> Pembayaran Sukses! Stok berkurang otomatis.
                  </motion.div>
                )}
              </AnimatePresence>

              <button 
                onClick={handleProcessPayment}
                disabled={cart.length === 0}
                className="w-full bg-gradient-to-r from-[#E87F24] to-[#FFC81E] disabled:opacity-40 disabled:cursor-not-allowed text-zinc-950 font-black py-4 rounded-2xl text-sm shadow-lg transition-transform hover:-translate-y-1 cursor-pointer flex items-center justify-center gap-2"
              >
                Proses Pembayaran (QRIS / Tunai)
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* === MODAL CATATAN DAPUR === */}
      <AnimatePresence>
        {noteModalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setNoteModalItem(null)}
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm cursor-pointer"
            ></motion.div>
            
            {/* Modal Content */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2rem] p-6 shadow-2xl border border-zinc-100"
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-black text-zinc-900 text-lg flex items-center gap-2">
                  <MessageSquare size={18} className="text-[#E87F24]" /> Catatan Dapur
                </h4>
                <button onClick={() => setNoteModalItem(null)} className="w-8 h-8 flex items-center justify-center bg-zinc-100 text-zinc-500 hover:text-zinc-900 rounded-full cursor-pointer transition-colors">
                  <X size={16} />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-xs font-bold text-zinc-500 mb-2">Item Pesanan:</p>
                <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm font-black text-zinc-900">
                  {noteModalItem.name}
                </div>
              </div>

              <textarea 
                placeholder="Contoh: Tanpa es, kurang manis, extra pedas..." 
                value={customNote} 
                onChange={(e) => setCustomNote(e.target.value)}
                rows={3}
                className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#E87F24] focus:ring-4 focus:ring-[#E87F24]/10 resize-none transition-all"
              />
              
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setNoteModalItem(null)} className="px-5 py-2.5 text-xs font-black text-zinc-500 hover:bg-zinc-100 rounded-xl cursor-pointer transition-colors">
                  Batal
                </button>
                <button onClick={saveNote} className="px-6 py-2.5 bg-zinc-900 text-white text-xs font-black rounded-xl shadow-md hover:bg-zinc-800 cursor-pointer transition-colors">
                  Simpan Catatan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
    </div>
  );
}