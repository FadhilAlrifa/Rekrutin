import { motion } from 'framer-motion';
import {
  Clock,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Edit3,
  Trash2,
  CalendarDays,
  Package,
  Tag,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import {
  evaluateIngredientStatus,
  parseLocalDate,
  checkExpiryStatus as defaultCheckExpiryStatus
} from '../../../utils/inventoryStatus';
import { computeIngredientPriceComparison } from '../../../utils/cogsCalculator';

export default function InventoryTable({
  activeSub,
  filteredProducts = [],
  filteredIngredients = [],
  checkExpiryStatus = defaultCheckExpiryStatus,
  handleOpenEdit,
  handleDeleteIngredient,
  handleOpenPriceModal
}) {
  const formatTanggal = (dateString) => {
    if (!dateString) return '-';
    const parsed = parseLocalDate(dateString);
    if (!parsed) return dateString;
    return parsed.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (activeSub === 'products') {
    return (
      <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-zinc-200 font-mono text-[10px] font-bold uppercase text-[#52525B]">
              <th className="pb-4 px-3 md:px-4">Nama Produk Akhir</th>
              <th className="pb-4 px-3 md:px-4">Kategori</th>
              <th className="pb-4 px-3 md:px-4">Stok Kasir</th>
              <th className="pb-4 px-3 md:px-4">Masa Kedaluwarsa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-xs font-medium">
            {filteredProducts.map((p, idx) => {
              const expiryStatus = checkExpiryStatus(p.expiryDate);
              let rowColor = 'hover:bg-[#FAFAFA]';
              if (expiryStatus === 'expired') rowColor = 'bg-red-50/50 hover:bg-red-50';
              else if (expiryStatus === 'hampir') rowColor = 'bg-[#FEF3C7]/35 hover:bg-[#FEF3C7]/60';

              return (
                <motion.tr
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  key={p.id}
                  className={`${rowColor} transition-colors`}
                >
                  <td className="py-4 px-3 md:px-4 font-bold text-[#141414] text-xs md:text-sm flex items-center gap-2.5">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-8 h-8 md:w-9 md:h-9 rounded-xl object-cover border border-zinc-200 shrink-0"
                    />
                    <span className="truncate max-w-[160px] sm:max-w-xs">{p.name}</span>
                  </td>
                  <td className="py-4 px-3 md:px-4">
                    <span className="bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] px-2.5 py-1 rounded-full font-mono text-[10px] font-bold uppercase whitespace-nowrap">
                      {p.category}
                    </span>
                  </td>
                  <td className="py-4 px-3 md:px-4 font-mono font-bold text-[#141414] whitespace-nowrap">
                    {p.stock} unit
                  </td>
                  <td className="py-4 px-3 md:px-4 text-[#52525B] font-semibold whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className={expiryStatus === 'aman' ? 'text-zinc-400' : 'text-red-600'} />
                      <span className={expiryStatus !== 'aman' ? 'font-bold text-red-600' : ''}>
                        {p.expiryDate || 'Tidak ada'}
                      </span>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[640px] lg:min-w-0">
        <thead>
          <tr className="border-b border-zinc-200 text-[10px] font-bold uppercase tracking-wider text-[#52525B]">
            <th className="pb-3 px-2.5">Bahan Gudang</th>
            <th className="pb-3 px-2.5">Stok</th>
            <th className="pb-3 px-2.5">Harga Bahan</th>
            <th className="pb-3 px-2.5">Masuk &amp; Exp</th>
            <th className="pb-3 px-2.5">Status</th>
            <th className="pb-3 px-2.5 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 text-[13px] font-medium text-[#52525B]">
          {filteredIngredients.map((ing, idx) => {
            const nameParts = (ing.name || '').split(' | ');
            const ingName = nameParts[0];
            const ingCategory = nameParts[1] || 'Bahan Umum';

            const {
              diffDays,
              effectiveExpiryDate,
              usableStock,
              expiredStock,
              batchCount,
              expiredBatchCount,
              isExpired,
              isNearExpiry,
              isBelowMin,
              isHealthy
            } = evaluateIngredientStatus(ing);
            const ratioCap = Math.max(Number(ing.minLimit) * 3 || 10, Number(ing.stock) || 1);
            const stockPct = Math.min(100, Math.max(6, Math.round((Number(ing.stock) / ratioCap) * 100)));

            let rowColor = 'hover:bg-[#FAFAFA]';
            if (isExpired || isBelowMin) rowColor = 'bg-red-50/40 hover:bg-red-50/70';
            else if (isNearExpiry) rowColor = 'bg-[#FEF3C7]/35 hover:bg-[#FEF3C7]/60';

            return (
              <motion.tr
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                key={ing.id}
                className={`${rowColor} transition-colors`}
              >
                <td className="py-3 px-2.5 font-bold text-[#141414] text-[13px]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#FAFAFA] text-[#D97706] flex items-center justify-center shrink-0 border border-zinc-200">
                      <Package size={14} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="truncate max-w-[140px] xl:max-w-[200px]">{ingName}</span>
                      <div className="flex flex-wrap items-center gap-1 mt-0.5">
                        <span className="text-[11px] font-medium text-[#52525B] truncate">{ingCategory}</span>
                        {(batchCount > 1 || expiredBatchCount > 0) && (
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(ing)}
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded border cursor-pointer transition-colors ${
                              expiredBatchCount > 0
                                ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                                : 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A] hover:bg-[#FDE68A]'
                            }`}
                            title="Klik untuk melihat rincian batch"
                          >
                            {batchCount} Batch
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="py-3 px-2.5 whitespace-nowrap">
                  <div className={`font-mono font-bold text-[13px] ${isBelowMin ? 'text-red-600' : 'text-[#141414]'}`}>
                    {ing.stock} <span className="text-[11px] text-[#52525B] font-medium">{ing.unit}</span>
                  </div>
                  {expiredStock > 0 && (
                    <span className="block font-mono text-[10px] font-bold text-red-600">
                      Layak: {usableStock} • Exp: {expiredStock}
                    </span>
                  )}
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-12 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${stockPct}%` }}
                        className={`h-full rounded-full ${
                          isExpired || isBelowMin
                            ? 'bg-red-600'
                            : isNearExpiry
                            ? 'bg-[#F59E0B]'
                            : 'bg-emerald-600'
                        }`}
                      />
                    </div>
                    <span className="font-mono text-[10px] text-[#52525B]">Min {ing.minLimit}</span>
                  </div>
                </td>

                <td className="py-3 px-2.5 whitespace-nowrap">
                  {(() => {
                    const priceInfo = computeIngredientPriceComparison(ing);
                    if (!priceInfo.hasPrice) {
                      return (
                        <span className="text-[10px] font-bold text-[#B45309] bg-[#FEF3C7] border border-[#FDE68A] px-2 py-0.5 rounded-md">
                          Belum diset
                        </span>
                      );
                    }
                    return (
                      <div className="space-y-0.5">
                        <div className="flex items-baseline gap-1">
                          <span className="font-mono font-extrabold text-[#141414] text-xs">
                            Rp {priceInfo.marketPrice.toLocaleString('id-ID')}
                          </span>
                          <span className="text-[10px] text-[#52525B] font-mono">
                            /{ing.unit}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="text-[10px] font-mono font-medium text-[#52525B]">
                            Awal: Rp {priceInfo.initialPrice.toLocaleString('id-ID')}
                          </span>
                          {priceInfo.trend === 'up' ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-mono text-[9px] font-bold">
                              <TrendingUp size={9} /> {priceInfo.formattedDiff}
                            </span>
                          ) : priceInfo.trend === 'down' ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-[9px] font-bold">
                              <TrendingDown size={9} /> {priceInfo.formattedDiff}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    );
                  })()}
                </td>

                <td className="py-3 px-2.5 text-[#52525B] whitespace-nowrap">
                  <div className="flex items-center gap-1 text-xs">
                    <Clock
                      size={13}
                      className={
                        isExpired
                          ? 'text-red-600 shrink-0'
                          : isNearExpiry
                          ? 'text-[#D97706] shrink-0'
                          : 'text-zinc-400 shrink-0'
                      }
                    />
                    <span
                      className={
                        isExpired
                          ? 'font-bold text-red-600'
                          : isNearExpiry
                          ? 'font-bold text-[#B45309]'
                          : 'font-semibold text-[#141414]'
                      }
                    >
                      {formatTanggal(effectiveExpiryDate)}
                    </span>
                    {isExpired && diffDays !== null && (
                      <span className="font-mono text-[10px] font-bold text-red-600">
                        (-{Math.abs(diffDays)}h)
                      </span>
                    )}
                    {isNearExpiry && diffDays !== null && (
                      <span className="font-mono text-[10px] font-bold text-[#B45309]">
                        ({diffDays === 0 ? 'Hari ini' : `H-${diffDays}`})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-[#52525B] mt-0.5">
                    <CalendarDays size={11} className="text-zinc-400 shrink-0" />
                    <span>Masuk: {formatTanggal(ing.entryDate)}</span>
                  </div>
                  {batchCount > 1 && (
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(ing)}
                      className="mt-0.5 text-[10px] font-semibold text-[#B45309] hover:underline cursor-pointer block"
                    >
                      +{batchCount - 1} batch lain
                    </button>
                  )}
                </td>

                <td className="py-3 px-2.5 whitespace-nowrap">
                  <div className="flex flex-wrap items-center gap-1">
                    {isExpired && (
                      <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-md text-[10px] font-bold inline-flex items-center gap-1 whitespace-nowrap">
                        <AlertOctagon size={11} /> Expired
                      </span>
                    )}
                    {isBelowMin && (
                      <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-md text-[10px] font-bold inline-flex items-center gap-1 whitespace-nowrap">
                        <AlertTriangle size={11} /> Menipis
                      </span>
                    )}
                    {isNearExpiry && (
                      <span className="bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] px-2 py-0.5 rounded-md text-[10px] font-bold inline-flex items-center gap-1 whitespace-nowrap">
                        <Clock size={11} /> Hampir Exp
                      </span>
                    )}
                    {isHealthy && (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md text-[10px] font-bold inline-flex items-center gap-1 whitespace-nowrap">
                        <ShieldCheck size={11} /> Aman
                      </span>
                    )}
                  </div>
                </td>

                <td className="py-3 px-2.5 text-right whitespace-nowrap">
                  <div className="inline-flex items-center justify-end gap-1">
                    {handleOpenPriceModal && (
                      <button
                        onClick={() => handleOpenPriceModal(ing)}
                        className="px-2 py-1.5 bg-[#FEF3C7] hover:bg-[#F59E0B] border border-[#FDE68A] text-[#B45309] hover:text-[#141414] rounded-lg font-bold transition-colors cursor-pointer inline-flex items-center gap-1 text-[11px] active:scale-95"
                        title="Update Harga Bahan"
                      >
                        <Tag size={12} /> <span className="hidden xl:inline">Harga</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenEdit(ing)}
                      className="px-2 py-1.5 bg-[#FAFAFA] hover:bg-zinc-200 border border-zinc-200 text-[#141414] rounded-lg font-bold transition-colors cursor-pointer inline-flex items-center gap-1 text-[11px] active:scale-95"
                      title="Edit Barang"
                    >
                      <Edit3 size={12} /> <span className="hidden xl:inline">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteIngredient(ing.id, ing.name)}
                      className="p-1.5 bg-red-50 hover:bg-red-600 hover:text-white border border-red-200 text-red-600 rounded-lg font-bold transition-colors cursor-pointer inline-flex items-center justify-center active:scale-95"
                      title="Hapus Barang"
                      aria-label={`Hapus ${ingName}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
