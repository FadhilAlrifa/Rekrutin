import { TrendingUp } from 'lucide-react';

export default function BestSellersTable({ bestSellers }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
        <h3 className="text-sm font-extrabold text-[#141414] flex items-center gap-2">
          <TrendingUp size={16} className="text-[#D97706]"/> Produk Terlaris
        </h3>
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#52525B]">Top 5</span>
      </div>

      {bestSellers.length === 0 ? (
        <p className="text-xs text-[#52525B] font-medium text-center py-6">Belum ada data penjualan.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 font-mono text-[10px] font-bold uppercase text-[#52525B]">
                <th className="pb-3 px-2">Produk</th>
                <th className="pb-3 px-2 text-center">Terjual</th>
                <th className="pb-3 px-2 text-right">Pendapatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs font-medium">
              {bestSellers.map((item, idx) => (
                <tr key={idx} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="py-3 px-2 flex items-center gap-2.5">
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center font-mono font-extrabold text-[10px] ${idx === 0 ? 'bg-[#F59E0B] text-[#141414]' : 'bg-[#FAFAFA] border border-zinc-200 text-[#52525B]'}`}>
                      {idx + 1}
                    </span>
                    <span className="font-bold text-[#141414]">{item.name}</span>
                  </td>
                  <td className="py-3 px-2 text-center font-mono font-bold text-[#52525B]">{item.sold}</td>
                  <td className="py-3 px-2 text-right font-mono font-bold text-emerald-700">Rp {item.revenue.toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}