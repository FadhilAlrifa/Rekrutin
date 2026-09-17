import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock, Sparkles, BellRing, PackageCheck, AlertOctagon, ShieldAlert, LayoutGrid } from 'lucide-react';

export default function AlertsModule({ ingredients = [], setActiveTab }) {
  const [filterType, setFilterType] = useState('all'); // 'all', 'stock', 'expiry'

  const getExpiryStatus = (dateString) => {
    if (!dateString) return 'aman';
    const expDate = new Date(dateString);
    const today = new Date();
    const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'expired';
    if (diffDays <= 30) return 'hampir'; 
    return 'aman';
  };

  // Filter bahan baku yang bermasalah (stok menipis atau kedaluwarsa)
  const alertItems = ingredients.filter(ing => ing.stock <= ing.minLimit || getExpiryStatus(ing.expiryDate) !== 'aman');

  // Filter lanjutan berdasarkan tab pilihan di atas
  const displayedItems = alertItems.filter(item => {
    const isLowStock = item.stock <= item.minLimit;
    const expStatus = getExpiryStatus(item.expiryDate);
    const isExpiryIssue = expStatus !== 'aman';

    if (filterType === 'stock') return isLowStock;
    if (filterType === 'expiry') return isExpiryIssue;
    return true;
  });

  const lowStockCount = alertItems.filter(item => item.stock <= item.minLimit).length;
  const expiryCount = alertItems.filter(item => getExpiryStatus(item.expiryDate) !== 'aman').length;

  // Daftar tab filter lengkap dengan ikon dan warna aktifnya yang konsisten
  const tabs = [
    { id: 'all', name: `Semua Peringatan (${alertItems.length})`, icon: LayoutGrid, activeColor: 'text-[#FFC81E]' },
    { id: 'stock', name: `Stok Menipis (${lowStockCount})`, icon: AlertTriangle, activeColor: 'text-red-500' },
    { id: 'expiry', name: `Isu Kedaluwarsa / FIFO (${expiryCount})`, icon: Clock, activeColor: 'text-orange-500' }
  ];

  return (
    <div className="space-y-8 pb-16">
      
      {/* 1. Header Banner Modern dengan Glassmorphism */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 text-white rounded-[2.5rem] p-7 md:p-8 shadow-2xl relative overflow-hidden border border-zinc-800"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5">
              <ShieldAlert size={13} /> Sistem Monitoring Real-Time
            </span>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Pusat Peringatan & Kritis Gudang</h1>
            <p className="text-zinc-400 text-xs font-medium max-w-xl leading-relaxed">
              Pantau bahan baku yang memerlukan tindakan cepat untuk menghindari kerugian stok kosong atau barang kedaluwarsa.
            </p>
          </div>

          {/* Statistik Counter Ringkas */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white/5 border border-white/10 backdrop-blur-md px-5 py-3.5 rounded-2xl flex items-center gap-3.5 shadow-lg">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${alertItems.length > 0 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                <BellRing size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Total Masalah</p>
                <p className="text-lg font-black text-white">{alertItems.length} Item</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. Filter Tab Pills Modern dengan Ikon Interaktif */}
      {alertItems.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
          {tabs.map(tab => {
            const IconComponent = tab.icon;
            const isActive = filterType === tab.id;

            return (
              <button 
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                  isActive 
                    ? 'bg-zinc-900 text-white shadow-md' 
                    : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                <IconComponent 
                  size={14} 
                  className={isActive ? tab.activeColor : 'text-zinc-400'} 
                />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* 3. Tampilan Konten Utama */}
      {alertItems.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white border border-zinc-200/80 rounded-[2.5rem] p-16 text-center shadow-sm flex flex-col items-center justify-center space-y-4">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shadow-inner">
            <PackageCheck size={40} />
          </div>
          <div className="space-y-1">
            <h3 className="font-black text-zinc-900 text-lg">Semua Stok & FIFO Gudang Aman!</h3>
            <p className="text-xs text-zinc-500 font-medium max-w-sm mx-auto">Sistem tidak mendeteksi adanya bahan baku gudang yang kritis maupun yang hampir kedaluwarsa.</p>
          </div>
        </motion.div>
      ) : displayedItems.length === 0 ? (
        <div className="bg-white border border-zinc-200/80 rounded-[2.5rem] p-12 text-center text-zinc-400 text-xs font-bold">
          Tidak ada item pada kategori filter ini.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence>
            {displayedItems.map((item, idx) => {
              const isLowStock = item.stock <= item.minLimit;
              const expStatus = getExpiryStatus(item.expiryDate);
              const isExpired = expStatus === 'expired';
              const isNearExp = expStatus === 'hampir';

              // Desain Border & Aksen Kartu Berdasarkan Tingkat Kritis
              const cardAccent = isExpired || (isLowStock && isExpired) 
                ? 'border-red-200 bg-gradient-to-b from-red-50/40 to-white' 
                : 'border-orange-200 bg-gradient-to-b from-orange-50/40 to-white';

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: idx * 0.05 }}
                  key={item.id} 
                  className={`border-[1.5px] rounded-[2.5rem] p-7 shadow-lg shadow-zinc-900/5 flex flex-col justify-between space-y-6 relative overflow-hidden ${cardAccent}`}
                >
                  {/* Top Section */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase bg-white text-zinc-700 px-3.5 py-1 rounded-full border border-zinc-200/80 shadow-2xs">
                        Bahan Baku Gudang
                      </span>

                      {/* Badge Status Kritis di Kanan */}
                      <div className="flex items-center gap-1.5">
                        {isLowStock && (
                          <span className="bg-red-100 text-red-600 border border-red-200 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <AlertTriangle size={11} /> Stok Kritis
                          </span>
                        )}
                        {isExpired && (
                          <span className="bg-red-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                            <AlertOctagon size={11} /> Expired!
                          </span>
                        )}
                        {isNearExp && !isExpired && (
                          <span className="bg-orange-100 text-orange-700 border border-orange-200 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <Clock size={11} /> Hampir Exp
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-black text-zinc-900 text-xl tracking-tight">{item.name}</h3>
                    </div>
                    
                    {/* Metrik Info Grid */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="bg-white/80 p-3.5 rounded-2xl border border-zinc-200/60 shadow-2xs space-y-1">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Sisa Stok</span>
                        <div className={`font-mono text-sm font-black flex items-center gap-1 ${isLowStock ? 'text-red-600' : 'text-zinc-900'}`}>
                          {item.stock} <span className="text-xs font-medium text-zinc-500">{item.unit}</span>
                        </div>
                        <span className="text-[10px] font-medium text-zinc-400 block">Min. Batas: {item.minLimit} {item.unit}</span>
                      </div>

                      <div className="bg-white/80 p-3.5 rounded-2xl border border-zinc-200/60 shadow-2xs space-y-1">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Tanggal FIFO</span>
                        <div className={`font-mono text-sm font-black flex items-center gap-1.5 ${isExpired ? 'text-red-600' : isNearExp ? 'text-orange-600' : 'text-zinc-900'}`}>
                          <Clock size={14} className="shrink-0" /> 
                          <span className="truncate">{item.expiryDate || 'Tidak ada data'}</span>
                        </div>
                        <span className="text-[10px] font-medium text-zinc-400 block">Masa Berlaku Barang</span>
                      </div>
                    </div>
                  </div>

                  {/* Warning Action Messages */}
                  <div className="space-y-2 pt-2 border-t border-zinc-200/50">
                    {isLowStock && (
                      <div className="bg-red-50/80 border border-red-200/80 text-red-800 px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2.5">
                        <AlertTriangle size={15} className="text-red-600 shrink-0" />
                        <span>Stok berada di bawah batas minimum pemesanan. Segera lakukan restock.</span>
                      </div>
                    )}
                    
                    {isExpired && (
                      <div className="bg-red-600 text-white px-3.5 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2.5 shadow-md">
                        <AlertOctagon size={15} className="text-white shrink-0" />
                        <span>Barang sudah kedaluwarsa! Wajib ditarik dari rak penyimpanan gudang.</span>
                      </div>
                    )}

                    {isNearExp && !isExpired && (
                      <div className="bg-orange-50/80 border border-orange-200/80 text-orange-800 px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2.5">
                        <Clock size={15} className="text-orange-600 shrink-0" />
                        <span>Masa kedaluwarsa kurang dari 30 hari. Prioritaskan penggunaan bahan ini (FIFO).</span>
                      </div>
                    )}
                  </div>

                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

    </div>
  );
}