import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, Check, Store, Wallet, ChefHat, ShieldCheck, ShoppingBag, UtensilsCrossed } from 'lucide-react';

export default function MerchantWorkflowModal({
  isOpen,
  onClose,
  settings,
  onSave
}) {
  const [draft, setDraft] = useState(settings);

  const handleSubmit = (e) => {
    e.preventDefault();
    const isRetailDraft = (draft?.businessType || 'fnb') === 'retail';
    onSave({
      ...draft,
      paymentFlow: isRetailDraft ? 'pay_first' : draft.paymentFlow,
      defaultOrderChannel:
        isRetailDraft && draft.defaultOrderChannel === 'dine_in'
          ? 'take_away'
          : draft.defaultOrderChannel
    });
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
                    Pengaturan Jenis Usaha &amp; Cara Bayar
                  </h3>
                  <p className="text-[11px] font-medium text-[#52525B]">
                    Pilih jenis usaha, cara pembayaran pelanggan, dan alur pesanan toko.
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

            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
              {/* 0. Business Type Selector (F&B vs Ritel) */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#52525B] flex items-center gap-1.5">
                  <Store size={13} className="text-[#D97706]" /> Jenis Usaha
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    {
                      id: 'fnb',
                      title: 'F&B (Kafe & Restoran)',
                      desc: 'Pakai resep bahan baku, hitung modal per porsi, antrean dapur & bayar nanti.',
                      icon: UtensilsCrossed
                    },
                    {
                      id: 'retail',
                      title: 'Toko Ritel & Minimarket',
                      desc: 'Produk satuan atau varian, harga beli vs jual, potong stok otomatis per barang.',
                      icon: ShoppingBag
                    }
                  ].map((mode) => {
                    const active = (draft.businessType || 'fnb') === mode.id;
                    const Icon = mode.icon;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() =>
                          setDraft({
                            ...draft,
                            businessType: mode.id,
                            ...(mode.id === 'retail'
                              ? {
                                  paymentFlow: 'pay_first',
                                  defaultOrderChannel:
                                    draft.defaultOrderChannel === 'dine_in'
                                      ? 'take_away'
                                      : draft.defaultOrderChannel
                                }
                              : {})
                          })
                        }
                        className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          active
                            ? 'bg-[#141414] text-white border-[#141414] shadow-sm'
                            : 'bg-[#FAFAFA] border-zinc-200 hover:border-zinc-300 text-[#141414]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon size={14} className={active ? 'text-[#F59E0B]' : 'text-[#D97706]'} />
                          <p className="text-xs font-extrabold">{mode.title}</p>
                        </div>
                        <p className={`text-[11px] mt-1 leading-snug ${active ? 'text-zinc-300' : 'text-[#52525B]'}`}>
                          {mode.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 0B. Tipe Layanan F&B (Dine-In + Take-Away vs Khusus Take-Away) */}
              {(draft.businessType || 'fnb') === 'fnb' && (
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#52525B] flex items-center gap-1.5">
                    <UtensilsCrossed size={13} className="text-[#D97706]" /> Model Layanan F&amp;B
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      {
                        id: 'dine_in_take_away',
                        title: 'Dine-In & Take-Away',
                        desc: 'Resto/kafe dengan nomor meja, pesan mandiri QR Meja, dan bawa pulang.'
                      },
                      {
                        id: 'take_away_only',
                        title: 'Khusus Take-Away',
                        desc: 'Counter / grab & go tanpa meja makan (seperti Komar, booth minuman, dll).'
                      }
                    ].map((svc) => {
                      const active = (draft.fnbServiceMode || 'dine_in_take_away') === svc.id;
                      return (
                        <button
                          key={svc.id}
                          type="button"
                          onClick={() =>
                            setDraft({
                              ...draft,
                              fnbServiceMode: svc.id,
                              defaultOrderChannel:
                                svc.id === 'take_away_only' && draft.defaultOrderChannel === 'dine_in'
                                  ? 'take_away'
                                  : draft.defaultOrderChannel
                            })
                          }
                          className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                            active
                              ? 'bg-[#FEF3C7] border-[#F59E0B] shadow-sm'
                              : 'bg-[#FAFAFA] border-zinc-200 hover:border-zinc-300'
                          }`}
                        >
                          <p className="text-xs font-extrabold text-[#141414]">{svc.title}</p>
                          <p className="text-[11px] text-[#52525B] mt-1 leading-snug">{svc.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 1. Payment Flow (Hanya untuk F&B; ritel otomatis bayar langsung di kasir) */}
              {(draft.businessType || 'fnb') === 'fnb' && (
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#52525B] flex items-center gap-1.5">
                    <Wallet size={13} className="text-[#D97706]" /> Cara Pembayaran Pelanggan
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      {
                        id: 'pay_first',
                        title: 'Bayar di Awal (Pay First)',
                        desc: 'Pelanggan bayar lunas dulu saat pesan, baru pesanan diproses.'
                      },
                      {
                        id: 'pay_later',
                        title: 'Bayar Nanti / Open Bill (Pay Later)',
                        desc: 'Pesanan langsung dibuat, bisa tambah item lagi, lalu bayar di akhir.'
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
              )}

              {/* 2. Default Order Channel */}
              <div className="space-y-2">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#52525B] flex items-center gap-1.5">
                  <Store size={13} className="text-[#D97706]" /> Kanal Pesanan Default
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    ...((draft.businessType || 'fnb') === 'retail' ||
                    ((draft.businessType || 'fnb') === 'fnb' &&
                      draft.fnbServiceMode === 'take_away_only')
                      ? []
                      : [{ id: 'dine_in', label: 'Dine-In' }]),
                    { id: 'take_away', label: (draft.businessType || 'fnb') === 'retail' ? 'Belanja di Toko' : 'Take-Away' },
                    { id: 'online_closed_kitchen', label: 'Online Order' }
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
                        Aktifkan Kanal Online Order
                      </p>
                      <p className="text-[11px] text-[#52525B]">
                        {(draft.businessType || 'fnb') === 'retail'
                          ? 'Pesanan online masuk ke daftar antrean untuk disiapkan kasir sebelum diambil.'
                          : 'Pesanan online masuk langsung ke antrean KDS dapur tanpa antre kasir tatap muka.'}
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
