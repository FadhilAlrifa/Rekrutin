import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, X, CheckCircle2, Building2, User, Mail, Phone, ShieldCheck, Sparkles, Store, Layers } from 'lucide-react';
import { sendMagicLink } from '../../services/stockoService';
import { SUBSCRIPTION_PLANS } from '../../components/landing/Pricing';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
};

export default function Register({ onBack, onOpenLogin, initialPlan = 'pro', onPlanChange }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState(initialPlan || 'pro');

  useEffect(() => {
    if (initialPlan) setSelectedPlanId(initialPlan);
  }, [initialPlan]);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    businessName: '',
    businessType: 'Coffee Shop / Cafe',
    location: 'Makassar',
  });

  const activePlan = SUBSCRIPTION_PLANS.find(p => p.id === selectedPlanId) || SUBSCRIPTION_PLANS[1];

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
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-[#E87F24] selection:text-white relative overflow-hidden">
      
      {/* Background Glow & Ornaments */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-20 pointer-events-none"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[600px] bg-gradient-to-b from-[#FEFDDF]/90 via-[#E87F24]/10 to-transparent rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      {/* NAVBAR */}
      <motion.nav 
        initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed w-full top-0 z-50 px-4 md:px-6 py-4"
      >
        <div className="max-w-7xl mx-auto bg-white/85 backdrop-blur-xl border border-zinc-200/80 rounded-full px-6 py-3 flex items-center justify-between shadow-[0_10px_30px_rgb(0,0,0,0.05)]">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={onBack}>
            <img src="/logo-stocko.png" alt="Stocko Logo" className="w-9 h-9 object-contain" />
            <span className="text-xl font-black tracking-tight text-zinc-900">
              Stocko<span className="text-[#E87F24]">.</span>
            </span>
          </div>

          <button 
            onClick={onBack}
            className="inline-flex items-center gap-2 text-zinc-700 hover:text-[#E87F24] font-bold text-sm transition-colors cursor-pointer group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Kembali ke Beranda
          </button>
        </div>
      </motion.nav>

      {/* KONTEN UTAMA */}
      <div className="max-w-6xl mx-auto px-6 pt-32 pb-28 space-y-16 relative z-10">
        
        {/* HEADER */}
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }} className="text-center space-y-5">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-zinc-100 px-4 py-1.5 rounded-full border border-zinc-200 shadow-xs">
            <Sparkles size={14} className="text-[#E87F24]" />
            <span className="text-[11px] font-black text-zinc-700 uppercase tracking-widest">Aktivasi Langganan & Free Trial 14 Hari</span>
          </motion.div>
          
          <motion.h1 variants={fadeUp} className="text-3xl md:text-5xl font-black tracking-tighter text-zinc-900 max-w-3xl mx-auto leading-[1.15]">
            Pilih Paket & Mulai Kelola <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E87F24] to-[#FFC81E]">
              Kasir dan Gudang Lebih Presisi.
            </span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-zinc-500 font-medium text-sm md:text-base max-w-2xl mx-auto">
            Sesuaikan paket dengan kebutuhan gerai Anda—mulai dari Basic POS Rp79.000/bln hingga Smart Inventory BOM dan Multi-Outlet Enterprise.
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
                onClick={() => handlePlanSelect(plan.id)}
                className={`rounded-[2rem] p-6 cursor-pointer transition-all duration-300 flex flex-col justify-between relative border-2 ${
                  isSelected
                    ? 'bg-zinc-950 text-white border-[#E87F24] shadow-2xl shadow-[#E87F24]/15 -translate-y-1'
                    : 'bg-white text-zinc-900 border-zinc-200/80 hover:border-zinc-300 shadow-lg shadow-zinc-200/30'
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 right-5 bg-gradient-to-r from-[#E87F24] to-[#FFC81E] text-zinc-950 text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-xs">
                    Core Product
                  </span>
                )}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                      isSelected ? 'bg-[#E87F24] text-zinc-950' : 'bg-orange-50 text-[#E87F24]'
                    }`}>
                      <Icon size={20} />
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'border-[#FFC81E] bg-[#FFC81E] text-zinc-950' : 'border-zinc-300'
                    }`}>
                      {isSelected && <Check size={14} strokeWidth={3} />}
                    </div>
                  </div>

                  <h3 className="font-black text-lg">{plan.name}</h3>
                  <p className={`text-xs font-bold ${isSelected ? 'text-[#FFC81E]' : 'text-[#E87F24]'}`}>
                    {plan.subtitle}
                  </p>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-2xl font-black">{plan.price}</span>
                    <span className={`text-xs font-bold ${isSelected ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      {plan.period}
                    </span>
                  </div>

                  <p className={`text-xs mt-2.5 leading-relaxed ${isSelected ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {plan.target}
                  </p>
                </div>

                <div className={`mt-5 pt-4 border-t text-[11px] font-bold ${
                  isSelected ? 'border-zinc-800 text-[#FFC81E]' : 'border-zinc-100 text-zinc-500'
                }`}>
                  {isSelected ? '✓ Paket Terpilih' : 'Klik untuk memilih paket ini'}
                </div>
              </div>
            );
          })}
        </div>

        {/* FORMULIR PENDAFTARAN & RINGKASAN PAKET TERPILIH */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4">
          
          {/* Form Kiri */}
          <div className="lg:col-span-7 bg-white border border-zinc-200/80 rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-zinc-200/50">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-2xl font-black text-zinc-900">Cek Email Anda!</h3>
                <p className="text-zinc-500 text-sm max-w-md mx-auto leading-relaxed">
                  Halo <strong className="text-zinc-900">{formData.fullName}</strong>, kami telah mengirimkan <strong className="text-zinc-900">Magic Link</strong> ke email <strong className="text-zinc-900">{formData.email}</strong> untuk mengaktifkan <strong className="text-[#E87F24]">{activePlan.name}</strong>.
                </p>
                <button onClick={() => setSubmitted(false)} className="mt-4 bg-zinc-900 text-white font-bold px-6 py-2.5 rounded-full text-xs cursor-pointer">
                  Daftar dengan Email Lain
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
                  <div>
                    <h3 className="text-2xl font-black text-zinc-900">Daftar Akun Stocko</h3>
                    <p className="text-xs text-zinc-500 font-medium mt-1">Tanpa kata sandi, aktivasi instan via email bisnis Anda.</p>
                  </div>
                  <span className="text-xs font-black bg-orange-50 border border-orange-200 text-[#E87F24] px-3.5 py-1.5 rounded-full">
                    {activePlan.name} • {activePlan.price}
                  </span>
                </div>

                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold p-3 rounded-xl text-center">
                    {errorMessage}
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 mb-1.5">Nama Pemilik / Pengelola</label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input 
                      type="text" required placeholder="Nama Lengkap Anda"
                      value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3.5 pl-12 text-sm font-bold text-zinc-900 focus:outline-none focus:bg-white focus:border-[#E87F24] focus:ring-3 focus:ring-[#E87F24]/15 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 mb-1.5">Email Bisnis</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input 
                        type="email" required placeholder="toko@domain.com"
                        value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3.5 pl-12 text-sm font-bold text-zinc-900 focus:outline-none focus:bg-white focus:border-[#E87F24] focus:ring-3 focus:ring-[#E87F24]/15 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 mb-1.5">Nomor WhatsApp</label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input 
                        type="tel" required placeholder="08xxxxxxxxxx"
                        value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3.5 pl-12 text-sm font-bold text-zinc-900 focus:outline-none focus:bg-white focus:border-[#E87F24] focus:ring-3 focus:ring-[#E87F24]/15 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 mb-1.5">Nama Usaha / Outlet</label>
                  <div className="relative">
                    <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input 
                      type="text" required placeholder="Contoh: Kedai Kopi Nusantara"
                      value={formData.businessName} onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3.5 pl-12 text-sm font-bold text-zinc-900 focus:outline-none focus:bg-white focus:border-[#E87F24] focus:ring-3 focus:ring-[#E87F24]/15 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 mb-1.5">Jenis Usaha</label>
                    <select 
                      value={formData.businessType} onChange={(e) => setFormData({...formData, businessType: e.target.value})}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3.5 text-sm font-bold text-zinc-900 focus:outline-none focus:bg-white focus:border-[#E87F24] focus:ring-3 focus:ring-[#E87F24]/15 transition-all cursor-pointer"
                    >
                      <option value="Coffee Shop / Cafe">Coffee Shop / Cafe</option>
                      <option value="Restoran & F&B">Restoran & F&B</option>
                      <option value="Bakery & Pastry">Bakery & Pastry</option>
                      <option value="Franchise / Cloud Kitchen">Franchise / Cloud Kitchen</option>
                      <option value="Retail / Toko Kelontong">Retail / Toko Kelontong</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 mb-1.5">Kota Outlet Utama</label>
                    <select 
                      value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3.5 text-sm font-bold text-zinc-900 focus:outline-none focus:bg-white focus:border-[#E87F24] focus:ring-3 focus:ring-[#E87F24]/15 transition-all cursor-pointer"
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
                  type="submit" disabled={loading}
                  className="w-full mt-4 bg-gradient-to-r from-[#E87F24] to-[#FFC81E] hover:from-[#c96a1a] hover:to-[#e6b419] text-zinc-950 font-black py-4 rounded-2xl shadow-xl shadow-[#E87F24]/20 transition-all cursor-pointer disabled:opacity-50 active:scale-98"
                >
                  {loading ? 'Mengirim Magic Link...' : `Aktifkan ${activePlan.name} (Trial Gratis 14 Hari)`}
                </button>
              </form>
            )}
          </div>

          {/* Ringkasan Fitur Paket Kanan */}
          <div className="lg:col-span-5 bg-zinc-50 border border-zinc-200/80 rounded-[2.5rem] p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-5">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#E87F24] bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">
                  Detail Paket Terpilih
                </span>
                <h3 className="font-black text-zinc-900 text-xl mt-2">{activePlan.name}</h3>
                <p className="text-xs font-bold text-zinc-500">{activePlan.subtitle}</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-[#E87F24] block">{activePlan.price}</span>
                <span className="text-[11px] font-bold text-zinc-400">{activePlan.period}</span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-black text-zinc-700 uppercase tracking-wider">Fitur yang Termasuk:</p>
              {activePlan.included.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs font-medium text-zinc-700 leading-relaxed">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {activePlan.excluded.length > 0 && (
              <div className="space-y-2.5 pt-4 border-t border-zinc-200/80">
                <p className="text-[11px] font-black text-zinc-400 uppercase tracking-wider">Tidak Termasuk di Paket Ini:</p>
                {activePlan.excluded.map((ex, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs font-medium text-zinc-400 leading-relaxed">
                    <div className="w-5 h-5 rounded-full bg-zinc-200/60 text-zinc-400 flex items-center justify-center shrink-0 mt-0.5">
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
