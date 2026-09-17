import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowLeft, Check, CheckCircle2, Building2, User, Mail, Phone, ShieldCheck, Sparkles, Store } from 'lucide-react';
import { sendMagicLink } from '../../services/stockoService'; // Menggunakan layanan Magic Link

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 20 } }
};

export default function Register({ onBack, onOpenLogin }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    businessName: '',
    businessType: 'Coffee Shop / Cafe',
    location: 'Makassar',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    // Kirim Magic Link ke Supabase Auth
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
        initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed w-full top-0 z-50 px-4 md:px-6 py-4"
      >
        <div className="max-w-7xl mx-auto bg-white/85 backdrop-blur-xl border border-zinc-200/80 rounded-full px-6 py-3 flex items-center justify-between shadow-[0_10px_30px_rgb(0,0,0,0.05)]">
          <div className="flex items-center gap-2 cursor-pointer" onClick={onBack}>
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#E87F24] to-[#FFC81E] flex items-center justify-center shadow-md text-zinc-950">
              <Zap size={18} className="fill-zinc-950" />
            </div>
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
      <div className="max-w-6xl mx-auto px-6 pt-36 pb-32 space-y-28 relative z-10">
        
        {/* HEADER & FITUR UTAMA */}
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={{ show: { transition: { staggerChildren: 0.1 } } }} className="text-center space-y-6">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-zinc-100 px-4 py-1.5 rounded-full border border-zinc-200 shadow-xs">
            <Sparkles size={14} className="text-[#E87F24]" />
            <span className="text-[11px] font-black text-zinc-700 uppercase tracking-widest">Aktivasi Free Trial Ekosistem Stocko</span>
          </motion.div>
          
          <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-black tracking-tighter text-zinc-900 max-w-4xl mx-auto leading-[1.1]">
            Kelola Stok Gudang & POS Jadi <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E87F24] to-[#FFC81E]">
              Lebih Presisi dan Otomatis.
            </span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-zinc-500 font-medium text-lg max-w-2xl mx-auto">
            Sistem manajemen bahan baku cerdas yang terhubung langsung ke mesin kasir untuk mencegah selisih stok dan kerugian.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "BOM Recipe Otomatis", desc: "Stok bahan baku terpotong presisi setiap terjadi transaksi penjualan." },
            { title: "Deteksi Expired & FIFO", desc: "Peringatan dini bahan mendekati masa kedaluwarsa secara real-time." },
            { title: "Validasi Lintas Menu", desc: "Mencegah kesalahan pesanan saat stok bahan gabungan tidak mencukupi." },
            { title: "Laporan Keuangan", desc: "Analitik omset, transaksi, dan riwayat gudang dalam satu dasbor." }
          ].map((feat, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
              className="bg-white/80 backdrop-blur-md border border-zinc-200/80 rounded-[2rem] p-8 shadow-xl shadow-zinc-200/30 hover:shadow-2xl hover:shadow-[#E87F24]/10 hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-zinc-950 flex items-center justify-center mb-6 text-[#FFC81E] group-hover:scale-110 transition-transform">
                <Store size={26} />
              </div>
              <h3 className="font-bold text-zinc-900 text-lg mb-2">{feat.title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed font-medium">{feat.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* DETAIL HARGA & FITUR */}
        <div id="harga" className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center bg-white border border-zinc-200/80 rounded-[3rem] p-8 md:p-14 shadow-xl shadow-zinc-200/40">
          <div className="space-y-6">
            <div className="inline-block bg-[#FEFDDF] border border-[#FFC81E]/40 px-3 py-1 rounded-full text-xs font-black text-[#E87F24]">
              Paket Spesial F&B Owner
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tight">
              Investasi Terjangkau untuk Bisnis Berkembang
            </h2>
            <p className="text-zinc-500 font-medium text-sm md:text-base leading-relaxed">
              Tinggalkan pembukuan manual yang melelahkan. Rasakan kemudahan kontrol operasional penuh bersama Stocko.
            </p>
            <div>
              <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Investasi Bulanan</p>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-zinc-400 line-through text-xl font-bold">Rp450.000</span>
                <span className="text-4xl md:text-5xl font-black text-[#E87F24]">Rp199.000</span>
                <span className="text-sm font-bold text-zinc-500">/ bulan</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-50 border border-zinc-200/80 rounded-3xl p-8 space-y-4 shadow-inner">
            <p className="font-bold text-zinc-900 mb-2">Semua fitur kasir & gudang di dalam satu paket:</p>
            {[
              "Unlimited POS & Kasir Transactions",
              "BOM & Recipe Management Real-Time",
              "Alerts Modul (Stok Menipis & Kedaluwarsa)",
              "Multi-Device Synchronized",
              "Laporan Analitik Penjualan",
              "Uji Coba Gratis 14 Hari Tanpa Risiko",
              "Support Tim Teknis Prioritas"
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 text-sm font-medium text-zinc-700">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check size={12} />
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FORMULIR PENDAFTARAN */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-12 border-t border-zinc-200">
          
          <div className="lg:col-span-7 bg-white border border-zinc-200/80 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-zinc-200/50">
            {submitted ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-2xl font-black text-zinc-900">Cek Email Anda!</h3>
                <p className="text-zinc-500 text-sm max-w-sm mx-auto leading-relaxed">
                  Halo <strong className="text-zinc-900">{formData.fullName}</strong>, kami telah mengirimkan <strong className="text-zinc-900">Magic Link</strong> ke email <strong className="text-zinc-900">{formData.email}</strong>. Klik tautan tersebut untuk mengaktifkan akun dan masuk otomatis.
                </p>
                <button onClick={() => setSubmitted(false)} className="mt-4 bg-zinc-900 text-white font-bold px-6 py-2.5 rounded-full text-sm cursor-pointer">
                  Daftar dengan Email Lain
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-2xl font-black text-zinc-900">Daftar Akun Stocko</h3>
                    <p className="text-xs text-zinc-500 font-medium mt-1">Tanpa kata sandi, cukup gunakan email aktif.</p>
                  </div>
                  <span className="text-xs font-black bg-[#E87F24]/10 text-[#E87F24] px-3.5 py-1.5 rounded-full">Trial 14 Hari</span>
                </div>

                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold p-3 rounded-xl text-center">
                    {errorMessage}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Nama Pemilik / Pengelola</label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input 
                      type="text" required placeholder="Nama Lengkap"
                      value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 pl-12 text-sm text-zinc-900 focus:outline-none focus:border-[#E87F24] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Email Bisnis</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input 
                        type="email" required placeholder="toko@domain.com"
                        value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 pl-12 text-sm text-zinc-900 focus:outline-none focus:border-[#E87F24] transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Nomor WhatsApp</label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input 
                        type="tel" required placeholder="08xxxxxxxxxx"
                        value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 pl-12 text-sm text-zinc-900 focus:outline-none focus:border-[#E87F24] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Nama Usaha / Outlet</label>
                  <div className="relative">
                    <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input 
                      type="text" required placeholder="Contoh: Kopi Kenangan / Resto Gokana"
                      value={formData.businessName} onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 pl-12 text-sm text-zinc-900 focus:outline-none focus:border-[#E87F24] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Jenis Usaha</label>
                    <select 
                      value={formData.businessType} onChange={(e) => setFormData({...formData, businessType: e.target.value})}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 text-sm text-zinc-900 focus:outline-none focus:border-[#E87F24] transition-colors cursor-pointer"
                    >
                      <option value="Coffee Shop / Cafe">Coffee Shop / Cafe</option>
                      <option value="Restoran & F&B">Restoran & F&B</option>
                      <option value="Bakery & Pastry">Bakery & Pastry</option>
                      <option value="Retail / Toko Kelontong">Retail / Toko Kelontong</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Kota Outlet</label>
                    <select 
                      value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 text-sm text-zinc-900 focus:outline-none focus:border-[#E87F24] transition-colors cursor-pointer"
                    >
                      <option value="Makassar">Makassar</option>
                      <option value="Jakarta">Jakarta</option>
                      <option value="Surabaya">Surabaya</option>
                      <option value="Bandung">Bandung</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit" disabled={loading}
                  className="w-full mt-6 bg-gradient-to-r from-[#E87F24] to-[#FFC81E] hover:from-[#c96a1a] hover:to-[#e6b419] text-zinc-950 font-black py-4 rounded-2xl shadow-xl shadow-[#E87F24]/20 transition-all hover:scale-[1.01] cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Mengirim Magic Link...' : 'Kirim Tautan Masuk Gratis'}
                </button>
              </form>
            )}
          </div>

          <div className="lg:col-span-5 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-[#E87F24]/20 rounded-[2.5rem] p-8 md:p-10 space-y-6 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-200 shadow-sm flex items-center justify-center text-[#E87F24]">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 text-xl">Sinkronisasi Gudang Aktif</h3>
              <p className="text-zinc-500 text-sm mt-2 leading-relaxed">
                Setiap item terjual di POS akan langsung memperbarui sisa gramasi dan mililiter bahan baku di inventaris gudang secara akurat.
              </p>
            </div>
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">Stok Terkini Aman</span>
                <span className="text-xs font-mono text-zinc-400">Status: Live</span>
              </div>
              <div className="h-3 w-full bg-zinc-100 rounded-full"></div>
              <div className="h-3 w-2/3 bg-zinc-100 rounded-full"></div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}