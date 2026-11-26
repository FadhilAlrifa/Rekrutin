import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Clock,
  PackageCheck,
  AlertOctagon,
  Search,
  ArrowRight,
  LayoutGrid,
  List,
  ArrowUpDown
} from 'lucide-react';
import { getExpiryDays, checkExpiryStatus } from '../../utils/inventoryStatus';

export default function AlertsModule({ ingredients = [], setActiveTab }) {
  const [filterType, setFilterType] = useState('all'); // 'all' | 'expired' | 'stock' | 'fefo'
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const [sortBy, setSortBy] = useState('severity'); // 'severity' | 'name'

  // Enrich & filter bermasalah dengan skor urgensi
  const enrichedAlerts = useMemo(() => {
    return ingredients
      .map((ing) => {
        const diffDays = getExpiryDays(ing.expiryDate);
        const expStatus = checkExpiryStatus(ing.expiryDate);
        const isExpired = expStatus === 'expired';
        const isNearExp = expStatus === 'hampir';
        const isLowStock = Number(ing.stock) <= Number(ing.minLimit);
        const hasIssue = isLowStock || isExpired || isNearExp;

        if (!hasIssue) return null;

        const parts = (ing.name || '').split(' | ');
        const cleanName = parts[0] || 'Bahan Baku';
        const categoryName = parts[1] || 'Bahan Umum';

        // Skor prioritas untuk sorting otomatis (makin tinggi = makin mendesak)
        let severityScore = 0;
        if (isExpired) severityScore += 100 + Math.min(50, Math.abs(diffDays || 0));
        if (isLowStock) severityScore += 60;
        if (isNearExp) severityScore += 30 + Math.max(0, 30 - (diffDays || 0));

        const minLimit = Math.max(Number(ing.minLimit) || 1, 0.001);
        const currentStock = Number(ing.stock) || 0;
        const stockRatioPct = Math.min(100, Math.max(4, Math.round((currentStock / (minLimit * 2)) * 100)));

        return {
          ...ing,
          cleanName,
          categoryName,
          diffDays,
          expStatus,
          isExpired,
          isNearExp,
          isLowStock,
          severityScore,
          stockRatioPct
        };
      })
      .filter(Boolean);
  }, [ingredients]);

  const expiredCount = enrichedAlerts.filter((a) => a.isExpired).length;
  const lowStockCount = enrichedAlerts.filter((a) => a.isLowStock).length;
  const fefoCount = enrichedAlerts.filter((a) => a.isNearExp).length;

  const displayedItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return enrichedAlerts
      .filter((item) => {
        if (filterType === 'expired' && !item.isExpired) return false;
        if (filterType === 'stock' && !item.isLowStock) return false;
        if (filterType === 'fefo' && !item.isNearExp) return false;
        if (q) {
          return (
            item.cleanName.toLowerCase().includes(q) ||
            item.categoryName.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.cleanName.localeCompare(b.cleanName);
        return b.severityScore - a.severityScore;
      });
  }, [enrichedAlerts, filterType, searchQuery, sortBy]);

  const handleOpenInventory = () => {
    setActiveTab?.('inventory');
  };

  const summaryTiles = [
    {
      id: 'all',
      label: 'Total Peringatan',
      count: enrichedAlerts.length,
      hint: 'Perlu segera dicek',
      tone: 'text-[#141414]',
      activeBorder: 'border-[#141414]'
    },
    {
      id: 'expired',
      label: 'Sudah Kedaluwarsa',
      count: expiredCount,
      hint: 'Segera tarik dari gudang',
      tone: 'text-red-600',
      activeBorder: 'border-red-600'
    },
    {
      id: 'stock',
      label: 'Stok Hampir Habis',
      count: lowStockCount,
      hint: 'Di bawah batas aman',
      tone: 'text-red-600',
      activeBorder: 'border-red-500'
    },
    {
      id: 'fefo',
      label: 'Hampir Kedaluwarsa',
      count: fefoCount,
      hint: 'Sisa simpan ≤ 30 hari',
      tone: 'text-[#D97706]',
      activeBorder: 'border-[#F59E0B]'
    }
  ];

  const renderPrimaryIssueText = (item) => {
    if (item.isExpired && item.isLowStock) {
      return `Batch lewat ${Math.abs(item.diffDays)} hari & stok di bawah minimum. Tarik batch lama lalu restock.`;
    }
    if (item.isExpired) {
      return `Melewati batas simpan ${Math.abs(item.diffDays)} hari lalu. Segera tarik dari penyimpanan.`;
    }
    if (item.isLowStock && item.isNearExp) {
      return `Stok menipis (${item.stock} ${item.unit}) dan batch tersisa ${item.diffDays} hari. Habiskan dulu lalu restock.`;
    }
    if (item.isLowStock) {
      const deficit = Math.max(0, Number((item.minLimit - item.stock).toFixed(3)));
      return deficit > 0
        ? `Kurang ${deficit} ${item.unit} untuk menyentuh batas aman minimum.`
        : 'Menyentuh tepat di batas aman minimum. Siapkan restock.';
    }
    return `Masa simpan tersisa ${item.diffDays} hari. Prioritaskan batch ini lebih dulu (FEFO).`;
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header Editorial */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 pb-5 border-b border-zinc-200">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#141414]">
            Peringatan Bahan Gudang
          </h1>
          <p className="text-[#52525B] text-[13px] font-medium mt-1">
            Pantau bahan baku yang stoknya menipis, mendekati kedaluwarsa, atau sudah lewat tanggal simpan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {enrichedAlerts.length > 0 && (
            <span className="bg-red-50 text-red-700 border border-red-200 font-mono text-xs font-bold px-3.5 py-2 rounded-xl inline-flex items-center gap-2">
              <AlertTriangle size={14} /> {enrichedAlerts.length} Isu Aktif
            </span>
          )}
          {setActiveTab && (
            <button
              type="button"
              onClick={handleOpenInventory}
              className="bg-[#141414] hover:bg-zinc-800 text-white text-xs font-bold px-4 py-2 rounded-xl inline-flex items-center gap-2 cursor-pointer transition-colors"
            >
              <span>Kelola di Gudang</span>
              <ArrowRight size={14} className="text-[#F59E0B]" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Summary Triage Strip (Interactive Filter Tiles) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summaryTiles.map((tile) => {
          const isActive = filterType === tile.id;
          return (
            <button
              key={tile.id}
              type="button"
              onClick={() => setFilterType(tile.id)}
              className={`text-left bg-white border rounded-2xl p-4 transition-all cursor-pointer ${
                isActive
                  ? `${tile.activeBorder} shadow-sm`
                  : 'border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#52525B] block">
                {tile.label}
              </span>
              <p className={`text-2xl font-extrabold font-mono mt-1 ${tile.tone}`}>
                {tile.count}
              </p>
              <span className="text-[11px] font-medium text-[#52525B] block mt-0.5">
                {tile.hint}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Controls Bar: Search, Sort & View Switch */}
      {enrichedAlerts.length > 0 && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Cari bahan baku atau kategori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-zinc-200 text-[#141414] text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all font-medium shadow-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setSortBy((prev) => (prev === 'severity' ? 'name' : 'severity'))}
              className="bg-white border border-zinc-200 hover:border-zinc-300 text-[#141414] text-xs font-bold px-3.5 py-2 rounded-xl inline-flex items-center gap-2 cursor-pointer transition-colors"
            >
              <ArrowUpDown size={13} className="text-[#D97706]" />
              <span>Urutan: {sortBy === 'severity' ? 'Prioritas Mendesak' : 'Nama A-Z'}</span>
            </button>

            <div className="flex items-center bg-zinc-200/70 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                aria-label="Tampilan Kartu"
                className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-all ${
                  viewMode === 'cards'
                    ? 'bg-[#141414] text-white shadow-sm'
                    : 'text-[#52525B] hover:text-[#141414]'
                }`}
              >
                <LayoutGrid size={13} />
                <span>Kartu</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                aria-label="Tampilan Tabel"
                className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-all ${
                  viewMode === 'table'
                    ? 'bg-[#141414] text-white shadow-sm'
                    : 'text-[#52525B] hover:text-[#141414]'
                }`}
              >
                <List size={13} />
                <span>Ringkas</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Main Content */}
      {enrichedAlerts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white border border-zinc-200 rounded-2xl p-12 sm:p-16 text-center shadow-sm flex flex-col items-center justify-center space-y-4"
        >
          <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl flex items-center justify-center">
            <PackageCheck size={32} />
          </div>
          <div className="space-y-1.5 max-w-md">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full inline-block">
              {ingredients.length} Bahan Terpantau • Semua Normal
            </span>
            <h3 className="font-extrabold text-[#141414] text-lg pt-1">
              Stok & Masa Simpan Gudang Terkendali
            </h3>
            <p className="text-xs sm:text-sm text-[#52525B] font-medium leading-relaxed">
              Tidak ditemukan bahan baku di bawah batas minimum ataupun yang mendekati kedaluwarsa dalam 30 hari ke depan.
            </p>
          </div>
          {setActiveTab && (
            <button
              type="button"
              onClick={handleOpenInventory}
              className="mt-2 bg-[#FAFAFA] hover:bg-[#141414] hover:text-white text-[#141414] border border-zinc-200 text-xs font-bold px-5 py-2.5 rounded-xl inline-flex items-center gap-2 cursor-pointer transition-colors"
            >
              <span>Buka Stok Gudang & BOM</span>
              <ArrowRight size={14} />
            </button>
          )}
        </motion.div>
      ) : displayedItems.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center space-y-3">
          <p className="text-[#141414] text-sm font-bold">Tidak ada peringatan pada filter ini.</p>
          <button
            type="button"
            onClick={() => {
              setFilterType('all');
              setSearchQuery('');
            }}
            className="text-xs font-bold text-[#D97706] hover:underline cursor-pointer"
          >
            Tampilkan semua peringatan ({enrichedAlerts.length})
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* Dense Triage Table View */
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-zinc-200 font-mono text-[10px] font-bold uppercase tracking-wider text-[#52525B]">
                <th className="pb-3 px-3">Bahan Baku</th>
                <th className="pb-3 px-3">Sisa / Min.</th>
                <th className="pb-3 px-3">FEFO / Exp</th>
                <th className="pb-3 px-3">Tindakan</th>
                {setActiveTab && <th className="pb-3 px-3 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs font-medium">
              {displayedItems.map((item) => (
                <tr key={item.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="py-3.5 px-3">
                    <p className="font-bold text-[#141414]">{item.cleanName}</p>
                    <span className="font-mono text-[10px] text-[#52525B]">{item.categoryName}</span>
                  </td>
                  <td className="py-3.5 px-3 font-mono whitespace-nowrap">
                    <span className={`font-extrabold ${item.isLowStock ? 'text-red-600' : 'text-[#141414]'}`}>
                      {item.stock} {item.unit}
                    </span>
                    <span className="text-[#52525B] text-[11px] block">
                      Min: {item.minLimit} {item.unit}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-mono whitespace-nowrap">
                    {item.isExpired ? (
                      <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                        <AlertOctagon size={11} /> Expired {Math.abs(item.diffDays)}h lalu
                      </span>
                    ) : item.isNearExp ? (
                      <span className="bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] text-[10px] font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                        <Clock size={11} /> Sisa {item.diffDays} hari
                      </span>
                    ) : (
                      <span className="text-[#52525B]">{item.expiryDate || '-'}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-[#52525B] max-w-xs">
                    {renderPrimaryIssueText(item)}
                  </td>
                  {setActiveTab && (
                    <td className="py-3.5 px-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={handleOpenInventory}
                        className="px-3 py-1.5 rounded-lg bg-[#FAFAFA] hover:bg-[#141414] hover:text-white border border-zinc-200 text-[#141414] font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>{item.isExpired ? 'Audit Batch' : 'Restock'}</span>
                        <ArrowRight size={12} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* High-Signal Triage Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {displayedItems.map((item, idx) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.22, delay: Math.min(idx * 0.03, 0.2) }}
                  key={item.id}
                  className="bg-white border border-zinc-200 hover:border-zinc-300 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-sm transition-colors"
                >
                  {/* Top Row: Identity & Severity Pills */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#52525B]">
                        {item.categoryName}
                      </span>
                      <h3 className="font-extrabold text-[#141414] text-base sm:text-lg tracking-tight truncate mt-0.5">
                        {item.cleanName}
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-1.5 shrink-0">
                      {item.isExpired && (
                        <span className="bg-red-600 text-white font-mono text-[10px] font-bold px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                          <AlertOctagon size={11} /> Expired {Math.abs(item.diffDays)}h
                        </span>
                      )}
                      {item.isLowStock && (
                        <span className="bg-red-50 text-red-700 border border-red-200 font-mono text-[10px] font-bold px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                          <AlertTriangle size={11} /> Stok Kritis
                        </span>
                      )}
                      {item.isNearExp && !item.isExpired && (
                        <span className="bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] font-mono text-[10px] font-bold px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                          <Clock size={11} /> FEFO {item.diffDays}h
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Middle Row: Compact Quantitative Readout */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#FAFAFA] border border-zinc-200 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#52525B]">
                          Stok Gudang
                        </span>
                        <span className="font-mono text-[10px] text-[#52525B]">
                          Min {item.minLimit}
                        </span>
                      </div>
                      <p className={`font-mono text-base font-extrabold ${item.isLowStock ? 'text-red-600' : 'text-[#141414]'}`}>
                        {item.stock} <span className="text-xs font-semibold text-[#52525B]">{item.unit}</span>
                      </p>
                      <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${item.stockRatioPct}%` }}
                          className={`h-full rounded-full ${item.isLowStock ? 'bg-red-600' : 'bg-emerald-600'}`}
                        />
                      </div>
                    </div>

                    <div className="bg-[#FAFAFA] border border-zinc-200 rounded-xl p-3 flex flex-col justify-between">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#52525B]">
                        Masa Simpan
                      </span>
                      <p className={`font-mono text-sm font-extrabold truncate mt-1 ${
                        item.isExpired ? 'text-red-600' : item.isNearExp ? 'text-[#D97706]' : 'text-[#141414]'
                      }`}>
                        {item.expiryDate || 'Belum diisi'}
                      </p>
                      <span className="text-[11px] font-medium text-[#52525B] mt-1">
                        {item.diffDays === null
                          ? 'Tanpa tanggal exp'
                          : item.diffDays < 0
                          ? `Lewat ${Math.abs(item.diffDays)} hari`
                          : `Sisa ${item.diffDays} hari`}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Row: Concise Action + CTA */}
                  <div className="pt-3 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="text-xs font-medium text-[#52525B] leading-relaxed">
                      {renderPrimaryIssueText(item)}
                    </p>
                    {setActiveTab && (
                      <button
                        type="button"
                        onClick={handleOpenInventory}
                        className={`px-3.5 py-2 rounded-xl text-xs font-extrabold inline-flex items-center justify-center gap-1.5 shrink-0 cursor-pointer transition-colors ${
                          item.isExpired
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-[#F59E0B] hover:bg-[#D97706] text-[#141414]'
                        }`}
                      >
                        <span>{item.isExpired ? 'Tarik Batch' : 'Restock'}</span>
                        <ArrowRight size={13} />
                      </button>
                    )}
                  </div>
                </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
