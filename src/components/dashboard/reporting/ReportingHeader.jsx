import { Download, Lock, Building2 } from 'lucide-react';

export default function ReportingHeader({ onDownload, currentFilter, setFilter, customDate, setCustomDate, subscriptionPlan = 'pro', activeOutlet = 'Semua Cabang (Terpusat)', onUpgradePlan }) {
  const isStarter = subscriptionPlan === 'starter';
  const isEnterprise = subscriptionPlan === 'enterprise';

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-orange-50 text-[#E87F24] border border-orange-200">
            {isStarter ? 'Laporan Dasar • Paket Starter' : 'Analitik & Rekapitulasi Penjualan'}
          </span>
          {isEnterprise && (
            <span className="text-[10px] font-bold text-zinc-600 bg-zinc-100 border border-zinc-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
              <Building2 size={12} className="text-[#E87F24]" /> {activeOutlet}
            </span>
          )}
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          {isEnterprise ? 'Laporan Performa Multi-Outlet' : 'Laporan Performa Bisnis'}
        </h1>
        <p className="text-zinc-600 text-[13px] font-medium mt-1">
          Ringkasan omzet, riwayat transaksi kasir, metode pembayaran, dan produk terlaris.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
        
        {/* TOMBOL FILTER & KALENDER */}
        <div className="bg-black/[0.04] p-1 rounded-xl flex items-center flex-wrap gap-1">
          {[
            { id: 'today', label: 'Hari Ini' },
            { id: 'yesterday', label: 'Kemarin' },
            { id: 'month', label: 'Bulan Ini' },
            { id: 'all', label: 'Semua' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap min-h-[34px] ${
                currentFilter === f.id 
                ? 'bg-white text-zinc-900 shadow-xs border border-black/[0.04]' 
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-black/[0.02]'
              }`}
            >
              {f.label}
            </button>
          ))}

          {/* Input Kalender Khusus */}
          <div className="flex items-center pl-1 ml-1 border-l border-zinc-200">
            <input 
              type="date"
              value={customDate}
              onChange={(e) => {
                setCustomDate(e.target.value);
                setFilter('custom');
              }}
              title="Pilih Tanggal Bebas"
              className={`px-2.5 py-1 bg-white rounded-lg text-xs font-medium outline-none cursor-pointer border transition-all ${
                currentFilter === 'custom' 
                ? 'border-[#E87F24] text-[#E87F24] ring-2 ring-[#E87F24]/15' 
                : 'border-zinc-200 text-zinc-600 hover:text-zinc-900'
              }`}
            />
          </div>
        </div>

        {isStarter ? (
          <button
            onClick={() => onUpgradePlan?.('pro')}
            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 font-bold text-xs px-4 py-2 rounded-xl cursor-pointer flex items-center justify-center gap-2 transition-colors min-h-[36px]"
            title="Ekspor CSV tersedia pada Paket Pro & Enterprise"
          >
            <Lock size={13} className="text-[#E87F24]" /> Unduh CSV (Pro)
          </button>
        ) : (
          <button 
            onClick={onDownload}
            className="bg-[#E87F24] hover:bg-[#d6731f] text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-2 transition-all min-h-[36px] active:scale-95"
          >
            <Download size={14} /> Unduh CSV
          </button>
        )}
      </div>
    </div>
  );
}
