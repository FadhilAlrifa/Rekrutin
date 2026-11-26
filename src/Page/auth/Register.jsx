import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Building2,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Users,
  Plus,
  Trash2,
  Briefcase,
  UtensilsCrossed,
  ShoppingBag,
  Wallet,
  ReceiptText,
  Landmark,
  QrCode,
  CreditCard,
  KeyRound,
  ShieldCheck,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { supabase, supabaseAdminAuth } from '../../services/supabaseClient';
import {
  saveMerchantSettings,
  fetchOrInitCompanyWorkspace
} from '../../services/stockoService';
import {
  createSingleEmployeeAccount,
  validatePersonalEmployeeName
} from '../../services/employeeAuditService';
import { SUBSCRIPTION_PLANS } from '../../data/subscriptionPlans';
import CustomCursor from '../../components/landing/CustomCursor';

const PAYMENT_METHODS = [
  {
    id: 'va_bank',
    title: 'Transfer Bank / Virtual Account',
    desc: 'BCA, Mandiri, BNI, BRI (Verifikasi otomatis)',
    icon: Landmark
  },
  {
    id: 'qris_ewallet',
    title: 'QRIS / E-Wallet',
    desc: 'GoPay, OVO, DANA, ShopeePay, QRIS Instan',
    icon: QrCode
  },
  {
    id: 'credit_card',
    title: 'Kartu Kredit / Debit',
    desc: 'Visa, Mastercard, JCB dengan penagihan bulanan',
    icon: CreditCard
  }
];

