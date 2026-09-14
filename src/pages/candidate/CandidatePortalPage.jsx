import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Calendar, CheckCircle2, Clock, FileText, LogOut, Video, Sparkles, Building2, User, Award, Check } from 'lucide-react';
import InterviewRoomPage from '../dashboard/InterviewRoomPage';

export default function CandidatePortalPage({ candidateData = { name: "Andi Pratama", role: "Frontend Engineer", email: "andi.pratama@example.com", phone: "+62 812-3456-7890", status: "Siap Wawancara", score: "94%" }, onLogout }) {
  const [activeTab, setActiveTab] = useState('status');
  const [isInInterview, setIsInInterview] = useState(false);

  // Tahapan rekrutmen pelamar untuk tracker
  const stages = [
    { key: 'Review AI', label: 'Review AI', desc: 'Penyaringan otomatis CV' },
    { key: 'Siap Wawancara', label: 'Wawancara Virtual', desc: 'Sesi meeting mandiri' },
    { key: 'Wawancara Selesai', label: 'Evaluasi User', desc: 'Penilaian teknis tim' },
    { key: 'Diterima', label: 'Offering Kerja', desc: 'Tahap penawaran akhir' }
  ];

  // Menentukan tahap aktif berdasarkan status
  const getCurrentStageIndex = () => {
    if (candidateData.status === 'Diterima' || candidateData.status === 'Offering') return 3;
    if (candidateData.status === 'Wawancara Selesai') return 2;
    if (candidateData.status === 'Siap Wawancara') return 1;
    return 0;
  };

  const activeIndex = getCurrentStageIndex();

  if (isInInterview) {
    return (
      <div className="min-h-screen bg-zinc-50 p-6 md:p-10 font-sans">
        <InterviewRoomPage 
          candidateName={candidateData.name} 
          role={candidateData.role} 
          onBack={() => setIsInInterview(false)} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans flex flex-col pb-16">
      
      {/* ================= NAVBAR PELAMAR ================= */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-zinc-200 px-6 md:px-12 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#E87F24] to-[#FFC81E] flex items-center justify-center text-zinc-950 font-black shadow-md">
            R
          </div>
          <div>
            <span className="font-black text-base text-zinc-900 block leading-tight">RecruitIn<span className="text-[#E87F24]">.</span></span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Candidate Portal</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-zinc-900">{candidateData.name}</p>
            <p className="text-[10px] font-bold text-[#E87F24]">{candidateData.role}</p>
          </div>
          <button 
            onClick={onLogout}
            className="p-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 transition-colors cursor-pointer"
            title="Keluar Portal"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-10 space-y-8">
        
        {/* Banner Hero Pelamar */}
        <div className="relative bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 text-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl overflow-hidden border border-zinc-800">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#E87F24]/20 via-[#FFC81E]/10 to-transparent blur-[80px] pointer-events-none"></div>
          
          <div className="relative z-10 space-y-3">
            <span className="bg-[#E87F24]/20 text-[#FFC81E] border border-[#E87F24]/30 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5">
              <Sparkles size={13} /> Status Rekrutmen Aktif
            </span>
            <h1 className="text-2xl md:text-3xl font-black">Halo, {candidateData.name}!</h1>
            <p className="text-zinc-400 text-xs md:text-sm font-medium max-w-lg leading-relaxed">
              Selamat datang di portal pelamar mandiri. Pantau tahapan seleksi lamaran Anda untuk posisi <strong className="text-white font-bold">{candidateData.role}</strong> secara real-time.
            </p>
          </div>
        </div>

        {/* Tab Navigasi Internal */}
        <div className="flex gap-2 border-b border-zinc-200 pb-2">
          <button 
            onClick={() => setActiveTab('status')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${activeTab === 'status' ? 'bg-[#E87F24] text-white shadow-md' : 'text-zinc-600 hover:bg-zinc-100'}`}
          >
            Status & Tracker Lamaran
          </button>
          <button 
            onClick={() => setActiveTab('interview')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${activeTab === 'interview' ? 'bg-[#E87F24] text-white shadow-md' : 'text-zinc-600 hover:bg-zinc-100'}`}
          >
            Jadwal & Ruang Wawancara
          </button>
        </div>

        {/* Konten Tab 1: Status & Tracker */}
        {activeTab === 'status' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Pipeline Tracker Pelamar */}
            <div className="bg-white border border-zinc-200/80 rounded-[2.5rem] p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-zinc-900 text-base">Tracker Tahapan Rekrutmen</h3>
                  <p className="text-xs text-zinc-400 font-medium">Progres seleksi Anda diperbarui otomatis oleh sistem HRD.</p>
                </div>
                <span className="bg-orange-50 text-[#E87F24] border border-orange-200 font-black text-xs px-3.5 py-1.5 rounded-full">
                  Status: {candidateData.status}
                </span>
              </div>

              <div className="relative pt-6 pb-2 px-2">
                <div className="absolute top-[42%] left-6 right-6 -translate-y-1/2 h-1.5 bg-zinc-100 rounded-full -z-0"></div>
                <div 
                  className="absolute top-[42%] left-6 -translate-y-1/2 h-1.5 bg-gradient-to-r from-[#E87F24] to-[#FFC81E] rounded-full transition-all duration-500 -z-0"
                  style={{ width: `${(activeIndex / (stages.length - 1)) * 100}%` }}
                ></div>

                <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {stages.map((stage, idx) => {
                    const isCompleted = idx < activeIndex;
                    const isCurrent = idx === activeIndex;

                    return (
                      <div key={stage.key} className="flex flex-col items-center text-center p-3 rounded-2xl">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs shadow-md transition-all ${
                          isCurrent 
                            ? 'bg-gradient-to-br from-[#E87F24] to-[#FFC81E] text-zinc-950 scale-110 ring-4 ring-orange-100' 
                            : isCompleted 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-white border-2 border-zinc-200 text-zinc-400'
                        }`}>
                          {isCompleted ? <Check size={16} strokeWidth={3} /> : idx + 1}
                        </div>
                        <div className="mt-2 space-y-0.5">
                          <p className={`text-xs font-bold ${isCurrent ? 'text-[#E87F24]' : isCompleted ? 'text-zinc-800' : 'text-zinc-400'}`}>
                            {stage.label}
                          </p>
                          <span className="text-[10px] text-zinc-400 block font-medium">
                            {isCurrent ? 'Tahap Aktif' : isCompleted ? 'Selesai' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Skor AI & Ringkasan Dokumen */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white border border-zinc-200/80 rounded-[2.5rem] p-7 shadow-sm space-y-3">
                <p className="text-xs font-bold text-zinc-400 uppercase">Skor Analisis AI Anda</p>
                <div className="text-3xl font-black text-emerald-700 flex items-center gap-2">
                  <Award size={26} className="text-emerald-600" /> {candidateData.score} Match
                </div>
                <p className="text-xs text-zinc-500 font-medium">CV Anda memenuhi kualifikasi tinggi untuk posisi ini.</p>
              </div>

              <div className="bg-white border border-zinc-200/80 rounded-[2.5rem] p-7 shadow-sm space-y-3">
                <p className="text-xs font-bold text-zinc-400 uppercase">Dokumen Terverifikasi</p>
                <div className="bg-zinc-50 border border-zinc-200 p-3.5 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3 truncate">
                    <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#E87F24] flex items-center justify-center font-bold text-xs shrink-0">
                      PDF
                    </div>
                    <span className="text-xs font-bold text-zinc-900 truncate">CV_{candidateData.name.replace(/\s+/g, '_')}.pdf</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg shrink-0">Valid</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Konten Tab 2: Jadwal & Ruang Wawancara */}
        {activeTab === 'interview' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white border border-zinc-200/80 rounded-[2.5rem] p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-zinc-900 text-base">Jadwal Sesi Wawancara Anda</h3>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3.5 py-1.5 rounded-full">
                  Terjadwal Aman
                </span>
              </div>

              <div className="bg-zinc-50 border border-zinc-200/80 p-6 rounded-3xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-zinc-400 uppercase">Waktu Pelaksanaan</p>
                    <p className="text-base font-black text-zinc-900 flex items-center gap-2">
                      <Clock size={16} className="text-[#E87F24]" /> 18 September 2026 • 14:00 WITA
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-zinc-400 uppercase">Pewawancara (PIC)</p>
                    <p className="text-xs font-extrabold text-zinc-800">Tim Engineering Duluin</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <p className="text-xs text-zinc-500 font-medium">
                    Ruang meeting mandiri siap diakses begitu waktu wawancara tiba.
                  </p>
                  <button 
                    onClick={() => setIsInInterview(true)}
                    className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold px-6 py-3.5 rounded-2xl shadow-md transition-all hover:scale-105 flex items-center gap-2 cursor-pointer"
                  >
                    <Video size={14} /> Masuk Ruang Wawancara Mandiri
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}