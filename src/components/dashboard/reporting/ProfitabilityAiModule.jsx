import { useState, useEffect, useMemo } from 'react';
import { Loader2, Sparkles, Grid2x2 } from 'lucide-react';
import { fetchTransactions } from '../../../services/stockoService';
import MenuEngineeringMatrix from './MenuEngineeringMatrix';
import AiInsightsPanel from './AiInsightsPanel';

export default function ProfitabilityAiModule({
  products = [],
  ingredients = [],
  priceHistory = [],
  stockMovements = [],
  seasonalEvents = [],
  onNavigateTab
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [period, setPeriod] = useState('all'); // 'all' | 'today' | 'month'
  const [activeView, setActiveView] = useState('ai'); // 'ai' | 'matrix'

  useEffect(() => {
    let active = true;
    fetchTransactions().then((txData) => {
      if (active) {
        setTransactions(txData || []);
        setIsLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter((tx) => {
      const txDate = new Date(tx.created_at);
      if (period === 'today') return txDate.toDateString() === now.toDateString();
      if (period === 'month') {
        return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [transactions, period]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#52525B] space-y-4">
        <Loader2 className="animate-spin text-[#D97706]" size={40} />
        <p className="text-sm font-bold">Mengkalkulasi HPP, Menu Engineering & AI Insights...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Header Halaman */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 pb-5 border-b border-zinc-200">
        <div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] inline-block mb-2">
            [ 07 // MENU ENGINEERING & AI INSIGHTS ]
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#141414]">
            Analisis Profitabilitas & AI
          </h1>
          <p className="text-[#52525B] text-[13px] font-medium mt-1">
            Gabungkan volume penjualan vs. margin HPP (COGS) dan dapatkan rekomendasi bisnis otomatis dari Stocko AI.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Period Filter */}
          <div className="flex items-center bg-zinc-200/70 p-1 rounded-xl">
            {[
              { id: 'all', label: 'Semua' },
              { id: 'month', label: 'Bulan Ini' },
              { id: 'today', label: 'Hari Ini' }
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriod(p.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  period === p.id ? 'bg-[#141414] text-white shadow-sm' : 'text-[#52525B] hover:text-[#141414]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Sub-View Switcher */}
          <div className="flex items-center bg-zinc-200/70 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveView('ai')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-all ${
                activeView === 'ai' ? 'bg-[#F59E0B] text-[#141414] shadow-sm' : 'text-[#52525B] hover:text-[#141414]'
              }`}
            >
              <Sparkles size={13} /> Stocko AI Insights
            </button>
            <button
              type="button"
              onClick={() => setActiveView('matrix')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-all ${
                activeView === 'matrix' ? 'bg-[#F59E0B] text-[#141414] shadow-sm' : 'text-[#52525B] hover:text-[#141414]'
              }`}
            >
              <Grid2x2 size={13} /> Menu Engineering Matrix
            </button>
          </div>
        </div>
      </div>

      {activeView === 'ai' ? (
        <AiInsightsPanel
          products={products}
          ingredients={ingredients}
          transactions={filteredTransactions}
          priceHistory={priceHistory}
          stockMovements={stockMovements}
          seasonalEvents={seasonalEvents}
          onNavigateTab={onNavigateTab}
        />
      ) : (
        <MenuEngineeringMatrix
          products={products}
          ingredients={ingredients}
          transactions={filteredTransactions}
        />
      )}
    </div>
  );
}
