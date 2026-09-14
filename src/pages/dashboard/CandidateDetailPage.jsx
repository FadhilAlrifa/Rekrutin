import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Mail, Phone, Award, FileText, CheckCircle2, 
  XCircle, Sparkles, Briefcase, GraduationCap, Check, ShieldCheck, Download, ExternalLink 
} from 'lucide-react';

export default function CandidateDetailPage({ candidate, onBack, onUpdateStatus }) {
  // Mapping tahapan rekrutmen untuk tracker
  const stages = [
    { key: 'Review AI', label: 'Review AI', desc: 'Penyaringan otomatis CV' },
    { key: 'Siap Wawancara', label: 'Siap Interview', desc: 'Penjadwalan sesi meeting' },
    { key: 'Wawancara Selesai', label: 'Sesi Selesai', desc: 'Evaluasi & catatan HR' },
    { key: 'Diterima', label: 'Offering / Diterima', desc: 'Tahap penawaran kerja' }
  ];

  const [status, setStatus] = useState(candidate.status);

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    onUpdateStatus(candidate.id, newStatus);
  };

  const getCurrentStageIndex = () => {
    if (status === 'Diterima' || status === 'Offering') return 3;
    if (status === 'Wawancara Selesai') return 2;
    if (status === 'Siap Wawancara') return 1;
    return 0;
  };

  const activeIndex = getCurrentStageIndex();

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto pb-16 font-sans">
      
      {/* ================= TOP NAVIGATION & ACTIONS ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-xl border border-zinc-200/80 px-6 py-4 rounded-3xl shadow-sm">
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-2 text-zinc-600 hover:text-[#E87F24] font-bold text-sm transition-colors cursor-pointer group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Kembali ke Talent Pool
        </button>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleStatusChange('Siap Wawancara')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${status === 'Siap Wawancara' ? 'bg-emerald-600 text-white shadow-emerald-600/20' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'}`}
          >
            <CheckCircle2 size={14} /> Siap Interview
          </button>
          <button 
            onClick={() => handleStatusChange('Ditolak')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${status === 'Ditolak' ? 'bg-red-600 text-white shadow-red-600/20' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'}`}
          >
            <XCircle size={14} /> Tolak Lamaran
          </button>
        </div>
      </div>

      {/* ================= PROFILE HERO CARD ================= */}
      <div className="relative bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 text-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl overflow-hidden border border-zinc-800">
        
        {/* Ornamen Background Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#E87F24]/20 via-[#FFC81E]/10 to-transparent blur-[80px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#E87F24] to-[#FFC81E] text-zinc-950 flex items-center justify-center font-black text-3xl shadow-xl shrink-0">
              {candidate.name.split(' ').map(n => n[0]).join('')}
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">{candidate.name}</h1>
                <span className="bg-white/10 border border-white/20 text-[#FFC81E] px-3.5 py-1 rounded-full text-xs font-bold backdrop-blur-md">
                  {status}
                </span>
              </div>
              <p className="text-sm font-bold text-zinc-300">{candidate.role}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 font-medium pt-1">
                <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                  <Mail size={13} className="text-[#E87F24]" /> {candidate.email}
                </span>
                <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                  <Phone size={13} className="text-[#E87F24]" /> {candidate.phone}
                </span>
              </div>
            </div>
          </div>

          {/* Skor AI Box */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/15 p-6 rounded-3xl text-center shrink-0 w-full md:w-auto shadow-inner">
            <p className="text-[10px] font-black tracking-widest text-[#FFC81E] uppercase mb-1">AI Match Score</p>
            <div className="text-4xl font-black text-white flex items-center justify-center gap-1.5">
              <Award size={28} className="text-[#E87F24]" /> {candidate.score}
            </div>
            <p className="text-[11px] text-zinc-300 font-medium mt-1">Tingkat Kecocokan Tinggi</p>
          </div>

        </div>
      </div>

      {/* ================= MODERN INTERACTIVE PIPELINE TRACKER ================= */}
      <div className="bg-white border border-zinc-200/80 rounded-[2.5rem] p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-extrabold text-zinc-900 text-lg">Pipeline Tahapan Rekrutmen</h3>
            <p className="text-xs text-zinc-400 font-medium mt-0.5">Klik pada salah satu tahap di bawah untuk memperbarui status seleksi kandidat.</p>
          </div>
          <span className="bg-orange-50 text-[#E87F24] border border-orange-200 font-black text-xs px-4 py-1.5 rounded-full self-start sm:self-auto">
            Tahap Aktif: {status}
          </span>
        </div>

        <div className="relative pt-8 pb-4 px-2">
          {/* Garis Dasar Tracker */}
          <div className="absolute top-[42%] left-8 right-8 -translate-y-1/2 h-2 bg-zinc-100 rounded-full -z-0"></div>

          {/* Garis Progres Menyala */}
          <div 
            className="absolute top-[42%] left-8 -translate-y-1/2 h-2 bg-gradient-to-r from-[#E87F24] to-[#FFC81E] rounded-full transition-all duration-500 -z-0 shadow-sm"
            style={{ width: `${(activeIndex / (stages.length - 1)) * 100}%` }}
          ></div>

          {/* Node Milestones */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stages.map((stage, idx) => {
              const isCompleted = idx < activeIndex;
              const isCurrent = idx === activeIndex;

              return (
                <div 
                  key={stage.key}
                  onClick={() => handleStatusChange(stage.key)}
                  className={`flex flex-col items-center text-center group cursor-pointer p-4 rounded-3xl transition-all duration-300 ${
                    isCurrent 
                      ? 'bg-orange-50/80 border border-orange-200 shadow-sm scale-105' 
                      : 'hover:bg-zinc-50 border border-transparent'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-all duration-300 shadow-md ${
                    isCurrent 
                      ? 'bg-gradient-to-br from-[#E87F24] to-[#FFC81E] text-zinc-950 shadow-[#E87F24]/30 ring-4 ring-orange-100' 
                      : isCompleted 
                      ? 'bg-emerald-600 text-white shadow-emerald-600/20' 
                      : 'bg-white border-2 border-zinc-200 text-zinc-400 group-hover:border-[#E87F24]'
                  }`}>
                    {isCompleted ? <Check size={20} strokeWidth={3} /> : idx + 1}
                  </div>

                  <div className="mt-3 space-y-1">
                    <p className={`text-xs font-black ${
                      isCurrent ? 'text-[#E87F24]' : isCompleted ? 'text-zinc-900' : 'text-zinc-400'
                    }`}>
                      {stage.label}
                    </p>
                    <p className="text-[10px] text-zinc-400 font-medium leading-tight">
                      {stage.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= GRID KONTEN DETAIL (2 KOLOM) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Kolom Kiri: Analisis & Pengalaman (8 Kolom) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Kotak Analisis AI */}
          <div className="bg-white border border-zinc-200/80 rounded-[2.5rem] p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 text-zinc-900 font-extrabold text-base">
              <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#E87F24] flex items-center justify-center">
                <Sparkles size={18} />
              </div>
              <h2>Analisis Mendalam & Rekomendasi AI</h2>
            </div>
            <p className="text-sm text-zinc-600 font-medium leading-relaxed pl-1">
              Kandidat menunjukkan keunggulan luar biasa dalam penguasaan stack teknologi modern yang selaras dengan kebutuhan perusahaan. Berdasarkan evaluasi otomatis saringan CV, kandidat ini memiliki skor relevansi skill <strong className="text-zinc-900 font-bold">{candidate.score}</strong> dan sangat direkomendasikan untuk langsung dijadwalkan ke tahap wawancara teknis.
            </p>
          </div>

          {/* Kotak Riwayat Pengalaman */}
          <div className="bg-white border border-zinc-200/80 rounded-[2.5rem] p-8 shadow-sm space-y-6">
            <h3 className="font-extrabold text-zinc-900 text-base flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#E87F24] flex items-center justify-center">
                <Briefcase size={18} />
              </div>
              Riwayat Pengalaman Kerja
            </h3>
            
            <div className="space-y-6 border-l-2 border-zinc-100 pl-6 ml-4">
              <div className="space-y-1.5 relative">
                <div className="absolute -left-[33px] top-1.5 w-4 h-4 rounded-full bg-[#E87F24] border-4 border-white shadow-sm"></div>
                <h4 className="font-extrabold text-zinc-900 text-sm">Senior Developer / Tech Lead</h4>
                <p className="text-xs text-[#E87F24] font-bold">PT. Teknologi Solusi Utama • 2023 - Sekarang</p>
                <p className="text-xs text-zinc-500 font-medium leading-relaxed pt-1">
                  Memimpin pengembangan arsitektur sistem berbasis web skala enterprise, optimasi performa basis data, serta kolaborasi lintas divisi produk.
                </p>
              </div>

              <div className="space-y-1.5 relative">
                <div className="absolute -left-[33px] top-1.5 w-4 h-4 rounded-full bg-zinc-300 border-4 border-white shadow-sm"></div>
                <h4 className="font-extrabold text-zinc-900 text-sm">Fullstack Software Engineer</h4>
                <p className="text-xs text-zinc-500 font-bold">Digital Kreasi Nusantara • 2021 - 2023</p>
                <p className="text-xs text-zinc-500 font-medium leading-relaxed pt-1">
                  Mengembangkan aplikasi web responsif menggunakan React.js dan Node.js, integrasi payment gateway, serta penerapan unit testing secara rutin.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Kolom Kanan: Dokumen & Pendidikan (4 Kolom) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Kotak Dokumen Lampiran */}
          <div className="bg-white border border-zinc-200/80 rounded-[2.5rem] p-8 shadow-sm space-y-5">
            <h3 className="font-extrabold text-zinc-900 text-sm flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#E87F24] flex items-center justify-center">
                <FileText size={16} />
              </div>
              Dokumen CV & Portofolio
            </h3>

            <div className="bg-zinc-50 border border-zinc-200/80 p-4 rounded-2xl flex items-center justify-between group hover:border-[#E87F24] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black text-xs shadow-md">
                  PDF
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-900 truncate max-w-[140px]">CV_{candidate.name.replace(/\s+/g, '_')}.pdf</p>
                  <p className="text-[10px] text-zinc-400 font-medium">2.4 MB • Terverifikasi</p>
                </div>
              </div>
              <button 
                onClick={() => alert(`Simulasi: Mengunduh CV ${candidate.name}`)}
                className="w-9 h-9 rounded-xl bg-white border border-zinc-200 text-zinc-700 hover:bg-[#E87F24] hover:text-white hover:border-[#E87F24] transition-all flex items-center justify-center shadow-sm cursor-pointer"
                title="Unduh CV"
              >
                <Download size={14} />
              </button>
            </div>
          </div>

          {/* Kotak Pendidikan */}
          <div className="bg-white border border-zinc-200/80 rounded-[2.5rem] p-8 shadow-sm space-y-4">
            <h3 className="font-extrabold text-zinc-900 text-sm flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#E87F24] flex items-center justify-center">
                <GraduationCap size={16} />
              </div>
              Pendidikan Terakhir
            </h3>
            <div className="space-y-1">
              <p className="text-sm font-black text-zinc-900">S1 - Teknik Informatika</p>
              <p className="text-xs text-zinc-500 font-semibold">Universitas Hasanuddin</p>
              <span className="inline-block mt-2 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-black px-3 py-1 rounded-full">
                IPK: 3.85 / 4.00 (Cum Laude)
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}