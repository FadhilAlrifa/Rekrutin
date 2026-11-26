import { useState, useEffect } from 'react';
import { Loader2, Lock, CalendarDays, Layers } from 'lucide-react';
import {
  fetchTransactions,
  fetchDailySalesHistory,
  syncDailySalesHistoryEntries
} from '../../../services/stockoService';
import { buildDailySalesHistory } from '../../../utils/dailySalesHistory';
import { useNotify } from '../../common/NotificationContext';

// Import komponen terpisah
import ReportingHeader from './ReportingHeader';
import ReportingMetrics from './ReportingMetrics';
import BestSellersTable from './BestSellersTable';
import TransactionHistory from './TransactionHistory';
import ReceiptModal from './ReceiptModal';
import DailySalesHistoryPanel from './DailySalesHistoryPanel';

export default function ReportingModule({
  subscriptionPlan = 'pro',
  activeOutlet = 'Semua Cabang (Terpusat)',
  onUpgradePlan,
  products = [],
  ingredients = [],
  seasonalEvents = [],
  businessType = 'fnb',
  isSimulationMode = false,
  externalTransactions = [],
  externalDailyRows = []
}) {
  const { showAlert, showToast } = useNotify();
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [persistedDailyRows, setPersistedDailyRows] = useState([]);
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    todayRevenue: 0,
    yesterdayRevenue: 0,
    trendPercentage: 0,
    isUp: true,
    transactionCount: 0,
    totalItemsSold: 0,
  });
  const [bestSellers, setBestSellers] = useState([]);
  const [selectedTx, setSelectedTx] = useState(null);
  const [filter, setFilter] = useState('all');
  const [customDate, setCustomDate] = useState('');

  useEffect(() => {
    async function loadReportData() {
      setIsLoading(true);
      let txData = [];
      let dailyRows = [];
      if (isSimulationMode) {
        txData = Array.isArray(externalTransactions) ? externalTransactions : [];
        dailyRows = Array.isArray(externalDailyRows) ? externalDailyRows : [];
      } else {
        [txData, dailyRows] = await Promise.all([
          fetchTransactions(),
          fetchDailySalesHistory()
        ]);
      }
      setPersistedDailyRows(Array.isArray(dailyRows) ? dailyRows : []);
      
      let totalAllTime = 0;
      let count = txData.length;
      let totalItemsCount = 0;
      let productMap = {};

      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const startOfYesterday = startOfToday - (24 * 60 * 60 * 1000);

      let todayRev = 0;
      let yesterdayRev = 0;

      txData.forEach(tx => {
        const txAmount = Number(tx.total_amount) || 0;
        const txTime = new Date(tx.created_at).getTime();

        totalAllTime += txAmount;

        if (txTime >= startOfToday) {
          todayRev += txAmount;
        } else if (txTime >= startOfYesterday && txTime < startOfToday) {
          yesterdayRev += txAmount;
        }
        
        if (tx.items && Array.isArray(tx.items)) {
          tx.items.forEach(item => {
            const qty = Number(item.qty) || 0;
            totalItemsCount += qty;

            if (!productMap[item.name]) {
              productMap[item.name] = { name: item.name, sold: 0, revenue: 0 };
            }
            productMap[item.name].sold += qty;
            productMap[item.name].revenue += (qty * Number(item.price));
          });
        }
      });

      let percentage = 0;
      if (yesterdayRev === 0 && todayRev > 0) {
        percentage = 100;
      } else if (yesterdayRev > 0) {
        percentage = ((todayRev - yesterdayRev) / yesterdayRev) * 100;
      }
      
      setMetrics({ 
        totalRevenue: totalAllTime, 
        todayRevenue: todayRev,
        yesterdayRevenue: yesterdayRev,
        trendPercentage: Math.round(Math.abs(percentage)),
        isUp: percentage >= 0,
        transactionCount: count, 
        totalItemsSold: totalItemsCount
      });
      
      setTransactions(txData);

      const builtDaily = buildDailySalesHistory({
        transactions: txData,
        products,
        ingredients,
        seasonalEvents,
        persistedDailyRows: Array.isArray(dailyRows) ? dailyRows : [],
        businessType
      });
      if (!isSimulationMode && builtDaily.flatRows.length > 0) {
        syncDailySalesHistoryEntries(builtDaily.flatRows, activeOutlet);
      }

      const sortedProducts = Object.values(productMap)
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 5); 
      setBestSellers(sortedProducts);
      
      setIsLoading(false);
    }

    loadReportData();
  }, [activeOutlet, businessType, ingredients, products, seasonalEvents, isSimulationMode, externalTransactions, externalDailyRows]);

  const isStarter = subscriptionPlan === 'starter';
  const activeFilter = isStarter && filter === 'custom' ? 'all' : filter;

  const filteredTransactions = transactions.filter(tx => {
    const txDate = new Date(tx.created_at);
    const now = new Date();

    if (activeFilter === 'today') {
      return txDate.toDateString() === now.toDateString();
    }
    if (activeFilter === 'yesterday') {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      return txDate.toDateString() === yesterday.toDateString();
    }
    if (activeFilter === 'month') {
      return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
    }
    if (activeFilter === 'custom' && customDate) {
      const localISODate = new Date(txDate.getTime() - (txDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      return localISODate === customDate;
    }
    return true;
  });

  let fLabel = 'Semua Waktu';
  if (activeFilter === 'today') fLabel = 'Hari Ini';
  else if (activeFilter === 'yesterday') fLabel = 'Kemarin';
  else if (activeFilter === 'month') fLabel = 'Bulan Ini';
  else if (activeFilter === 'custom' && customDate) {
    fLabel = new Date(customDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  const displayMetrics = {
    ...metrics,
    revenue: filteredTransactions.reduce((sum, tx) => sum + (Number(tx.total_amount) || 0), 0),
    transactionCount: filteredTransactions.length,
    totalItemsSold: filteredTransactions.reduce((sum, tx) => {
      let itemSum = 0;
      if (tx.items) {
        tx.items.forEach(i => itemSum += Number(i.qty) || 0);
      }
      return sum + itemSum;
    }, 0),
    paymentBreakdown: filteredTransactions.reduce((acc, tx) => {
      const method = tx.payment_method || 'cash';
      if (!acc[method]) acc[method] = 0;
      acc[method] += 1;
      return acc;
    }, { qris: 0, cash: 0, card: 0 }),
    filterLabel: fLabel
  };

  const handleDownloadReport = () => {
    if (transactions.length === 0) {
      showAlert({
        title: 'Data Belum Tersedia',
        message: 'Belum ada data transaksi untuk diunduh sebagai laporan CSV.',
        variant: 'info'
      });
      return;
    }
    let csvContent = "Tanggal,Waktu,ID Transaksi,Sumber/Meja,Metode Bayar,Total Item,Total Pendapatan\n";
    transactions.forEach(tx => {
      const dateObj = new Date(tx.created_at);
      const totalItem = tx.items ? tx.items.reduce((acc, curr) => acc + Number(curr.qty), 0) : 0;
      csvContent += `${dateObj.toLocaleDateString('id-ID')},${dateObj.toLocaleTimeString('id-ID')},${tx.id},"${tx.table_number || 'Kasir'}",${(tx.payment_method || 'cash').toUpperCase()},${totalItem},${tx.total_amount}\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Laporan_Stocko_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    showToast({
      title: 'Laporan CSV berhasil diunduh',
      message: `${transactions.length} transaksi diekspor ke file CSV.`,
      variant: 'success'
    });
  };

  const formatDateTime = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('id-ID', { 
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-zinc-500 space-y-4">
        <Loader2 className="animate-spin text-[#E87F24]" size={40} />
        <p className="text-sm font-bold animate-pulse">Menghitung analitik data transaksi...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 relative">
      <ReportingHeader 
        onDownload={handleDownloadReport} 
        currentFilter={activeFilter} 
        setFilter={setFilter} 
        customDate={customDate}
        setCustomDate={setCustomDate}
        subscriptionPlan={subscriptionPlan}
        activeOutlet={activeOutlet}
        onUpgradePlan={onUpgradePlan}
      />
      
      <ReportingMetrics metrics={displayMetrics} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <BestSellersTable bestSellers={bestSellers} />
        <TransactionHistory 
          transactions={filteredTransactions} 
          formatDateTime={formatDateTime} 
          onSelectTx={setSelectedTx} 
        />
      </div>

      {isStarter ? (
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] text-[#B45309] flex items-center justify-center shrink-0">
              <CalendarDays size={22} />
            </div>
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#141414] text-[#F59E0B]">
                <Lock size={10} /> Khusus Paket Pro &amp; Enterprise
              </span>
              <h3 className="text-lg font-extrabold text-[#141414] tracking-tight">
                Riwayat Penjualan Harian &amp; Menu Favorit
              </h3>
              <p className="text-xs text-[#52525B] font-medium max-w-2xl leading-relaxed">
                Lihat catatan penjualan lengkap per tanggal, peringkat menu paling laris harian, serta filter pilih tanggal penjualan bebas dengan upgrade ke <strong>Paket Pro</strong>.
              </p>
            </div>
          </div>

          {onUpgradePlan && (
            <button
              type="button"
              onClick={() => onUpgradePlan('pro')}
              className="px-5 py-3 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#141414] text-xs font-extrabold inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-sm transition-colors"
            >
              <Layers size={14} /> Aktifkan Paket Pro
            </button>
          )}
        </div>
      ) : (
        <DailySalesHistoryPanel
          transactions={transactions}
          products={products}
          ingredients={ingredients}
          seasonalEvents={seasonalEvents}
          persistedDailyRows={persistedDailyRows}
          businessType={businessType}
        />
      )}

      <ReceiptModal
        selectedTx={selectedTx} 
        onClose={() => setSelectedTx(null)} 
        formatDateTime={formatDateTime} 
      />
    </div>
  );
}
