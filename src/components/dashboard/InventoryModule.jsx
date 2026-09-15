import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Clock, ShieldCheck, Sparkles, AlertTriangle, Layers, Database, Search, X, Save, ArrowDownToLine, Tag, Scale } from 'lucide-react';

export default function InventoryModule({ products, ingredients, setIngredients }) {
  const [activeSub, setActiveSub] = useState('ingredients'); // Default tab langsung ke Gudang
  const [searchTerm, setSearchTerm] = useState('');
  
  // State untuk form Barang Masuk (Bebas Input / Fleksibel)
  const [isStockInModalOpen, setIsStockInModalOpen] = useState(false);
  const [stockInData, setStockInData] = useState({
    name: '',
    addedQty: '',
    unit: 'pcs',
    minLimit: '5',
    newExpiryDate: ''
  });

  // Logika Pengecekan Kedaluwarsa
  const checkExpiryStatus = (dateString) => {
    if (!dateString) return 'aman';
    const expDate = new Date(dateString);
    const today = new Date();
    const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'expired';
    if (diffDays <= 30) return 'hampir'; 
    return 'aman';
  };

  // Handler Simpan Barang Masuk (Otomatis deteksi barang lama vs baru)
  const handleStockInSubmit = (e) => {
    e.preventDefault();
    if (!stockInData.name || !stockInData.addedQty) {
      alert("Nama barang dan jumlah stok wajib diisi!");
      return;
    }

    // Cek apakah barang sudah ada (berdasarkan nama, tidak case-sensitive)
    const existingIndex = ingredients.findIndex(
      ing => ing.name.toLowerCase().trim() === stockInData.name.toLowerCase().trim()
    );

    if (existingIndex >= 0) {
      // JIKA BARANG SUDAH ADA: Update stok dan expiry date
      const updatedIngredients = [...ingredients];
      updatedIngredients[existingIndex] = {
        ...updatedIngredients[existingIndex],
        stock: updatedIngredients[existingIndex].stock + parseInt(stockInData.addedQty),
        expiryDate: stockInData.newExpiryDate || updatedIngredients[existingIndex].expiryDate
      };
      setIngredients(updatedIngredients);
    } else {
      // JIKA BARANG BARU: Tambahkan sebagai item baru di gudang
      const newIngredient = {
        id: Date.now(),
        name: stockInData.name.trim(),
        stock: parseInt(stockInData.addedQty),
        unit: stockInData.unit,
        minLimit: parseInt(stockInData.minLimit),
        expiryDate: stockInData.newExpiryDate
      };
      setIngredients([newIngredient, ...ingredients]);
    }

    setIsStockInModalOpen(false);
    setStockInData({ name: '', addedQty: '', unit: 'pcs', minLimit: '5', newExpiryDate: '' });
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredIngredients = ingredients.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 pb-16 relative">
      
      {/* HEADER BANNER */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 text-white rounded-[2.5rem] p-7 md:p-8 shadow-xl relative overflow-hidden border border-zinc-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#E87F24]/20 rounded-full blur-[80px] pointer-events-none"></div>
        
        <div className="relative z-10 space-y-2">
          <span className="bg-[#E87F24]/20 text-[#FFC81E] border border-[#E87F24]/30 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5">
            <Sparkles size={13} /> Inventaris & Stok Gudang
          </span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Manajemen Gudang</h1>
          <p className="text-zinc-400 text-xs font-medium max-w-lg">Pantau persediaan bahan baku dan catat barang masuk secara fleksibel.</p>
        </div>

        <div className="relative z-10 flex flex-col w-full md:w-auto gap-3">
          <button 
            onClick={() => setIsStockInModalOpen(true)}
            className="w-full md:w-auto bg-gradient-to-r from-[#E87F24] to-[#FFC81E] text-zinc-950 font-black text-xs px-6 py-3.5 rounded-2xl shadow-lg cursor-pointer flex items-center justify-center gap-2 shrink-0 transition-transform hover:scale-[1.02]"
          >
            <ArrowDownToLine size={16} /> Catat Barang Masuk
          </button>
          <div className="relative w-full">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input type="text" placeholder="Cari item..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white/10 border border-white/15 text-white placeholder-zinc-400 text-xs rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#E87F24] transition-all font-medium backdrop-blur-md" />
          </div>
        </div>
      </motion.div>

      {/* TABS NAVIGASI */}
      <div className="flex items-center gap-2 border-b border-zinc-200/80 pb-4">
        <button onClick={() => setActiveSub('ingredients')} className={`px-6 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shadow-xs ${activeSub === 'ingredients' ? 'bg-gradient-to-r from-[#E87F24] to-[#FFC81E] text-zinc-950' : 'bg-white text-zinc-600 border border-zinc-200/80 hover:bg-zinc-50'}`}>
          <Database size={16} /> Stok Gudang & BOM ({ingredients.length})
        </button>
        <button onClick={() => setActiveSub('products')} className={`px-6 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shadow-xs ${activeSub === 'products' ? 'bg-gradient-to-r from-[#E87F24] to-[#FFC81E] text-zinc-950' : 'bg-white text-zinc-600 border border-zinc-200/80 hover:bg-zinc-50'}`}>
          <Layers size={16} /> Produk Etalase ({products.length})
        </button>
      </div>

      {/* AREA TABEL */}
      <div className="bg-white border border-zinc-200/80 rounded-[2.5rem] p-6 md:p-8 shadow-xl overflow-hidden">
        {activeSub === 'products' ? (
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 text-[10px] font-black uppercase text-zinc-400">
                  <th className="pb-4 px-4">Nama Produk Akhir</th>
                  <th className="pb-4 px-4">Kategori</th>
                  <th className="pb-4 px-4">Stok Kasir</th>
                  <th className="pb-4 px-4">Masa Kedaluwarsa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 text-xs font-medium">
                {filteredProducts.map((p, idx) => {
                  const expiryStatus = checkExpiryStatus(p.expiryDate);
                  let rowColor = 'hover:bg-zinc-50/80';
                  if(expiryStatus === 'expired') rowColor = 'bg-red-50/50 hover:bg-red-50';
                  else if(expiryStatus === 'hampir') rowColor = 'bg-orange-50/50 hover:bg-orange-50';

                  return (
                    <motion.tr initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} key={p.id} className={`${rowColor} transition-colors`}>
                      <td className="py-4 px-4 font-black text-zinc-900 text-sm">{p.name}</td>
                      <td className="py-4 px-4"><span className="bg-zinc-100 text-zinc-600 border border-zinc-200 px-3 py-1 rounded-full text-[9px] font-black uppercase">{p.category}</span></td>
                      <td className="py-4 px-4 font-bold text-zinc-800">{p.stock} unit</td>
                      <td className="py-4 px-4 text-zinc-600 flex items-center gap-1.5 pt-4">
                        <Clock size={14} className={expiryStatus === 'aman' ? 'text-zinc-400' : 'text-red-500'} /> 
                        <span className={expiryStatus !== 'aman' ? 'font-black text-red-600' : ''}>{p.expiryDate}</span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        ) : (

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 text-[10px] font-black uppercase text-zinc-400">
                  <th className="pb-4 px-4">Nama Barang Gudang</th>
                  <th className="pb-4 px-4">Total Stok</th>
                  <th className="pb-4 px-4">Batas Restock</th>
                  <th className="pb-4 px-4">Kedaluwarsa (FIFO)</th>
                  <th className="pb-4 px-4">Status Peringatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 text-xs font-medium">
                {filteredIngredients.map((ing, idx) => {
                  const isBelowMin = ing.stock <= ing.minLimit;
                  const expiryStatus = checkExpiryStatus(ing.expiryDate);

                  // Penentuan warna baris bahan baku
                  let rowColor = 'hover:bg-zinc-50/80';
                  if (expiryStatus === 'expired' || isBelowMin) rowColor = 'bg-red-50/40 hover:bg-red-50/80';
                  else if (expiryStatus === 'hampir') rowColor = 'bg-orange-50/40 hover:bg-orange-50/80';

                  return (
                    <motion.tr initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} key={ing.id} className={`${rowColor} transition-colors`}>
                      <td className="py-4 px-4 font-black text-zinc-900 text-sm">{ing.name}</td>
                      <td className={`py-4 px-4 font-mono font-black text-sm ${isBelowMin ? 'text-red-600' : 'text-zinc-800'}`}>
                        {ing.stock} <span className="text-[10px] font-bold text-zinc-400">{ing.unit}</span>
                      </td>
                      <td className="py-4 px-4 text-zinc-500 font-bold">{ing.minLimit} {ing.unit}</td>
                      <td className="py-4 px-4 text-zinc-600 flex items-center gap-1.5 pt-4">
                        <Clock size={14} className={expiryStatus === 'aman' ? 'text-zinc-400' : 'text-red-500'} /> 
                        <span className={expiryStatus !== 'aman' ? 'font-black text-red-600' : ''}>
                          {ing.expiryDate || 'Tidak ada'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {isBelowMin ? (
                          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-black inline-flex items-center gap-1"><AlertTriangle size={12} /> Restock!</span>
                        ) : expiryStatus === 'hampir' ? (
                          <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[10px] font-black">Hampir Kedaluwarsa</span>
                        ) : (
                          <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black inline-flex items-center gap-1"><ShieldCheck size={12} /> Terkendali</span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        )}
      </div>

      {/* MODAL CATAT BARANG MASUK FLEKSIBEL (Tanpa Dropdown) */}
      <AnimatePresence>
        {isStockInModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsStockInModalOpen(false)} className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm cursor-pointer"></motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-7 shadow-2xl border border-zinc-100">
              
              <div className="flex justify-between items-center border-b border-zinc-100 pb-4 mb-6">
                <div>
                  <h4 className="font-black text-zinc-900 text-base flex items-center gap-2"><ArrowDownToLine size={18} className="text-[#E87F24]"/> Catat Barang Masuk</h4>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1">Gudang & Inventaris Baru</p>
                </div>
                <button onClick={() => setIsStockInModalOpen(false)} className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 flex items-center justify-center cursor-pointer"><X size={16}/></button>
              </div>

              <form onSubmit={handleStockInSubmit} className="space-y-4">
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-600">Nama Barang / Bahan Baku</label>
                  <div className="relative">
                    <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input 
                      type="text" 
                      placeholder="Ketik nama barang (Misal: Gula Pasir)"
                      value={stockInData.name} 
                      onChange={(e) => setStockInData({...stockInData, name: e.target.value})} 
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-11 pr-4 py-3 text-sm font-bold focus:outline-none focus:border-[#E87F24]"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-600">Jumlah Masuk</label>
                    <input 
                      type="number" 
                      placeholder="Misal: 50"
                      value={stockInData.addedQty} 
                      onChange={(e) => setStockInData({...stockInData, addedQty: e.target.value})} 
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-sm font-black focus:outline-none focus:border-[#E87F24]" 
                      required 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-600">Satuan</label>
                    <input 
                      type="text" 
                      placeholder="kg / liter / pcs"
                      value={stockInData.unit} 
                      onChange={(e) => setStockInData({...stockInData, unit: e.target.value})} 
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#E87F24]" 
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-600">Batas Restock (Min. Stok)</label>
                    <input 
                      type="number" 
                      placeholder="Misal: 5"
                      value={stockInData.minLimit} 
                      onChange={(e) => setStockInData({...stockInData, minLimit: e.target.value})} 
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#E87F24]" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-600">Tgl. Kedaluwarsa</label>
                    <input 
                      type="text" 
                      placeholder="Contoh: 30 Dec 2026"
                      value={stockInData.newExpiryDate} 
                      onChange={(e) => setStockInData({...stockInData, newExpiryDate: e.target.value})} 
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#E87F24]" 
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl mt-2">
                  <p className="text-[10px] text-blue-700 font-medium leading-relaxed">
                    <strong>Pintar:</strong> Jika nama barang sudah ada di gudang, sistem akan otomatis menjumlahkan stok baru tanpa membuat data ganda.
                  </p>
                </div>

                <button type="submit" className="w-full bg-gradient-to-r from-[#E87F24] to-[#FFC81E] text-zinc-950 font-black py-3.5 rounded-2xl shadow-lg cursor-pointer flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]">
                  <Save size={16} /> Simpan ke Gudang
                </button>
              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}