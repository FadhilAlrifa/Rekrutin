import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowLeft, Mail, CheckCircle2, Store } from 'lucide-react';
import { sendMagicLink } from '../../services/stockoService';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 20 } }
};

export default function Login({ onBack, onOpenRegister }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const result = await sendMagicLink(email);
    setLoading(false);

    if (result.success) {
      setSubmitted(true);
    } else {
      setErrorMessage(result.message || 'Gagal mengirim tautan masuk. Periksa kembali email Anda.');
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-[#E87F24] selection:text-white relative overflow-hidden flex flex-col justify-between">
      
      {/* Background Ornaments */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-20 pointer-events-none"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-gradient-to-b from-[#FEFDDF]/90 via-[#E87F24]/10 to-transparent rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      {/* NAVBAR */}
      <motion.nav 
        initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full top-0 z-50 px-4 md:px-6 py-4"
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
      <div className="max-w-md w-full mx-auto px-6 py-12 relative z-10 my-auto">
        <motion.div 
          initial="hidden" animate="show" variants={fadeUp}
          className="bg-white border border-zinc-200/80 rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-zinc-200/60 space-y-6"
        >
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-2xl font-black text-zinc-900">Tautan Masuk Terkirim!</h3>
              <p className="text-zinc-500 text-xs leading-relaxed max-w-xs mx-auto">
                Periksa kotak masuk email <strong className="text-zinc-900">{email}</strong>. Klik tautan verifikasi di dalam email tersebut untuk masuk secara otomatis.
              </p>
              <button onClick={() => setSubmitted(false)} className="mt-4 bg-zinc-900 text-white font-bold px-6 py-2.5 rounded-full text-xs cursor-pointer">
                Gunakan Email Lain
              </button>
            </div>
          ) : (
            <>
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E87F24] to-[#FFC81E] text-zinc-950 flex items-center justify-center mx-auto shadow-lg shadow-orange-500/20">
                  <Store size={26} />
                </div>
                <h2 className="text-2xl font-black text-zinc-900">Masuk Tanpa Sandi</h2>
                <p className="text-xs text-zinc-500 font-medium">Masukkan email terdaftar Anda untuk menerima Magic Link.</p>
              </div>

              {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold p-3 rounded-xl text-center">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Email Bisnis</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input 
                      type="email" required placeholder="toko@domain.com"
                      value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 pl-12 text-sm text-zinc-900 focus:outline-none focus:border-[#E87F24] transition-colors"
                    />
                  </div>
                </div>

                <button 
                  type="submit" disabled={loading}
                  className="w-full mt-2 bg-gradient-to-r from-[#E87F24] to-[#FFC81E] hover:from-[#c96a1a] hover:to-[#e6b419] text-zinc-950 font-black py-4 rounded-2xl shadow-xl shadow-[#E87F24]/20 transition-all hover:scale-[1.01] cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Mengirim Tautan...' : 'Kirim Magic Link Masuk'}
                </button>
              </form>

              <div className="text-center pt-4 border-t border-zinc-100">
                <p className="text-xs text-zinc-500 font-medium">
                  Belum punya akun Stocko?{' '}
                  <button onClick={onOpenRegister} className="text-[#E87F24] font-bold hover:underline cursor-pointer">
                    Daftar di sini
                  </button>
                </p>
              </div>
            </>
          )}
        </motion.div>
      </div>

      <footer className="py-6 text-center text-xs text-zinc-400 font-medium">
        &copy; 2026 Stocko. Seluruh hak cipta dilindungi.
      </footer>

    </div>
  );
}