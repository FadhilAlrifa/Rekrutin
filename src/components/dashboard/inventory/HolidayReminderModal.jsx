import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  CalendarClock,
  Tag,
  History,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Package,
  Award
} from 'lucide-react';
import { parseLocalDate } from '../../../utils/inventoryStatus';

export default function HolidayReminderModal({
  isOpen,
  onClose,
  reminder,
  referenceData,
  favoriteMenuQuotas = [],
  onNavigateInventory
}) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !reminder) return null;

  const formatDate = (dateStr) => {
    const parsed = parseLocalDate(dateStr);
    if (!parsed) return dateStr || '-';
    return parsed.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const items = referenceData?.items || [];
  const isLastYearExact = referenceData?.sourceScope === 'last_year_event';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="holiday-reminder-title"
      className="fixed inset-0 z-[125] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-[#141414]/45 backdrop-blur-[4px] cursor-pointer"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ type: 'spring', stiffness: 420, damping: 32, mass: 0.85 }}
        className="relative w-full max-w-2xl bg-white sm:rounded-3xl rounded-t-3xl border border-[#E5E5E5] shadow-[0_24px_64px_-16px_rgba(20,20,20,0.22)] z-10 flex flex-col max-h-[90vh] overflow-hidden"
      >
        <div className="h-1.5 w-full bg-[#F59E0B] shrink-0" />

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-[#E5E5E5] flex items-start justify-between gap-3 shrink-0 bg-white">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] ring-4 ring-[#FEF3C7]/60 flex items-center justify-center shrink-0">
              <CalendarClock size={22} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] font-mono text-[10px] font-extrabold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                  {reminder.countdownBadge} • Reminder Hari Besar
                </span>
                <span className="font-mono text-[10px] font-bold text-[#52525B]">
                  {formatDate(reminder.startDate)} – {formatDate(reminder.endDate)}
                </span>
              </div>
              <h3
                id="holiday-reminder-title"
                className="text-lg font-extrabold text-[#141414] tracking-tight leading-snug"
              >
                {reminder.headline}
              </h3>
              {reminder.notes && (
                <p className="text-xs text-[#52525B] font-medium mt-0.5">{reminder.notes}</p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup reminder"
            className="w-8 h-8 rounded-full bg-[#FAFAFA] hover:bg-zinc-200/70 border border-[#E5E5E5] text-zinc-500 hover:text-[#141414] flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 space-y-5 flex-1 bg-white">
          {/* Pesan Pengingat Utama & Penegasan Buffer */}
          <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-2xl p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#F59E0B] text-[#141414] flex items-center justify-center shrink-0">
                <Tag size={17} />
              </div>
              <div>
                <p className="text-sm font-extrabold text-[#141414]">
                  Harap Update Daftar Harga &amp; Siapkan Pembelian Stok
                </p>
                <p className="text-xs font-medium text-[#78350F] mt-0.5 leading-relaxed">
                  {reminder.actionMessage}
                </p>
              </div>
            </div>

            <div className="bg-white border border-[#FDE68A] rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 text-[11px] font-semibold text-[#141414]">
              <ShieldCheck size={15} className="text-emerald-700 shrink-0" />
              <span>{reminder.bufferNote}</span>
            </div>
          </div>

          {/* Referensi Data Riwayat Pembelian Tahun Lalu */}
          <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-2xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <History size={16} className="text-[#D97706] shrink-0" />
                <div>
                  <h4 className="text-xs font-extrabold text-[#141414]">
                    {referenceData?.sourceLabel || 'Referensi Riwayat Pembelian Tahun Lalu'}
                  </h4>
                  <p className="font-mono text-[10px] text-[#52525B] mt-0.5">
                    Periode pembanding {referenceData?.referenceYear}: {referenceData?.lastYearRangeLabel}
                  </p>
                </div>
              </div>
              <span
                className={`font-mono text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 w-fit ${
                  isLastYearExact
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-white text-[#B45309] border-[#FDE68A]'
                }`}
              >
                {isLastYearExact ? 'Data Tahun Lalu' : 'Referensi Historis Tersedia'}
              </span>
            </div>

            {items.length === 0 ? (
              <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 text-center space-y-1">
                <Package size={20} className="mx-auto text-zinc-400" />
                <p className="text-xs font-bold text-[#141414]">
                  Belum ada catatan pembelian bahan baku
                </p>
                <p className="text-[11px] text-[#52525B]">
                  Catat barang masuk dan pembaruan harga di menu Stok &amp; BOM Gudang agar tahun depan referensi terisi otomatis.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.ingredientKey}
                    className="bg-white border border-[#E5E5E5] rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-extrabold text-[#141414]">
                          {item.ingredientName}
                        </span>
                        <span className="font-mono text-[10px] font-bold bg-[#FAFAFA] border border-[#E5E5E5] text-[#141414] px-2 py-0.5 rounded-md">
                          Beli: +{item.totalPurchasedQty} {item.unit} ({item.purchaseCount}x)
                        </span>
                      </div>
                      <p className="text-[11px] text-[#52525B] mt-1">
                        {item.noteSummary}
                        {item.lastPurchaseDate ? ` • ${formatDate(item.lastPurchaseDate)}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-left sm:text-right">
                        <span className="block font-mono text-[10px] text-[#52525B]">
                          Harga Saat Lalu: Rp {Number(item.historicalPrice || 0).toLocaleString('id-ID')}
                        </span>
                        <span className="block font-mono text-xs font-extrabold text-[#141414]">
                          Pasar Kini: Rp {Number(item.currentMarketPrice || 0).toLocaleString('id-ID')}{' '}
                          <span className="text-[10px] font-normal text-[#52525B]">
                            /{item.unit}
                          </span>
                        </span>
                      </div>

                      {item.priceDiffPct !== 0 && (
                        <span
                          className={`inline-flex items-center gap-0.5 px-2 py-1 rounded-lg font-mono text-[10px] font-bold border ${
                            item.priceDiffPct > 0
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {item.priceDiffPct > 0 ? (
                            <TrendingUp size={11} />
                          ) : (
                            <TrendingDown size={11} />
                          )}
                          {item.priceDiffPct > 0 ? `+${item.priceDiffPct}%` : `${item.priceDiffPct}%`}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Menu Favorit & Kuota Penjualan Harian (Acuan Event Tanpa Mengubah Buffer) */}
          {favoriteMenuQuotas.length > 0 && (
            <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Award size={15} className="text-[#D97706] shrink-0" />
                  <h4 className="text-xs font-extrabold text-[#141414]">
                    Menu Favorit &amp; Acuan Kuota Harian (Daily History)
                  </h4>
                </div>
                <span className="font-mono text-[10px] font-bold text-[#52525B]">
                  Top {favoriteMenuQuotas.length} Menu
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {favoriteMenuQuotas.map((m, idx) => (
                  <div
                    key={m.menuKey || m.menuName}
                    className="bg-white border border-[#E5E5E5] rounded-xl px-3 py-2.5 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-[#FEF3C7] text-[#B45309] font-mono text-[10px] font-extrabold flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-bold text-[#141414] truncate">{m.menuName}</span>
                    </div>
                    <div className="text-right font-mono shrink-0">
                      <span className="block text-[11px] font-extrabold text-[#141414]">
                        ~{m.avgDailyQuota}/hr
                      </span>
                      <span className="block text-[9px] text-[#B45309] font-bold">
                        Puncak {m.peakDailyQuota}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#FAFAFA] border-t border-[#E5E5E5] flex items-center justify-between gap-3 shrink-0">
          <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[10px] text-zinc-400">
            <kbd className="px-1.5 py-0.5 bg-white border border-[#E5E5E5] rounded text-[9px] font-bold text-zinc-500">
              ESC
            </kbd>
            <span>Tutup</span>
          </span>

          <div className="flex items-center gap-2.5 flex-1 sm:flex-none justify-end">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-[#E5E5E5] bg-white hover:bg-zinc-100 text-[#141414] text-xs font-bold cursor-pointer transition-colors"
            >
              Tutup
            </button>
            {onNavigateInventory && (
              <button
                type="button"
                onClick={() => {
                  onClose?.();
                  onNavigateInventory();
                }}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#141414] text-xs font-extrabold inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-[0.98] transition-all"
              >
                <Tag size={14} /> Update Daftar Harga &amp; Stok <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
