import { useState, useEffect, useMemo } from 'react';
import {
  CalendarRange,
  TrendingUp,
  Package,
  Sparkles,
  Plus,
  Trash2,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  CheckCircle2,
  CalendarClock,
  History
} from 'lucide-react';
import {
  fetchTransactions,
  fetchDailySalesHistory,
  createSeasonalEvent,
  deleteSeasonalEvent
} from '../../../services/stockoService';
import {
  aggregatePeriodAnalytics,
  analyzeSeasonalPerformance,
  computeSeasonalDemandForecast,
  getUpcomingHolidayReminders
} from '../../../utils/seasonalForecasting';
import DailySalesHistoryPanel from './DailySalesHistoryPanel';

export default function SeasonalAnalyticsModule({
  products = [],
  ingredients = [],
  stockMovements = [],
  seasonalEvents = [],
  setSeasonalEvents,
  currentOperator,
  onNavigateTab,
  onOpenHolidayReminder,
  businessType = 'fnb'
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [persistedDailyRows, setPersistedDailyRows] = useState([]);
  const [granularity, setGranularity] = useState('daily'); // 'daily' | 'weekly' | 'monthly' | 'yearly'
  const [selectedEventId, setSelectedEventId] = useState(seasonalEvents[0]?.id || 'EVT-RAMADAN');
  const [horizonDays, setHorizonDays] = useState(14);
  const [seasonMode, setSeasonMode] = useState('peak'); // 'peak' | 'normal' | 'low'

  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState(() => ({
    name: '',
    category: 'holiday',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    expectedLiftPct: '35',
    notes: ''
  }));

  useEffect(() => {
    let active = true;
    Promise.all([fetchTransactions(), fetchDailySalesHistory()]).then(([txData, dailyRows]) => {
      if (active) {
        setTransactions(txData || []);
        setPersistedDailyRows(Array.isArray(dailyRows) ? dailyRows : []);
        setIsLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const periodData = useMemo(
    () => aggregatePeriodAnalytics(transactions, stockMovements, granularity, products, ingredients),
    [transactions, stockMovements, granularity, products, ingredients]
  );

  const seasonalComparisons = useMemo(() => {
    const comparisons = analyzeSeasonalPerformance(transactions, seasonalEvents);
    const { allEventsWithStatus } = getUpcomingHolidayReminders(seasonalEvents);
    const statusMap = new Map(allEventsWithStatus.map((e) => [String(e.id), e]));
    return comparisons.map((c) => ({
      ...c,
      reminderMeta: statusMap.get(String(c.id)) || null
    }));
  }, [transactions, seasonalEvents]);

  const forecast = useMemo(
    () =>
      computeSeasonalDemandForecast(
        ingredients,
        products,
        transactions,
        stockMovements,
        seasonalEvents,
        selectedEventId,
        horizonDays,
        seasonMode
      ),
    [
      ingredients,
      products,
      transactions,
      stockMovements,
      seasonalEvents,
      selectedEventId,
      horizonDays,
      seasonMode
    ]
  );

  const maxRevenue = useMemo(
    () => Math.max(1, ...periodData.series.map((s) => s.revenue)),
    [periodData.series]
  );
  const maxStockOut = useMemo(
    () => Math.max(1, ...periodData.series.map((s) => s.stockOutQty)),
    [periodData.series]
  );

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.name.trim() || !newEvent.startDate || !newEvent.endDate) return;
    const created = await createSeasonalEvent(newEvent, currentOperator?.name || 'Owner');
    setSeasonalEvents((prev) => [...prev, created]);
    setSelectedEventId(created.id);
    setShowAddEvent(false);
    setNewEvent({
      name: '',
      category: 'holiday',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      expectedLiftPct: '35',
      notes: ''
    });
  };

  const handleRemoveEvent = async (id) => {
    const next = await deleteSeasonalEvent(id);
    setSeasonalEvents(next);
    if (selectedEventId === id && next.length > 0) {
      setSelectedEventId(next[0].id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#52525B] space-y-4">
        <Loader2 className="animate-spin text-[#D97706]" size={40} />
        <p className="text-sm font-bold">Menganalisis Tren Historis & Proyeksi Musiman...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 pb-5 border-b border-zinc-200">
        <div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] inline-block mb-2">
            [ 08 // HISTORICAL & SEASONAL DEMAND FORECASTING ]
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#141414]">
            Analitik Musiman & Prediksi Stok
          </h1>
          <p className="text-[#52525B] text-[13px] font-medium mt-1">
            Analisis penjualan lintas periode (Harian–Tahunan), penandaan event musiman, dan kalkulasi proyeksi kebutuhan bahan baku.
          </p>
        </div>

        {/* Multi-Period Selector */}
        <div className="flex items-center bg-zinc-200/70 p-1 rounded-xl shrink-0">
          {[
            { id: 'daily', label: 'Harian' },
            { id: 'weekly', label: 'Mingguan' },
            { id: 'monthly', label: 'Bulanan' },
            { id: 'yearly', label: 'Tahunan' }
          ].map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setGranularity(g.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                granularity === g.id
                  ? 'bg-[#141414] text-[#F59E0B] shadow-sm'
                  : 'text-[#52525B] hover:text-[#141414]'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Ringkas Periode */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#52525B]">
            Total Omzet Bersih ({granularity.toUpperCase()})
          </p>
          <p className="text-2xl font-extrabold font-mono text-[#141414] mt-1.5">
            Rp {periodData.totals.revenue.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-[#52525B] font-medium mt-1">
            {periodData.totals.orders} transaksi valid ({periodData.totals.itemsSold} porsi)
          </p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#52525B]">
            Pergerakan Bahan Keluar
          </p>
          <p className="text-2xl font-extrabold font-mono text-[#141414] mt-1.5">
            {periodData.totals.stockOutQty} <span className="text-xs font-bold text-[#52525B]">unit</span>
          </p>
          <p className="text-[11px] text-[#52525B] font-medium mt-1">
            Masuk/Restock: +{periodData.totals.stockInQty} unit
          </p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#52525B]">
            Persiapan Stok Event
          </p>
          <p className="text-2xl font-extrabold font-mono text-[#B45309] mt-1.5">
            {forecast.summary.raiseBufferCount} Bahan
          </p>
          <p className="text-[11px] text-[#52525B] font-medium mt-1">
            Buffer tetap berbasis riwayat • Belanja: Rp {forecast.summary.priorityRestockCost.toLocaleString('id-ID')}
          </p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#52525B]">
            Kerugian Waste Pasca-Proses
          </p>
          <p className="text-2xl font-extrabold font-mono text-red-600 mt-1.5">
            Rp {periodData.totals.wasteCost.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-[#52525B] font-medium mt-1">
            Tercatat dari pembatalan pasca-produksi
          </p>
        </div>
      </div>

      {/* Grafik Multi-Periode: Penjualan vs Konsumsi Bahan */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-4">
          <div>
            <h2 className="text-base font-extrabold text-[#141414] flex items-center gap-2">
              <TrendingUp size={18} className="text-[#D97706]" /> Tren Penjualan &amp; Konsumsi Bahan Baku
            </h2>
            <p className="text-xs text-[#52525B] font-medium">
              Perbandingan omzet penjualan (batang gelap) dan konsumsi stok bahan baku (batang amber) per periode.
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-bold">
            <span className="inline-flex items-center gap-1.5 text-[#141414]">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#141414]" /> Omzet Penjualan
            </span>
            <span className="inline-flex items-center gap-1.5 text-[#B45309]">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#F59E0B]" /> Konsumsi Bahan
            </span>
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="min-w-[560px] flex items-end justify-between gap-2 h-52 pt-6 px-2 border-b border-zinc-200">
            {periodData.series.map((bar) => {
              const revPct = Math.max(4, Math.round((bar.revenue / maxRevenue) * 100));
              const stockPct = Math.max(4, Math.round((bar.stockOutQty / maxStockOut) * 100));
              return (
                <div key={bar.key} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full flex items-end justify-center gap-1 h-36">
                    <div
                      title={`Omzet: Rp ${bar.revenue.toLocaleString('id-ID')}`}
                      style={{ height: `${revPct}%` }}
                      className="w-3 sm:w-4 bg-[#141414] rounded-t-md transition-all group-hover:bg-zinc-700"
                    />
                    <div
                      title={`Konsumsi Bahan: ${bar.stockOutQty} unit`}
                      style={{ height: `${stockPct}%` }}
                      className="w-3 sm:w-4 bg-[#F59E0B] rounded-t-md transition-all group-hover:bg-[#D97706]"
                    />
                  </div>
                  <div className="text-center">
                    <p className="font-mono text-[10px] font-bold text-[#141414] whitespace-nowrap">
                      {bar.label}
                    </p>
                    <p className="font-mono text-[9px] text-[#52525B]">
                      {bar.orders} ord
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Kalender Seasonal Event Tagging & Baseline vs Seasonal Lift */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-2 border-b border-zinc-100 pb-3.5">
            <div>
              <h2 className="text-sm font-extrabold text-[#141414] flex items-center gap-2">
                <CalendarRange size={16} className="text-[#D97706]" /> Kalender Event Musiman
              </h2>
              <p className="text-[11px] text-[#52525B] font-medium">
                Tandai periode musiman untuk mengukur Seasonal Lift %.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddEvent((v) => !v)}
              className="px-3 py-1.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#141414] text-[11px] font-extrabold inline-flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus size={13} /> Event Baru
            </button>
          </div>

          {showAddEvent && (
            <form onSubmit={handleAddEvent} className="bg-[#FAFAFA] border border-zinc-200 rounded-xl p-4 space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#52525B] mb-1">
                  Nama Event / Musim
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Promo Akhir Tahun / Ramadan"
                  value={newEvent.name}
                  onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-semibold text-[#141414] focus:outline-none focus:border-[#F59E0B]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#52525B] mb-1">
                    Mulai
                  </label>
                  <input
                    type="date"
                    required
                    value={newEvent.startDate}
                    onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-2 text-xs font-semibold text-[#141414]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#52525B] mb-1">
                    Selesai
                  </label>
                  <input
                    type="date"
                    required
                    value={newEvent.endDate}
                    onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-2 text-xs font-semibold text-[#141414]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#52525B] mb-1">
                    Kategori
                  </label>
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-2 text-xs font-semibold text-[#141414]"
                  >
                    <option value="religious">Ramadan / Keagamaan</option>
                    <option value="holiday">Hari Raya / Libur Nasional</option>
                    <option value="school_holiday">Libur Sekolah</option>
                    <option value="promo">Promo Akhir Pekan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#52525B] mb-1">
                    Estimasi Lift (%)
                  </label>
                  <input
                    type="number"
                    min="-50"
                    max="300"
                    value={newEvent.expectedLiftPct}
                    onChange={(e) => setNewEvent({ ...newEvent, expectedLiftPct: e.target.value })}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-2 text-xs font-mono font-bold text-[#141414]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddEvent(false)}
                  className="px-3 py-1.5 text-xs font-bold text-[#52525B] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#141414] text-[#F59E0B] text-xs font-bold cursor-pointer"
                >
                  Simpan Event
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2.5 max-h-[390px] overflow-y-auto pr-1">
            {seasonalComparisons.map((evt) => {
              const isSelected = selectedEventId === evt.id;
              return (
                <div
                  key={evt.id}
                  onClick={() => {
                    setSelectedEventId(evt.id);
                    setSeasonMode('peak');
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#FEF3C7] border-[#F59E0B]'
                      : 'bg-[#FAFAFA] border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-extrabold text-[#141414]">{evt.name}</span>
                        {evt.reminderMeta?.isReminderActive && (
                          <span className="inline-flex items-center gap-1 font-mono text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-[#F59E0B] text-[#141414]">
                            <CalendarClock size={10} /> {evt.reminderMeta.countdownBadge} Reminder
                          </span>
                        )}
                        <span
                          className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-md border inline-flex items-center gap-0.5 ${
                            evt.effectiveLiftPct >= 0
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          {evt.effectiveLiftPct >= 0 ? (
                            <ArrowUpRight size={10} />
                          ) : (
                            <ArrowDownRight size={10} />
                          )}
                          {evt.effectiveLiftPct >= 0 ? `+${evt.effectiveLiftPct}%` : `${evt.effectiveLiftPct}%`} Lift
                        </span>
                      </div>
                      <p className="font-mono text-[10px] text-[#52525B] mt-1">
                        {evt.startDate} s.d. {evt.endDate}
                        {evt.reminderMeta?.triggerDateIso && !evt.reminderMeta.isReminderActive && evt.reminderMeta.daysUntilStart > 14
                          ? ` • Reminder H-14 mulai ${evt.reminderMeta.triggerDateIso}`
                          : ''}
                      </p>
                      <p className="text-[11px] text-[#52525B] mt-1">
                        Baseline: Rp {evt.baselineDailyRevenue.toLocaleString('id-ID')}/hr →{' '}
                        <span className="font-bold text-[#141414]">
                          Rp {evt.projectedDailyRevenue.toLocaleString('id-ID')}/hr
                        </span>
                        {evt.hasActualData ? ' (Aktual)' : ' (Proyeksi)'}
                      </p>
                      {onOpenHolidayReminder && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenHolidayReminder(evt);
                          }}
                          className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-[#FEF3C7] border border-[#E5E5E5] hover:border-[#F59E0B] text-[10px] font-bold text-[#141414] cursor-pointer transition-colors"
                        >
                          <History size={11} className="text-[#D97706]" /> Referensi Pembelian Tahun Lalu
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveEvent(evt.id);
                      }}
                      className="p-1.5 text-zinc-400 hover:text-red-600 cursor-pointer"
                      aria-label={`Hapus ${evt.name}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Demand Forecasting & Stock Recommendation */}
        <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3.5">
            <div>
              <h2 className="text-sm font-extrabold text-[#141414] flex items-center gap-2">
                <Package size={16} className="text-[#D97706]" /> Proyeksi Kebutuhan Stok (Demand Forecast)
              </h2>
              <p className="text-[11px] text-[#52525B] font-medium">
                Skenario:{' '}
                <span className="font-bold text-[#141414]">
                  {seasonMode === 'peak'
                    ? `${forecast.selectedEvent?.name || 'Event Musiman'} (+${forecast.liftPct}%)`
                    : seasonMode === 'low'
                    ? 'Low Season (-20%)'
                    : 'Hari Normal Baseline (0%)'}
                </span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={seasonMode}
                onChange={(e) => setSeasonMode(e.target.value)}
                className="bg-[#FAFAFA] border border-zinc-200 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-[#141414] cursor-pointer"
              >
                <option value="peak">Musim Ramai (Event)</option>
                <option value="normal">Baseline Normal</option>
                <option value="low">Low-Season (-20%)</option>
              </select>

              <select
                value={horizonDays}
                onChange={(e) => setHorizonDays(Number(e.target.value))}
                className="bg-[#FAFAFA] border border-zinc-200 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-[#141414] cursor-pointer"
              >
                <option value={7}>Horizon 7 Hari</option>
                <option value={14}>Horizon 14 Hari</option>
                <option value={30}>Horizon 30 Hari</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[340px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 font-mono text-[10px] font-bold uppercase text-[#52525B] sticky top-0 bg-white">
                  <th className="py-2.5 px-2">Bahan Baku</th>
                  <th className="py-2.5 px-2">Stok / Min</th>
                  <th className="py-2.5 px-2">Kebutuhan {horizonDays}h</th>
                  <th className="py-2.5 px-2">Buffer Historis</th>
                  <th className="py-2.5 px-2">Rekomendasi Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs">
                {forecast.ingredientForecasts.map((item) => {
                  const isRaise = item.bufferAction === 'Siapkan Restock (Buffer Tetap)';
                  const isLow = item.bufferAction === 'Pantau Stok (Low-Season)';
                  return (
                    <tr key={item.ingredientId} className="hover:bg-[#FAFAFA]">
                      <td className="py-3 px-2 font-bold text-[#141414]">
                        {item.name}
                        <span className="block font-mono text-[10px] font-normal text-[#52525B]">
                          ~{item.baselineDailyUsage} {item.unit}/hari
                        </span>
                      </td>
                      <td className="py-3 px-2 font-mono text-[#141414]">
                        {item.currentStock} {item.unit}
                        <span className="block text-[10px] text-[#52525B]">Min: {item.minLimit}</span>
                      </td>
                      <td className="py-3 px-2 font-mono font-bold text-[#141414]">
                        {item.projectedNeed} {item.unit}
                        {item.deficitQty > 0 && (
                          <span className="block text-[10px] text-red-600">
                            Kurang {item.deficitQty} {item.unit}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2 font-mono font-bold text-[#B45309]">
                        {item.recommendedBuffer} {item.unit}
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg font-mono text-[10px] font-bold border ${
                            isRaise
                              ? 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]'
                              : isLow
                              ? 'bg-sky-50 text-sky-700 border-sky-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {isRaise ? (
                            <AlertTriangle size={11} />
                          ) : (
                            <CheckCircle2 size={11} />
                          )}
                          {item.bufferAction}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Menu Prioritas Saat Periode Terpilih */}
          <div className="pt-3 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#52525B] flex items-center gap-1.5">
                <Sparkles size={12} className="text-[#D97706]" /> Fokus Menu Periode Ini
              </p>
              <div className="flex flex-wrap gap-1.5">
                {forecast.menuRecommendations.slice(0, 3).map((m) => (
                  <span
                    key={m.id}
                    className="text-[11px] font-semibold bg-[#FAFAFA] border border-zinc-200 px-2.5 py-1 rounded-lg text-[#141414]"
                  >
                    {m.name} ({m.grossMarginPct}% • {m.strategy})
                  </span>
                ))}
              </div>
            </div>
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('inventory')}
                className="px-4 py-2 rounded-xl bg-[#141414] hover:bg-zinc-800 text-[#F59E0B] text-xs font-bold shrink-0 cursor-pointer transition-colors"
              >
                Kelola Buffer Gudang
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Riwayat Penjualan Harian & Kuota Menu Favorit untuk Acuan Persiapan Event */}
      <DailySalesHistoryPanel
        transactions={transactions}
        products={products}
        ingredients={ingredients}
        seasonalEvents={seasonalEvents}
        persistedDailyRows={persistedDailyRows}
        businessType={businessType}
        compactTitle
      />
    </div>
  );
}
