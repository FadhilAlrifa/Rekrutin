import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, MapPin, Clock, Search, ArrowRight, Sparkles, Building2, CheckCircle2, X, Upload, User, Mail, Phone } from 'lucide-react';

export default function JobBoardPage({ onBackToHome, onSubmitApplication }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState(null); // Jika pelamar klik lamar, buka modal form

  // State untuk form lamaran publik
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cvFile: null
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Daftar lowongan pekerjaan terbuka
  const jobListings = [
    {
      id: 1,
      title: "Senior Frontend Engineer",
      department: "Engineering",
      location: "Makassar / Remote",
      type: "Full-time",
      salary: "Rp 10jt - 15jt",
      desc: "Kami mencari Frontend Engineer berpengalaman yang menguasai React.js, Tailwind CSS, dan arsitektur komponen modern untuk membangun antarmuka web skala enterprise."
    },
    {
      id: 2,
      title: "Backend Developer (Node.js)",
      department: "Engineering",
      location: "Makassar (Hybrid)",
      type: "Full-time",
      salary: "Rp 9jt - 13jt",
      desc: "Bertanggung jawab merancang RESTful API berkecepatan tinggi, pengelolaan database MySQL/ClickHouse, serta integrasi keamanan sistem backend."
    },
    {
      id: 3,
      title: "UI/UX Product Designer",
      department: "Product",
      location: "Remote",
      type: "Full-time",
      salary: "Rp 8jt - 12jt",
      desc: "Merancang pengalaman pengguna yang intuitif, membuat wireframe, design system, dan prototipe interaktif untuk produk SaaS B2B."
    },
    {
      id: 4,
      title: "HR & Talent Acquisition Specialist",
      department: "Human Resources",
      location: "Makassar",
      type: "Full-time",
      salary: "Rp 6jt - 9jt",
      desc: "Mengelola proses rekrutmen end-to-end, penjawalan wawancara mandiri, serta penyaringan kandidat menggunakan sistem otomatisasi AI."
    }
  ];

  const filteredJobs = jobListings.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmitForm = (e) => {
    e.preventDefault();
    // Kirim data lamaran ke fungsi penampung (masuk ke talent pool HRD)
    if (onSubmitApplication) {
      onSubmitApplication({
        id: Date.now(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: selectedJob.title,
        score: '92%', // Simulasi hasil saringan awal AI
        status: 'Review AI'
      });
    }
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setSelectedJob(null);
      setFormData({ name: '', email: '', phone: '', cvFile: null });
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-[#E87F24] selection:text-white">
      
      {/* ================= HEADER KARIER PUBLIK ================= */}
      <header className="border-b border-zinc-800/80 bg-zinc-900/50 backdrop-blur-xl px-6 md:px-12 py-5 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={onBackToHome}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#E87F24] to-[#FFC81E] flex items-center justify-center text-zinc-950 font-black shadow-lg">
            D
          </div>
          <div>
            <span className="font-black text-base text-white block leading-tight">Duluin Careers<span className="text-[#E87F24]">.</span></span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Powered by RecruitIn</span>
          </div>
        </div>

        <button 
          onClick={onBackToHome}
          className="text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
        >
          Kembali ke Beranda
        </button>
      </header>

      {/* ================= HERO SECTION ================= */}
      <section className="relative px-6 md:px-12 py-20 max-w-5xl mx-auto text-center space-y-6 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-[#E87F24]/20 to-[#FFC81E]/10 blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 space-y-4">
          <span className="bg-[#E87F24]/20 text-[#FFC81E] border border-[#E87F24]/30 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5">
            <Sparkles size={14} /> Bergabung Bersama Tim Kami
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
            Temukan Karier Impian Anda di Sini
          </h1>
          <p className="text-zinc-400 text-sm md:text-base max-w-2xl mx-auto font-medium leading-relaxed">
            Kami membangun produk teknologi masa depan untuk startup dan perusahaan enterprise. Wujudkan potensi terbaik Anda bersama ekosistem Duluin.
          </p>
        </div>

        {/* Bar Pencarian Lowongan */}
        <div className="relative max-w-xl mx-auto pt-4">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-[20%] text-zinc-400" />
          <input 
            type="text" 
            placeholder="Cari posisi atau departemen (contoh: Frontend, Engineer)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-4 pl-12 text-xs text-white focus:outline-none focus:border-[#E87F24] transition-colors shadow-2xl"
          />
        </div>
      </section>

      {/* ================= DAFTAR KARTU LOWONGAN ================= */}
      <section className="px-6 md:px-12 max-w-5xl mx-auto pb-24 space-y-4">
        <div className="flex items-center justify-between text-xs text-zinc-400 font-bold px-2">
          <span>Menampilkan {filteredJobs.length} Posisi Terbuka</span>
          <span>Sistem Seleksi AI Otomatis</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredJobs.map((job) => (
            <motion.div 
              key={job.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900/90 border border-zinc-800/80 hover:border-[#E87F24]/60 rounded-[2.5rem] p-7 md:p-8 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl group"
            >
              <div className="space-y-3 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-orange-500/10 text-[#FFC81E] border border-orange-500/20 text-[11px] font-black px-3 py-1 rounded-full">
                    {job.department}
                  </span>
                  <span className="bg-zinc-800 text-zinc-300 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <MapPin size={12} className="text-[#E87F24]" /> {job.location}
                  </span>
                  <span className="bg-zinc-800 text-zinc-300 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Clock size={12} /> {job.type}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-black text-white group-hover:text-[#FFC81E] transition-colors">{job.title}</h3>
                  <p className="text-xs text-zinc-400 font-medium mt-1 leading-relaxed">{job.desc}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col items-end justify-between md:justify-center gap-3 shrink-0">
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 px-3 py-1.5 rounded-xl">
                  {job.salary}
                </span>
                <button 
                  onClick={() => setSelectedJob(job)}
                  className="bg-gradient-to-r from-[#E87F24] to-[#FFC81E] hover:opacity-90 text-zinc-950 font-black px-6 py-3 rounded-xl text-xs shadow-lg transition-transform hover:scale-105 flex items-center gap-2 cursor-pointer"
                >
                  Lamar Sekarang <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-12 text-center space-y-3">
            <p className="text-zinc-400 text-sm font-medium">Tidak ada lowongan yang cocok dengan pencarian "{searchTerm}".</p>
          </div>
        )}
      </section>

      {/* ================= MODAL FORMULIR LAMARAN ================= */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 p-8 md:p-10 rounded-[2.5rem] max-w-lg w-full shadow-2xl space-y-6 relative overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div>
                  <span className="text-[10px] font-black text-[#FFC81E] uppercase tracking-wider">Formulir Pendaftaran</span>
                  <h3 className="text-xl font-black text-white mt-0.5">{selectedJob.title}</h3>
                </div>
                <button 
                  onClick={() => setSelectedJob(null)}
                  className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {isSubmitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 className="text-xl font-black text-white">Lamaran Berhasil Dikirim!</h4>
                  <p className="text-xs text-zinc-400 max-w-xs mx-auto font-medium">
                    Data dan CV Anda telah masuk ke sistem Talent Pool Duluin. Tim HRD kami akan segera meninjau hasil saringan AI.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitForm} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-zinc-400 uppercase">Nama Lengkap</label>
                    <div className="relative">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input 
                        type="text" required placeholder="Contoh: Rian Ardiansyah"
                        value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3.5 pl-11 text-xs text-white focus:outline-none focus:border-[#E87F24]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-zinc-400 uppercase">Email Aktif</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input 
                          type="email" required placeholder="nama@domain.com"
                          value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3.5 pl-11 text-xs text-white focus:outline-none focus:border-[#E87F24]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-zinc-400 uppercase">Nomor WhatsApp</label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input 
                          type="text" required placeholder="0812xxxxxxxx"
                          value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3.5 pl-11 text-xs text-white focus:outline-none focus:border-[#E87F24]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-zinc-400 uppercase">Unggah Dokumen CV (PDF)</label>
                    <div className="border-2 border-dashed border-zinc-800 bg-zinc-950 rounded-2xl p-6 text-center space-y-2 hover:border-[#E87F24] transition-colors cursor-pointer">
                      <Upload size={24} className="mx-auto text-[#E87F24]" />
                      <p className="text-xs text-zinc-300 font-bold">Seret file ke sini atau klik untuk memilih</p>
                      <p className="text-[10px] text-zinc-500">Format PDF maks. 5MB (Sistem AI akan otomatis membaca CV Anda)</p>
                      <input 
                        type="file" accept=".pdf" required 
                        onChange={(e) => setFormData({...formData, cvFile: e.target.files[0]})}
                        className="w-full opacity-0 cursor-pointer absolute inset-0 hidden" 
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-3">
                    <button type="button" onClick={() => setSelectedJob(null)} className="px-5 py-3 rounded-2xl text-xs font-bold text-zinc-400 hover:bg-zinc-800 cursor-pointer">Batal</button>
                    <button type="submit" className="bg-gradient-to-r from-[#E87F24] to-[#FFC81E] text-zinc-950 px-6 py-3.5 rounded-2xl text-xs font-black shadow-lg cursor-pointer">Kirim Lamaran</button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}