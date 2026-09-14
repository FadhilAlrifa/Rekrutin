import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowLeft, Check, CheckCircle2, Building2, User, Mail, Phone, Users, Bot, ShieldCheck, Sparkles, Star } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 20 } }
};

export default function Register({ onBack }) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    jobTitle: 'HR Manager',
    location: 'Jakarta',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-[#E87F24] selection:text-white relative overflow-hidden">
      
      {/* Background Glow & Ornaments (Meniru Beranda) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-20 pointer-events-none"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[600px] bg-gradient-to-b from-[#FEFDDF]/90 via-[#E87F24]/10 to-transparent rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      {/* NAVBAR */}
      <motion.nav 
        initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed w-full top-0 z-50 px-4 md:px-6 py-4"
      >
        <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-xl border border-zinc-200/80 rounded-full px-6 py-3 flex items-center justify-between shadow-[0_10px_30px_rgb(0,0,0,0.05)]">
          <div className="flex items-center gap-2 cursor-pointer" onClick={onBack}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#E87F24] to-[#FFC81E] flex items-center justify-center shadow-md shadow-[#E87F24]/20">
              <Zap className="text-white fill-white" size={16} />
            </div>
            <span className="text-xl font-black tracking-tight text-zinc-900">
              RecruitIn<span className="text-[#E87F24]">.</span>
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
        
        {/* BAGIAN 1: HEADER & FITUR UTAMA */}
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={{ show: { transition: { staggerChildren: 0.1 } } }} className="text-center space-y-6">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-zinc-100 px-4 py-1.5 rounded-full border border-zinc-200 shadow-sm">
            <Sparkles size={14} className="text-[#E87F24]" />
            <span className="text-[11px] font-black text-zinc-700 uppercase tracking-widest">Pendaftaran Free Trial Ekosistem Duluin</span>
          </motion.div>
          
          <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-black tracking-tighter text-zinc-900 max-w-4xl mx-auto leading-[1.1]">
            Semua yang Anda Butuhkan untuk <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E87F24] to-[#FFC81E]">
              Merekrut Talenta Terbaik.
            </span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-zinc-500 font-medium text-lg max-w-2xl mx-auto">
            Platform rekrutmen terintegrasi yang dirancang untuk memangkas waktu seleksi manual hingga 80% secara presisi.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Analisis dengan Bantuan AI", desc: "Skor kecocokan pelamar secara instan tanpa bias." },
            { title: "Penilaian Konsisten", desc: "Standar evaluasi objektif yang sama di setiap kandidat." },
            { title: "Rekomendasi Transparan", desc: "Setiap keputusan saringan memiliki dasar data jelas." },
            { title: "Deteksi Potensi Lebih Awal", desc: "Amankan talenta berkualitas sebelum diambil kompetitor." }
          ].map((feat, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
              className="bg-white/80 backdrop-blur-md border border-zinc-200/80 rounded-[2rem] p-8 shadow-xl shadow-zinc-200/30 hover:shadow-2xl hover:shadow-[#E87F24]/10 hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-zinc-950 flex items-center justify-center mb-6 text-[#FFC81E] group-hover:scale-110 transition-transform">
                <Bot size={26} />
              </div>
              <h3 className="font-bold text-zinc-900 text-lg mb-2">{feat.title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed font-medium">{feat.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* BAGIAN 2: INTEGRASI EKOSISTEM */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          className="bg-gradient-to-br from-zinc-900 to-zinc-950 text-white border border-zinc-800 rounded-[3rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 w-96 h-96 bg-[#E87F24]/10 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="space-y-4 max-w-xl relative z-10">
            <span className="bg-[#E87F24]/20 text-[#FFC81E] border border-[#E87F24]/30 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
              Ekosistem Terpadu Duluin
            </span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              RecruitIn Hadir Terintegrasi dengan Workin by Duluin
            </h2>
            <p className="text-zinc-400 font-medium text-sm md:text-base leading-relaxed">
              Data pelamar yang lolos wawancara dan diterima dapat langsung disinkronkan ke platform HRIS Workin secara otomatis tanpa ketik ulang.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl relative z-10 shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E87F24] to-[#FFC81E] flex items-center justify-center text-zinc-950 font-black text-2xl shadow-lg">R</div>
            <div className="w-10 h-0.5 bg-zinc-700"></div>
            <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black text-2xl shadow-lg">W</div>
          </div>
        </motion.div>

        {/* BAGIAN 3: DETAIL HARGA & FITUR */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center bg-white border border-zinc-200/80 rounded-[3rem] p-8 md:p-14 shadow-xl shadow-zinc-200/40">
          <div className="space-y-6">
            <div className="inline-block bg-[#FEFDDF] border border-[#FFC81E]/40 px-3 py-1 rounded-full text-xs font-black text-[#E87F24]">
              Penawaran Spesial Eksekutif
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tight">
              Otomatisasi Rekrutmen dengan Harga Transparan
            </h2>
            <p className="text-zinc-500 font-medium text-sm md:text-base leading-relaxed">
              RecruitIn by Duluin memberikan solusi sistem pintar dengan investasi yang sangat ramah di kantong perusahaan Anda.
            </p>
            <div>
              <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Investasi Bulanan</p>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-zinc-400 line-through text-xl font-bold">Rp500.000</span>
                <span className="text-4xl md:text-5xl font-black text-[#E87F24]">Rp249.000</span>
                <span className="text-sm font-bold text-zinc-500">/ bulan</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-50 border border-zinc-200/80 rounded-3xl p-8 space-y-4 shadow-inner">
            <p className="font-bold text-zinc-900 mb-2">Semua fitur enterprise di dalam satu paket:</p>
            {[
              "Unlimited Platform Access",
              "Dashboard & AI Scoring Reports",
              "1 User (Owner/Admin)",
              "1 Entitas Bisnis Terdaftar",
              "2 GB Storage Dokumen Kandidat",
              "Uji Coba Gratis 14 Hari Tanpa Risiko",
              "Prioritas Dukungan Customer Service"
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

        {/* BAGIAN 4: TESTIMONI PENGGUNA */}
        <div className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tight">
              Dipercaya Praktisi HR Profesional
            </h2>
            <p className="text-zinc-500 font-medium">Ulasan nyata dari perusahaan yang telah bertransformasi bersama RecruitIn.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { quote: "Proses screening CV yang biasanya memakan waktu berminggu-minggu kini selesai kilat dalam hitungan detik secara objektif.", name: "Rian Ardiansyah", role: "Head of HR, Perusahaan Teknologi" },
              { quote: "Sistem penilaian AI membantu tim kami menjaga standar kualifikasi rekrutmen yang konsisten tanpa bias.", name: "Dewi Lestari", role: "Talent Lead, Multifinance" },
              { quote: "Visibilitas rekrutmen jadi jauh lebih tajam sejak tahap awal. Sangat merekomendasikan platform ini.", name: "Hendra Wijaya", role: "COO, Korporasi Nasional" }
            ].map((testi, idx) => (
              <div key={idx} className="bg-white border border-zinc-200/80 p-8 rounded-[2rem] shadow-lg shadow-zinc-200/30 flex flex-col justify-between space-y-6">
                <div className="flex text-amber-400 gap-1"><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/></div>
                <p className="text-sm text-zinc-700 font-medium leading-relaxed">"{testi.quote}"</p>
                <div>
                  <p className="font-bold text-zinc-900 text-sm">{testi.name}</p>
                  <p className="text-xs text-zinc-500 font-medium">{testi.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BAGIAN 5: FORMULIR PENDAFTARAN & KARTU PREVIEW DINAMIS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-12 border-t border-zinc-200">
          
          {/* Kolom Kiri: Form Input Modern */}
          <div className="lg:col-span-7 bg-white border border-zinc-200/80 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-zinc-200/50">
            {submitted ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-2xl font-black text-zinc-900">Pendaftaran Berhasil!</h3>
                <p className="text-zinc-500 text-sm max-w-sm mx-auto">
                  Terima kasih, <strong className="text-zinc-900">{formData.fullName}</strong>. Tim Sales kami segera menghubungi Anda melalui email <strong>{formData.email}</strong>.
                </p>
                <button onClick={() => setSubmitted(false)} className="mt-4 bg-zinc-900 text-white font-bold px-6 py-2.5 rounded-full text-sm cursor-pointer">
                  Daftar Akun Lain
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-2xl font-black text-zinc-900">Mulai Uji Coba</h3>
                    <p className="text-xs text-zinc-500 font-medium mt-1">Isi data perusahaan Anda untuk aktivasi instan.</p>
                  </div>
                  <span className="text-xs font-black bg-[#E87F24]/10 text-[#E87F24] px-3.5 py-1.5 rounded-full">Langkah 1 dari 2</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Nama Lengkap</label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input 
                      type="text" required placeholder="Nama Anda"
                      value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 pl-12 text-sm text-zinc-900 focus:outline-none focus:border-[#E87F24] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Email Perusahaan</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input 
                        type="email" required placeholder="nama@perusahaan.com"
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
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Nama Perusahaan</label>
                  <div className="relative">
                    <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input 
                      type="text" required placeholder="PT. Solusi Mandiri"
                      value={formData.companyName} onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 pl-12 text-sm text-zinc-900 focus:outline-none focus:border-[#E87F24] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Jabatan</label>
                    <select 
                      value={formData.jobTitle} onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 text-sm text-zinc-900 focus:outline-none focus:border-[#E87F24] transition-colors cursor-pointer"
                    >
                      <option value="HR Manager">HR Manager</option>
                      <option value="Founder / CEO">Founder / CEO</option>
                      <option value="Recruiter">Recruiter</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Lokasi Perusahaan</label>
                    <select 
                      value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 text-sm text-zinc-900 focus:outline-none focus:border-[#E87F24] transition-colors cursor-pointer"
                    >
                      <option value="Jakarta">Jakarta</option>
                      <option value="Bandung">Bandung</option>
                      <option value="Surabaya">Surabaya</option>
                      <option value="Makassar">Makassar</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full mt-6 bg-gradient-to-r from-[#E87F24] to-[#FFC81E] hover:from-[#c96a1a] hover:to-[#e6b419] text-zinc-950 font-black py-4 rounded-2xl shadow-xl shadow-[#E87F24]/20 transition-all hover:scale-[1.01] cursor-pointer"
                >
                  Lanjutkan Pendaftaran
                </button>
              </form>
            )}
          </div>

          {/* Kolom Kanan: Card Ilustrasi Preview Dinamis */}
          <div className="lg:col-span-5 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-[#E87F24]/20 rounded-[2.5rem] p-8 md:p-10 space-y-6 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-200 shadow-sm flex items-center justify-center text-[#E87F24]">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 text-xl">Sistem Penilaian AI Aktif</h3>
              <p className="text-zinc-500 text-sm mt-2 leading-relaxed">
                Hasilkan laporan skor kecocokan pelamar secara otomatis menggunakan model analitik yang paling disesuaikan untuk perusahaan Anda.
              </p>
            </div>
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">Kandidat Terverifikasi</span>
                <span className="text-xs font-mono text-zinc-400">Match: 98%</span>
              </div>
              <div className="h-3 w-full bg-zinc-100 rounded-full"></div>
              <div className="h-3 w-2/3 bg-zinc-100 rounded-full"></div>
            </div>
          </div>

        </div>

      </div>

      {/* STICKY FLOATING BANNER BAWAH */}
      <div className="fixed bottom-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto bg-white/95 text-zinc-900 py-3.5 px-6 rounded-full shadow-[0_15px_40px_rgba(0,0,0,0.15)] border border-zinc-200/80 flex items-center gap-6 backdrop-blur-xl">
          <div className="text-xs sm:text-sm font-bold flex items-center gap-2.5 whitespace-nowrap">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E87F24] animate-ping shrink-0"></span>
            <span>
              Kelola Rekrutmen Anda Mulai dari <span className="text-[#E87F24] font-black underline decoration-wavy">Rp249.000/bulan</span>
            </span>
          </div>
          <button 
            onClick={() => window.scrollTo({ top: 1000, behavior: 'smooth' })}
            className="bg-zinc-900 hover:bg-zinc-800 text-white font-black text-xs sm:text-sm px-6 py-2.5 rounded-full shadow-md transition-transform hover:scale-105 shrink-0 cursor-pointer whitespace-nowrap"
          >
            Daftar Sekarang!
          </button>
        </div>
      </div>

    </div>
  );
}