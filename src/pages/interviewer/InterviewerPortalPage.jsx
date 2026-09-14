import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Video, Award, CheckCircle2, LogOut, Sparkles, FileText, Check, Star } from 'lucide-react';
import InterviewRoomPage from '../dashboard/InterviewRoomPage'; // Memanfaatkan ruang wawancara mandiri

export default function InterviewerPortalPage({ onLogout }) {
  const [activeInterview, setActiveInterview] = useState(null);
  
  // Daftar kandidat yang ditugaskan kepada Interviewer ini untuk diuji
  const [assignedCandidates, setAssignedCandidates] = useState([
    { id: 1, name: "Andi Pratama", role: "Frontend Engineer", date: "15 Sep 2026", time: "10:00 WITA", status: "Belum Dinilai", scoreTech: null },
    { id: 2, name: "Budi Santoso", role: "Backend Developer", date: "16 Sep 2026", time: "13:30 WITA", status: "Selesai Dinilai", scoreTech: "88/100" },
  ]);

  const [selectedForReview, setSelectedForReview] = useState(null);
  const [evalForm, setEvalForm] = useState({ codingScore: 90, communication: 85, notes: '' });
  const [successMsg, setSuccessMsg] = useState(false);

  // Jika Interviewer menekan tombol masuk ruang wawancara mandiri
  if (activeInterview) {
    return (
      <div className="min-h-screen bg-zinc-50 p-6 md:p-10 font-sans">
        <InterviewRoomPage 
          candidateName={activeInterview.name} 
          role={activeInterview.role} 
          onBack={() => setActiveInterview(null)} 
        />
      </div>
    );
  }

  const handleSaveEvaluation = (e) => {
    e.preventDefault();
    setAssignedCandidates(assignedCandidates.map(c => 
      c.id === selectedForReview.id ? { ...c, status: 'Selesai Dinilai', scoreTech: `${evalForm.codingScore}/100` } : c
    ));
    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
      setSelectedForReview(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans flex flex-col">
      
      {/* Top Navbar Interviewer */}
      <header className="bg-white border-b border-zinc-200 px-6 md:px-12 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#E87F24] to-[#FFC81E] flex items-center justify-center text-zinc-950 font-black shadow-md">
            IV
          </div>
          <div>
            <span className="font-black text-base text-zinc-900 block leading-tight">RecruitIn<span className="text-[#E87F24]">.</span></span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Technical Interviewer Portal</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-zinc-900">Rian (Lead Engineering)</p>
            <p className="text-[10px] font-bold text-[#E87F24]">Technical Assessor</p>
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

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-10 space-y-8">
        
        {/* Banner Hero */}
        <div className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 text-white rounded-[2.5rem] p-8 md:p-10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#E87F24]/20 to-transparent blur-[70px] pointer-events-none"></div>
          
          <div className="relative z-10 space-y-3">
            <span className="bg-[#E87F24]/20 text-[#FFC81E] border border-[#E87F24]/30 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5">
              <Users size={13} /> Panel Penilaian Teknis
            </span>
            <h1 className="text-2xl md:text-3xl font-black">Halo, Rian!</h1>
            <p className="text-zinc-400 text-xs md:text-sm font-medium max-w-lg leading-relaxed">
              Berikut adalah daftar kandidat yang ditugaskan kepada Anda untuk diuji kemampuan teknis, logika pemrograman, dan arsitekturnya.
            </p>
          </div>
        </div>

        {/* Modal Lembar Penilaian Teknis */}
        {selectedForReview ? (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-zinc-200 rounded-[2.5rem] p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-zinc-900">Lembar Penilaian: {selectedForReview.name}</h3>
                <p className="text-xs text-zinc-400 font-medium">Posisi: {selectedForReview.role}</p>
              </div>
              <button onClick={() => setSelectedForReview(null)} className="text-xs font-bold text-zinc-500 hover:text-zinc-900">Tutup Lembar</button>
            </div>

            <form onSubmit={handleSaveEvaluation} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Skor Logika & Coding (0-100)</label>
                  <input 
                    type="number" min="0" max="100" required
                    value={evalForm.codingScore} onChange={(e) => setEvalForm({...evalForm, codingScore: e.target.value})}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-xs font-bold text-zinc-800 focus:outline-none focus:border-[#E87F24]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Skor Komunikasi & Problem Solving</label>
                  <input 
                    type="number" min="0" max="100" required
                    value={evalForm.communication} onChange={(e) => setEvalForm({...evalForm, communication: e.target.value})}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-xs font-bold text-zinc-800 focus:outline-none focus:border-[#E87F24]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Catatan Evaluasi Teknis</label>
                <textarea 
                  rows="4" required
                  placeholder="Contoh: Pemahaman terhadap struktur algoritma sangat baik, mampu menjelaskan solusi dengan efisien..."
                  value={evalForm.notes} onChange={(e) => setEvalForm({...evalForm, notes: e.target.value})}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-xs font-medium text-zinc-800 focus:outline-none focus:border-[#E87F24] resize-none"
                ></textarea>
              </div>

              {successMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-2xl text-xs font-bold text-center">
                  Berhasil! Penilaian teknis telah disinkronkan ke profil kandidat.
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setSelectedForReview(null)} className="px-5 py-3 rounded-2xl text-xs font-bold text-zinc-600 hover:bg-zinc-100 cursor-pointer">Batal</button>
                <button type="submit" className="bg-gradient-to-r from-[#E87F24] to-[#FFC81E] text-zinc-950 px-6 py-3 rounded-2xl text-xs font-black shadow-md cursor-pointer">Simpan Penilaian</button>
              </div>
            </form>
          </motion.div>
        ) : (
          /* Daftar Kandidat yang Ditugaskan */
          <div className="space-y-6">
            <h3 className="font-extrabold text-zinc-900 text-base">Daftar Kandidat Penugasan Anda</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {assignedCandidates.map((item) => (
                <div key={item.id} className="bg-white border border-zinc-200/80 rounded-[2.5rem] p-7 shadow-sm space-y-5 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="bg-orange-50 text-[#E87F24] border border-orange-200 text-xs font-bold px-3 py-1 rounded-full">
                        {item.date} • {item.time}
                      </span>
                      <span className={`text-[10px] font-black px-3 py-1 rounded-lg ${item.status === 'Selesai Dinilai' ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-600'}`}>
                        {item.status} {item.scoreTech && `(${item.scoreTech})`}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-black text-zinc-900 text-lg">{item.name}</h4>
                      <p className="text-xs font-bold text-[#E87F24] mt-0.5">{item.role}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-100 flex items-center justify-between gap-2">
                    <button 
                      onClick={() => setActiveInterview(item)}
                      className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Video size={14} /> Masuk Sesi
                    </button>
                    <button 
                      onClick={() => setSelectedForReview(item)}
                      className="bg-orange-50 hover:bg-orange-100 text-[#E87F24] border border-orange-200 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Star size={14} /> Beri Nilai Teknis
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}