export default function Register({
  onBack,
  onOpenLogin,
  initialPlan = 'pro',
  onPlanChange,
  onCompleteRegistration
}) {
  const [step, setStep] = useState(1); // 1: Akun & OTP, 2: Kategori & Cara Bayar, 3: Paket & Pembayaran, 4: Karyawan
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [showOwnerPass, setShowOwnerPass] = useState(false);
  const [showStaffPass, setShowStaffPass] = useState(false);

  // Slide 1: Akun & Verifikasi Email (OTP)
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    businessName: ''
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [fallbackOtpCode, setFallbackOtpCode] = useState('');
  const [smtpNotice, setSmtpNotice] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verifiedUser, setVerifiedUser] = useState(null);

  // Slide 2: Kategori Usaha & Cara Bayar (sama seperti Simulasi POS)
  const [businessType, setBusinessType] = useState('fnb'); // 'fnb' | 'retail'
  const [paymentFlow, setPaymentFlow] = useState('pay_first'); // 'pay_first' | 'pay_later'

  // Slide 3: Paket & Metode Pembayaran
  const [selectedPlanId, setSelectedPlanId] = useState(initialPlan || 'pro');
  const [paymentMethod, setPaymentMethod] = useState('va_bank');

  // Slide 4: Tambah Karyawan atau Tidak
  const [wantAddStaff, setWantAddStaff] = useState(false);
  const [staffDraft, setStaffDraft] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'kasir'
  });
  const [staffList, setStaffList] = useState([]);

  useEffect(() => {
    try {
      window.sessionStorage.setItem('stocko_registration_active', '1');
    } catch {
      // Abaikan
    }
    return () => {
      try {
        window.sessionStorage.removeItem('stocko_registration_active');
      } catch {
        // Abaikan
      }
    };
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((prev) => Math.max(0, prev - 1)), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const isStarter = selectedPlanId === 'starter';
  const activePlan =
    SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlanId) || SUBSCRIPTION_PLANS[1];
  const kasirCount = staffList.filter((s) => s.role === 'kasir').length;
  const starterKasirFull = isStarter && kasirCount >= 1;

  const handlePlanSelect = (planId) => {
    setSelectedPlanId(planId);
    onPlanChange?.(planId);
    if (planId === 'starter') {
      setStaffDraft((prev) => ({ ...prev, role: 'kasir' }));
      setStaffList((prev) => {
        const firstKasir = prev.find((s) => s.role === 'kasir');
        return firstKasir ? [firstKasir] : [];
      });
    }
  };

  // SLIDE 1A: Kirim kode verifikasi ke email menggunakan client terisolasi (persistSession: false)
  // agar TIDAK langsung login ke dashboard sebelum user memasukkan kode verifikasi
  const handleSendVerification = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanUsername = formData.username.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Masukkan alamat email yang valid.');
      return;
    }
    if (cleanUsername.length < 3) {
      setErrorMessage('Username / nama admin minimal 3 karakter.');
      return;
    }
    if (formData.password.length < 6) {
      setErrorMessage('Password minimal 6 karakter.');
      return;
    }

    setLoading(true);
    try {
      window.sessionStorage.setItem('stocko_registration_active', '1');
    } catch {
      // Abaikan
    }

    const { data, error } = await supabaseAdminAuth.auth.signUp({
      email: cleanEmail,
      password: formData.password,
      options: {
        data: {
          username: cleanUsername,
          full_name: cleanUsername,
          role: 'superadmin'
        }
      }
    });

    let authData = data;
    if (error) {
      const msg = String(error.message || '').toLowerCase();
      if (msg.includes('already registered') || msg.includes('already exists')) {
        // Jika user sebelumnya sudah klik kirim kode tapi belum selesai slide 2-4, cek password-nya
        const retrySign = await supabaseAdminAuth.auth.signInWithPassword({
          email: cleanEmail,
          password: formData.password
        });
        if (!retrySign.error && retrySign.data?.user) {
          authData = retrySign.data;
        } else {
          setLoading(false);
          setErrorMessage('Email ini sudah terdaftar. Silakan masuk melalui halaman Login atau gunakan email lain.');
          return;
        }
      } else {
        setLoading(false);
        setErrorMessage(error.message || 'Gagal mengirim verifikasi ke email.');
        return;
      }
    }

    if (authData?.user) {
      setVerifiedUser(authData.user);
    }

    // Jika Supabase langsung mengembalikan session (mailer_autoconfirm: true),
    // kirim email OTP lewat signInWithOtp (menggunakan template "Magic Link" di Supabase).
    // Hanya tampilkan kode cadangan di layar apabila pengiriman email ditolak Supabase (mis. terkena rate-limit).
    let otpMailError = null;
    if (authData?.session) {
      const { error: otpErr } = await supabaseAdminAuth.auth.signInWithOtp({
        email: cleanEmail,
        options: { shouldCreateUser: false }
      });
      otpMailError = otpErr;
    }

    setLoading(false);
    setOtpSent(true);
    setOtpCode('');
    setResendCooldown(30);
    if (otpMailError) {
      const generatedCode = String(Math.floor(100000 + Math.random() * 900000));
      setFallbackOtpCode(generatedCode);
      setSmtpNotice(
        `Server email Supabase membatasi pengiriman (${otpMailError.message}). Gunakan kode cadangan di atas agar tetap bisa melanjutkan.`
      );
      setInfoMessage(`Masukkan kode verifikasi 6 digit untuk melanjutkan pendaftaran ${cleanEmail}.`);
    } else {
      setFallbackOtpCode('');
      setSmtpNotice('');
      setInfoMessage(
        `Kode verifikasi telah dikirim ke ${cleanEmail}. Cek kotak masuk atau folder spam email kamu.`
      );
    }
  };

  // SLIDE 1B: Kirim ulang kode verifikasi
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;
    setErrorMessage('');
    setInfoMessage('');
    const cleanEmail = formData.email.trim().toLowerCase();

    setLoading(true);
    let resendError = null;
    const { error: resendErr } = await supabaseAdminAuth.auth.resend({
      type: 'signup',
      email: cleanEmail
    });

    if (resendErr) {
      const { error: otpErr } = await supabaseAdminAuth.auth.signInWithOtp({
        email: cleanEmail,
        options: { shouldCreateUser: false }
      });
      resendError = otpErr;
    }

    setLoading(false);
    setResendCooldown(30);
    if (resendError) {
      const nextCode = String(Math.floor(100000 + Math.random() * 900000));
      setFallbackOtpCode(nextCode);
      setSmtpNotice(
        `Server email Supabase membatasi pengiriman ulang (${resendError.message}). Gunakan kode cadangan di atas.`
      );
      setInfoMessage(`Kode verifikasi cadangan telah disiapkan untuk ${cleanEmail}.`);
    } else {
      setFallbackOtpCode('');
      setSmtpNotice('');
      setInfoMessage(`Kode verifikasi baru telah dikirim ke email ${cleanEmail}.`);
    }
  };

  // SLIDE 1C: Cocokkan kode verifikasi -> lanjut Slide 2 (masih di client terisolasi agar tidak lompat ke dashboard)
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanToken = otpCode.replace(/\s+/g, '');
    if (cleanToken.length < 6) {
      setErrorMessage('Masukkan kode verifikasi 6–8 digit yang dikirim ke email kamu.');
      return;
    }

    if (fallbackOtpCode && cleanToken === fallbackOtpCode && verifiedUser) {
      setErrorMessage('');
      setInfoMessage('');
      setStep(2);
      return;
    }

    setLoading(true);
    let verifyRes = await supabaseAdminAuth.auth.verifyOtp({
      email: cleanEmail,
      token: cleanToken,
      type: 'signup'
    });

    if (verifyRes.error) {
      const fallbackRes = await supabaseAdminAuth.auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: 'email'
      });
      if (!fallbackRes.error) {
        verifyRes = fallbackRes;
      }
    }

    setLoading(false);

    if (verifyRes.error || !verifyRes.data?.user) {
      setErrorMessage(
        verifyRes.error?.message?.toLowerCase().includes('expired')
          ? 'Kode verifikasi sudah kedaluwarsa. Klik "Kirim Ulang Kode".'
          : 'Kode verifikasi tidak cocok. Periksa kembali kode di email kamu.'
      );
      return;
    }

    setVerifiedUser(verifyRes.data.user);
    setErrorMessage('');
    setInfoMessage('');
    setStep(2);
  };

  // SLIDE 2 -> SLIDE 3
  const handleSubmitStep2 = (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!formData.businessName.trim()) {
      setErrorMessage('Nama perusahaan / usaha wajib diisi.');
      return;
    }
    setStep(3);
  };

  // SLIDE 3 -> SLIDE 4
  const handleSubmitStep3 = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setStep(4);
  };

  // SLIDE 4: Tambah draft karyawan
  const handleAddStaffDraft = () => {
    setErrorMessage('');

    if (isStarter && staffDraft.role === 'stocker') {
      setErrorMessage(
        'Role Stocker terkunci di Paket Starter. Kembali ke Slide 3 untuk pilih Paket Pro atau Enterprise.'
      );
      return;
    }
    if (starterKasirFull) {
      setErrorMessage(
        'Paket Starter maksimal 1 akun Kasir. Pilih Paket Pro untuk menambah lebih banyak karyawan.'
      );
      return;
    }

    const nameCheck = validatePersonalEmployeeName(staffDraft.fullName, staffList);
    if (!nameCheck.valid) {
      setErrorMessage(nameCheck.message);
      return;
    }

    if (nameCheck.cleanName.toLowerCase() === formData.username.trim().toLowerCase()) {
      setErrorMessage('Username karyawan harus berbeda dengan username admin.');
      return;
    }
    if (!staffDraft.password || staffDraft.password.length < 6) {
      setErrorMessage('Password karyawan minimal 6 karakter.');
      return;
    }

    setStaffList((prev) => [
      ...prev,
      {
        id: `DRAFT-${Date.now()}`,
        username: nameCheck.cleanName,
        fullName: nameCheck.cleanName,
        password: staffDraft.password,
        role: staffDraft.role
      }
    ]);
    setStaffDraft({
      fullName: '',
      email: '',
      password: '',
      role: 'kasir'
    });
  };

  const handleRemoveStaff = (id) => {
    setStaffList((prev) => prev.filter((s) => s.id !== id));
  };

  // SLIDE 4: Selesai, inisialisasi workspace perusahaan baru yang terisolasi (mulai dari 0),
  // buat akun karyawan perusahaan ini, lalu masuk ke Dashboard Admin
  const handleFinishRegistration = async (skipStaff = false) => {
    setErrorMessage('');
    setLoading(true);

    const cleanBusiness = formData.businessName.trim() || 'Usaha Utama';
    const cleanUsername = formData.username.trim();
    const cleanEmail = formData.email.trim().toLowerCase();
    const businessCategoryLabel =
      businessType === 'retail' ? 'Toko Ritel & Minimarket' : 'F&B (Kafe / Restoran / Kedai)';

    // 1. Login ke client utama Supabase setelah seluruh 4 slide selesai
    const { data: signInData } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: formData.password
    });

    const activeUser = signInData?.user || verifiedUser;
    const companyId = activeUser?.id || `comp-${Date.now()}`;

    // 2. Simpan metadata perusahaan pada akun Admin
    await supabase.auth.updateUser({
      data: {
        username: cleanUsername,
        full_name: cleanUsername,
        role: 'superadmin',
        company_id: companyId,
        business_name: cleanBusiness,
        business_category: businessCategoryLabel,
        business_type: businessType,
        payment_flow: paymentFlow,
        subscription_plan: selectedPlanId,
        payment_method: paymentMethod
      }
    });

    // 3. Buat workspace perusahaan baru yang 100% bersih & terpisah dari perusahaan/akun sebelumnya
    await fetchOrInitCompanyWorkspace({
      companyId,
      adminId: companyId,
      adminEmail: cleanEmail,
      adminName: cleanUsername,
      businessName: cleanBusiness,
      businessType,
      paymentFlow,
      subscriptionPlan: selectedPlanId,
      forceReset: true
    });

    await saveMerchantSettings(
      { businessType, paymentFlow },
      cleanUsername
    );

    // 4. Daftarkan karyawan (jika ada) ke dalam workspace perusahaan ini
    if (!skipStaff && wantAddStaff && staffList.length > 0) {
      const createdSoFar = [];
      for (const st of staffList) {
        if (isStarter && st.role === 'stocker') continue;
        const res = await createSingleEmployeeAccount({
          username: st.username || st.fullName,
          password: st.password,
          role: st.role,
          fullName: st.fullName,
          existingEmployees: createdSoFar
        });
        if (res.success) {
          createdSoFar.push({ fullName: st.fullName, username: st.username || st.fullName });
        }
      }
    }

    try {
      window.sessionStorage.removeItem('stocko_registration_active');
    } catch {
      // Abaikan
    }

    setLoading(false);
    await onCompleteRegistration?.({
      companyId,
      subscriptionPlan: selectedPlanId,
      businessType,
      paymentFlow,
      paymentMethod,
      businessName: cleanBusiness,
      username: cleanUsername,
      email: cleanEmail,
      user: activeUser
    });
  };

  const stepMeta = {
    1: {
      title: otpSent ? 'Verifikasi Email Kamu' : 'Buat Akun Admin',
      desc: otpSent
        ? 'Masukkan kode verifikasi yang dikirim ke email untuk melanjutkan ke pemilihan kategori.'
        : 'Masukkan email, username, dan password untuk mulai mendaftar di Stocko.'
    },
    2: {
      title: 'Pilih Kategori & Alur Kasir',
      desc: 'Tentukan jenis usaha dan cara bayar pelanggan seperti pada simulasi POS.'
    },
    3: {
      title: 'Pilih Paket & Metode Pembayaran',
      desc: 'Daftarkan paket langganan dan metode pembayaran untuk perusahaan kamu.'
    },
    4: {
      title: 'Tambah Karyawan (Opsional)',
      desc: 'Pilih ingin langsung masuk dashboard admin atau menambahkan kasir/stocker dulu.'
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#141414] font-sans selection:bg-[#F59E0B] selection:text-[#141414] relative overflow-hidden flex flex-col justify-between">
      <CustomCursor />

      {/* NAVBAR */}
      <motion.nav
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.36, 1] }}
        className="w-full top-0 z-50 px-4 md:px-6 pt-4 relative"
      >
        <div className="max-w-7xl mx-auto bg-white/95 backdrop-blur-xl border border-zinc-200 rounded-full px-5 py-2.5 flex items-center justify-between shadow-[0_4px_16px_-6px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={onBack}>
            <div className="w-9 h-9 rounded-full bg-[#FAFAFA] border border-zinc-200 flex items-center justify-center">
              <img src="/logo-stocko.png" alt="Stocko Logo" className="w-5 h-5 object-contain" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-[#141414]">
              Stocko<span className="text-[#F59E0B]">.</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onOpenLogin}
              className="text-xs font-semibold text-[#52525B] hover:text-[#141414] transition-colors cursor-pointer hidden sm:inline"
            >
              Sudah punya akun? Masuk
            </button>
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 text-[#52525B] hover:text-[#D97706] font-semibold text-xs transition-colors cursor-pointer group"
            >
              <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" /> Kembali ke Beranda
            </button>
          </div>
        </div>
      </motion.nav>

      {/* CARD UTAMA PENDAFTARAN (4 SLIDE) */}
      <div className="max-w-2xl w-full mx-auto px-4 sm:px-6 py-10 relative z-10 my-auto">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.36, 1] }}
          className="bg-white border border-zinc-200 rounded-3xl shadow-[0_24px_60px_-20px_rgba(20,20,20,0.12)] overflow-hidden"
        >
          {/* Progress Bar 4 Langkah */}
          <div className="h-1.5 w-full bg-zinc-100 overflow-hidden">
            <motion.div
              initial={false}
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              className="h-full bg-[#F59E0B]"
            />
          </div>

          <div className="p-6 sm:p-9">
            {/* Header Card */}
            <div className="flex items-start justify-between gap-3 pb-5 mb-6 border-b border-zinc-100">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
                    Slide {step} dari 4
                  </span>
                  {verifiedUser && step > 1 && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <ShieldCheck size={11} /> Email Terverifikasi
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-extrabold text-[#141414] tracking-tight">
                  {stepMeta[step].title}
                </h1>
                <p className="text-xs text-[#52525B] font-medium mt-0.5">
                  {stepMeta[step].desc}
                </p>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3 rounded-xl text-center">
                {errorMessage}
              </div>
            )}

            {infoMessage && (
              <div className="mb-5 bg-[#FEF3C7]/60 border border-[#FDE68A] text-[#78350F] text-xs font-semibold p-3 rounded-xl text-center">
                {infoMessage}
              </div>
            )}

            <AnimatePresence mode="wait">
              {/* SLIDE 1: EMAIL, USERNAME, PASSWORD & VERIFIKASI EMAIL */}
              {step === 1 && !otpSent && (
                <motion.form
                  key="reg-slide-1-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  onSubmit={handleSendVerification}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold text-[#141414] mb-1.5">Email</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="email"
                        required
                        placeholder="admin@usahaanda.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-[#FAFAFA] border border-zinc-200 rounded-xl px-4 py-3.5 pl-11 text-sm font-semibold text-[#141414] placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-[#F59E0B] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#141414] mb-1.5">
                      Username / Nama Admin
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Budi Santoso"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full bg-[#FAFAFA] border border-zinc-200 rounded-xl px-4 py-3.5 pl-11 text-sm font-semibold text-[#141414] placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-[#F59E0B] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#141414] mb-1.5">Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type={showOwnerPass ? 'text' : 'password'}
                        required
                        minLength={6}
                        placeholder="Minimal 6 karakter"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full bg-[#FAFAFA] border border-zinc-200 rounded-xl px-4 py-3.5 pl-11 pr-11 text-sm font-semibold text-[#141414] placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-[#F59E0B] transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOwnerPass((v) => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-[#141414] cursor-pointer p-1"
                        aria-label="Lihat atau sembunyikan password"
                      >
                        {showOwnerPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={onOpenLogin}
                      className="text-xs font-bold text-[#52525B] hover:text-[#141414] cursor-pointer"
                    >
                      Sudah punya akun? Masuk
                    </button>
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-3.5 bg-[#141414] hover:bg-zinc-800 text-white font-extrabold rounded-xl text-xs sm:text-sm inline-flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={15} className="animate-spin text-[#F59E0B]" />
                          <span>Mengirim Kode...</span>
                        </>
                      ) : (
                        <>
                          <span>Kirim Kode Verifikasi</span>
                          <ArrowRight size={15} className="text-[#F59E0B]" />
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.form>
              )}

              {/* SLIDE 1B: INPUT KODE VERIFIKASI EMAIL */}
              {step === 1 && otpSent && (
                <motion.form
                  key="reg-slide-1-otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  onSubmit={handleVerifyOtp}
                  className="space-y-5"
                >
                  <div className="bg-[#FAFAFA] border border-zinc-200 rounded-2xl p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-[#52525B] block">
                        Email Tujuan Verifikasi
                      </span>
                      <span className="text-sm font-mono font-extrabold text-[#141414] truncate block">
                        {formData.email.trim().toLowerCase()}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setErrorMessage('');
                        setInfoMessage('');
                      }}
                      className="text-xs font-bold text-[#D97706] hover:underline cursor-pointer shrink-0"
                    >
                      Ubah Email
                    </button>
                  </div>

                  {fallbackOtpCode && (
                    <div className="bg-[#FEF3C7]/75 border border-[#FDE68A] rounded-2xl p-4 space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#B45309] block">
                            Kode Verifikasi Akun Stocko
                          </span>
                          <span className="font-mono text-xl font-black tracking-[0.22em] text-[#141414]">
                            {fallbackOtpCode}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setOtpCode(fallbackOtpCode)}
                          className="px-3.5 py-2 rounded-xl bg-[#141414] hover:bg-zinc-800 text-[#F59E0B] text-xs font-extrabold cursor-pointer transition-colors"
                        >
                          Isi Kode Otomatis
                        </button>
                      </div>
                      {smtpNotice && (
                        <p className="text-[11px] text-[#78350F] font-medium leading-relaxed">
                          {smtpNotice}
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-[#141414] mb-1.5">
                      Masukkan Kode Verifikasi dari Email
                    </label>
                    <div className="relative">
                      <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D97706]" />
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={8}
                        required
                        placeholder="Contoh: 123456"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full bg-[#FAFAFA] border-2 border-zinc-200 focus:border-[#F59E0B] focus:bg-white rounded-xl px-4 py-4 pl-11 text-lg font-mono font-extrabold tracking-[0.25em] text-[#141414] placeholder:tracking-normal placeholder:font-sans placeholder:text-sm placeholder:font-semibold placeholder-zinc-400 focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[11px] text-[#52525B] font-medium">
                        Belum menerima kode di kotak masuk / spam?
                      </span>
                      <button
                        type="button"
                        disabled={resendCooldown > 0 || loading}
                        onClick={handleResendOtp}
                        className="text-[11px] font-bold text-[#D97706] hover:underline inline-flex items-center gap-1 cursor-pointer disabled:text-zinc-400 disabled:no-underline disabled:cursor-not-allowed"
                      >
                        <RefreshCw size={11} />
                        {resendCooldown > 0 ? `Kirim Ulang (${resendCooldown}d)` : 'Kirim Ulang Kode'}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setErrorMessage('');
                        setInfoMessage('');
                      }}
                      className="px-4 py-3 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-100 text-xs font-bold text-[#141414] inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft size={14} /> Kembali
                    </button>
                    <motion.button
                      type="submit"
                      disabled={loading || otpCode.trim().length < 6}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 sm:flex-none px-7 py-3.5 bg-[#F59E0B] hover:bg-[#D97706] text-[#141414] font-extrabold rounded-xl text-xs sm:text-sm inline-flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          <span>Memverifikasi...</span>
                        </>
                      ) : (
                        <>
                          <span>Verifikasi &amp; Lanjut</span>
                          <ArrowRight size={15} />
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.form>
              )}

              {/* SLIDE 2: PILIH KATEGORI USAHA & PAY FIRST / PAY LATER SEPERTI SIMULASI POS */}
              {step === 2 && (
                <motion.form
                  key="reg-slide-2"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                  onSubmit={handleSubmitStep2}
                  className="space-y-5"
                >
                  <div>
                    <label className="block text-xs font-bold text-[#141414] mb-1.5">
                      Nama Perusahaan / Usaha
                    </label>
                    <div className="relative">
                      <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Kopi Kita Makassar / Minimarket Berkah"
                        value={formData.businessName}
                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                        className="w-full bg-[#FAFAFA] border border-zinc-200 rounded-xl px-4 py-3 pl-10 text-sm font-semibold text-[#141414] placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-[#F59E0B]"
                      />
                    </div>
                  </div>

                  {/* Kategori Usaha (Persis Simulasi POS) */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[#141414]">
                      Pilih Jenis Usaha
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        {
                          id: 'fnb',
                          title: 'F&B (Kafe / Restoran / Kedai)',
                          desc: 'Cocok untuk usaha makanan & minuman dengan menu siap saji atau bahan resep.',
                          badge: 'Usaha Kuliner & Minuman',
                          icon: UtensilsCrossed
                        },
                        {
                          id: 'retail',
                          title: 'Toko Ritel & Minimarket',
                          desc: 'Cocok untuk minimarket atau toko produk jadi. Stok berkurang sesuai barang terjual.',
                          badge: 'Stok Per Barang',
                          icon: ShoppingBag
                        }
                      ].map((opt) => {
                        const active = businessType === opt.id;
                        const Icon = opt.icon;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setBusinessType(opt.id)}
                            className={`text-left p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                              active
                                ? 'bg-[#FEF3C7]/45 border-[#F59E0B] shadow-sm'
                                : 'bg-[#FAFAFA] border-zinc-200 hover:border-zinc-300'
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <div
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                                    active
                                      ? 'bg-[#141414] text-[#F59E0B]'
                                      : 'bg-white border border-zinc-200 text-[#D97706]'
                                  }`}
                                >
                                  <Icon size={17} />
                                </div>
                                <span
                                  className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                                    active
                                      ? 'bg-[#F59E0B] border-[#F59E0B] text-[#141414]'
                                      : 'bg-white border-zinc-300 text-transparent'
                                  }`}
                                >
                                  <Check size={12} strokeWidth={3} />
                                </span>
                              </div>
                              <h4 className="text-xs sm:text-sm font-extrabold text-[#141414]">
                                {opt.title}
                              </h4>
                              <p className="text-[11px] text-[#52525B] font-medium leading-relaxed">
                                {opt.desc}
                              </p>
                            </div>
                            <span className="inline-block w-fit text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white border border-zinc-200 text-[#52525B]">
                              {opt.badge}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cara Bayar Pelanggan: Pay First vs Pay Later */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[#141414]">
                      Cara Bayar Pelanggan di Kasir
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        {
                          id: 'pay_first',
                          title: 'Bayar di Awal (Pay First)',
                          desc: 'Pelanggan bayar langsung di kasir saat memesan, lalu pesanan diproses.',
                          badge: 'Kedai Kopi & Minimarket',
                          icon: Wallet
                        },
                        {
                          id: 'pay_later',
                          title: 'Bayar Nanti / Open Bill (Pay Later)',
                          desc: 'Pesanan diproses dulu, bisa tambah menu susulan, lalu bayar di akhir.',
                          badge: 'Resto & Kafe Meja',
                          icon: ReceiptText
                        }
                      ].map((opt) => {
                        const active = paymentFlow === opt.id;
                        const Icon = opt.icon;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setPaymentFlow(opt.id)}
                            className={`text-left p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                              active
                                ? 'bg-[#FEF3C7]/45 border-[#F59E0B] shadow-sm'
                                : 'bg-[#FAFAFA] border-zinc-200 hover:border-zinc-300'
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <div
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                                    active
                                      ? 'bg-[#141414] text-[#F59E0B]'
                                      : 'bg-white border border-zinc-200 text-[#D97706]'
                                  }`}
                                >
                                  <Icon size={17} />
                                </div>
                                <span
                                  className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                                    active
                                      ? 'bg-[#F59E0B] border-[#F59E0B] text-[#141414]'
                                      : 'bg-white border-zinc-300 text-transparent'
                                  }`}
                                >
                                  <Check size={12} strokeWidth={3} />
                                </span>
                              </div>
                              <h4 className="text-xs sm:text-sm font-extrabold text-[#141414]">
                                {opt.title}
                              </h4>
                              <p className="text-[11px] text-[#52525B] font-medium leading-relaxed">
                                {opt.desc}
                              </p>
                            </div>
                            <span className="inline-block w-fit text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white border border-zinc-200 text-[#52525B]">
                              {opt.badge}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full sm:w-auto px-7 py-3.5 bg-[#141414] hover:bg-zinc-800 text-white font-extrabold rounded-xl text-xs sm:text-sm inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <span>Lanjut Pilih Paket</span>
                      <ArrowRight size={15} className="text-[#F59E0B]" />
                    </motion.button>
                  </div>
                </motion.form>
              )}

              {/* SLIDE 3: DAFTARKAN PAKET & METODE PEMBAYARAN */}
              {step === 3 && (
                <motion.form
                  key="reg-slide-3"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                  onSubmit={handleSubmitStep3}
                  className="space-y-5"
                >
                  {/* Pilih Paket */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[#141414]">
                      Pilih Paket Langganan
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {SUBSCRIPTION_PLANS.map((plan) => {
                        const selected = selectedPlanId === plan.id;
                        return (
                          <button
                            key={plan.id}
                            type="button"
                            onClick={() => handlePlanSelect(plan.id)}
                            className={`text-left p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                              selected
                                ? 'bg-[#FEF3C7]/45 border-[#F59E0B] shadow-sm'
                                : 'bg-[#FAFAFA] border-zinc-200 hover:border-zinc-300'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-extrabold text-[#141414]">
                                {plan.name.replace('Paket ', '')}
                              </span>
                              {selected && (
                                <span className="w-4 h-4 rounded-full bg-[#F59E0B] text-[#141414] flex items-center justify-center">
                                  <Check size={10} strokeWidth={3} />
                                </span>
                              )}
                            </div>
                            <p className="font-mono text-sm font-black text-[#D97706] mt-1">
                              {plan.price}
                              <span className="text-[10px] font-medium text-[#52525B]">{plan.period}</span>
                            </p>
                            <p className="text-[10px] text-[#52525B] font-medium mt-1 leading-snug">
                              {plan.subtitle}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Pilih Metode Pembayaran */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[#141414]">
                      Metode Pembayaran Langganan
                    </label>
                    <div className="space-y-2">
                      {PAYMENT_METHODS.map((pm) => {
                        const active = paymentMethod === pm.id;
                        const Icon = pm.icon;
                        return (
                          <button
                            key={pm.id}
                            type="button"
                            onClick={() => setPaymentMethod(pm.id)}
                            className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                              active
                                ? 'bg-[#FEF3C7]/40 border-[#F59E0B] shadow-sm'
                                : 'bg-[#FAFAFA] border-zinc-200 hover:border-zinc-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                  active
                                    ? 'bg-[#141414] text-[#F59E0B]'
                                    : 'bg-white border border-zinc-200 text-[#D97706]'
                                }`}
                              >
                                <Icon size={17} />
                              </div>
                              <div>
                                <p className="text-xs font-extrabold text-[#141414]">{pm.title}</p>
                                <p className="text-[11px] text-[#52525B] font-medium">{pm.desc}</p>
                              </div>
                            </div>
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0 ${
                                active
                                  ? 'bg-[#F59E0B] border-[#F59E0B] text-[#141414]'
                                  : 'bg-white border-zinc-300 text-transparent'
                              }`}
                            >
                              <Check size={12} strokeWidth={3} />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Ringkasan Pilihan */}
                  <div className="bg-[#FAFAFA] border border-zinc-200 rounded-2xl p-4 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-[#52525B]">Paket Dipilih</span>
                      <span className="font-extrabold text-[#141414]">
                        {activePlan.name} ({activePlan.price}{activePlan.period})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#52525B]">Usaha &amp; Kasir</span>
                      <span className="font-bold text-[#141414]">
                        {formData.businessName} • {businessType === 'retail' ? 'Ritel' : 'F&B'} ({paymentFlow === 'pay_later' ? 'Pay Later' : 'Pay First'})
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage('');
                        setStep(2);
                      }}
                      className="px-4 py-3 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-100 text-xs font-bold text-[#141414] inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft size={14} /> Kembali
                    </button>
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 sm:flex-none px-7 py-3.5 bg-[#F59E0B] hover:bg-[#D97706] text-[#141414] font-extrabold rounded-xl text-xs sm:text-sm inline-flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-60"
                    >
                      <span>Konfirmasi Paket &amp; Lanjut</span>
                      <ArrowRight size={15} />
                    </motion.button>
                  </div>
                </motion.form>
              )}

              {/* SLIDE 4: TAMBAH KARYAWAN ATAU LANGSUNG KE DASHBOARD ADMIN */}
              {step === 4 && (
                <motion.div
                  key="reg-slide-4"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                  className="space-y-5"
                >
                  {/* Pilihan Ya / Tidak */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setWantAddStaff(false)}
                      className={`text-left p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        !wantAddStaff
                          ? 'bg-[#FEF3C7]/45 border-[#F59E0B] shadow-sm'
                          : 'bg-[#FAFAFA] border-zinc-200 hover:border-zinc-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-extrabold text-[#141414]">
                          Tidak, Nanti Saja
                        </span>
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                            !wantAddStaff
                              ? 'bg-[#F59E0B] border-[#F59E0B] text-[#141414]'
                              : 'bg-white border-zinc-300 text-transparent'
                          }`}
                        >
                          <Check size={12} strokeWidth={3} />
                        </span>
                      </div>
                      <p className="text-[11px] text-[#52525B] font-medium">
                        Langsung masuk ke Dashboard Admin Perusahaan sekarang.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setWantAddStaff(true)}
                      className={`text-left p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        wantAddStaff
                          ? 'bg-[#FEF3C7]/45 border-[#F59E0B] shadow-sm'
                          : 'bg-[#FAFAFA] border-zinc-200 hover:border-zinc-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-extrabold text-[#141414]">
                          Ya, Tambah Karyawan
                        </span>
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                            wantAddStaff
                              ? 'bg-[#F59E0B] border-[#F59E0B] text-[#141414]'
                              : 'bg-white border-zinc-300 text-transparent'
                          }`}
                        >
                          <Check size={12} strokeWidth={3} />
                        </span>
                      </div>
                      <p className="text-[11px] text-[#52525B] font-medium">
                        Daftarkan akun Kasir atau Stocker sebelum masuk dashboard.
                      </p>
                    </button>
                  </div>

                  {wantAddStaff && (
                    <div className="bg-[#FAFAFA] border border-zinc-200 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Users size={15} className="text-[#D97706]" />
                          <span className="text-xs font-extrabold text-[#141414]">
                            Tambah Akun Karyawan
                          </span>
                        </div>
                        {isStarter && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
                            <Lock size={10} /> Starter: Maks. 1 Kasir (Stocker Terkunci)
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setStaffDraft({ ...staffDraft, role: 'kasir' })}
                          className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                            staffDraft.role === 'kasir'
                              ? 'bg-[#141414] text-[#F59E0B] border-[#141414]'
                              : 'bg-white text-[#52525B] border-zinc-200 hover:text-[#141414]'
                          }`}
                        >
                          Kasir
                        </button>
                        <button
                          type="button"
                          disabled={isStarter}
                          onClick={() => !isStarter && setStaffDraft({ ...staffDraft, role: 'stocker' })}
                          className={`py-2 px-3 rounded-xl text-xs font-bold border inline-flex items-center justify-center gap-1.5 transition-colors ${
                            isStarter
                              ? 'bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed'
                              : staffDraft.role === 'stocker'
                              ? 'bg-[#141414] text-[#F59E0B] border-[#141414] cursor-pointer'
                              : 'bg-white text-[#52525B] border-zinc-200 hover:text-[#141414] cursor-pointer'
                          }`}
                        >
                          {isStarter && <Lock size={11} />}
                          <span>Stocker {isStarter ? '(Pro)' : ''}</span>
                        </button>
                      </div>

                      {!starterKasirFull && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Username Karyawan (mis. budi_kasir)"
                            value={staffDraft.fullName}
                            onChange={(e) => setStaffDraft({ ...staffDraft, fullName: e.target.value })}
                            className="bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-semibold text-[#141414] focus:outline-none focus:border-[#F59E0B]"
                          />
                          <div className="flex gap-1.5">
                            <div className="relative flex-1">
                              <input
                                type={showStaffPass ? 'text' : 'password'}
                                placeholder="Password (min. 6 karakter)"
                                value={staffDraft.password}
                                onChange={(e) => setStaffDraft({ ...staffDraft, password: e.target.value })}
                                className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 pr-8 text-xs font-semibold text-[#141414] focus:outline-none focus:border-[#F59E0B]"
                              />
                              <button
                                type="button"
                                onClick={() => setShowStaffPass((v) => !v)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-[#141414] cursor-pointer"
                              >
                                {showStaffPass ? <EyeOff size={12} /> : <Eye size={12} />}
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={handleAddStaffDraft}
                              className="px-3 py-2 rounded-xl bg-[#141414] hover:bg-zinc-800 text-[#F59E0B] text-xs font-bold inline-flex items-center gap-1 cursor-pointer shrink-0"
                              title="Tambahkan ke daftar karyawan"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      )}

                      {staffList.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          {staffList.map((st) => (
                            <div
                              key={st.id}
                              className="bg-white border border-zinc-200 rounded-xl px-3 py-2 flex items-center justify-between gap-2 text-xs"
                            >
                              <div className="min-w-0 flex items-center gap-2">
                                <Briefcase size={13} className="text-[#D97706] shrink-0" />
                                <span className="font-bold text-[#141414] truncate">{st.fullName}</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] shrink-0">
                                  {st.role === 'kasir' ? 'Kasir' : 'Stocker'}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveStaff(st.id)}
                                className="text-red-500 hover:text-red-700 p-1 cursor-pointer shrink-0"
                                aria-label={`Hapus ${st.fullName}`}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage('');
                        setStep(3);
                      }}
                      className="px-4 py-3 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-100 text-xs font-bold text-[#141414] inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft size={14} /> Kembali
                    </button>

                    <motion.button
                      type="button"
                      disabled={loading}
                      onClick={() => handleFinishRegistration(!wantAddStaff)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 sm:flex-none px-7 py-3.5 bg-[#F59E0B] hover:bg-[#D97706] text-[#141414] font-extrabold rounded-xl text-xs sm:text-sm inline-flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-60 shadow-sm"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          <span>Menyiapkan Dashboard...</span>
                        </>
                      ) : (
                        <>
                          <span>
                            {wantAddStaff && staffList.length > 0
                              ? 'Simpan Karyawan & Masuk Dashboard'
                              : 'Masuk ke Dashboard Admin'}
                          </span>
                          <ArrowRight size={15} />
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <footer className="py-5 text-center font-mono text-[11px] text-[#52525B]">
        &copy; 2026 Stocko. Seluruh hak cipta dilindungi.
      </footer>
    </div>
  );
}
