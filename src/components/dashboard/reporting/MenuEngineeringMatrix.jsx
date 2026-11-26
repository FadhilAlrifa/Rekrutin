import { useState, useMemo } from 'react';
import { Star, TrendingUp, HelpCircle, AlertOctagon, BarChart3 } from 'lucide-react';
import { computeMenuEngineering } from '../../../utils/cogsCalculator';

const QUADRANT_META = {
  stars: {
    label: 'Stars',
    subtitle: 'Margin Tinggi & Laris',
    desc: 'Menu unggulan utama. Pertahankan kualitas resep dan prioritaskan stok bahan bakunya.',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: Star
  },
  plowhorses: {
    label: 'Plowhorses',
    subtitle: 'Margin Tipis & Laris',
    desc: 'Trafik tinggi tapi laba per porsi kecil. Evaluasi harga jual atau efisiensi gramasi BOM.',
    badgeClass: 'bg-[#FAFAFA] text-[#141414] border-zinc-300',
    icon: TrendingUp
  },
  puzzles: {
    label: 'Puzzles',
    subtitle: 'Margin Tebal & Jarang Dipesan',
    desc: 'Profit tinggi namun volume rendah. Jadikan prioritas Smart Upselling kasir POS.',
    badgeClass: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]',
    icon: HelpCircle
  },
  dogs: {
    label: 'Dogs',
    subtitle: 'Margin Rendah & Sepi Peminat',
    desc: 'Kontribusi laba paling kecil. Pertimbangkan reformulasi resep atau penghapusan menu.',
    badgeClass: 'bg-red-50 text-red-700 border-red-200',
    icon: AlertOctagon
  }
};

