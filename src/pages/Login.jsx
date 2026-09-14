import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, ShieldCheck, UserCheck, Briefcase, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [selectedRole, setSelectedRole] = useState('hrd'); // 'hrd', 'interviewer', 'candidate'
  const [email, setEmail] = useState('hrd.manager@duluin.com');
  const [password, setPassword] = useState('••••••••••••');

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    if (role === 'hrd') {
      setEmail('hrd.manager@duluin.com');
    } else if (role === 'interviewer') {
      setEmail('interviewer.lead@duluin.com');
    } else {
      setEmail('andi.pratama@example.com');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Kirim role yang dipilih ke komponen utama App/Router untuk merender halaman yang sesuai
    onLoginSuccess(selectedRole);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex items-center justify-center p-6 relative overflow-hidden selection:bg-[#E87F24] selection:text-white">
      
      {/* Ornamen Background Glow Cahaya Oranye */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[#E87F24]/20 via-[#FFC81E]/10 to-transparent blur-[120px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-zinc-900/90 border border-zinc-800/80 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-10 shadow-2xl space-y-8 relative z-10"
      >
        
        {/* Logo & Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E87F24] to-[#FFC81E] items-center justify-center shadow-lg shadow-[#E87F24]/20 text-zinc-950 font-black">
            <Zap size={22} className="fill-zinc-950" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">RecruitIn Enterprise</h1>
            <p className="text-xs text-zinc-400 font-medium mt-1">Sistem Rekrutmen & Wawancara Mandiri Terpadu</p>
          </div>
        </div>

        {/* Pemilihan Role Cepat (Demo Selector) */}
        <div className="space-y-2">
          <label className="block text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider text-center">Pilih Mode Akses (Role)</label>
          <div className="grid grid-cols-3 gap-2 bg-zinc-950/80 p-1.5 rounded-2xl border border-zinc-800">
            <button 
              type="button"
              onClick={() => handleRoleSelect('hrd')}
              className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex flex-col items-center gap-1 ${selectedRole === 'hrd' ? 'bg-gradient-to-r from-[#E87F24] to-[#FFC81E] text-zinc-950 shadow-md' : 'text-zinc-400 hover:text-white'}`}
            >
              <ShieldCheck size={16} /> HRD
            </button>
            <button 
              type="button"
              onClick={() => handleRoleSelect('interviewer')}
              className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex flex-col items-center gap-1 ${selectedRole === 'interviewer' ? 'bg-gradient-to-r from-[#E87F24] to-[#FFC81E] text-zinc-950 shadow-md' : 'text-zinc-400 hover:text-white'}`}
            >
              <UserCheck size={16} /> User/Lead
            </button>
            <button 
              type="button"
              onClick={() => handleRoleSelect('candidate')}
              className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex flex-col items-center gap-1 ${selectedRole === 'candidate' ? 'bg-gradient-to-r from-[#E87F24] to-[#FFC81E] text-zinc-950 shadow-md' : 'text-zinc-400 hover:text-white'}`}
            >
              <Briefcase size={16} /> Pelamar
            </button>
          </div>
        </div>

        {/* Form Login */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-zinc-400 uppercase">Email Perusahaan / Akun</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3.5 pl-11 text-xs text-white focus:outline-none focus:border-[#E87F24] transition-colors font-medium"
                placeholder="nama@perusahaan.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-zinc-400 uppercase">Kata Sandi (Password)</label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3.5 pl-11 text-xs text-white focus:outline-none focus:border-[#E87F24] transition-colors font-medium"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <div className="bg-zinc-950/60 border border-zinc-800/80 p-3.5 rounded-2xl text-[11px] text-zinc-400 flex items-center gap-2.5">
            <Sparkles size={16} className="text-[#E87F24] shrink-0" />
            <span>Mode Aktif: <strong className="text-white uppercase">{selectedRole === 'hrd' ? 'HRD Manager' : selectedRole === 'interviewer' ? 'Technical Interviewer' : 'Candidate Portal'}</strong></span>
          </div>

          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-[#E87F24] to-[#FFC81E] hover:opacity-95 text-zinc-950 font-black py-4 rounded-2xl text-xs shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            Masuk ke Sistem <ArrowRight size={16} />
          </button>
        </form>

        <p className="text-center text-[10px] text-zinc-500 font-medium">
          Dilindungi oleh sistem keamanan Enterprise Enclave v3.2 & End-to-End Cloud Recording.
        </p>

      </motion.div>
    </div>
  );
}