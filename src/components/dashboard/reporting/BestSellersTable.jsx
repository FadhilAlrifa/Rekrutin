import React from 'react';
import { TrendingUp } from 'lucide-react';

export default function BestSellersTable({ bestSellers }) {
  return (
    <div className="bg-white border border-zinc-200/80 rounded-[2.5rem] p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-zinc-900 flex items-center gap-2">
          <TrendingUp size={16} className="text-[#E87F24]"/> Produk Terlaris
        </h3>
      </div>

      {bestSellers.length === 0 ? (
        <p className="text-xs text-zinc-400 font-medium text-center py-6">Belum ada data penjualan.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 text-[10px] font-black uppercase text-zinc-400">
                <th className="pb-3 px-2">Produk</th>
                <th className="pb-3 px-2 text-center">Terjual</th>
                <th className="pb-3 px-2 text-right">Pendapatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 text-xs font-medium">
              {bestSellers.map((item, idx) => (
                <tr key={idx} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="py-3 px-2 flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center font-black text-[9px] ${idx === 0 ? 'bg-[#E87F24] text-white' : 'bg-zinc-100 text-zinc-500'}`}>
                      {idx + 1}
                    </span>
                    <span className="font-bold text-zinc-800">{item.name}</span>
                  </td>
                  <td className="py-3 px-2 text-center font-bold text-zinc-600">{item.sold}</td>
                  <td className="py-3 px-2 text-right font-mono font-bold text-emerald-600">Rp {item.revenue.toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}