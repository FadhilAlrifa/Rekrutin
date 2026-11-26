import { Download, Lock, Building2 } from 'lucide-react';

export default function ReportingHeader({ onDownload, currentFilter, setFilter, customDate, setCustomDate, subscriptionPlan = 'pro', activeOutlet = 'Semua Cabang (Terpusat)', onUpgradePlan }) {
  const isStarter = subscriptionPlan === 'starter';
  const isEnterprise = subscriptionPlan === 'enterprise';

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 pb-5 border-b border-zinc-200">
      <div>
        {isEnterprise && (
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-[11px] font-bold text-[#52525B] bg-white border border-zinc-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
              <Building2 size={12} className="text-[#D97706]" /> {activeOutlet}
            </span>
          </div>
        )}
        <h1 className="text-3xl font-extrabold tracking-tight text-[#141414]">
          {isEnterprise ? 'Laporan Performa Multi-Outlet' : 'Laporan Performa Bisnis'}
        </h1>
        <p className="text-[#52525B] text-[13px] font-medium mt-1">
          Ringkasan omzet, riwayat transaksi kasir, metode pembayaran, dan produk terlaris.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
        
        {/* TOMBOL FILTER & KALENDER */}
        <div className="bg-zinc-200/70 p-1 rounded-xl flex items-center flex-wrap gap-1">
          {[
            { id: 'today', label: 'Hari Ini' },
            { id: 'yesterday', label: 'Kemarin' },
            { id: 'month', label: 'Bulan Ini' },
            { id: 'all', label: 'Semua' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap min-h-[34px] ${
                currentFilter === f.id 
                ? 'bg-[#141414] text-white shadow-sm' 
                : 'text-[#52525B] hover:text-[#141414]'
              }`}
            >
              {f.label}
            </button>
          ))}

          {/* Input Kalender Khusus (Pro & Enterprise) */}
          <div className="flex items-center pl-1 ml-1 border-l border-zinc-300">
            {isStarter ? (
              <button
                type="button"
                onClick={() => onUpgradePlan?.('pro')}
                title="Pilih tanggal penjualan khusus tersedia di Paket Pro & Enterprise"
                className="px-2.5 py-1.5 bg-white hover:bg-[#FEF3C7] rounded-lg text-xs font-bold border border-zinc-200 text-[#52525B] hover:text-[#B45309] inline-flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Lock size={12} className="text-[#D97706]" />
                <span>Pilih Tanggal (Pro)</span>
              </button>
            ) : (
              <input 
                type="date"
                value={customDate}
                onChange={(e) => {
                  setCustomDate(e.target.value);
                  setFilter('custom');
                }}
                title="Pilih Tanggal Bebas"
                className={`px-2.5 py-1 bg-white rounded-lg text-xs font-semibold outline-none cursor-pointer border transition-all ${
                  currentFilter === 'custom' 
                  ? 'border-[#F59E0B] text-[#B45309] ring-2 ring-[#F59E0B]/20' 
                  : 'border-zinc-200 text-[#52525B] hover:text-[#141414]'
                }`}
              />
            )}
          </div>
        </div>

        <button 
          onClick={onDownload}
          className="bg-[#F59E0B] hover:bg-[#D97706] text-[#141414] font-extrabold text-xs px-4 py-2 rounded-xl shadow-sm cursor-pointer flex items-center justify-center gap-2 transition-all min-h-[36px] active:scale-95"
        >
          <Download size={14} /> Unduh CSV
        </button>
      </div>
    </div>
  );
}
