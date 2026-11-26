import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Mail,
  User,
  Lock,
  KeyRound,
  ShieldCheck,
  ReceiptText,
  Package,
  Eye,
  EyeOff,
  RefreshCw,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { sendLoginOtp, verifyLoginOtp, loginUser } from '../../services/stockoService';
import { useNotify } from '../../components/common/NotificationContext';

const cardTransition = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.16, 1, 0.36, 1] } }
};

const panelTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.16, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.12, ease: 'easeIn' } }
};

const LOGIN_ROLES = [
  {
    id: 'superadmin',
    label: 'Admin',
    desc: 'Akses penuh',
    fullDesc: 'Akses penuh bisnis',
    inputLabel: 'Email Admin',
    placeholder: 'admin@usahaanda.com',
    inputType: 'email',
    icon: ShieldCheck
  },
  {
    id: 'kasir',
    label: 'Kasir',
    desc: 'Transaksi POS',
    fullDesc: 'Transaksi POS',
    inputLabel: 'Username / Email Kasir',
    placeholder: 'Contoh: budi_kasir',
    inputType: 'text',
    icon: ReceiptText
  },
  {
    id: 'stocker',
    label: 'Stocker',
    desc: 'Stok gudang',
    fullDesc: 'Stok & bahan baku',
    inputLabel: 'Username / Email Stocker',
    placeholder: 'Contoh: andi_stocker',
    inputType: 'text',
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
  const { showToast } = useNotify();

  const [selectedRole, setSelectedRole] = useState('superadmin'); // 'superadmin' | 'kasir' | 'stocker'
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' | 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;
    const timer = setTimeout(() => setResendCooldown((prev) => Math.max(0, prev - 1)), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const activeRoleMeta = LOGIN_ROLES.find((r) => r.id === selectedRole) || LOGIN_ROLES[0];
  const ActiveRoleIcon = activeRoleMeta.icon;

  // Kunci animasi hanya berdasarkan mode form agar pergantian role tidak me-remount form
  const activeModeKey =
    loginMethod === 'otp' && selectedRole === 'superadmin'
      ? otpSent
        ? 'otp-verify'
        : 'otp-send'
      : 'password';

  const handleSelectRole = (roleId) => {
    setSelectedRole(roleId);
    setErrorMessage('');
    if (roleId !== 'superadmin' && loginMethod === 'otp') {
      setLoginMethod('password');
      setOtpSent(false);
      setOtpCode('');
    }
  };

  const handleSendLoginOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMessage('Masukkan alamat email admin yang valid.');
      return;
    }

    setLoading(true);
    onPrepareLoginRole?.('superadmin');

    const result = await sendLoginOtp(cleanEmail);
    setLoading(false);

    if (result.success) {
      setEmail(cleanEmail);
      setOtpSent(true);
      setOtpCode('');
      setResendCooldown(30);
      showToast({
        title: 'Kode OTP Terkirim',
        message: `Cek kotak masuk atau folder spam pada ${cleanEmail}.`,
        variant: 'info'
      });
    } else {
      onPrepareLoginRole?.(null);
      setErrorMessage(result.message || 'Gagal mengirim kode OTP. Periksa kembali email Anda.');
    }
  };

  const handleResendLoginOtp = async () => {
    if (resendCooldown > 0 || loading) return;
    setErrorMessage('');
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const result = await sendLoginOtp(cleanEmail);
    setLoading(false);

    if (result.success) {
      setResendCooldown(30);
      showToast({
        title: 'Kode OTP Dikirim Ulang',
        message: `Kode terbaru sudah dikirim ke ${cleanEmail}.`,
        variant: 'info'
      });
    } else {
      setErrorMessage(result.message || 'Gagal mengirim ulang kode OTP.');
    }
  };

  const handleVerifyLoginOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanToken = otpCode.replace(/\s+/g, '');
    if (cleanToken.length < 6) {
      setErrorMessage('Masukkan kode OTP 6–8 digit yang dikirim ke email Anda.');
      return;
    }

    setLoading(true);
    onPrepareLoginRole?.('superadmin');

    const result = await verifyLoginOtp(email, cleanToken);
    setLoading(false);

    if (result.success) {
      showToast({
        title: 'Login Berhasil',
        message: 'Selamat datang kembali di Stocko.',
        variant: 'success'
      });
      if (typeof onLoginSuccess === 'function') {
        onLoginSuccess();
      }
    } else {
      onPrepareLoginRole?.(null);
      setErrorMessage(result.message || 'Kode OTP tidak cocok atau sudah kedaluwarsa.');
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
    <div className="min-h-screen bg-[#FAFAFA] text-[#141414] font-sans selection:bg-[#F59E0B] selection:text-[#141414] flex flex-col">
      {/* TOP BAR / HEADER */}
      <header className="w-full h-16 bg-white border-b border-[#E5E5E5] sticky top-0 z-40 shrink-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2.5 cursor-pointer group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-[#FAFAFA] border border-[#E5E5E5] flex items-center justify-center group-hover:border-[#F59E0B] transition-colors">
              <img src="/logo-stocko.png" alt="Stocko Logo" className="w-5 h-5 object-contain" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-[#141414]">
              Stocko<span className="text-[#F59E0B]">.</span>
            </span>
          </button>

          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#E5E5E5] bg-[#FAFAFA] hover:bg-white hover:border-[#F59E0B] text-[#141414] font-semibold text-xs transition-colors cursor-pointer group"
          >
            <ArrowLeft
              size={14}
              className="text-[#52525B] group-hover:text-[#D97706] group-hover:-translate-x-0.5 transition-all"
            />
            <span>Kembali ke Beranda</span>
          </button>
        </div>
      </header>

      {/* KONTEN UTAMA (posisi top stabil agar header tidak bergeser saat state berubah) */}
      <main className="flex-1 w-full max-w-[464px] mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-8">
        <motion.div
          initial="hidden"
          animate="show"
          variants={cardTransition}
          className="bg-white border border-[#E5E5E5] rounded-3xl shadow-[0_16px_40px_-18px_rgba(20,20,20,0.08)] p-6 sm:p-8 space-y-5"
        >
          {/* Header Card & Badge Peran (tinggi baris terkunci agar nol layout shift) */}
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <span className="inline-flex items-center justify-center gap-1.5 min-w-[176px] h-7 px-3 rounded-full bg-[#FEF3C7] border border-[#FDE68A] text-[#B45309] text-[11px] font-bold transition-colors duration-150">
                <ActiveRoleIcon size={13} className="text-[#D97706] shrink-0" />
                <span className="whitespace-nowrap">Masuk sebagai {activeRoleMeta.label}</span>
              </span>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-[#141414] leading-8">
              {loginMethod === 'otp'
                ? otpSent
                  ? 'Verifikasi Kode OTP'
                  : 'Masuk dengan Kode OTP'
                : 'Masuk ke Stocko'}
            </h1>

            <p className="min-h-[40px] flex items-center justify-center text-xs sm:text-[13px] text-[#52525B] font-medium leading-5 px-1">
              {loginMethod === 'otp'
                ? otpSent
                  ? 'Masukkan kode OTP 6–8 digit yang dikirim ke email admin kamu.'
                  : 'Masukkan email admin terdaftar untuk menerima kode OTP.'
                : 'Pilih kategori akun lalu masukkan kredensial login kamu.'}
            </p>
          </div>

          {/* Pemilih Kategori Akun: Admin / Kasir / Stocker */}
          <div className="space-y-2.5">
            <div className="h-4 flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#52525B] font-bold whitespace-nowrap">
                Kategori Akun
              </span>
              <span className="text-[11px] font-semibold text-[#71717A] whitespace-nowrap truncate">
                {activeRoleMeta.fullDesc}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 items-stretch">
              {LOGIN_ROLES.map((roleItem) => {
                const active = selectedRole === roleItem.id;
                const Icon = roleItem.icon;
                return (
                  <button
                    key={roleItem.id}
                    type="button"
                    onClick={() => handleSelectRole(roleItem.id)}
                    className={`h-[96px] p-3 rounded-2xl border-2 text-center transition-colors duration-150 cursor-pointer flex flex-col items-center justify-center gap-2 ${
                      active
                        ? 'bg-[#FEF3C7]/45 border-[#F59E0B] text-[#141414] shadow-sm'
                        : 'bg-[#FAFAFA] border-[#E5E5E5] text-[#52525B] hover:border-zinc-300 hover:bg-white'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-colors duration-150 shrink-0 ${
                        active
                          ? 'bg-[#141414] border-[#141414] text-[#F59E0B]'
                          : 'bg-white border-[#E5E5E5] text-[#D97706]'
                      }`}
                    >
                      <Icon size={16} />
                    </div>
                    <div className="space-y-0.5 w-full min-w-0">
                      <span className="block text-xs font-extrabold leading-4 text-[#141414] truncate">
                        {roleItem.label}
                      </span>
                      <span className="block text-[10px] font-medium leading-3.5 text-[#71717A] truncate">
                        {roleItem.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Banner Error */}
          {(errorMessage || externalError) && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-3.5 py-3 rounded-xl flex items-start gap-2.5">
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-600" />
              <span className="leading-relaxed">{errorMessage || externalError}</span>
            </div>
          )}

          {/* Area Form (hanya transisi opacity saat pindah mode Password <-> OTP, tidak geser saat ganti role) */}
          <AnimatePresence mode="wait">
            {loginMethod === 'otp' && selectedRole === 'superadmin' && !otpSent && (
              <motion.form
                key={activeModeKey}
                initial={panelTransition.initial}
                animate={panelTransition.animate}
                exit={panelTransition.exit}
                onSubmit={handleSendLoginOtp}
                className="space-y-4"
              >
                <div>
                  <label className="h-4 flex items-center font-mono text-[10px] uppercase tracking-wider text-[#52525B] font-bold mb-1.5">
                    Email Admin
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                    />
                    <input
                      type="email"
                      required
                      placeholder="admin@usahaanda.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-11 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl px-4 pl-10 text-sm font-semibold text-[#141414] placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-[#F59E0B] focus:ring-4 focus:ring-[#F59E0B]/15 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-[#F59E0B] hover:bg-[#D97706] text-[#141414] font-extrabold px-4 rounded-xl transition-colors cursor-pointer disabled:opacity-50 text-xs sm:text-sm inline-flex items-center justify-center gap-2 shadow-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Mengirim Kode OTP...
                    </>
                  ) : (
                    'Kirim Kode OTP'
                  )}
                </button>
              </motion.form>
            )}

            {loginMethod === 'otp' && selectedRole === 'superadmin' && otpSent && (
              <motion.form
                key={activeModeKey}
                initial={panelTransition.initial}
                animate={panelTransition.animate}
                exit={panelTransition.exit}
                onSubmit={handleVerifyLoginOtp}
                className="space-y-4"
              >
                <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="block font-mono text-[10px] uppercase tracking-wider text-[#71717A] font-semibold">
                      Email Tujuan
                    </span>
                    <span className="block text-xs font-bold text-[#141414] truncate">
                      {email}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtpCode('');
                      setErrorMessage('');
                    }}
                    className="text-[11px] font-bold text-[#D97706] hover:underline shrink-0 cursor-pointer"
                  >
                    Ganti Email
                  </button>
                </div>

                <div>
                  <label className="h-4 flex items-center font-mono text-[10px] uppercase tracking-wider text-[#52525B] font-bold mb-1.5">
                    Kode OTP Email
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={8}
                    required
                    placeholder="••••••"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full h-12 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl px-4 text-center font-mono text-xl font-extrabold tracking-[0.35em] text-[#141414] placeholder-zinc-300 focus:outline-none focus:bg-white focus:border-[#F59E0B] focus:ring-4 focus:ring-[#F59E0B]/15 transition-colors tabular-nums"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otpCode.replace(/\s+/g, '').length < 6}
                  className="w-full h-11 bg-[#F59E0B] hover:bg-[#D97706] text-[#141414] font-extrabold px-4 rounded-xl transition-colors cursor-pointer disabled:opacity-50 text-xs sm:text-sm inline-flex items-center justify-center gap-2 shadow-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Memverifikasi...
                    </>
                  ) : (
                    'Verifikasi & Masuk'
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendLoginOtp}
                    disabled={resendCooldown > 0 || loading}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#52525B] hover:text-[#D97706] disabled:text-zinc-400 transition-colors cursor-pointer disabled:cursor-not-allowed tabular-nums"
                  >
                    <RefreshCw size={12} />
                    {resendCooldown > 0
                      ? `Kirim ulang dalam ${resendCooldown}d`
                      : 'Kirim Ulang Kode OTP'}
                  </button>
                </div>
              </motion.form>
            )}

            {loginMethod === 'password' && (
              <motion.form
                key={activeModeKey}
                initial={panelTransition.initial}
                animate={panelTransition.animate}
                exit={panelTransition.exit}
                onSubmit={handlePasswordSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="h-4 flex items-center font-mono text-[10px] uppercase tracking-wider text-[#52525B] font-bold mb-1.5 whitespace-nowrap">
                    {activeRoleMeta.inputLabel}
                  </label>
                  <div className="relative">
                    {selectedRole === 'superadmin' ? (
                      <Mail
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                      />
                    ) : (
                      <User
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                      />
                    )}
                    <input
                      type={activeRoleMeta.inputType}
                      required
                      placeholder={activeRoleMeta.placeholder}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-11 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl px-4 pl-10 text-sm font-semibold text-[#141414] placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-[#F59E0B] focus:ring-4 focus:ring-[#F59E0B]/15 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="h-4 flex items-center font-mono text-[10px] uppercase tracking-wider text-[#52525B] font-bold mb-1.5">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-11 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl px-4 pl-10 pr-11 text-sm font-semibold text-[#141414] placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-[#F59E0B] focus:ring-4 focus:ring-[#F59E0B]/15 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-[#141414] hover:bg-zinc-100 cursor-pointer transition-colors"
                      aria-label="Lihat atau sembunyikan password"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-[#141414] hover:bg-zinc-800 text-white font-extrabold px-4 rounded-xl transition-colors cursor-pointer disabled:opacity-50 text-xs sm:text-sm inline-flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={15} className="animate-spin text-[#F59E0B]" /> Memeriksa...
                    </>
                  ) : (
                    `Masuk sebagai ${activeRoleMeta.label}`
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Opsi Sekunder OTP & Link Daftar (slot h-11 konsisten agar tinggi card tetap) */}
          <div className="space-y-3.5 pt-4 border-t border-[#E5E5E5] text-center">
            {selectedRole === 'superadmin' ? (
              loginMethod === 'otp' ? (
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('password');
                    setOtpSent(false);
                    setOtpCode('');
                    setErrorMessage('');
                  }}
                  className="w-full h-11 px-4 rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] hover:bg-white hover:border-[#F59E0B] text-xs font-bold text-[#141414] transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <KeyRound size={14} className="text-[#D97706] shrink-0" />
                  <span>Masuk dengan Email &amp; Password</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('otp');
                    setOtpSent(false);
                    setOtpCode('');
                    setErrorMessage('');
                  }}
                  className="w-full h-11 px-4 rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] hover:bg-[#FEF3C7]/45 hover:border-[#F59E0B] text-xs font-bold text-[#141414] transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <KeyRound size={14} className="text-[#D97706] shrink-0" />
                  <span>Atau Masuk dengan Kode OTP Email (Admin)</span>
                </button>
              )
            ) : (
              <div className="w-full h-11 px-4 rounded-xl border border-dashed border-[#E5E5E5] bg-[#FAFAFA] text-[11px] font-medium text-[#71717A] flex items-center justify-center gap-2">
                <KeyRound size={13} className="text-zinc-400 shrink-0" />
                <span>Login OTP Email tersedia khusus untuk akun Admin</span>
              </div>
            )}

            <p className="text-xs text-[#52525B] font-medium h-5 flex items-center justify-center gap-1">
              <span>Belum punya akun?</span>
              <button
                type="button"
                onClick={onOpenRegister}
                className="text-[#D97706] font-extrabold hover:underline cursor-pointer"
              >
                Daftar di sini
              </button>
            </p>
          </div>
        </motion.div>
      </main>

      <footer className="py-5 text-center font-mono text-[11px] text-[#71717A] shrink-0">
        &copy; 2026 Stocko. Seluruh hak cipta dilindungi.
      </footer>
    </div>
  );
}
