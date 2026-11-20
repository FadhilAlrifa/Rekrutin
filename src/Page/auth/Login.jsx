import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, CheckCircle2, Store, Lock, KeyRound, ShieldCheck } from 'lucide-react';
import { sendMagicLink, loginUser } from '../../services/stockoService';
import CustomCursor from '../../components/landing/CustomCursor';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.36, 1] } }
};

export default function Login({ onBack, onOpenRegister, onLoginSuccess, externalError = '' }) {
  const [loginMethod, setLoginMethod] = useState('magic'); // 'magic' atau 'password'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleMagicLinkSubmit = async (e) => {
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

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const result = await loginUser(email, password);
    setLoading(false);

    if (result.success) {
      if (typeof onLoginSuccess === 'function') {
        onLoginSuccess();
      }
    } else {
      setErrorMessage(result.message || 'Email atau kata sandi salah. Silakan coba lagi.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#141414] font-sans selection:bg-[#F59E0B] selection:text-[#141414] relative overflow-hidden flex flex-col justify-between">
      <CustomCursor />

      {/* NAVBAR */}
      <motion.nav
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.36, 1] }}
        className="w-full top-0 z-50 px-4 md:px-6 pt-4 relative"
      >
        <div className="max-w-7xl mx-auto bg-white border border-zinc-200 rounded-full px-5 py-2.5 flex items-center justify-between shadow-[0_4px_16px_-6px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={onBack}>
            <div className="w-9 h-9 rounded-full bg-[#FAFAFA] border border-zinc-200 flex items-center justify-center">
              <img src="/logo-stocko.png" alt="Stocko Logo" className="w-5 h-5 object-contain" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-[#141414]">
              Stocko<span className="text-[#F59E0B]">.</span>
            </span>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-[#52525B] hover:text-[#D97706] font-semibold text-xs transition-colors cursor-pointer group"
          >
            <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" /> Kembali ke Beranda
          </button>
        </div>
      </motion.nav>

      {/* KONTEN UTAMA */}
      <div className="max-w-md w-full mx-auto px-4 sm:px-6 py-12 relative z-10 my-auto">
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="agency-card-light p-7 sm:p-10 space-y-6"
        >
          {submitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-2xl font-extrabold text-[#141414]">Tautan Masuk Terkirim</h3>
              <p className="text-[#52525B] text-xs leading-relaxed max-w-xs mx-auto">
                Periksa kotak masuk email <strong className="text-[#141414]">{email}</strong>. Klik tautan verifikasi untuk masuk secara otomatis.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setLoginMethod('magic');
                }}
                className="mt-4 bg-[#141414] text-white font-extrabold px-6 py-2.5 rounded-full text-xs cursor-pointer"
              >
                Gunakan Email Lain
              </button>
            </div>
          ) : (
            <>
              <div className="text-center space-y-2.5">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto border transition-colors ${
                    loginMethod === 'magic'
                      ? 'bg-[#FEF3C7] border-[#FDE68A] text-[#D97706]'
                      : 'bg-[#141414] border-[#141414] text-white'
                  }`}
                >
                  {loginMethod === 'magic' ? <ShieldCheck size={24} /> : <Store size={24} />}
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#D97706] font-bold block">
                  {loginMethod === 'magic' ? 'ADMIN // MAGIC LINK' : 'STAF PRIBADI // 1 AKUN = 1 KARYAWAN'}
                </span>
                <h2 className="text-2xl font-extrabold text-[#141414]">
                  {loginMethod === 'magic' ? 'Portal Admin' : 'Portal Karyawan'}
                </h2>
                <p className="text-xs text-[#52525B] font-medium">
                  {loginMethod === 'magic'
                    ? 'Masuk menggunakan Magic Link aman tanpa kata sandi.'
                    : 'Masuk dengan akun pribadi Anda (Kasir atau Stocker). Sesi login tercatat untuk audit.'}
                </p>
              </div>

              {(errorMessage || externalError) && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3 rounded-xl text-center">
                  {errorMessage || externalError}
                </div>
              )}

              {/* FORM MAGIC LINK (SUPER ADMIN) */}
              {loginMethod === 'magic' && (
                <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-[#52525B] font-semibold mb-2">
                      Email Admin
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="email"
                        required
                        placeholder="admin@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#FAFAFA] border border-zinc-200 rounded-xl px-4 py-3.5 pl-11 text-sm font-semibold text-[#141414] placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-[#F59E0B] transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    data-cursor="Submit"
                    className="w-full mt-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#141414] font-extrabold py-3.5 rounded-full transition-colors cursor-pointer disabled:opacity-50 text-xs sm:text-sm"
                  >
                    {loading ? 'Mengirim Tautan...' : 'Kirim Tautan Masuk'}
                  </button>
                </form>
              )}

              {/* FORM KARYAWAN (EMAIL + PASSWORD) */}
              {loginMethod === 'password' && (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-[#52525B] font-semibold mb-2">
                      Email Pribadi Karyawan
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="email"
                        required
                        placeholder="nama.karyawan@toko.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#FAFAFA] border border-zinc-200 rounded-xl px-4 py-3.5 pl-11 text-sm font-semibold text-[#141414] placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-[#F59E0B] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-[#52525B] font-semibold mb-2">
                      Kata Sandi
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#FAFAFA] border border-zinc-200 rounded-xl px-4 py-3.5 pl-11 text-sm font-semibold text-[#141414] placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-[#F59E0B] transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    data-cursor="Login"
                    className="w-full mt-2 bg-[#141414] hover:bg-zinc-800 text-white font-extrabold py-3.5 rounded-full transition-colors cursor-pointer disabled:opacity-50 text-xs sm:text-sm"
                  >
                    {loading ? 'Memeriksa...' : 'Masuk ke Sistem'}
                  </button>
                </form>
              )}

              <div className="space-y-3 pt-4 border-t border-zinc-200 text-center">
                {loginMethod === 'magic' ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setLoginMethod('password');
                      setErrorMessage('');
                    }}
                    className="text-xs text-[#52525B] font-semibold hover:text-[#141414] transition-colors cursor-pointer w-full flex items-center justify-center gap-2 py-2"
                  >
                    <KeyRound size={14} className="text-[#D97706]" /> Masuk sebagai Karyawan (Kasir / Stocker)
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setLoginMethod('magic');
                      setErrorMessage('');
                    }}
                    className="text-xs text-[#52525B] font-semibold hover:text-[#141414] transition-colors cursor-pointer w-full flex items-center justify-center gap-2 py-2"
                  >
                    <ShieldCheck size={14} className="text-[#D97706]" /> Kembali ke Login Super Admin
                  </button>
                )}

                {loginMethod === 'magic' && (
                  <p className="text-xs text-[#52525B] font-medium pt-1">
                    Belum punya akun Admin?{' '}
                    <button
                      type="button"
                      onClick={onOpenRegister}
                      className="text-[#D97706] font-bold hover:underline cursor-pointer"
                    >
                      Daftar di sini
                    </button>
                  </p>
                )}
              </div>
            </>
          )}
        </motion.div>
      </div>

      <footer className="py-6 text-center font-mono text-[11px] text-[#52525B]">
        &copy; 2026 Stocko. Seluruh hak cipta dilindungi.
      </footer>
    </div>
  );
}
