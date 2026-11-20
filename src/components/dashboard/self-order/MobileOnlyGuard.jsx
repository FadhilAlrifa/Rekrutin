import { useState, useEffect } from 'react';
import { Smartphone, MonitorX, ArrowLeft } from 'lucide-react';

const MOBILE_MAX_WIDTH = 768;

function checkIsMobileViewport() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= MOBILE_MAX_WIDTH;
}

export default function MobileOnlyGuard({ onBackToDashboard, children }) {
  const [isMobileView, setIsMobileView] = useState(checkIsMobileViewport);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(checkIsMobileViewport());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isMobileView) {
    return (
      <div className="min-h-screen w-full bg-[#FAFAFA] text-[#141414] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border border-zinc-200 rounded-3xl p-8 sm:p-10 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] text-[#B45309] flex items-center justify-center mx-auto relative">
            <Smartphone size={28} />
            <span className="w-6 h-6 rounded-full bg-[#141414] text-[#F59E0B] flex items-center justify-center absolute -bottom-1.5 -right-1.5 border-2 border-white">
              <MonitorX size={12} />
            </span>
          </div>

          <div className="space-y-2.5">
            <span className="inline-block font-mono text-[10px] font-bold uppercase tracking-[0.16em] px-3 py-1 rounded-full bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
              Akses Khusus Mobile (HP)
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#141414]">
              Hanya bisa di buka di HP
            </h1>
            <p className="text-xs sm:text-sm text-[#52525B] font-medium leading-relaxed">
              Halaman <strong>Pemesanan Mandiri</strong> dikhususkan untuk diakses pelanggan melalui smartphone. Silakan buka halaman ini di HP Anda.
            </p>
          </div>

          <div className="bg-[#FAFAFA] border border-zinc-200 rounded-2xl p-4 text-[11px] font-mono text-[#52525B]">
            Layar terdeteksi sebagai perangkat laptop / desktop (&gt; 768px). Menu dan keranjang pemesanan mandiri tidak ditampilkan.
          </div>

          {onBackToDashboard && (
            <button
              type="button"
              onClick={onBackToDashboard}
              className="w-full py-3.5 px-5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#141414] text-xs font-extrabold inline-flex items-center justify-center gap-2 cursor-pointer transition-colors active:scale-[0.98]"
            >
              <ArrowLeft size={15} /> Kembali ke Dashboard POS
            </button>
          )}
        </div>
      </div>
    );
  }

  return children;
}
