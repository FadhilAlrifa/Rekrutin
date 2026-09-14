import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Mail, Phone, CheckCircle2, XCircle, Award, Users, Sparkles, Briefcase } from 'lucide-react';
import CandidateDetailPage from './CandidateDetailPage';

export default function TalentPoolPage({ applicants, controller, onOpenNewJobModal }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  if (selectedCandidate) {
    return (
      <CandidateDetailPage 
        candidate={selectedCandidate} 
        onBack={() => setSelectedCandidate(null)}
        onUpdateStatus={(id, status) => {
          controller.handleUpdateStatus(id, status);
          setSelectedCandidate(prev => ({ ...prev, status }));
        }}
      />
    );
  }

  const filteredApplicants = applicants.filter(app => 
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    app.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper warna badge status
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Siap Wawancara':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Wawancara Selesai':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Ditolak':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-orange-50 text-orange-700 border-orange-200';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn font-sans pb-16">
      
      {/* ================= HERO HEADER HALAMAN ================= */}
      <div className="relative bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 text-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl overflow-hidden border border-zinc-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#E87F24]/20 via-[#FFC81E]/10 to-transparent blur-[80px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="bg-[#E87F24]/20 text-[#FFC81E] border border-[#E87F24]/30 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5">
              <Users size={14} /> Database Pelamar Enterprise
            </span>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Talent Pool Perusahaan</h1>
            <p className="text-zinc-400 text-sm font-medium max-w-xl">
              Tinjau profil kandidat, saringan skor AI, dan kelola alur rekrutmen tim Anda secara visual dan terpusat.
            </p>
          </div>

          <button 
            onClick={onOpenNewJobModal}
            className="bg-gradient-to-r from-[#E87F24] to-[#FFC81E] hover:from-[#d66f1e] hover:to-[#eeb717] text-zinc-950 font-black px-6 py-3.5 rounded-2xl shadow-xl transition-transform hover:scale-105 flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus size={18} /> Buka Lowongan Baru
          </button>
        </div>
      </div>

      {/* ================= STATISTIK RINGKAS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-zinc-200/80 p-6 rounded-3xl shadow-sm space-y-2">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Pelamar Masuk</p>
          <div className="text-3xl font-black text-zinc-900">{applicants.length} Kandidat</div>
          <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">Sinkronisasi cloud otomatis aktif</p>
        </div>
        <div className="bg-white border border-zinc-200/80 p-6 rounded-3xl shadow-sm space-y-2">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Lolos Filter AI (&gt;90%)</p>
          <div className="text-3xl font-black text-[#E87F24]">
            {applicants.filter(a => parseInt(a.score) >= 90).length} Orang
          </div>
          <p className="text-xs font-bold text-zinc-500">Prioritas wawancara tinggi</p>
        </div>
        <div className="bg-zinc-900 text-white p-6 rounded-3xl shadow-md space-y-2">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Status Paket Aktif</p>
          <div className="text-xl font-black text-[#FFC81E]">Enterprise Free Trial</div>
          <p className="text-xs text-zinc-400 font-medium">Berlaku hingga 14 hari ke depan</p>
        </div>
      </div>

      {/* ================= BAR PENCARIAN ================= */}
      <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-base font-extrabold text-zinc-900">Daftar Kartu Kandidat</h3>
          <p className="text-xs text-zinc-400 font-medium">Klik pada kartu untuk melihat laporan detail dan dokumen lengkap.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input 
            type="text" placeholder="Cari nama atau posisi..." 
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 pl-10 text-xs text-zinc-900 focus:outline-none focus:border-[#E87F24] transition-colors"
          />
        </div>
      </div>

      {/* ================= GRID CARD KANDIDAT (DESAIN BARU) ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredApplicants.map((item) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setSelectedCandidate(item)}
            className="bg-white border border-zinc-200/80 rounded-[2.5rem] p-7 shadow-sm hover:shadow-xl hover:border-[#E87F24]/50 transition-all duration-300 flex flex-col justify-between space-y-6 group cursor-pointer relative overflow-hidden"
          >
            {/* Aksen Garis Atas Card */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#E87F24] to-[#FFC81E] opacity-0 group-hover:opacity-100 transition-opacity"></div>

            {/* Bagian Atas Card */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-200 border border-zinc-200 flex items-center justify-center font-black text-zinc-800 text-lg shadow-inner group-hover:scale-105 transition-transform">
                  {item.name.split(' ').map(n => n[0]).join('')}
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 shadow-sm">
                    <Award size={13} className="text-emerald-600" /> {item.score} Match
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${getStatusBadgeColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-extrabold text-zinc-900 text-lg group-hover:text-[#E87F24] transition-colors">{item.name}</h4>
                <p className="text-xs font-extrabold text-[#E87F24] bg-orange-50 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg mt-1.5 border border-orange-100">
                  <Briefcase size={12} /> {item.role}
                </p>
              </div>

              {/* Kontak Informasi */}
              <div className="space-y-1.5 pt-3 border-t border-zinc-100 text-xs text-zinc-500 font-medium">
                <div className="flex items-center gap-2 truncate">
                  <Mail size={13} className="text-zinc-400 shrink-0" />
                  <span className="truncate">{item.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={13} className="text-zinc-400 shrink-0" />
                  <span>{item.phone}</span>
                </div>
              </div>
            </div>

            {/* Bagian Bawah Card (Tombol Aksi Cepat) */}
            <div className="space-y-3 pt-4 border-t border-zinc-100" onClick={(e) => e.stopPropagation()}>
              <div className="grid grid-cols-2 gap-2.5">
                <button 
                  onClick={() => controller.handleUpdateStatus(item.id, 'Siap Wawancara')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                >
                  <CheckCircle2 size={14} /> Terima
                </button>
                <button 
                  onClick={() => controller.handleUpdateStatus(item.id, 'Ditolak')}
                  className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <XCircle size={14} /> Tolak
                </button>
              </div>
            </div>

          </motion.div>
        ))}
      </div>

      {filteredApplicants.length === 0 && (
        <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-12 text-center space-y-3">
          <p className="text-zinc-400 font-medium text-sm">Tidak ada kandidat yang cocok dengan pencarian "{searchTerm}".</p>
        </div>
      )}

    </div>
  );
}