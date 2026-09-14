import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, Video, Plus, User, Briefcase, CheckCircle, CalendarDays, X, Sparkles, AlertCircle } from 'lucide-react';
import InterviewRoomPage from './InterviewRoomPage';

export default function SchedulePage() {
  const [schedules, setSchedules] = useState([
    { id: 1, candidate: "Andi Pratama", role: "Frontend Engineer", date: "2026-09-15", time: "10:00", type: "Technical Interview", interviewer: "Rian (Lead Dev)" },
    { id: 2, candidate: "Budi Santoso", role: "Backend Developer", date: "2026-09-14", time: "14:10", type: "HR Screening", interviewer: "Sarah (HR Manager)" }, // Contoh hari ini jam 14:10
  ]);

  const [activeInterview, setActiveInterview] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: '' });

  const [formInput, setFormInput] = useState({
    candidate: 'Andi Pratama',
    role: 'Frontend Engineer',
    date: '2026-09-18',
    time: '14:00',
    type: 'Technical Interview',
    interviewer: 'Tim Engineering Duluin'
  });

  if (activeInterview) {
    return (
      <InterviewRoomPage 
        candidateName={activeInterview.candidate} 
        role={activeInterview.role} 
        onBack={() => setActiveInterview(null)} 
      />
    );
  }

  // Validasi Waktu: Hanya bisa masuk 10 menit sebelum jadwal atau sesudahnya
  const handleTryEnterRoom = (item) => {
    const now = new Date(); // Waktu saat ini (14 September 2026, 13:59)
    const [hours, minutes] = item.time.split(':').map(Number);
    
    // Gabungkan tanggal dan waktu jadwal
    const scheduleDate = new Date(item.date);
    scheduleDate.setHours(hours, minutes, 0, 0);

    // Hitung batas waktu mulai (10 menit sebelum jadwal)
    const openingTime = new Date(scheduleDate.getTime() - 10 * 60 * 1000);

    if (now < openingTime) {
      // Jika belum waktunya (lebih dari 10 menit sebelum jadwal)
      setAlertModal({
        isOpen: true,
        message: `Belum waktunya! Ruang wawancara untuk ${item.candidate} baru akan dibuka pada ${item.date} pukul ${item.time} WITA (dapat diakses 10 menit sebelum jadwal).`
      });
    } else {
      // Jika sudah masuk rentang waktu (10 menit sebelum atau sesudahnya)
      setActiveInterview(item);
    }
  };

  const handleAddSchedule = (e) => {
    e.preventDefault();
    if (formInput.candidate && formInput.role) {
      setSchedules([...schedules, { id: Date.now(), ...formInput }]);
      setModalOpen(false);
    }
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return '';
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  return (
    <div className="space-y-8 animate-fadeIn font-sans pb-16 max-w-5xl mx-auto">
      
      {/* ================= HERO HEADER HALAMAN ================= */}
      <div className="relative bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 text-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl overflow-hidden border border-zinc-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#E87F24]/20 via-[#FFC81E]/10 to-transparent blur-[80px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="bg-[#E87F24]/20 text-[#FFC81E] border border-[#E87F24]/30 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5">
              <CalendarDays size={14} /> Kalender Wawancara Mandiri
            </span>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Jadwal Sesi Virtual</h1>
            <p className="text-zinc-400 text-sm font-medium max-w-xl">
              Ruang meeting mandiri terkunci otomatis. Hanya dapat diakses mulai 10 menit sebelum jadwal sesi dimulai.
            </p>
          </div>

          <button 
            onClick={() => setModalOpen(true)}
            className="bg-gradient-to-r from-[#E87F24] to-[#FFC81E] hover:from-[#d66f1e] hover:to-[#eeb717] text-zinc-950 font-black px-6 py-3.5 rounded-2xl shadow-xl transition-transform hover:scale-105 flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus size={18} /> Atur Jadwal Baru
          </button>
        </div>
      </div>

      {/* ================= GRID KARTU JADWAL ================= */}
      {schedules.length === 0 ? (
        <div className="bg-white border border-zinc-200/80 rounded-[2.5rem] p-12 text-center py-20 space-y-4 shadow-sm">
          <CalendarIcon size={36} className="mx-auto text-[#E87F24]" />
          <h3 className="text-xl font-black text-zinc-900">Belum Ada Jadwal Wawancara Hari Ini</h3>
          <p className="text-zinc-500 text-sm max-w-md mx-auto font-medium">
            Gunakan tombol di atas untuk menambahkan jadwal wawancara baru dengan kandidat terpilih.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {schedules.map((item) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-zinc-200/80 rounded-[2.5rem] p-7 shadow-sm hover:shadow-xl hover:border-[#E87F24]/50 transition-all duration-300 flex flex-col justify-between space-y-6 group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#E87F24] to-[#FFC81E] opacity-0 group-hover:opacity-100 transition-opacity"></div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="bg-orange-50 text-[#E87F24] border border-orange-200 text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                    <Clock size={13} /> {formatDateDisplay(item.date)} • {item.time} WITA
                  </span>
                  <span className="text-[10px] font-black bg-zinc-100 text-zinc-700 px-3 py-1 rounded-lg">
                    {item.type || 'Interview'}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-zinc-900 flex items-center gap-2 group-hover:text-[#E87F24] transition-colors">
                    <User size={18} className="text-zinc-400" /> {item.candidate}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <p className="text-xs font-extrabold text-[#E87F24] bg-orange-50 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-orange-100">
                      <Briefcase size={12} /> {item.role}
                    </p>
                    {item.interviewer && (
                      <span className="text-xs font-bold text-zinc-500 bg-zinc-100 px-3 py-1 rounded-lg">
                        PIC: {item.interviewer}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                <button 
                  onClick={() => handleTryEnterRoom(item)}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold px-5 py-3 rounded-2xl transition-all shadow-md hover:scale-105 inline-flex items-center gap-2 cursor-pointer"
                >
                  <Video size={14} /> Masuk Ruang Wawancara
                </button>
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                  <CheckCircle size={14} /> Terkunci Aman
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ================= MODAL PERINGATAN WAKTU (RESTRICTION ALERT) ================= */}
      <AnimatePresence>
        {alertModal.isOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border border-zinc-200 p-8 rounded-[2.5rem] max-w-md w-full shadow-2xl space-y-6 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-amber-100 text-[#E87F24] flex items-center justify-center mx-auto shadow-inner">
                <AlertCircle size={32} />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-zinc-900">Akses Ruangan Belum Dibuka</h3>
                <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                  {alertModal.message}
                </p>
              </div>

              <button 
                onClick={() => setAlertModal({ isOpen: false, message: '' })}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-3.5 rounded-2xl text-xs transition-colors shadow-md cursor-pointer"
              >
                Mengerti, Tutup Peringatan
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL TAMBAH JADWAL ================= */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border border-zinc-200 p-8 rounded-[2.5rem] max-w-lg w-full shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-100 text-[#E87F24] flex items-center justify-center">
                    <CalendarDays size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-zinc-900">Atur Jadwal Wawancara</h3>
                    <p className="text-xs text-zinc-400 font-medium">Proteksi akses 10 menit sebelum sesi</p>
                  </div>
                </div>
                <button onClick={() => setModalOpen(false)} className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 cursor-pointer">
                  <X size={18} />
                </button>
              </div>
              
              <form onSubmit={handleAddSchedule} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Pilih Kandidat</label>
                    <select 
                      value={formInput.candidate}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormInput({...formInput, candidate: val, role: val === 'Andi Pratama' ? 'Frontend Engineer' : val === 'Siti Rahma' ? 'UI/UX Designer' : 'Backend Developer'});
                      }}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-xs font-bold text-zinc-800 focus:outline-none focus:border-[#E87F24]"
                    >
                      <option value="Andi Pratama">Andi Pratama (Frontend Engineer)</option>
                      <option value="Siti Rahma">Siti Rahma (UI/UX Designer)</option>
                      <option value="Budi Santoso">Budi Santoso (Backend Developer)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Jenis Sesi Wawancara</label>
                    <select 
                      value={formInput.type}
                      onChange={(e) => setFormInput({...formInput, type: e.target.value})}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-xs font-bold text-zinc-800 focus:outline-none focus:border-[#E87F24]"
                    >
                      <option value="HR Screening">HR Screening</option>
                      <option value="Technical Interview">Technical Interview</option>
                      <option value="User Interview">User Interview</option>
                      <option value="Final Offering">Final Offering</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Pilih Tanggal</label>
                    <input 
                      type="date" required
                      value={formInput.date} onChange={(e) => setFormInput({...formInput, date: e.target.value})}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-xs font-bold text-zinc-800 focus:outline-none focus:border-[#E87F24]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Pilih Waktu (Jam)</label>
                    <input 
                      type="time" required
                      value={formInput.time} onChange={(e) => setFormInput({...formInput, time: e.target.value})}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-xs font-bold text-zinc-800 focus:outline-none focus:border-[#E87F24]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Pewawancara / PIC HR</label>
                  <input 
                    type="text" required placeholder="Contoh: Sarah (HR Manager)"
                    value={formInput.interviewer} onChange={(e) => setFormInput({...formInput, interviewer: e.target.value})}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-xs font-bold text-zinc-800 focus:outline-none focus:border-[#E87F24]"
                  />
                </div>

                <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-[11px] text-amber-900 flex items-center gap-2">
                  <Sparkles size={16} className="text-[#E87F24] shrink-0" />
                  <span>Ruang meeting otomatis terkunci dan baru terbuka bagi HRD 10 menit sebelum jam sesi dimulai.</span>
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-3 rounded-2xl text-xs font-bold text-zinc-600 hover:bg-zinc-100 cursor-pointer">Batal</button>
                  <button type="submit" className="bg-gradient-to-r from-[#E87F24] to-[#FFC81E] text-zinc-950 px-6 py-3 rounded-2xl text-xs font-black hover:opacity-90 cursor-pointer shadow-md">Simpan & Buat Jadwal</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}