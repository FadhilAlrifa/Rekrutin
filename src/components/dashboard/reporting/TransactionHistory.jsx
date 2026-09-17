import React, { useState } from 'react';
import { Receipt, Eye, Calendar, MapPin } from 'lucide-react';

export default function TransactionHistory({ transactions, formatDateTime, onSelectTx }) {
  const [selectedDate, setSelectedDate] = useState('');

  // Logika filter transaksi berdasarkan tanggal yang dipilih pada input date
  const filteredByDateTransactions = transactions.filter(tx => {
    if (!selectedDate) return true; // Jika tidak ada tanggal yang dipilih, tampilkan semua
    const txDateStr = new Date(tx.created_at).toISOString().split('T')[0];
    return txDateStr === selectedDate;
  });

  return (
    <div className="bg-white border border-zinc-200/80 rounded-[2.5rem] p-6 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="text-sm font-black text-zinc-900 flex items-center gap-2">
          <Receipt size={16} className="text-[#E87F24]"/> Riwayat Transaksi Terbaru
        </h3>

        {/* Input Filter Berdasarkan Hari / Tanggal */}
        <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 shadow-2xs">
          <Calendar size={14} className="text-zinc-400 shrink-0" />
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)} 
            className="bg-transparent text-xs font-bold text-zinc-700 focus:outline-none cursor-pointer"
          />
          {selectedDate && (
            <button 
              onClick={() => setSelectedDate('')} 
              className="text-[10px] font-bold text-red-500 hover:underline ml-1 cursor-pointer"
              title="Reset Filter Tanggal"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {filteredByDateTransactions.length === 0 ? (
        <p className="text-xs text-zinc-400 font-medium text-center py-6">
          {selectedDate ? `Tidak ada transaksi pada tanggal ${selectedDate}.` : "Belum ada data transaksi."}
        </p>
      ) : (
        <div className="overflow-y-auto max-h-[300px] hide-scrollbar pr-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 text-[10px] font-black uppercase text-zinc-400 sticky top-0 bg-white">
                <th className="pb-3 px-2">Waktu</th>
                <th className="pb-3 px-2">Sumber / Meja</th>
                <th className="pb-3 px-2">Total Harga</th>
                <th className="pb-3 px-2 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 text-xs font-medium">
              {filteredByDateTransactions.slice(0, 50).map((tx, idx) => (
                <tr key={idx} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="py-3 px-2 text-zinc-600 font-medium">
                    {formatDateTime(tx.created_at)}
                  </td>
                  {/* Kolom Informasi Nomor Meja / Kasir */}
                  <td className="py-3 px-2">
                    <span className="inline-flex items-center gap-1 bg-orange-50 text-[#E87F24] border border-orange-100 px-2.5 py-1 rounded-lg text-[10px] font-black">
                      <MapPin size={10} /> {tx.table_number || 'Takeaway / Kasir'}
                    </span>
                  </td>
                  <td className="py-3 px-2 font-mono font-bold text-zinc-900">
                    Rp {Number(tx.total_amount).toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-2 text-right">
                    <button 
                      onClick={() => onSelectTx(tx)}
                      className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-[10px] font-bold cursor-pointer inline-flex items-center gap-1 transition-colors"
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