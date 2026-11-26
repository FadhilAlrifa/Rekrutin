import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UtensilsCrossed,
  ShoppingBag,
  Wallet,
  ReceiptText,
  ArrowRight,
  ArrowLeft,
  X,
  Check,
  Store
} from 'lucide-react';

export default function SimulationSetupModal({
  isOpen,
  onClose,
  initialBusinessType = 'fnb',
  initialPaymentFlow = 'pay_first',
  pendingPlan = null,
  onConfirm
}) {
  const [step, setStep] = useState(1);
  const [businessType, setBusinessType] = useState(initialBusinessType);
  const [paymentFlow, setPaymentFlow] = useState(initialPaymentFlow);

  useEffect(() => {
    if (!isOpen) return;
    setStep(1);
    setBusinessType(initialBusinessType || 'fnb');
    setPaymentFlow(initialPaymentFlow || 'pay_first');
  }, [isOpen, initialBusinessType, initialPaymentFlow]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const handleConfirm = () => {
    onConfirm?.({ businessType, paymentFlow });
  };

  const planNames = {
    starter: 'Starter',
    pro: 'Pro',
    enterprise: 'Enterprise'
  };

  const step1Options = [
    {
      id: 'fnb',
      title: 'F&B (Kafe / Restoran / Kedai)',
      desc: 'Cocok untuk usaha makanan & minuman. Setiap pesanan otomatis memotong stok bahan baku sesuai takaran resep.',
      badge: 'Pakai Resep Bahan',
      icon: UtensilsCrossed
    },
    {
      id: 'retail',
      title: 'Toko Ritel & Minimarket',
      desc: 'Cocok untuk bisnis ritel, minimarket, atau toko produk jadi. Stok otomatis berkurang sesuai jumlah barang terjual.',
      badge: 'Stok Per Barang',
      icon: ShoppingBag
    }
  ];

  const step2Options = [
    {
      id: 'pay_first',
      title: 'Bayar di Awal (Pay First)',
      desc: 'Pelanggan langsung bayar di kasir saat memesan. Setelah lunas, pesanan baru diproses.',
      badge: 'Umum di Kedai Kopi & Ritel',
      icon: Wallet
    },
    {
      id: 'pay_later',
      title: 'Bayar Nanti / Open Bill (Pay Later)',
      desc: 'Pesanan langsung diproses dulu, bisa tambah menu susulan, lalu pelanggan bayar di akhir.',
      badge: 'Umum di Resto & Kafe Meja',
      icon: ReceiptText
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="simulation-setup-title"
          className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#141414]/45 backdrop-blur-[4px] cursor-pointer"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32, mass: 0.85 }}
            className="relative w-full max-w-xl bg-white sm:rounded-3xl rounded-t-3xl border border-[#E5E5E5] shadow-[0_24px_64px_-16px_rgba(20,20,20,0.22)] z-10 overflow-hidden"
          >
            <div className="h-1.5 w-full bg-zinc-100 overflow-hidden">
              <motion.div
                initial={false}
                animate={{ width: step === 1 ? '50%' : '100%' }}
                transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                className="h-full bg-[#F59E0B]"
              />
            </div>

            {/* Header */}
            <div className="px-6 pt-5 pb-4 border-b border-zinc-100 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] text-[#B45309] flex items-center justify-center shrink-0">
                  <Store size={20} />
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`header-${step}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
                        Langkah {step} dari 2
                      </span>
                      {pendingPlan && (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-zinc-100 text-[#141414] border border-zinc-200">
                          Simulasi Paket {planNames[pendingPlan] || pendingPlan}
                        </span>
                      )}
                    </div>
                    <h3
                      id="simulation-setup-title"
                      className="text-lg font-extrabold text-[#141414] tracking-tight"
                    >
                      {step === 1
                        ? 'Pilih Jenis Usaha yang Ingin Dicoba'
                        : 'Pilih Cara Bayar Pelanggan'}
                    </h3>
                    <p className="text-xs text-[#52525B] font-medium mt-0.5">
                      {step === 1
                        ? 'Sesuaikan tampilan kasir dan stok dengan jenis usaha kamu.'
                        : 'Tentukan apakah pelanggan bayar langsung saat pesan atau bayar belakangan.'}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup pengaturan simulasi"
                className="w-8 h-8 rounded-full bg-[#FAFAFA] hover:bg-zinc-200/70 border border-zinc-200 text-zinc-500 hover:text-[#141414] flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X size={15} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-hidden">
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3.5"
                  >
                    {step1Options.map((opt, idx) => {
                      const active = businessType === opt.id;
                      const Icon = opt.icon;
                      return (
                        <motion.button
                          key={opt.id}
                          type="button"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25, delay: idx * 0.06 }}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setBusinessType(opt.id)}
                          className={`text-left p-5 rounded-2xl border-2 transition-colors cursor-pointer flex flex-col justify-between gap-4 ${
                            active
                              ? 'bg-[#FEF3C7]/40 border-[#F59E0B] shadow-sm'
                              : 'bg-[#FAFAFA] border-zinc-200 hover:border-zinc-300'
                          }`}
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                                  active
                                    ? 'bg-[#141414] text-[#F59E0B]'
                                    : 'bg-white border border-zinc-200 text-[#D97706]'
                                }`}
                              >
                                <Icon size={18} />
                              </div>
                              <motion.span
                                animate={{ scale: active ? [1, 1.15, 1] : 1 }}
                                transition={{ duration: 0.25 }}
                                className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${
                                  active
                                    ? 'bg-[#F59E0B] border-[#F59E0B] text-[#141414]'
                                    : 'bg-white border-zinc-300 text-transparent'
                                }`}
                              >
                                <Check size={13} strokeWidth={3} />
                              </motion.span>
                            </div>
                            <div>
                              <h4 className="text-sm font-extrabold text-[#141414]">
                                {opt.title}
                              </h4>
                              <p className="text-xs text-[#52525B] font-medium leading-relaxed mt-1.5">
                                {opt.desc}
                              </p>
                            </div>
                          </div>

                          <span className="inline-block w-fit text-[10px] font-bold px-2.5 py-1 rounded-full bg-white border border-zinc-200 text-[#52525B]">
                            {opt.badge}
                          </span>
                        </motion.button>
                      );
                    })}
                  </motion.div>
                ) : (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 24 }}
                    transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3.5"
                  >
                    {step2Options.map((opt, idx) => {
                      const active = paymentFlow === opt.id;
                      const Icon = opt.icon;
                      return (
                        <motion.button
                          key={opt.id}
                          type="button"
                          initial={{ opacity: 0, y: 14, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{
                            type: 'spring',
                            stiffness: 380,
                            damping: 26,
                            delay: idx * 0.08
                          }}
                          whileHover={{ y: -3, transition: { duration: 0.18 } }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setPaymentFlow(opt.id)}
                          className={`text-left p-5 rounded-2xl border-2 transition-colors cursor-pointer flex flex-col justify-between gap-4 ${
                            active
                              ? 'bg-[#FEF3C7]/45 border-[#F59E0B] shadow-md'
                              : 'bg-[#FAFAFA] border-zinc-200 hover:border-zinc-300'
                          }`}
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <motion.div
                                animate={{ rotate: active ? [0, -6, 0] : 0 }}
                                transition={{ duration: 0.3 }}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                                  active
                                    ? 'bg-[#141414] text-[#F59E0B]'
                                    : 'bg-white border border-zinc-200 text-[#D97706]'
                                }`}
                              >
                                <Icon size={18} />
                              </motion.div>
                              <motion.span
                                animate={{ scale: active ? [1, 1.18, 1] : 1 }}
                                transition={{ duration: 0.25 }}
                                className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${
                                  active
                                    ? 'bg-[#F59E0B] border-[#F59E0B] text-[#141414]'
                                    : 'bg-white border-zinc-300 text-transparent'
                                }`}
                              >
                                <Check size={13} strokeWidth={3} />
                              </motion.span>
                            </div>
                            <div>
                              <h4 className="text-sm font-extrabold text-[#141414]">
                                {opt.title}
                              </h4>
                              <p className="text-xs text-[#52525B] font-medium leading-relaxed mt-1.5">
                                {opt.desc}
                              </p>
                            </div>
                          </div>

                          <span className="inline-block w-fit text-[10px] font-bold px-2.5 py-1 rounded-full bg-white border border-zinc-200 text-[#52525B]">
                            {opt.badge}
                          </span>
                        </motion.button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-[#FAFAFA] border-t border-zinc-200 flex items-center justify-between gap-3">
              {step === 1 ? (
                <>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#52525B] hover:bg-zinc-200/70 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setStep(2)}
                    className="px-6 py-3 rounded-xl bg-[#141414] hover:bg-zinc-800 text-white text-xs font-extrabold inline-flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <span>Lanjut Pilih Cara Bayar</span>
                    <ArrowRight size={14} className="text-[#F59E0B]" />
                  </motion.button>
                </>
              ) : (
                <>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setStep(1)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#141414] bg-white border border-zinc-200 hover:bg-zinc-100 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    <span>Kembali</span>
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleConfirm}
                    className="px-6 py-3 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#141414] text-xs font-extrabold inline-flex items-center gap-2 shadow-sm cursor-pointer transition-colors"
                  >
                    <span>Masuk ke Simulasi POS</span>
                    <ArrowRight size={14} />
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
