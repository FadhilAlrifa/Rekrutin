import { useState, useMemo } from 'react';
import {
  Calendar,
  CalendarDays,
  Award,
  TrendingUp,
  Filter,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import {
  buildDailySalesHistory,
  filterDailySalesHistory
} from '../../../utils/dailySalesHistory';

export default function DailySalesHistoryPanel({
  transactions = [],
  products = [],
  ingredients = [],
  seasonalEvents = [],
  persistedDailyRows = [],
  businessType = 'fnb',
  compactTitle = false
}) {
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'range' | 'specific'
  const [specificDate, setSpecificDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [onlyHolidayDays, setOnlyHolidayDays] = useState(false);
  const [selectedDayIso, setSelectedDayIso] = useState('');

  const fullHistory = useMemo(
    () =>
      buildDailySalesHistory({
        transactions,
        products,
        ingredients,
        seasonalEvents,
        persistedDailyRows,
        businessType
      }),
    [transactions, products, ingredients, seasonalEvents, persistedDailyRows, businessType]
  );

  const filteredHistory = useMemo(
    () =>
      filterDailySalesHistory(fullHistory, {
        specificDate: filterMode === 'specific' ? specificDate : '',
        startDate: filterMode === 'range' ? startDate : '',
        endDate: filterMode === 'range' ? endDate : '',
        onlyHolidayDays
      }),
    [fullHistory, filterMode, specificDate, startDate, endDate, onlyHolidayDays]
  );

  const activeDay = useMemo(() => {
    const days = filteredHistory.dailyDays || [];
    if (days.length === 0) return null;
    if (selectedDayIso) {
      const found = days.find((d) => d.salesDate === selectedDayIso);
      if (found) return found;
    }
    return days[0];
  }, [filteredHistory.dailyDays, selectedDayIso]);

  const handleResetFilters = () => {
    setFilterMode('all');
    setSpecificDate('');
    setStartDate('');
    setEndDate('');
    setOnlyHolidayDays(false);
    setSelectedDayIso('');
  };

  const hasActiveFilter =
    filterMode !== 'all' || onlyHolidayDays || Boolean(specificDate || startDate || endDate);

  const unitLabel = businessType === 'retail' ? 'unit' : 'porsi';

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
                Daily Sales History • Acuan Kuota Event
              </span>
              {filteredHistory.totals.daysCount > 0 && (
                <span className="font-mono text-[10px] font-bold text-[#52525B] bg-[#FAFAFA] border border-[#E5E5E5] px-2.5 py-0.5 rounded-full">
                  {filteredHistory.totals.daysCount} Hari Tercatat
                </span>
              )}
            </div>
            <h2 className={`${compactTitle ? 'text-lg' : 'text-xl'} font-extrabold text-[#141414] tracking-tight`}>
              Riwayat Penjualan Harian &amp; Menu Favorit
            </h2>
            <p className="text-xs text-[#52525B] font-medium mt-0.5">
              Lihat menu paling diminati dan kuota penjualan per hari sebagai acuan persiapan hari besar tanpa mengubah buffer stock historis.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="bg-zinc-100 p-1 rounded-xl flex items-center gap-1">
              {[
                { id: 'all', label: 'Semua Hari' },
                { id: 'range', label: 'Rentang Tanggal' },
                { id: 'specific', label: 'Tanggal Spesifik' }
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setFilterMode(m.id)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                    filterMode === m.id
                      ? 'bg-[#141414] text-white'
                      : 'text-[#52525B] hover:text-[#141414]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setOnlyHolidayDays((v) => !v)}
              className={`px-3 py-2 rounded-xl border text-[11px] font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                onlyHolidayDays
                  ? 'bg-[#F59E0B] border-[#F59E0B] text-[#141414]'
                  : 'bg-[#FAFAFA] border-[#E5E5E5] text-[#52525B] hover:text-[#141414]'
              }`}
            >
              <Sparkles size={13} /> Hari Besar / Libur
            </button>

            {hasActiveFilter && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-2 rounded-xl border border-[#E5E5E5] bg-white hover:bg-[#FAFAFA] text-[#52525B] hover:text-[#141414] text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw size={12} /> Reset
              </button>
            )}
          </div>
        </div>

        {/* Inputs untuk Rentang Tanggal / Tanggal Spesifik */}
        {(filterMode === 'range' || filterMode === 'specific') && (
          <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl p-3.5 flex flex-wrap items-center gap-3">
            <span className="font-mono text-[10px] font-bold uppercase text-[#52525B] inline-flex items-center gap-1.5">
              <Filter size={12} className="text-[#D97706]" /> Filter Tanggal:
            </span>
            {filterMode === 'specific' ? (
              <input
                type="date"
                value={specificDate}
                onChange={(e) => setSpecificDate(e.target.value)}
                className="bg-white border border-[#E5E5E5] rounded-lg px-3 py-1.5 text-xs font-bold text-[#141414] focus:outline-none focus:border-[#F59E0B]"
              />
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-white border border-[#E5E5E5] rounded-lg px-3 py-1.5 text-xs font-bold text-[#141414] focus:outline-none focus:border-[#F59E0B]"
                />
                <span className="text-xs font-bold text-[#52525B]">s.d.</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-white border border-[#E5E5E5] rounded-lg px-3 py-1.5 text-xs font-bold text-[#141414] focus:outline-none focus:border-[#F59E0B]"
                />
              </div>
            )}
          </div>
        )}

        {/* Info Acuan Buffer Stock Tetap */}
        <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl px-4 py-2.5 flex items-center gap-2.5 text-[11px] font-semibold text-[#52525B]">
          <ShieldCheck size={15} className="text-emerald-700 shrink-0" />
          <span>
            <strong className="text-[#141414]">Acuan Kuota Event:</strong> Data kuota terjual per hari membantu persiapan stok hari besar. Nilai <em>buffer stock</em> minimum di gudang tetap mengacu riwayat dan tidak diubah otomatis.
          </span>
        </div>

        {/* Section 1: Menu Favorit & Benchmark Kuota Harian */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#141414] flex items-center gap-2">
              <Award size={16} className="text-[#D97706]" /> Acuan Menu Favorit &amp; Kuota Harian
            </h3>
            <span className="font-mono text-[10px] font-bold text-[#52525B]">
              Diurutkan dari total terjual terbanyak
            </span>
          </div>

          {filteredHistory.menuQuotaSummary.length === 0 ? (
            <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl p-8 text-center text-xs text-[#52525B] font-medium">
              Belum ada data penjualan harian yang cocok dengan filter tanggal saat ini.
            </div>
          ) : (
            <div className="overflow-x-auto border border-[#E5E5E5] rounded-xl">
              <table className="w-full text-left border-collapse min-w-[680px]">
                <thead>
                  <tr className="bg-[#FAFAFA] border-b border-[#E5E5E5] font-mono text-[10px] font-bold uppercase text-[#52525B]">
                    <th className="py-3 px-3.5">Peringkat &amp; Menu</th>
                    <th className="py-3 px-3.5 text-center">Rata-Rata / Hari</th>
                    <th className="py-3 px-3.5 text-center">Puncak Harian</th>
                    <th className="py-3 px-3.5 text-center">Total Terjual</th>
                    <th className="py-3 px-3.5 text-right">Omzet &amp; Est. Laba</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-xs bg-white">
                  {filteredHistory.menuQuotaSummary.slice(0, 8).map((menu, idx) => (
                    <tr key={menu.menuKey} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-[10px] font-extrabold shrink-0 ${
                              idx < 3
                                ? 'bg-[#F59E0B] text-[#141414]'
                                : 'bg-[#FAFAFA] border border-[#E5E5E5] text-[#52525B]'
                            }`}
                          >
                            #{idx + 1}
                          </span>
                          <div>
                            <p className="font-extrabold text-[#141414]">{menu.menuName}</p>
                            <p className="text-[10px] font-medium text-[#52525B]">
                              {menu.category} • Muncul di {menu.activeDaysCount} hari
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3.5 text-center font-mono">
                        <span className="font-extrabold text-[#141414]">
                          {menu.avgDailyQuota} {unitLabel}
                        </span>
                        {menu.holidayAvgQuota !== null && (
                          <span className="block text-[10px] text-[#B45309] font-bold">
                            Saat Libur: {menu.holidayAvgQuota} {unitLabel}/hr
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-center font-mono">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] font-extrabold text-[11px]">
                          <TrendingUp size={11} /> {menu.peakDailyQuota} {unitLabel}
                        </span>
                        <span className="block text-[10px] text-[#52525B] mt-0.5">
                          {menu.peakDate}
                          {menu.peakDayIsHoliday && menu.peakHolidayLabel
                            ? ` (${menu.peakHolidayLabel})`
                            : ''}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-center font-mono font-bold text-[#141414]">
                        {menu.totalQtySold} {unitLabel}
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono">
                        <span className="font-bold text-[#141414] block">
                          Rp {menu.totalRevenue.toLocaleString('id-ID')}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700">
                          Laba ~Rp {menu.totalEstimatedProfit.toLocaleString('id-ID')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Rincian Harian (Pilih Tanggal -> Menu Terlaris Hari Itu) */}
      {filteredHistory.dailyDays.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Daftar Tanggal */}
          <div className="lg:col-span-5 bg-white border border-[#E5E5E5] rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="text-sm font-extrabold text-[#141414] flex items-center gap-2">
                <CalendarDays size={16} className="text-[#D97706]" /> Pilih Tanggal Penjualan
              </h3>
              <span className="font-mono text-[10px] font-bold text-[#52525B]">
                {filteredHistory.dailyDays.length} hari
              </span>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {filteredHistory.dailyDays.map((day) => {
                const isSelected = activeDay?.salesDate === day.salesDate;
                return (
                  <button
                    key={day.salesDate}
                    type="button"
                    onClick={() => setSelectedDayIso(day.salesDate)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#FEF3C7] border-[#F59E0B]'
                        : 'bg-[#FAFAFA] border-[#E5E5E5] hover:border-zinc-300'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-extrabold text-[#141414]">
                          {day.formattedDate}
                        </span>
                        {day.isHoliday && (
                          <span className="font-mono text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-[#F59E0B] text-[#141414]">
                            {day.holidayLabel || 'Hari Besar'}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#52525B] font-medium mt-1 truncate">
                        Favorit: <strong className="text-[#141414]">{day.topFavoriteMenu?.menuName || '-'}</strong>{' '}
                        ({day.topFavoriteMenu?.quantitySold || 0} {unitLabel})
                      </p>
                    </div>

                    <div className="text-right shrink-0 flex items-center gap-2">
                      <div>
                        <span className="block font-mono text-xs font-extrabold text-[#141414]">
                          {day.totalQtySold} {unitLabel}
                        </span>
                        <span className="block font-mono text-[10px] font-bold text-emerald-700">
                          Rp {day.totalRevenue.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <ChevronRight
                        size={14}
                        className={isSelected ? 'text-[#B45309]' : 'text-zinc-400'}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detail Menu Terjual Pada Tanggal Terpilih */}
          {activeDay && (
            <div className="lg:col-span-7 bg-white border border-[#E5E5E5] rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-zinc-100">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-extrabold text-[#141414] flex items-center gap-2">
                      <Calendar size={16} className="text-[#D97706]" /> {activeDay.formattedDate}
                    </h3>
                    {activeDay.isHoliday && (
                      <span className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
                        {activeDay.holidayLabel}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#52525B] font-medium mt-0.5">
                    Urutan menu terjual dari kuota terbanyak pada tanggal ini ({activeDay.salesDate}).
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl px-3.5 py-2 shrink-0">
                  <div>
                    <span className="block font-mono text-[9px] uppercase text-[#52525B]">Total Kuota</span>
                    <span className="font-mono text-xs font-extrabold text-[#141414]">
                      {activeDay.totalQtySold} {unitLabel}
                    </span>
                  </div>
                  <div className="w-px h-6 bg-[#E5E5E5]" />
                  <div>
                    <span className="block font-mono text-[9px] uppercase text-[#52525B]">Omzet / Est. Laba</span>
                    <span className="font-mono text-xs font-extrabold text-emerald-700">
                      Rp {activeDay.totalRevenue.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                {activeDay.items.map((item) => (
                  <div
                    key={`${activeDay.salesDate}-${item.menuKey || item.menuName}`}
                    className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl p-3.5 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-[10px] font-extrabold shrink-0 ${
                            item.rank === 1
                              ? 'bg-[#F59E0B] text-[#141414]'
                              : 'bg-white border border-[#E5E5E5] text-[#52525B]'
                          }`}
                        >
                          #{item.rank}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-extrabold text-[#141414] truncate">
                            {item.menuName}
                          </p>
                          <p className="text-[10px] text-[#52525B] font-medium">
                            {item.category} • {item.transactionsCount} transaksi
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono text-xs font-extrabold text-[#141414]">
                          {item.quantitySold} {unitLabel} ({item.sharePct}%)
                        </span>
                        <span className="block font-mono text-[10px] text-emerald-700 font-bold">
                          Rp {item.totalRevenue.toLocaleString('id-ID')} • Laba ~Rp{' '}
                          {item.estimatedProfit.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, Math.max(4, item.sharePct))}%` }}
                        className={`h-full rounded-full ${
                          item.rank === 1 ? 'bg-[#F59E0B]' : 'bg-[#141414]'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
