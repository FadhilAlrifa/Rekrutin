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
      
      {/* 1. Header ala macOS */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Peringatan Gudang</h1>
          <p className="text-zinc-500 text-[13px] font-medium mt-1">Pantau bahan baku yang memerlukan tindakan cepat.</p>
        </div>
        <div className="flex items-center gap-2">
          {alertItems.length > 0 && (
            <span className="bg-red-50 text-red-600 border border-red-100 text-[13px] font-semibold px-4 py-2 rounded-[14px] flex items-center gap-2 shadow-sm">
              <AlertTriangle size={16} /> {alertItems.length} Peringatan Aktif
            </span>
          )}
        </div>
      </div>

      {/* 2. Sistem Tab Filter ala Apple Segmented Control */}
      {alertItems.length > 0 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center p-1 bg-black/[0.04] rounded-[14px] overflow-x-auto hide-scrollbar">
            {tabs.map(tab => {
              const IconComponent = tab.icon;
              const isActive = filterType === tab.id;

              return (
                <button 
                  key={tab.id}
                  onClick={() => setFilterType(tab.id)}
                  className={`px-4 py-1.5 rounded-[10px] text-[13px] font-medium transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    isActive 
                      ? 'bg-white text-zinc-900 shadow-[0_1px_4px_rgba(0,0,0,0.12)] border border-black/[0.04]' 
                      : 'text-zinc-500 hover:text-zinc-700 hover:bg-black/[0.02] border border-transparent'
                  }`}
                >
                  <IconComponent size={14} className={isActive ? tab.activeColor : 'text-zinc-400'} />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Tampilan Konten Utama */}
      {alertItems.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#f5f5f7] border border-black/[0.04] rounded-[24px] p-16 text-center shadow-sm flex flex-col items-center justify-center space-y-4">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shadow-inner">
            <PackageCheck size={40} />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-zinc-900 text-lg">Semua Stok & FIFO Gudang Aman!</h3>
            <p className="text-sm text-zinc-500 font-medium max-w-sm mx-auto">Sistem tidak mendeteksi adanya bahan baku gudang yang kritis maupun yang hampir kedaluwarsa.</p>
          </div>
        </motion.div>
      ) : displayedItems.length === 0 ? (
        <div className="bg-[#f5f5f7] border border-black/[0.04] rounded-[24px] p-12 text-center text-zinc-400 text-sm font-medium">
          Tidak ada item pada kategori filter ini.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <AnimatePresence>
            {displayedItems.map((item, idx) => {
              const isLowStock = item.stock <= item.minLimit;
              const expStatus = getExpiryStatus(item.expiryDate);
              const isExpired = expStatus === 'expired';
              const isNearExp = expStatus === 'hampir';

              // Desain Border & Aksen Kartu ala iOS Widget
              const cardAccent = isExpired || (isLowStock && isExpired) 
                ? 'border-red-200/50 bg-white shadow-[0_8px_30px_rgba(239,68,68,0.06)]' 
                : 'border-orange-200/50 bg-white shadow-[0_8px_30px_rgba(249,115,22,0.06)]';

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: idx * 0.05 }}
                  key={item.id} 
                  className={`border rounded-[20px] p-6 flex flex-col justify-between space-y-5 relative overflow-hidden ${cardAccent}`}
                >
                  {/* Top Section */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-semibold uppercase bg-black/[0.02] text-zinc-500 px-3 py-1 rounded-full border border-black/[0.04] tracking-wide">
                        Bahan Baku Gudang
                      </span>

                      {/* Badge Status Kritis di Kanan */}
                      <div className="flex items-center gap-1.5">
                        {isLowStock && (
                          <span className="bg-red-50 text-red-600 border border-red-100 text-[11px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                            <AlertTriangle size={12} /> Stok Kritis
                          </span>
                        )}
                        {isExpired && (
                          <span className="bg-red-500 text-white text-[11px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                            <AlertOctagon size={12} /> Expired!
                          </span>
                        )}
                        {isNearExp && !isExpired && (
                          <span className="bg-orange-50 text-orange-600 border border-orange-100 text-[11px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Clock size={12} /> Hampir Exp
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-zinc-900 text-lg tracking-tight">{(item.name || '').split(' | ')[0]}</h3>
                    </div>
                    
                    {/* Metrik Info Grid */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="bg-[#f5f5f7] p-3 rounded-[14px] border border-black/[0.02] space-y-1">
                        <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide block">Sisa Stok</span>
                        <div className={`font-mono text-[15px] font-semibold flex items-center gap-1 ${isLowStock ? 'text-red-600' : 'text-zinc-900'}`}>
                          {item.stock} <span className="text-[12px] font-medium text-zinc-500">{item.unit}</span>
                        </div>
                        <span className="text-[11px] font-medium text-zinc-400 block">Min. Batas: {item.minLimit} {item.unit}</span>
                      </div>

                      <div className="bg-[#f5f5f7] p-3 rounded-[14px] border border-black/[0.02] space-y-1">
                        <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide block">Tanggal FIFO</span>
                        <div className={`font-mono text-[15px] font-semibold flex items-center gap-1.5 ${isExpired ? 'text-red-600' : isNearExp ? 'text-orange-600' : 'text-zinc-900'}`}>
                          <Clock size={14} className="shrink-0" /> 
                          <span className="truncate">{item.expiryDate || 'Tidak ada data'}</span>
                        </div>
                        <span className="text-[11px] font-medium text-zinc-400 block">Masa Berlaku Barang</span>
                      </div>
                    </div>
                  </div>

                  {/* Warning Action Messages */}
                  <div className="space-y-2 pt-3 border-t border-black/[0.04]">
                    {isLowStock && (
                      <div className="bg-red-50/80 border border-red-100 text-red-800 px-3 py-2.5 rounded-[12px] text-[12px] font-medium flex items-center gap-2.5">
                        <AlertTriangle size={14} className="text-red-600 shrink-0" />
                        <span>Stok di bawah batas aman. Lakukan restock segera.</span>
                      </div>
                    )}
                    
                    {isExpired && (
                      <div className="bg-red-500 text-white px-3 py-2.5 rounded-[12px] text-[12px] font-semibold flex items-center gap-2.5 shadow-[0_4px_12px_rgba(239,68,68,0.3)]">
                        <AlertOctagon size={14} className="text-white shrink-0" />
                        <span>Barang sudah kedaluwarsa! Tarik dari penyimpanan.</span>
                      </div>
                    )}

                    {isNearExp && !isExpired && (
                      <div className="bg-orange-50/80 border border-orange-100 text-orange-800 px-3 py-2.5 rounded-[12px] text-[12px] font-medium flex items-center gap-2.5">
                        <Clock size={14} className="text-orange-600 shrink-0" />
                        <span>Masa kedaluwarsa &lt; 30 hari. Prioritaskan (FIFO).</span>
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