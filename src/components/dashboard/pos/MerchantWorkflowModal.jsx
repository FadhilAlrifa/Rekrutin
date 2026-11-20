import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, Check, Store, Wallet, ChefHat, ShieldCheck } from 'lucide-react';

export default function MerchantWorkflowModal({
  isOpen,
  onClose,
  settings,
  onSave
}) {
  const [draft, setDraft] = useState(settings);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(draft);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-zinc-950/40 cursor-pointer"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden z-10"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] text-[#B45309] flex items-center justify-center">
                  <SlidersHorizontal size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#141414] text-base">
                    Pengaturan Alur Toko &amp; Dapur
                  </h3>
                  <p className="text-[11px] font-medium text-[#52525B]">
                    Konfigurasi mode kanal order, alur pembayaran, dan antrean dapur (KDS).
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#FAFAFA] hover:bg-zinc-200 border border-zinc-200 flex items-center justify-center text-[#52525B] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* 1. Payment Flow */}
              <div className="space-y-2">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#52525B] flex items-center gap-1.5">
                  <Wallet size={13} className="text-[#D97706]" /> Mode Alur Pembayaran (Payment Flow)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    {
                      id: 'pay_first',
                      title: 'Pay First (Bayar Awal)',
                      desc: 'Pesanan masuk dapur setelah pembayaran lunas (paid).'
                    },
                    {
                      id: 'pay_later',
                      title: 'Pay Later (Open Bill)',
                      desc: 'Dapur langsung memasak, bayar di akhir & bisa tambah item susulan.'
                    }
                  ].map((opt) => {
                    const active = draft.paymentFlow === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setDraft({ ...draft, paymentFlow: opt.id })}
                        className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          active
                            ? 'bg-[#FEF3C7] border-[#F59E0B] shadow-sm'
                            : 'bg-[#FAFAFA] border-zinc-200 hover:border-zinc-300'
                        }`}
                      >
                        <p className="text-xs font-extrabold text-[#141414]">{opt.title}</p>
                        <p className="text-[11px] text-[#52525B] mt-1 leading-snug">{opt.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Default Order Channel */}
              <div className="space-y-2">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#52525B] flex items-center gap-1.5">
                  <Store size={13} className="text-[#D97706]" /> Kanal Pesanan Default
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'dine_in', label: 'Dine-In' },
                    { id: 'take_away', label: 'Take-Away' },
                    { id: 'online_closed_kitchen', label: 'Closed Kitchen' }
                  ].map((ch) => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setDraft({ ...draft, defaultOrderChannel: ch.id })}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        draft.defaultOrderChannel === ch.id
                          ? 'bg-[#141414] text-[#F59E0B] border-[#141414]'
                          : 'bg-[#FAFAFA] text-[#52525B] border-zinc-200 hover:text-[#141414]'
                      }`}
                    >
                      {ch.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Closed Kitchen & Cashier Shift Toggles */}
              <div className="space-y-2.5 pt-1">
                <label className="flex items-start justify-between gap-3 p-3.5 rounded-2xl bg-[#FAFAFA] border border-zinc-200 cursor-pointer">
                  <div className="flex items-start gap-2.5">
                    <ChefHat size={16} className="text-[#D97706] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-[#141414]">
                        Aktifkan Kanal Online / Closed Kitchen
                      </p>
                      <p className="text-[11px] text-[#52525B]">
                        Pesanan online masuk langsung ke antrean KDS dapur tanpa antre kasir tatap muka.
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(draft.closedKitchenEnabled)}
                    onChange={(e) => setDraft({ ...draft, closedKitchenEnabled: e.target.checked })}
                    className="w-4 h-4 accent-[#F59E0B] mt-1 cursor-pointer"
                  />
                </label>

                <label className="flex items-start justify-between gap-3 p-3.5 rounded-2xl bg-[#FAFAFA] border border-zinc-200 cursor-pointer">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck size={16} className="text-[#D97706] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-[#141414]">
                        Wajib Autentikasi Sesi Shift Kasir
                      </p>
                      <p className="text-[11px] text-[#52525B]">
                        Mencetak identitas kasir aktif otomatis pada setiap struk dan log audit.
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(draft.requireCashierShift)}
                    onChange={(e) => setDraft({ ...draft, requireCashierShift: e.target.checked })}
                    className="w-4 h-4 accent-[#F59E0B] mt-1 cursor-pointer"
                  />
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-white border border-zinc-200 text-xs font-bold text-[#52525B] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#141414] text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Check size={15} /> Terapkan Alur Operasional
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
