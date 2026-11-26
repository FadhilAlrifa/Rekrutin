import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Mail,
  User,
  CheckCircle2,
  Store,
  Lock,
  KeyRound,
  ShieldCheck,
  ReceiptText,
  Package,
  Eye,
  EyeOff
} from 'lucide-react';
import { sendMagicLink, loginUser } from '../../services/stockoService';
import CustomCursor from '../../components/landing/CustomCursor';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.36, 1] } }
};

const LOGIN_ROLES = [
  {
    id: 'superadmin',
    label: 'Admin',
    desc: 'Akses penuh bisnis',
    icon: ShieldCheck
  },
  {
    id: 'kasir',
    label: 'Kasir',
    desc: 'Transaksi POS',
    icon: ReceiptText
  },
  {
    id: 'stocker',
    label: 'Stocker',
    desc: 'Stok & bahan baku',
    icon: Package
  }
];

export default function Login({
  onBack,
  onOpenRegister,
  onPrepareLoginRole,
  onLoginSuccess,
  externalError = ''
}) {
  const [selectedRole, setSelectedRole] = useState('superadmin'); // 'superadmin' | 'kasir' | 'stocker'
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' | 'magic'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const activeRoleMeta = LOGIN_ROLES.find((r) => r.id === selectedRole) || LOGIN_ROLES[0];
  const ActiveRoleIcon = activeRoleMeta.icon;

  const handleSelectRole = (roleId) => {
    setSelectedRole(roleId);
    setErrorMessage('');
    if (roleId !== 'superadmin' && loginMethod === 'magic') {
      setLoginMethod('password');
    }
  };

  const handleMagicLinkSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    onPrepareLoginRole?.('superadmin');

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
    onPrepareLoginRole?.(selectedRole);

    const result = await loginUser(email, password);
    setLoading(false);

    if (result.success) {
      if (typeof onLoginSuccess === 'function') {
        onLoginSuccess();
      }
    } else {
      onPrepareLoginRole?.(null);
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
      <div className="max-w-md w-full mx-auto px-4 sm:px-6 py-10 relative z-10 my-auto">
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="agency-card-light p-7 sm:p-9 space-y-6"
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
              <div className="text-center space-y-2">
                <div
                  className={`w-13 h-13 rounded-2xl flex items-center justify-center mx-auto border transition-colors ${
                    selectedRole === 'superadmin'
                      ? 'bg-[#141414] border-[#141414] text-[#F59E0B]'
                      : 'bg-[#FEF3C7] border-[#FDE68A] text-[#B45309]'
                  }`}
                >
                  <ActiveRoleIcon size={23} />
                </div>
                <span className="text-[11px] text-[#D97706] font-bold block">
                  Masuk sebagai {activeRoleMeta.label}
                </span>
                <h2 className="text-2xl font-extrabold text-[#141414]">
                  {loginMethod === 'magic' ? 'Tautan Masuk Cepat' : 'Masuk ke Stocko'}
                </h2>
                <p className="text-xs text-[#52525B] font-medium">
                  {selectedRole === 'superadmin'
                    ? 'Pilih kategori akun kamu lalu masukkan email dan password.'
                    : `Masukkan username dan password akun ${activeRoleMeta.label} kamu.`}
                </p>
              </div>

              {/* 3 KATEGORI AKUN: PEMILIK / KASIR / STOCKER */}
              <div className="space-y-1.5">
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#52525B] font-semibold">
                  Kategori Akun
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {LOGIN_ROLES.map((roleItem) => {
                    const active = selectedRole === roleItem.id;
                    const Icon = roleItem.icon;
                    return (
                      <button
                        key={roleItem.id}
                        type="button"
                        onClick={() => handleSelectRole(roleItem.id)}
                        className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                          active
                            ? 'bg-[#141414] border-[#141414] text-white shadow-sm'
                            : 'bg-[#FAFAFA] border-zinc-200 text-[#52525B] hover:border-zinc-300 hover:text-[#141414]'
                        }`}
                      >
                        <Icon
                          size={17}
                          className={active ? 'text-[#F59E0B]' : 'text-[#D97706]'}
                        />
                        <span className="text-xs font-extrabold leading-tight">
                          {roleItem.label}
                        </span>
                        <span
                          className={`text-[9px] font-medium leading-tight ${
                            active ? 'text-zinc-300' : 'text-zinc-400'
                          }`}
                        >
                          {roleItem.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {(errorMessage || externalError) && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3 rounded-xl text-center">
                  {errorMessage || externalError}
                </div>
              )}

              {/* FORM MAGIC LINK (KHUSUS ADMIN) */}
              {loginMethod === 'magic' && selectedRole === 'superadmin' && (
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
                        placeholder="admin@usahaanda.com"
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

              {/* FORM LOGIN (ADMIN VIA EMAIL/USERNAME, KASIR & STOCKER VIA USERNAME + PASSWORD) */}
              {loginMethod === 'password' && (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-[#52525B] font-semibold mb-2">
                      {selectedRole === 'superadmin'
                        ? 'Email Admin'
                        : `Username ${activeRoleMeta.label}`}
                    </label>
                    <div className="relative">
                      {selectedRole === 'superadmin' ? (
                        <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                      ) : (
                        <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                      )}
                      <input
                        type={selectedRole === 'superadmin' ? 'email' : 'text'}
                        required
                        placeholder={
                          selectedRole === 'superadmin'
                            ? 'admin@usahaanda.com'
                            : selectedRole === 'kasir'
                            ? 'Contoh: budi_kasir'
                            : 'Contoh: andi_stocker'
                        }
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
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#FAFAFA] border border-zinc-200 rounded-xl px-4 py-3.5 pl-11 pr-11 text-sm font-semibold text-[#141414] placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-[#F59E0B] transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-[#141414] cursor-pointer p-1"
                        aria-label="Lihat atau sembunyikan password"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    data-cursor="Login"
                    className="w-full mt-2 bg-[#141414] hover:bg-zinc-800 text-white font-extrabold py-3.5 rounded-full transition-colors cursor-pointer disabled:opacity-50 text-xs sm:text-sm"
                  >
                    {loading ? 'Memeriksa...' : `Masuk sebagai ${activeRoleMeta.label}`}
                  </button>
                </form>
              )}

              <div className="space-y-3 pt-4 border-t border-zinc-200 text-center">
                {selectedRole === 'superadmin' && (
                  loginMethod === 'magic' ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setLoginMethod('password');
                        setErrorMessage('');
                      }}
                      className="text-xs text-[#52525B] font-semibold hover:text-[#141414] transition-colors cursor-pointer w-full flex items-center justify-center gap-2 py-2"
                    >
                      <KeyRound size={14} className="text-[#D97706]" /> Masuk dengan Email &amp; Password
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
                      <Store size={14} className="text-[#D97706]" /> Atau Masuk Lewat Tautan Email (Admin)
                    </button>
                  )
                )}

                <p className="text-xs text-[#52525B] font-medium pt-1">
                  Belum punya akun?{' '}
                  <button
                    type="button"
                    onClick={onOpenRegister}
                    className="text-[#D97706] font-bold hover:underline cursor-pointer"
                  >
                    Daftar di sini
                  </button>
                </p>
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