export default function MenuEngineeringMatrix({
  products = [],
  ingredients = [],
  transactions = [],
  businessType = 'fnb'
}) {
  const [selectedQuadrant, setSelectedQuadrant] = useState('all');
  const isRetail = businessType === 'retail';

  const analysis = useMemo(
    () => computeMenuEngineering(products, ingredients, transactions, businessType),
    [products, ingredients, transactions, businessType]
  );

  const displayedRows = useMemo(() => {
    const list =
      selectedQuadrant === 'all'
        ? analysis.items
        : analysis.items.filter((i) => i.quadrant === selectedQuadrant);
    return [...list].sort((a, b) => b.totalProfit - a.totalProfit || b.marginPct - a.marginPct);
  }, [analysis.items, selectedQuadrant]);

  const maxTrendQty = Math.max(1, ...analysis.trendSeries.map((d) => d.qtySold));
  const maxTrendProfit = Math.max(1, ...analysis.trendSeries.map((d) => d.totalProfit));

  return (
    <div className="space-y-6">
      {/* 4 Quadrant Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        {(['stars', 'plowhorses', 'puzzles', 'dogs']).map((qKey) => {
          const meta = QUADRANT_META[qKey];
          const Icon = meta.icon;
          const count = analysis.counts[qKey];
          const isActive = selectedQuadrant === qKey;

          return (
            <button
              key={qKey}
              type="button"
              onClick={() => setSelectedQuadrant(isActive ? 'all' : qKey)}
              className={`text-left bg-white border rounded-2xl p-5 transition-all cursor-pointer space-y-2.5 ${
                isActive
                  ? 'border-[#141414] ring-1 ring-[#141414] shadow-sm'
                  : 'border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-mono text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 ${meta.badgeClass}`}>
                  <Icon size={11} /> {meta.label}
                </span>
                <span className="font-mono text-2xl font-extrabold text-[#141414]">{count}</span>
              </div>
              <div>
                <p className="text-xs font-bold text-[#141414]">{meta.subtitle}</p>
                <p className="text-[11px] text-[#52525B] leading-relaxed mt-0.5">{meta.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Grafik Perbandingan Volume Penjualan vs Total Margin Keuntungan Bersih */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] text-[#B45309] flex items-center justify-center">
              <BarChart3 size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-[#141414] text-base">
                Tren Volume Penjualan vs. Total Laba Kotor (Profit)
              </h3>
              <p className="text-xs text-[#52525B] font-medium">
                Validasi apakah kenaikan jumlah porsi terjual sebanding dengan pertumbuhan total profit bersih.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 font-mono text-[11px] font-bold">
            <span className="flex items-center gap-1.5 text-[#141414]">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#141414]" /> Kuantitas (Porsi)
            </span>
            <span className="flex items-center gap-1.5 text-[#B45309]">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#F59E0B]" /> Total Laba (Rp)
            </span>
          </div>
        </div>

        {analysis.trendSeries.length === 0 ? (
          <div className="py-10 text-center text-xs font-medium text-[#52525B]">
            Belum ada data transaksi untuk menampilkan grafik perbandingan volume vs profit.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
            {analysis.trendSeries.map((day) => {
              const qtyPct = Math.max(10, Math.round((day.qtySold / maxTrendQty) * 100));
              const profitPct = Math.max(10, Math.round((Math.max(0, day.totalProfit) / maxTrendProfit) * 100));

              return (
                <div
                  key={day.dateLabel}
                  className="bg-[#FAFAFA] border border-zinc-200 rounded-xl p-3 flex flex-col justify-between gap-3"
                >
                  <div className="h-28 flex items-end justify-center gap-2 pt-2">
                    <div className="flex flex-col items-center h-full justify-end flex-1">
                      <span className="font-mono text-[9px] font-bold text-[#141414] mb-1">
                        {day.qtySold}
                      </span>
                      <div
                        style={{ height: `${qtyPct}%` }}
                        className="w-full max-w-[20px] bg-[#141414] rounded-t-md transition-all duration-300"
                        title={`Terjual: ${day.qtySold} porsi`}
                      />
                    </div>
                    <div className="flex flex-col items-center h-full justify-end flex-1">
                      <span className="font-mono text-[9px] font-bold text-[#B45309] mb-1">
                        {day.totalProfit >= 1000000
                          ? `${(day.totalProfit / 1000000).toFixed(1)}jt`
                          : `${Math.round(day.totalProfit / 1000)}rb`}
                      </span>
                      <div
                        style={{ height: `${profitPct}%` }}
                        className="w-full max-w-[20px] bg-[#F59E0B] rounded-t-md transition-all duration-300"
                        title={`Laba: Rp ${day.totalProfit.toLocaleString('id-ID')}`}
                      />
                    </div>
                  </div>

                  <div className="border-t border-zinc-200 pt-2 text-center">
                    <span className="font-mono text-[10px] font-bold text-[#141414] block">
                      {day.dateLabel}
                    </span>
                    <span className="font-mono text-[9px] text-[#52525B]">
                      Rp {day.totalProfit.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tabel Matriks Klasifikasi Menu */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
          <div>
              <h3 className="font-extrabold text-[#141414] text-base">
                {isRetail ? 'Matriks Performa & Profitabilitas Produk Ritel' : 'Matriks Performa & Profitabilitas Menu'}
              </h3>
              <p className="text-xs text-[#52525B] font-medium">
                Benchmark rata-rata: Volume <strong className="font-mono text-[#141414]">{analysis.benchmarks.avgVolume} {isRetail ? 'unit' : 'porsi'}</strong> • Margin{' '}
                <strong className="font-mono text-[#141414]">{analysis.benchmarks.avgMargin}%</strong>
              </p>
          </div>

          {selectedQuadrant !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedQuadrant('all')}
              className="text-xs font-bold text-[#B45309] bg-[#FEF3C7] border border-[#FDE68A] px-3 py-1.5 rounded-lg cursor-pointer self-start"
            >
              Tampilkan Semua Kuadran ({analysis.items.length})
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="border-b border-zinc-200 font-mono text-[10px] font-bold uppercase tracking-wider text-[#52525B]">
                <th className="pb-3 px-3">{isRetail ? 'Produk / SKU' : 'Menu'}</th>
                <th className="pb-3 px-3">Klasifikasi</th>
                <th className="pb-3 px-3 text-center">Terjual</th>
                <th className="pb-3 px-3 text-right">{isRetail ? 'Harga Beli / Unit' : 'HPP / Porsi'}</th>
                <th className="pb-3 px-3 text-right">Harga Jual</th>
                <th className="pb-3 px-3 text-center">Margin</th>
                <th className="pb-3 px-3 text-right">Total Laba Bersih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs font-medium text-[#52525B]">
              {displayedRows.map((row) => {
                const qMeta = QUADRANT_META[row.quadrant];
                return (
                  <tr key={row.id} className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={row.image}
                          alt={row.name}
                          className="w-8 h-8 rounded-lg object-cover border border-zinc-200 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-[#141414]">{row.name}</p>
                          <span className="font-mono text-[10px] text-[#52525B]">{row.category}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`font-mono text-[10px] font-bold px-2.5 py-1 rounded-full border ${qMeta.badgeClass}`}>
                        {qMeta.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-[#141414]">
                      {row.qtySold}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono">
                      Rp {row.unitCogs.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-[#141414]">
                      Rp {row.sellingPrice.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className={`font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${row.marginStatus.badgeClass}`}>
                        {row.marginPct}%
                      </span>
                    </td>
                    <td className={`py-3.5 px-3 text-right font-mono font-extrabold ${row.totalProfit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                      Rp {row.totalProfit.toLocaleString('id-ID')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
