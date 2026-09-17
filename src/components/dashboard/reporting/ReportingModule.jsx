import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { fetchTransactions } from '../../../services/stockoService'; 

// Import komponen terpisah
import ReportingHeader from './ReportingHeader';
import ReportingMetrics from './ReportingMetrics';
import BestSellersTable from './BestSellersTable';
import TransactionHistory from './TransactionHistory';
import ReceiptModal from './ReceiptModal';

export default function ReportingModule() {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    todayRevenue: 0,
    yesterdayRevenue: 0,
    trendPercentage: 0,
    isUp: true,
    transactionCount: 0,
    totalItemsSold: 0, // <-- State untuk Total Item Terjual
  });
  const [bestSellers, setBestSellers] = useState([]);
  const [selectedTx, setSelectedTx] = useState(null);
  const [filter, setFilter] = useState('all'); // State untuk filter
  const [customDate, setCustomDate] = useState(''); // State untuk filter tanggal kalender bebas

  useEffect(() => {
    async function loadReportData() {
      setIsLoading(true);
      const txData = await fetchTransactions();
      
      let totalAllTime = 0;
      let count = txData.length;
      let totalItemsCount = 0; // Inumulator total item
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
        
        // Memproses item di dalam transaksi
        if (tx.items && Array.isArray(tx.items)) {
          tx.items.forEach(item => {
            const qty = Number(item.qty) || 0;
            totalItemsCount += qty; // Menjumlahkan total porsi/item keluar

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
        totalItemsSold: totalItemsCount // Mengirim hasil hitung total item ke metrics
      });
      
      setTransactions(txData);

      const sortedProducts = Object.values(productMap)
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 5); 
      setBestSellers(sortedProducts);
      
      setIsLoading(false);
    }

    loadReportData();
  }, []);

  // Filter transaksi berdasarkan pilihan di Header
  const filteredTransactions = transactions.filter(tx => {
    const txDate = new Date(tx.created_at);
    const now = new Date();

    if (filter === 'today') {
      return txDate.toDateString() === now.toDateString();
    }
    if (filter === 'yesterday') {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      return txDate.toDateString() === yesterday.toDateString();
    }
    if (filter === 'month') {
      return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
    }
    if (filter === 'custom' && customDate) {
      // Mencocokkan tanggal transaksi dengan tanggal yang dipilih dari kalender
      const localISODate = new Date(txDate.getTime() - (txDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      return localISODate === customDate;
    }
    return true;
  });

  // Tentukan label yang akan tampil di UI
  let fLabel = 'Semua Waktu';
  if (filter === 'today') fLabel = 'Hari Ini';
  else if (filter === 'yesterday') fLabel = 'Kemarin';
  else if (filter === 'month') fLabel = 'Bulan Ini';
  else if (filter === 'custom' && customDate) {
    fLabel = new Date(customDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  // Hitung jumlah transaksi, pendapatan, dan item khusus untuk filter yang aktif
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
    filterLabel: fLabel
  };

  const handleDownloadReport = () => {
    if (transactions.length === 0) return alert("Belum ada data untuk diunduh.");
    let csvContent = "Tanggal,Waktu,ID Transaksi,Total Item,Total Pendapatan\n";
    transactions.forEach(tx => {
      const dateObj = new Date(tx.created_at);
      const totalItem = tx.items ? tx.items.reduce((acc, curr) => acc + Number(curr.qty), 0) : 0;
      csvContent += `${dateObj.toLocaleDateString('id-ID')},${dateObj.toLocaleTimeString('id-ID')},${tx.id},${totalItem},${tx.total_amount}\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Laporan_Stocko_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
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
        currentFilter={filter} 
        setFilter={setFilter} 
        customDate={customDate}
        setCustomDate={setCustomDate}
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

      <ReceiptModal 
        selectedTx={selectedTx} 
        onClose={() => setSelectedTx(null)} 
        formatDateTime={formatDateTime} 
      />
    </div>
  );
}