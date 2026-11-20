import { useState } from 'react';
import { Receipt, Eye, Calendar, MapPin } from 'lucide-react';

export default function TransactionHistory({ transactions, formatDateTime, onSelectTx }) {
  const [selectedDate, setSelectedDate] = useState('');

  // Logika filter transaksi berdasarkan tanggal lokal yang dipilih pada input date
  const filteredByDateTransactions = transactions.filter(tx => {
    if (!selectedDate) return true;
    const txDate = new Date(tx.created_at);
    const localISODate = new Date(txDate.getTime() - (txDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    return localISODate === selectedDate;
  });

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
        <h3 className="text-sm font-extrabold text-[#141414] flex items-center gap-2">
          <Receipt size={16} className="text-[#D97706]"/> Riwayat Transaksi Terbaru
        </h3>

        {/* Input Filter Berdasarkan Hari / Tanggal */}
        <div className="flex items-center gap-2 bg-[#FAFAFA] border border-zinc-200 rounded-xl px-3 py-1.5">
          <Calendar size={14} className="text-zinc-400 shrink-0" />
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)} 
            className="bg-transparent text-xs font-bold text-[#141414] focus:outline-none cursor-pointer"
          />
          {selectedDate && (
            <button 
              onClick={() => setSelectedDate('')} 
              className="text-[10px] font-bold text-red-600 hover:underline ml-1 cursor-pointer"
              title="Reset Filter Tanggal"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {filteredByDateTransactions.length === 0 ? (
        <p className="text-xs text-[#52525B] font-medium text-center py-6">
          {selectedDate ? `Tidak ada transaksi pada tanggal ${selectedDate}.` : "Belum ada data transaksi."}
        </p>
      ) : (
        <div className="overflow-y-auto max-h-[300px] hide-scrollbar pr-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 font-mono text-[10px] font-bold uppercase text-[#52525B] sticky top-0 bg-white">
                <th className="pb-3 px-2">Waktu</th>
                <th className="pb-3 px-2">Sumber / Meja</th>
                <th className="pb-3 px-2">Total Harga</th>
                <th className="pb-3 px-2 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs font-medium">
              {filteredByDateTransactions.slice(0, 50).map((tx, idx) => (
                <tr key={idx} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="py-3 px-2 text-[#52525B] font-medium">
                    {formatDateTime(tx.created_at)}
                  </td>
                  {/* Kolom Informasi Nomor Meja / Kasir */}
                  <td className="py-3 px-2">
                    <span className="inline-flex items-center gap-1 bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold">
                      <MapPin size={10} /> {tx.table_number || 'Takeaway / Kasir'} • {tx.cashier_name || 'Kasir'}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <div className="font-mono font-bold text-[#141414]">
                      Rp {Number(tx.total_amount).toLocaleString('id-ID')}
                    </div>
                    <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-[#FAFAFA] border border-zinc-200 font-mono text-[9px] font-bold text-[#52525B] uppercase tracking-widest">
                      {tx.payment_method || 'CASH'}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <button 
                      onClick={() => onSelectTx(tx)}
                      className="px-3 py-1.5 bg-[#FAFAFA] border border-zinc-200 text-[#141414] hover:bg-[#141414] hover:text-white rounded-lg text-[10px] font-bold cursor-pointer inline-flex items-center gap-1 transition-colors"
                    >
                      <Eye size={12}/> Nota
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}