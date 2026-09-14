import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Video, Mic, MicOff, VideoOff, PhoneOff, Edit3, Save, Sparkles, CheckCircle2, Clock, User, ShieldAlert } from 'lucide-react';

export default function InterviewRoomPage({ candidateName = "Andi Pratama", role = "Frontend Engineer", onBack }) {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isRecording, setIsRecording] = useState(true);
  const [notes, setNotes] = useState('');
  const [savedStatus, setSavedStatus] = useState(false);
  const [timer, setTimer] = useState(0);

  // Timer durasi wawancara otomatis
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveNotes = () => {
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header Ruangan & Kontrol Cepat */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white border border-zinc-200/80 px-6 py-4 rounded-3xl shadow-sm gap-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
          <div>
            <h2 className="font-extrabold text-zinc-900 text-base">Sesi Live: {candidateName} ({role})</h2>
            <p className="text-xs text-zinc-400 font-medium">Rekaman otomatis aktif • Durasi: <strong className="text-zinc-700">{formatTime(timer)}</strong></p>
          </div>
        </div>

        <button 
          onClick={onBack}
          className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-4 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer self-start md:self-auto"
        >
          <PhoneOff size={14} /> Akhiri & Keluar Sesi
        </button>
      </div>

      {/* Grid Utama: Layar Video Kiri & Notepad Kanan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* KOLOM KIRI: VIDEO STREAMING SIMULATION (8 Kolom) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Main Video Box */}
          <div className="relative w-full aspect-video bg-zinc-950 rounded-[2.5rem] overflow-hidden border border-zinc-800 shadow-2xl flex items-center justify-center">
            
            {/* Simulasi Wajah Kandidat */}
            {isVideoOn ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950 text-white p-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#E87F24] to-[#FFC81E] flex items-center justify-center text-zinc-950 font-black text-3xl shadow-lg mb-4">
                  {candidateName.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="text-lg font-bold">{candidateName}</h3>
                <p className="text-xs text-zinc-400">Kandidat Terhubung (WebRTC Secure Stream)</p>
              </div>
            ) : (
              <div className="text-center text-zinc-500 space-y-2">
                <VideoOff size={40} className="mx-auto" />
                <p className="text-xs font-bold">Kandidat Mematikan Kamera</p>
              </div>
            )}

            {/* Badge Auto-Recording di Pojok Kiri Atas */}
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full text-white text-[11px] font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              <span>Auto-Recording Cloud Active</span>
            </div>

            {/* Video Kecil (HRD) di Pojok Kanan Bawah */}
            <div className="absolute bottom-4 right-4 w-36 h-24 bg-zinc-900 border border-zinc-700 rounded-2xl overflow-hidden shadow-lg flex items-center justify-center text-zinc-400 text-xs">
              {isMicOn ? "Kamera Anda (HR)" : "Mic Muted"}
            </div>

            {/* Control Bar di Bawah Video */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-full flex items-center gap-4 text-white">
              <button 
                onClick={() => setIsMicOn(!isMicOn)}
                className={`p-3 rounded-full transition-colors cursor-pointer ${isMicOn ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500 text-white'}`}
              >
                {isMicOn ? <Mic size={18} /> : <MicOff size={18} />}
              </button>

              <button 
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-3 rounded-full transition-colors cursor-pointer ${isVideoOn ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500 text-white'}`}
              >
                {isVideoOn ? <Video size={18} /> : <VideoOff size={18} />}
              </button>
            </div>

          </div>

          <div className="bg-orange-50 border border-orange-200 p-4 rounded-2xl text-xs text-orange-900 flex items-center gap-3">
            <Sparkles size={18} className="text-[#E87F24] shrink-0" />
            <span>Sistem mandiri RecruitIn merekam audio dan video sesi ini ke *cloud storage* secara otomatis. Transkrip AI akan tersedia setelah wawancara selesai.</span>
          </div>

        </div>

        {/* KOLOM KANAN: NOTEPAD PINTAR HR (4 Kolom) */}
        <div className="lg:col-span-4 bg-white border border-zinc-200/80 rounded-[2.5rem] p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 size={18} className="text-[#E87F24]" />
                <h3 className="font-bold text-zinc-900 text-sm">Notepad Penilaian HR</h3>
              </div>
              <span className="text-[10px] font-bold bg-zinc-100 text-zinc-500 px-2.5 py-1 rounded-md">Real-time Save</span>
            </div>

            <p className="text-xs text-zinc-500 font-medium">
              Tulis catatan penting, penilaian teknis, atau poin pertanyaan untuk kandidat selama wawancara berlangsung.
            </p>

            <textarea 
              rows="10"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Penguasaan framework sangat baik, komunikasi jelas, memiliki pengalaman dengan arsitektur mikroservis..."
              className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-xs text-zinc-900 focus:outline-none focus:border-[#E87F24] transition-colors resize-none font-medium leading-relaxed"
            ></textarea>
          </div>

          <div className="space-y-2 pt-2">
            {savedStatus && (
              <div className="text-emerald-600 text-xs font-bold flex items-center gap-1.5 justify-center py-1">
                <CheckCircle2 size={14} /> Catatan berhasil disimpan ke profil kandidat!
              </div>
            )}
            <button 
              onClick={handleSaveNotes}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-3 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save size={14} /> Simpan Catatan Sesi
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}