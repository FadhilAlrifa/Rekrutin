import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { generateAiInsights } from '../../../utils/cogsCalculator';
import { computeSeasonalDemandForecast, DEFAULT_SEASONAL_EVENTS } from '../../../utils/seasonalForecasting';

export default function AiInsightsPanel({
  products = [],
  ingredients = [],
  transactions = [],
  priceHistory = [],
  stockMovements = [],
  seasonalEvents = DEFAULT_SEASONAL_EVENTS,
  businessType = 'fnb',
  onNavigateTab
}) {
  const [refreshTick, setRefreshTick] = useState(0);

  const insights = useMemo(() => {
    void refreshTick;
    const seasonalForecast = computeSeasonalDemandForecast(
      ingredients,
      products,
      transactions,
      stockMovements,
      seasonalEvents,
      seasonalEvents[0]?.id,
      14,
      'peak'
    );
    return generateAiInsights({
      products,
      ingredients,
      transactions,
      priceHistory,
      seasonalForecast,
      businessType
    });
  }, [products, ingredients, transactions, priceHistory, stockMovements, seasonalEvents, businessType, refreshTick]);

  const getCardStyle = (status) => {
    if (status === 'critical') {
      return {
        badge: 'bg-red-50 text-red-700 border-red-200',
        icon: AlertTriangle,
        iconColor: 'text-red-600'
      };
    }
    if (status === 'amber') {
      return {
        badge: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]',
        icon: Sparkles,
        iconColor: 'text-[#D97706]'
      };
    }
    if (status === 'healthy') {
      return {
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: CheckCircle2,
        iconColor: 'text-emerald-600'
      };
    }
    return {
      badge: 'bg-[#FAFAFA] text-[#141414] border-zinc-200',
      icon: TrendingUp,
      iconColor: 'text-[#141414]'
    };
  };

  const mapActionTarget = (id) => {
    if (id === 'margin' || id === 'pricing') return { tab: 'menu-management', label: 'Kelola Menu & HPP' };
    if (id === 'upselling') return { tab: 'pos', label: 'Buka POS Kasir' };
    if (id === 'stock') return { tab: 'inventory', label: 'Buka Stok Gudang' };
    return { tab: 'pos', label: 'Lihat Katalog POS' };
  };

  return (
    <div className="space-y-5">
      {/* Header Panel Stocko AI Insights */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#141414] text-[#F59E0B] flex items-center justify-center shrink-0">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-extrabold text-[#141414] tracking-tight">
                Stocko AI Business Analyst
              </h3>
              <span className="text-[10px] font-bold bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] px-2.5 py-0.5 rounded-full">
                Analisis Otomatis
              </span>
            </div>
            <p className="text-xs text-[#52525B] font-medium mt-1">
              Menganalisis {products.length} menu, {ingredients.length} bahan baku, dan {transactions.length} transaksi secara otomatis.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setRefreshTick((t) => t + 1)}
            className="bg-[#F59E0B] hover:bg-[#D97706] text-[#141414] text-xs font-extrabold px-4 py-2 rounded-xl inline-flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RefreshCw size={13} />
            <span>Analisis Ulang</span>
          </button>
        </div>
      </div>

      {/* 5 Kartu Insight Bisnis Actionable */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {insights.map((item, idx) => {
          const style = getCardStyle(item.status);
          const Icon = style.icon;
          const nav = mapActionTarget(item.id);
          const isWide = idx === insights.length - 1;

          return (
            <motion.div
              key={`${item.id}-${refreshTick}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: idx * 0.05 }}
              className={`bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-4 ${
                isWide ? 'lg:col-span-2' : ''
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#B45309]">
                    {item.code}
                  </span>
                  <span className={`font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 ${style.badge}`}>
                    <Icon size={11} className={style.iconColor} />
                    {item.title}
                  </span>
                </div>

                <h4 className="text-base sm:text-lg font-extrabold text-[#141414] tracking-tight">
                  {item.headline}
                </h4>

                <p className="text-xs sm:text-[13px] text-[#52525B] font-medium leading-relaxed">
                  {item.detail}
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="font-mono text-[11px] font-bold text-[#141414]">
                  Saran Aksi: <span className="text-[#D97706]">{item.action}</span>
                </span>
                {onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => onNavigateTab(nav.tab)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#FAFAFA] hover:bg-[#141414] hover:text-white border border-zinc-200 text-[#141414] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors self-start sm:self-auto"
                  >
                    <span>{nav.label}</span>
                    <ArrowRight size={13} />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
