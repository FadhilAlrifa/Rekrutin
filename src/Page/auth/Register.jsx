import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, X, CheckCircle2, Building2, User, Mail, Phone } from 'lucide-react';
import { sendMagicLink } from '../../services/stockoService';
import { SUBSCRIPTION_PLANS } from '../../data/subscriptionPlans';
import CustomCursor from '../../components/landing/CustomCursor';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.36, 1] } }
};

export default function Register({ onBack, onOpenLogin, initialPlan = 'pro', onPlanChange }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState(initialPlan || 'pro');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    businessName: '',
    businessType: 'Coffee Shop / Cafe',
    location: 'Makassar'
  });

  const activePlan = SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlanId) || SUBSCRIPTION_PLANS[1];

  const handlePlanSelect = (planId) => {
    setSelectedPlanId(planId);
    onPlanChange?.(planId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const result = await sendMagicLink(formData.email);
    setLoading(false);

    if (result.success) {
      setSubmitted(true);
    } else {
      setErrorMessage(result.message || 'Gagal mengirim tautan masuk. Silakan coba lagi.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#141414] font-sans selection:bg-[#F59E0B] selection:text-[#141414] relative overflow-hidden">
      <CustomCursor />

      {/* NAVBAR */}
      <motion.nav
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.36, 1] }}
        className="fixed w-full top-0 z-50 px-4 md:px-6 pt-4"
      >
        <div className="max-w-7xl mx-auto bg-white/95 backdrop-blur-xl border border-zinc-200 rounded-full px-5 py-2.5 flex items-center justify-between shadow-[0_4px_16px_-6px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={onBack}>
            <div className="w-9 h-9 rounded-full bg-[#FAFAFA] border border-zinc-200 flex items-center justify-center">
              <img src="/logo-stocko.png" alt="Stocko Logo" className="w-5 h-5 object-contain" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-[#141414]">
              Stocko<span className="text-[#F59E0B]">.</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onOpenLogin}
              className="text-xs font-semibold text-[#52525B] hover:text-[#141414] transition-colors cursor-pointer hidden sm:inline"
            >
              Sudah punya akun? Masuk
            </button>
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 text-[#52525B] hover:text-[#D97706] font-semibold text-xs transition-colors cursor-pointer group"
            >
              <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" /> Kembali ke Beranda
            </button>
          </div>
        </div>
      </motion.nav>

      {/* KONTEN UTAMA */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-32 pb-28 space-y-14 relative z-10">
        {/* HEADER */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="text-center space-y-4"
        >
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full border border-zinc-200 shadow-sm"
          >
            <CheckCircle2 size={14} className="text-[#D97706]" />
            <span className="font-mono text-[10px] font-bold text-[#52525B] uppercase tracking-[0.18em]">
              Aktivasi Langganan & Trial Gratis 14 Hari
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#141414] max-w-3xl mx-auto leading-[1.08]"
          >
            Pilih Paket & Mulai Kelola{' '}
            <span className="font-serif italic font-normal text-[#F59E0B]">
              Kasir dan Gudang
            </span>{' '}
            Lebih Presisi.
          </motion.h1>

          <motion.p variants={fadeUp} className="text-[#52525B] font-medium text-sm md:text-base max-w-2xl mx-auto">
            Sesuaikan paket dengan kebutuhan gerai Anda - mulai dari Basic POS Rp79.000/bln hingga Smart Inventory BOM dan Multi-Outlet Enterprise.
          </motion.p>
        </motion.div>

        {/* PILIHAN 3 PAKET LANGGANAN INTERAKTIF */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selectedPlanId === plan.id;
            return (
              <div
                key={plan.id}
                data-cursor="Select"
                onClick={() => handlePlanSelect(plan.id)}
                className={`rounded-3xl p-6 cursor-pointer transition-all duration-200 flex flex-col justify-between relative border ${
                  isSelected
                    ? 'bg-white text-[#141414] border-2 border-[#F59E0B] shadow-[0_20px_50px_-15px_rgba(245,158,11,0.18)]'
                    : 'bg-white text-[#141414] border-zinc-200 hover:border-zinc-300'
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 right-5 bg-[#F59E0B] text-[#141414] font-mono text-[10px] font-extrabold uppercase px-3 py-1 rounded-full">
                    Core Product
                  </span>
                )}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${
                        isSelected
                          ? 'bg-[#F59E0B] text-[#141414] border-[#F59E0B]'
                          : 'bg-[#FAFAFA] text-[#D97706] border-zinc-200'
                      }`}
                    >
                      <Icon size={20} />
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-[#F59E0B] bg-[#F59E0B] text-[#141414]' : 'border-zinc-300'
                      }`}
                    >
                      {isSelected && <Check size={14} strokeWidth={3} />}
                    </div>
                  </div>

                  <h3 className="font-extrabold text-lg text-[#141414]">{plan.name}</h3>
                  <p className="text-xs font-bold text-[#D97706]">{plan.subtitle}</p>

                  <div className="mt-4 flex items-baseline gap-1.5">
                    <span className="text-2xl font-black font-mono text-[#141414]">{plan.price}</span>
                    <span className="text-xs font-mono text-[#52525B]">{plan.period}</span>
                  </div>

                  <p className="text-xs mt-2.5 leading-relaxed text-[#52525B]">{plan.target}</p>
                </div>

                <div
                  className={`mt-5 pt-4 border-t border-zinc-200 font-mono text-[11px] font-bold ${
                    isSelected ? 'text-[#D97706]' : 'text-[#52525B]'
                  }`}
                >
                  {isSelected ? '✓ PAKET TERPILIH' : 'KLIK UNTUK MEMILIH'}
                </div>
              </div>
            );
          })}
        </div>

        {/* FORMULIR PENDAFTARAN & RINGKASAN PAKET TERPILIH */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
          {/* Form Kiri */}
          <div className="lg:col-span-7 agency-card-light p-7 sm:p-10">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-2xl font-extrabold text-[#141414]">Cek Email Anda</h3>
                <p className="text-[#52525B] text-sm max-w-md mx-auto leading-relaxed">
                  Halo <strong className="text-[#141414]">{formData.fullName}</strong>, kami telah mengirimkan <strong className="text-[#141414]">Magic Link</strong> ke email <strong className="text-[#141414]">{formData.email}</strong> untuk mengaktifkan <strong className="text-[#D97706]">{activePlan.name}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-4 bg-[#141414] text-white font-extrabold px-6 py-2.5 rounded-full text-xs cursor-pointer"
                >
                  Daftar dengan Email Lain
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex flex-wrap justify-between items-center gap-2 mb-4 pb-4 border-b border-zinc-200">
                  <div>
                    <h3 className="text-2xl font-extrabold text-[#141414]">Daftar Akun Stocko</h3>
                    <p className="text-xs text-[#52525B] font-medium mt-1">
                      Tanpa kata sandi, aktivasi instan via email bisnis Anda.
                    </p>
                  </div>
                  <span className="font-mono text-xs font-bold bg-[#FEF3C7] border border-[#FDE68A] text-[#B45309] px-3.5 py-1.5 rounded-full">
                    {activePlan.name} • {activePlan.price}
                  </span>
                </div>

                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3 rounded-xl text-center">
                    {errorMessage}
                  </div>
                )}

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#52525B] font-semibold mb-2">
                    Nama Pemilik / Pengelola
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      required
                      placeholder="Nama Lengkap Anda"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full bg-[#FAFAFA] border border-zinc-200 rounded-xl px-4 py-3.5 pl-11 text-sm font-semibold text-[#141414] placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-[#F59E0B] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-[#52525B] font-semibold mb-2">
                      Email Bisnis
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="email"
                        required
                        placeholder="toko@domain.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-[#FAFAFA] border border-zinc-200 rounded-xl px-4 py-3.5 pl-11 text-sm font-semibold text-[#141414] placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-[#F59E0B] transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-[#52525B] font-semibold mb-2">
                      Nomor WhatsApp
                    </label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="tel"
                        required
                        placeholder="08xxxxxxxxxx"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-[#FAFAFA] border border-zinc-200 rounded-xl px-4 py-3.5 pl-11 text-sm font-semibold text-[#141414] placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-[#F59E0B] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#52525B] font-semibold mb-2">
                    Nama Usaha / Outlet
                  </label>
                  <div className="relative">
                    <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Kedai Kopi Nusantara"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      className="w-full bg-[#FAFAFA] border border-zinc-200 rounded-xl px-4 py-3.5 pl-11 text-sm font-semibold text-[#141414] placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-[#F59E0B] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-[#52525B] font-semibold mb-2">
                      Jenis Usaha
                    </label>
                    <select
                      value={formData.businessType}
                      onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                      className="w-full bg-[#FAFAFA] border border-zinc-200 rounded-xl px-4 py-3.5 text-sm font-semibold text-[#141414] focus:outline-none focus:bg-white focus:border-[#F59E0B] transition-colors cursor-pointer"
                    >
                      <option value="Coffee Shop / Cafe">Coffee Shop / Cafe</option>
                      <option value="Restoran & F&B">Restoran & F&B</option>
                      <option value="Bakery & Pastry">Bakery & Pastry</option>
                      <option value="Franchise / Cloud Kitchen">Franchise / Cloud Kitchen</option>
                      <option value="Retail / Toko Kelontong">Retail / Toko Kelontong</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-[#52525B] font-semibold mb-2">
                      Kota Outlet Utama
                    </label>
                    <select
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full bg-[#FAFAFA] border border-zinc-200 rounded-xl px-4 py-3.5 text-sm font-semibold text-[#141414] focus:outline-none focus:bg-white focus:border-[#F59E0B] transition-colors cursor-pointer"
                    >
                      <option value="Makassar">Makassar</option>
                      <option value="Jakarta">Jakarta</option>
                      <option value="Bandung">Bandung</option>
                      <option value="Surabaya">Surabaya</option>
                      <option value="Yogyakarta">Yogyakarta</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  data-cursor="Start"
                  className="w-full mt-4 bg-[#F59E0B] hover:bg-[#D97706] text-[#141414] font-extrabold py-4 rounded-full transition-colors cursor-pointer disabled:opacity-50 text-xs sm:text-sm"
                >
                  {loading ? 'Mengirim Magic Link...' : `Aktifkan ${activePlan.name} (Trial Gratis 14 Hari)`}
                </button>
              </form>
            )}
          </div>

          {/* Ringkasan Fitur Paket Kanan */}
          <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-3xl p-7 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-5">
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#B45309] bg-[#FEF3C7] border border-[#FDE68A] px-3 py-1 rounded-full">
                  Detail Paket Terpilih
                </span>
                <h3 className="font-extrabold text-[#141414] text-xl mt-2.5">{activePlan.name}</h3>
                <p className="text-xs font-bold text-[#52525B]">{activePlan.subtitle}</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black font-mono text-[#D97706] block">{activePlan.price}</span>
                <span className="text-[11px] font-mono text-[#52525B]">{activePlan.period}</span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="font-mono text-[10px] font-bold text-[#52525B] uppercase tracking-widest">
                Fitur yang Termasuk:
              </p>
              {activePlan.included.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs font-medium text-[#141414] leading-relaxed">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {activePlan.excluded.length > 0 && (
              <div className="space-y-2.5 pt-4 border-t border-zinc-200">
                <p className="font-mono text-[10px] font-bold text-[#52525B] uppercase tracking-widest">
                  Tidak Termasuk di Paket Ini:
                </p>
                {activePlan.excluded.map((ex, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs font-medium text-[#52525B] leading-relaxed">
                    <div className="w-5 h-5 rounded-full bg-zinc-200 text-[#52525B] flex items-center justify-center shrink-0 mt-0.5">
                      <X size={11} />
                    </div>
                    <span>{ex}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
