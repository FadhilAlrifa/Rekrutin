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
  Edit3,
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
  Loader2,
  AlertCircle,
  CheckCircle2,
  AtSign
} from 'lucide-react';
import { supabase, supabaseAdminAuth } from '../../services/supabaseClient';
import {
  saveMerchantSettings,
  fetchOrInitCompanyWorkspace
} from '../../services/stockoService';
import {
  createSingleEmployeeAccount,
  validatePersonalEmployeeName,
  usernameToInternalAuthEmail
} from '../../services/employeeAuditService';
import { SUBSCRIPTION_PLANS } from '../../data/subscriptionPlans';
import { useNotify } from '../../components/common/NotificationContext';
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

const REGISTER_STEPS = [
  { id: 1, shortTitle: 'Akun & OTP', icon: ShieldCheck },
  { id: 2, shortTitle: 'Profil Bisnis', icon: Building2 },
  { id: 3, shortTitle: 'Paket & Bayar', icon: CreditCard },
  { id: 4, shortTitle: 'Staf Awal', icon: Users }
];

export default function Register({
  onBack,
  onOpenLogin,
  initialPlan = 'pro',
  onPlanChange,
  onCompleteRegistration
}) {
  const { showToast, showAlert } = useNotify();

  const [step, setStep] = useState(1); // 1: Akun & OTP, 2: Kategori & Cara Bayar, 3: Paket & Pembayaran, 4: Karyawan
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
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

  // Slide 2: Kategori Usaha, Tipe Layanan F&B, & Cara Bayar
  const [businessType, setBusinessType] = useState('fnb'); // 'fnb' | 'retail'
  const [fnbServiceMode, setFnbServiceMode] = useState('dine_in_take_away'); // 'dine_in_take_away' | 'take_away_only'
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
  const [editingStaffId, setEditingStaffId] = useState(null);
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
  const kasirCount = staffList.filter(
    (s) => s.role === 'kasir' && s.id !== editingStaffId
  ).length;
  const starterKasirFull = isStarter && kasirCount >= 1 && !editingStaffId;
  const previewStaffEmail = staffDraft.fullName.trim()
    ? usernameToInternalAuthEmail(staffDraft.fullName)
    : 'username@staff.stocko.app';

  const handlePlanSelect = (planId) => {
    setSelectedPlanId(planId);
    onPlanChange?.(planId);
    if (planId === 'starter') {
      setStaffDraft((prev) => ({ ...prev, role: 'kasir' }));
      setStaffList((prev) => {
        const firstKasir = prev.find((s) => s.role === 'kasir');
        return firstKasir ? [firstKasir] : [];
      });
      setEditingStaffId(null);
    }
  };

  // SLIDE 1A: Kirim kode verifikasi ke email menggunakan client terisolasi (persistSession: false)
  const handleSendVerification = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanUsername = formData.username.trim();
    const nextErrors = {};

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      nextErrors.email = 'Masukkan alamat email aktif yang valid (contoh: owner@usaha.com).';
    }
    if (cleanUsername.length < 3) {
      nextErrors.username = 'Username / nama admin minimal 3 karakter.';
    }
    if (formData.password.length < 6) {
      nextErrors.password = 'Password akun minimal 6 karakter.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setErrorMessage(Object.values(nextErrors)[0]);
      return;
    }
    setFieldErrors({});

    // Jika email ini sudah terverifikasi sebelumnya di sesi registrasi ini, langsung lanjut ke Slide 2
    if (verifiedUser && String(verifiedUser.email || '').toLowerCase() === cleanEmail) {
      setStep(2);
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
        const retrySign = await supabaseAdminAuth.auth.signInWithPassword({
          email: cleanEmail,
          password: formData.password
        });
        if (!retrySign.error && retrySign.data?.user) {
          authData = retrySign.data;
        } else {
          setLoading(false);
          setErrorMessage(
            'Email ini sudah terdaftar. Silakan masuk melalui halaman Login atau gunakan email lain.'
          );
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
        `Server email Supabase membatasi pengiriman (${otpMailError.message}). Gunakan kode OTP cadangan di atas agar tetap bisa melanjutkan.`
      );
      setInfoMessage(`Kode OTP cadangan aktif untuk verifikasi ${cleanEmail}.`);
      showToast({
        title: 'Fallback OTP Lokal Aktif',
        message: 'SMTP Supabase terkena rate-limit. Kode cadangan 6 digit siap digunakan.',
        variant: 'warning'
      });
    } else {
      setFallbackOtpCode('');
      setSmtpNotice('');
      setInfoMessage(
        `Kode verifikasi telah dikirim ke ${cleanEmail}. Cek kotak masuk atau folder spam email kamu.`
      );
      showToast({
        title: 'Kode OTP Terkirim',
        message: `Silakan cek inbox atau spam pada ${cleanEmail}.`,
        variant: 'info'
      });
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
      setInfoMessage(`Kode verifikasi cadangan baru disiapkan untuk ${cleanEmail}.`);
      showToast({
        title: 'Kode OTP Cadangan Diperbarui',
        message: 'Gunakan kode baru yang tampil pada panel verifikasi.',
        variant: 'warning'
      });
    } else {
      setFallbackOtpCode('');
      setSmtpNotice('');
      setInfoMessage(`Kode verifikasi baru telah dikirim ke email ${cleanEmail}.`);
      showToast({
        title: 'Kode OTP Dikirim Ulang',
        message: `Cek email ${cleanEmail} untuk kode terbaru.`,
        variant: 'info'
      });
    }
  };

  // SLIDE 1C: Cocokkan kode verifikasi -> lanjut Slide 2
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
      showToast({
        title: 'Verifikasi Berhasil',
        message: 'Lanjut mengatur profil bisnis kamu.',
        variant: 'success'
      });
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
    showToast({
      title: 'Email Terverifikasi',
      message: `${cleanEmail} terkonfirmasi. Lanjut pilih profil bisnis.`,
      variant: 'success'
    });
    setStep(2);
  };

  // SLIDE 2 -> SLIDE 3
  const handleSubmitStep2 = (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!formData.businessName.trim()) {
      setFieldErrors({ businessName: 'Nama perusahaan / usaha wajib diisi.' });
      setErrorMessage('Nama perusahaan / usaha wajib diisi.');
      return;
    }
    setFieldErrors({});
    setStep(3);
  };

  // SLIDE 3 -> SLIDE 4
  const handleSubmitStep3 = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setStep(4);
  };

  // SLIDE 4: Tambah / perbarui draft karyawan
  const handleAddOrUpdateStaffDraft = () => {
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

    const otherEmployees = staffList.filter((s) => s.id !== editingStaffId);
    const nameCheck = validatePersonalEmployeeName(staffDraft.fullName, otherEmployees);
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

    const generatedEmail = usernameToInternalAuthEmail(nameCheck.cleanName);

    if (editingStaffId) {
      setStaffList((prev) =>
        prev.map((s) =>
          s.id === editingStaffId
            ? {
                ...s,
                username: nameCheck.cleanName,
                fullName: nameCheck.cleanName,
                email: generatedEmail,
                password: staffDraft.password,
                role: staffDraft.role
              }
            : s
        )
      );
      setEditingStaffId(null);
      showToast({
        title: 'Draft staf diperbarui',
        message: `${nameCheck.cleanName} (${generatedEmail})`,
        variant: 'success'
      });
    } else {
      setStaffList((prev) => [
        ...prev,
        {
          id: `DRAFT-${Date.now()}`,
          username: nameCheck.cleanName,
          fullName: nameCheck.cleanName,
          email: generatedEmail,
          password: staffDraft.password,
          role: staffDraft.role
        }
      ]);
      showToast({
        title: 'Staf ditambahkan ke daftar',
        message: `${nameCheck.cleanName} • ${generatedEmail}`,
        variant: 'success'
      });
    }

    setStaffDraft({
      fullName: '',
      email: '',
      password: '',
      role: 'kasir'
    });
  };

  const handleEditStaffDraft = (st) => {
    setErrorMessage('');
    setWantAddStaff(true);
    setEditingStaffId(st.id);
    setStaffDraft({
      fullName: st.username || st.fullName,
      email: st.email || usernameToInternalAuthEmail(st.username || st.fullName),
      password: st.password || '',
      role: st.role || 'kasir'
    });
  };

  const handleCancelEditStaff = () => {
    setEditingStaffId(null);
    setStaffDraft({
      fullName: '',
      email: '',
      password: '',
      role: 'kasir'
    });
  };

  const handleRemoveStaff = (id) => {
    if (editingStaffId === id) {
      handleCancelEditStaff();
    }
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
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: formData.password
    });

    if (signInError && !verifiedUser) {
      setLoading(false);
      await showAlert({
        title: 'Gagal Mengaktifkan Sesi',
        message: signInError.message || 'Silakan ulangi verifikasi akun di Slide 1.',
        variant: 'danger'
      });
      return;
    }

    const activeUser = signInData?.user || verifiedUser;
    const companyId = activeUser?.id || `comp-${Date.now()}`;

    const effectiveFnbServiceMode =
      businessType === 'fnb' ? fnbServiceMode : 'dine_in_take_away';
    const defaultOrderChannel =
      businessType === 'fnb' && effectiveFnbServiceMode === 'take_away_only'
        ? 'take_away'
        : 'dine_in';

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
        fnb_service_mode: effectiveFnbServiceMode,
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
      fnbServiceMode: effectiveFnbServiceMode,
      paymentFlow,
      subscriptionPlan: selectedPlanId,
      forceReset: true
    });

    await saveMerchantSettings(
      {
        businessType,
        fnbServiceMode: effectiveFnbServiceMode,
        defaultOrderChannel,
        paymentFlow
      },
      cleanUsername
    );

    // 4. Daftarkan karyawan (jika ada) ke dalam workspace perusahaan ini
    let createdCount = 0;
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
          createdCount += 1;
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
    showToast({
      title: `Selamat datang, ${cleanBusiness}!`,
      message:
        createdCount > 0
          ? `Workspace & ${createdCount} akun staf berhasil disiapkan.`
          : 'Workspace bisnis berhasil disiapkan.',
      variant: 'success'
    });

    await onCompleteRegistration?.({
      companyId,
      subscriptionPlan: selectedPlanId,
      businessType,
      fnbServiceMode: effectiveFnbServiceMode,
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
        ? 'Masukkan kode OTP 6 digit untuk memverifikasi email dan membuka pengaturan bisnis.'
        : 'Isi email, username admin, dan kata sandi untuk mulai membuat workspace usaha.'
    },
    2: {
      title: 'Pilih Kategori & Alur Kasir',
      desc: 'Tentukan jenis usaha dan metode alur bayar pelanggan yang sesuai operasional Anda.'
    },
    3: {
      title: 'Pilih Paket & Metode Pembayaran',
      desc: 'Pilih paket fitur Stocko dan metode pembayaran langganan untuk bisnis Anda.'
    },
    4: {
      title: 'Tambah Akun Staf Awal (Opsional)',
      desc: 'Buat akun eksklusif Kasir / Stocker berbasis username sebelum masuk ke dashboard.'
    }
  };

  const handleStepperJump = (targetStep) => {
    if (loading) return;
    if (targetStep < step) {
      setErrorMessage('');
      setInfoMessage('');
      setStep(targetStep);
    }
  };

  const activePaymentLabel =
    PAYMENT_METHODS.find((p) => p.id === paymentMethod)?.title || 'Transfer Bank / VA';

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#141414] font-sans selection:bg-[#F59E0B] selection:text-[#141414] relative overflow-x-hidden flex flex-col justify-between">
      <CustomCursor />

      {/* NAVBAR */}
      <motion.nav
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.36, 1] }}
        className="w-full top-0 z-50 px-4 md:px-6 pt-4 relative"
      >
        <div className="max-w-7xl mx-auto bg-white border border-[#E5E5E5] rounded-full px-4 sm:px-5 py-2.5 flex items-center justify-between shadow-[0_4px_16px_-6px_rgba(20,20,20,0.06)]">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={onBack}>
            <div className="w-9 h-9 rounded-full bg-[#FAFAFA] border border-[#E5E5E5] flex items-center justify-center shrink-0">
              <img src="/logo-stocko.png" alt="Stocko Logo" className="w-5 h-5 object-contain" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-[#141414]">
              Stocko<span className="text-[#F59E0B]">.</span>
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={onOpenLogin}
              className="text-xs font-semibold text-[#52525B] hover:text-[#141414] transition-colors cursor-pointer hidden sm:inline"
            >
              Sudah punya akun? <span className="font-extrabold text-[#D97706]">Masuk</span>
            </button>
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-[#52525B] hover:text-[#D97706] font-semibold text-xs transition-colors cursor-pointer group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              <span>Beranda</span>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* CARD UTAMA PENDAFTARAN (4 SLIDE) */}
      <div className="max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 relative z-10 my-auto">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.36, 1] }}
          className="bg-white border border-[#E5E5E5] rounded-3xl shadow-[0_24px_60px_-20px_rgba(20,20,20,0.12)] overflow-hidden"
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

          {/* 4-Slide Stepper Bar */}
          <div className="px-5 sm:px-9 pt-6 pb-5 bg-[#FAFAFA] border-b border-[#E5E5E5]">
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {REGISTER_STEPS.map((s) => {
                const isDone = s.id < step || (s.id === 1 && verifiedUser && step > 1);
                const isActive = s.id === step;
                const canJump = s.id < step && !loading;
                const StepIcon = s.icon;

                return (
                  <button
                    key={s.id}
                    type="button"
                    disabled={!canJump}
                    onClick={() => handleStepperJump(s.id)}
                    className={`flex flex-col sm:flex-row items-center sm:items-center gap-1.5 sm:gap-2.5 p-2 sm:px-3 sm:py-2.5 rounded-2xl border text-center sm:text-left transition-all ${
                      isActive
                        ? 'bg-white border-[#F59E0B] shadow-sm'
                        : isDone
                        ? 'bg-white border-[#E5E5E5] hover:border-[#F59E0B]/70 cursor-pointer'
                        : 'bg-transparent border-transparent text-zinc-400 cursor-default'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 font-mono text-xs font-extrabold transition-colors ${
                        isActive
                          ? 'bg-[#F59E0B] text-[#141414]'
                          : isDone
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-white border border-[#E5E5E5] text-[#52525B]'
                      }`}
                    >
                      {isDone ? <Check size={14} strokeWidth={3} /> : <StepIcon size={14} />}
                    </div>
                    <div className="min-w-0">
                      <span className="block font-mono text-[9px] font-bold uppercase tracking-wider text-[#52525B]">
                        Slide {s.id}
                      </span>
                      <span
                        className={`block text-[11px] font-extrabold truncate ${
                          isActive || isDone ? 'text-[#141414]' : 'text-[#52525B]'
                        }`}
                      >
                        {s.shortTitle}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6 sm:p-9">
            {/* Header Judul Slide */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-6 border-b border-zinc-100">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
                    Langkah {step} / 4
                  </span>
                  {verifiedUser && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <ShieldCheck size={11} /> Email Terverifikasi
                    </span>
                  )}
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#141414] tracking-tight">
                  {stepMeta[step].title}
                </h1>
                <p className="text-xs text-[#52525B] font-medium mt-1 leading-relaxed">
                  {stepMeta[step].desc}
                </p>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-4 py-3 rounded-xl flex items-start gap-2.5">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {infoMessage && (
              <div className="mb-5 bg-[#FEF3C7]/75 border border-[#FDE68A] text-[#78350F] text-xs font-semibold px-4 py-3 rounded-xl flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[#B45309] shrink-0 mt-0.5" />
                <span>{infoMessage}</span>
              </div>
            )}

            <AnimatePresence mode="wait">
              {/* SLIDE 1A: EMAIL, USERNAME, PASSWORD */}
              {step === 1 && !otpSent && (
                <motion.form
                  key="reg-slide-1-form"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  onSubmit={handleSendVerification}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold text-[#141414] mb-1.5">
                      Email Admin <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="email"
                        required
                        placeholder="admin@usahaanda.com"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                        }}
                        className={`w-full bg-[#FAFAFA] border rounded-xl px-4 py-3.5 pl-11 text-sm font-semibold text-[#141414] placeholder-zinc-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-[#F59E0B]/15 transition-all ${
                          fieldErrors.email
                            ? 'border-red-400 focus:border-red-500'
                            : 'border-[#E5E5E5] focus:border-[#F59E0B]'
                        }`}
                      />
                    </div>
                    {fieldErrors.email && (
                      <p className="text-[11px] font-semibold text-red-600 mt-1">{fieldErrors.email}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#141414] mb-1.5">
                        Username / Nama Admin <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                          type="text"
                          required
                          placeholder="Contoh: Budi Santoso"
                          value={formData.username}
                          onChange={(e) => {
                            setFormData({ ...formData, username: e.target.value });
                            if (fieldErrors.username) setFieldErrors({ ...fieldErrors, username: '' });
                          }}
                          className={`w-full bg-[#FAFAFA] border rounded-xl px-4 py-3.5 pl-11 text-sm font-semibold text-[#141414] placeholder-zinc-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-[#F59E0B]/15 transition-all ${
                            fieldErrors.username
                              ? 'border-red-400 focus:border-red-500'
                              : 'border-[#E5E5E5] focus:border-[#F59E0B]'
                          }`}
                        />
                      </div>
                      {fieldErrors.username && (
                        <p className="text-[11px] font-semibold text-red-600 mt-1">
                          {fieldErrors.username}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#141414] mb-1.5">
                        Password Akun <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                          type={showOwnerPass ? 'text' : 'password'}
                          required
                          minLength={6}
                          placeholder="Minimal 6 karakter"
                          value={formData.password}
                          onChange={(e) => {
                            setFormData({ ...formData, password: e.target.value });
                            if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                          }}
                          className={`w-full bg-[#FAFAFA] border rounded-xl px-4 py-3.5 pl-11 pr-11 text-sm font-semibold text-[#141414] placeholder-zinc-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-[#F59E0B]/15 transition-all ${
                            fieldErrors.password
                              ? 'border-red-400 focus:border-red-500'
                              : 'border-[#E5E5E5] focus:border-[#F59E0B]'
                          }`}
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
                      {fieldErrors.password && (
                        <p className="text-[11px] font-semibold text-red-600 mt-1">
                          {fieldErrors.password}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-2xl p-3.5 flex items-start gap-2.5 text-[11px] text-[#52525B] font-medium">
                    <ShieldCheck size={15} className="text-[#D97706] shrink-0 mt-0.5" />
                    <span>
                      Setelah ini, kami akan mengirimkan kode OTP 6 digit ke email Admin untuk mengaktifkan workspace perusahaan Anda.
                    </span>
                  </div>

                  <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={onOpenLogin}
                      className="text-xs font-bold text-[#52525B] hover:text-[#141414] cursor-pointer text-center py-2"
                    >
                      Sudah punya akun? <span className="text-[#D97706]">Masuk di sini</span>
                    </button>

                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-7 py-3.5 bg-[#F59E0B] hover:bg-[#D97706] text-[#141414] font-extrabold rounded-xl text-xs sm:text-sm inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          <span>Mengirim Kode OTP...</span>
                        </>
                      ) : (
                        <>
                          <span>Kirim Kode Verifikasi</span>
                          <ArrowRight size={15} />
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.form>
              )}

              {/* SLIDE 1B: INPUT KODE VERIFIKASI OTP */}
              {step === 1 && otpSent && (
                <motion.form
                  key="reg-slide-1-otp"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  onSubmit={handleVerifyOtp}
                  className="space-y-5"
                >
                  <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-[#E5E5E5] text-[#D97706] flex items-center justify-center shrink-0">
                        <Mail size={18} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold text-[#52525B] block">
                          Email Tujuan Verifikasi
                        </span>
                        <span className="text-sm font-mono font-extrabold text-[#141414] truncate block">
                          {formData.email.trim().toLowerCase()}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setErrorMessage('');
                        setInfoMessage('');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E5] hover:border-[#F59E0B] text-xs font-bold text-[#141414] cursor-pointer shrink-0 w-fit"
                    >
                      Ubah Email
                    </button>
                  </div>

                  {fallbackOtpCode ? (
                    <div className="bg-[#FEF3C7] border border-[#F59E0B] rounded-2xl p-4 space-y-2.5">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div>
                          <span className="font-mono text-[10px] font-extrabold uppercase tracking-wider text-[#B45309] block">
                            Fallback OTP Lokal (Rate-Limit SMTP)
                          </span>
                          <span className="font-mono text-2xl font-black tracking-[0.24em] text-[#141414] block mt-0.5">
                            {fallbackOtpCode}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setOtpCode(fallbackOtpCode);
                            showToast({
                              title: 'Kode OTP Terisi',
                              message: 'Klik Verifikasi & Lanjut untuk melanjutkan.',
                              variant: 'info'
                            });
                          }}
                          className="px-4 py-2 rounded-xl bg-[#141414] hover:bg-zinc-800 text-[#F59E0B] text-xs font-extrabold cursor-pointer transition-colors"
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
                  ) : (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 flex items-center gap-2.5 text-xs font-semibold text-emerald-800">
                      <CheckCircle2 size={16} className="shrink-0" />
                      <span>
                        OTP resmi Supabase telah dikirim ke email Anda. Periksa kotak masuk atau folder spam.
                      </span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-[#141414] mb-1.5">
                      Masukkan Kode Verifikasi OTP (6–8 Digit)
                    </label>
                    <div className="relative">
                      <KeyRound size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D97706]" />
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={8}
                        required
                        placeholder="Contoh: 123456"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full bg-[#FAFAFA] border-2 border-[#E5E5E5] focus:border-[#F59E0B] focus:bg-white rounded-xl px-4 py-4 pl-12 text-xl font-mono font-extrabold tracking-[0.3em] text-[#141414] placeholder:tracking-normal placeholder:font-sans placeholder:text-sm placeholder:font-semibold placeholder-zinc-400 focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mt-2.5">
                      <span className="text-[11px] text-[#52525B] font-medium">
                        Belum menerima kode di kotak masuk / spam?
                      </span>
                      <button
                        type="button"
                        disabled={resendCooldown > 0 || loading}
                        onClick={handleResendOtp}
                        className="text-[11px] font-extrabold text-[#B45309] hover:text-[#141414] inline-flex items-center gap-1.5 cursor-pointer disabled:text-zinc-400 disabled:cursor-not-allowed"
                      >
                        <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
                        {resendCooldown > 0
                          ? `Kirim Ulang (${resendCooldown}d)`
                          : 'Kirim Ulang Kode'}
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
                      className="px-4 py-3 rounded-xl bg-white border border-[#E5E5E5] hover:bg-[#FAFAFA] text-xs font-bold text-[#141414] inline-flex items-center gap-1.5 cursor-pointer"
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

              {/* SLIDE 2: PROFIL BISNIS */}
              {step === 2 && (
                <motion.form
                  key="reg-slide-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                  onSubmit={handleSubmitStep2}
                  className="space-y-5"
                >
                  <div>
                    <label className="block text-xs font-bold text-[#141414] mb-1.5">
                      Nama Perusahaan / Usaha <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Kopi Kita Makassar / Minimarket Berkah"
                        value={formData.businessName}
                        onChange={(e) => {
                          setFormData({ ...formData, businessName: e.target.value });
                          if (fieldErrors.businessName) {
                            setFieldErrors({ ...fieldErrors, businessName: '' });
                          }
                        }}
                        className={`w-full bg-[#FAFAFA] border rounded-xl px-4 py-3.5 pl-11 text-sm font-semibold text-[#141414] placeholder-zinc-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-[#F59E0B]/15 transition-all ${
                          fieldErrors.businessName
                            ? 'border-red-400 focus:border-red-500'
                            : 'border-[#E5E5E5] focus:border-[#F59E0B]'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Kategori Usaha */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[#141414]">
                      Pilih Kategori Usaha
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        {
                          id: 'fnb',
                          title: 'F&B (Kafe / Restoran / Kedai)',
                          desc: 'Mendukung resep bahan baku (BOM), HPP per porsi, alur dapur/KDS, dan open bill.',
                          badge: 'Mode Resep & BOM',
                          icon: UtensilsCrossed
                        },
                        {
                          id: 'retail',
                          title: 'Toko Ritel & Minimarket',
                          desc: 'Mendukung SKU barang jadi, harga kulakan vs jual, serta pengurangan stok unit langsung.',
                          badge: 'Mode SKU & Kulakan',
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
                                : 'bg-[#FAFAFA] border-[#E5E5E5] hover:border-zinc-300'
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <div
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                    active
                                      ? 'bg-[#141414] text-[#F59E0B]'
                                      : 'bg-white border border-[#E5E5E5] text-[#D97706]'
                                  }`}
                                >
                                  <Icon size={18} />
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
                            <span className="inline-block w-fit font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white border border-[#E5E5E5] text-[#52525B]">
                              {opt.badge}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tipe Layanan F&B (Dine-In + Take-Away vs Khusus Take-Away) */}
                  {businessType === 'fnb' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <label className="block text-xs font-bold text-[#141414]">
                          Model Layanan F&amp;B
                        </label>
                        <span className="text-[11px] font-medium text-[#71717A]">
                          Menyesuaikan kasir &amp; fitur meja
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          {
                            id: 'dine_in_take_away',
                            title: 'Resto & Kafe (Dine-In + Take-Away)',
                            desc: 'Tersedia meja makan di tempat (nomor meja), bawa pulang, serta pesan mandiri QR Meja.',
                            badge: 'Resto & Kafe Meja',
                            icon: UtensilsCrossed
                          },
                          {
                            id: 'take_away_only',
                            title: 'Khusus Take-Away (Counter / Grab & Go)',
                            desc: 'Fokus pesanan bawa pulang / antrean tanpa meja (seperti Komar, booth minuman, dll).',
                            badge: 'Tanpa Meja • Take-Away',
                            icon: ShoppingBag
                          }
                        ].map((opt) => {
                          const active = fnbServiceMode === opt.id;
                          const Icon = opt.icon;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                setFnbServiceMode(opt.id);
                                if (opt.id === 'take_away_only') {
                                  setPaymentFlow('pay_first');
                                }
                              }}
                              className={`text-left p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                                active
                                  ? 'bg-[#FEF3C7]/45 border-[#F59E0B] shadow-sm'
                                  : 'bg-[#FAFAFA] border-[#E5E5E5] hover:border-zinc-300'
                              }`}
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                  <div
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                      active
                                        ? 'bg-[#141414] text-[#F59E0B]'
                                        : 'bg-white border border-[#E5E5E5] text-[#D97706]'
                                    }`}
                                  >
                                    <Icon size={18} />
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
                              <span className="inline-block w-fit font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white border border-[#E5E5E5] text-[#52525B]">
                                {opt.badge}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Cara Bayar Pelanggan */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[#141414]">
                      Alur Pembayaran di Kasir
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        {
                          id: 'pay_first',
                          title: 'Bayar di Awal (Pay First)',
                          desc: 'Pelanggan membayar lunas di kasir saat memesan, lalu pesanan diproses.',
                          badge: 'Kedai Kopi & Minimarket',
                          icon: Wallet
                        },
                        {
                          id: 'pay_later',
                          title: 'Bayar Nanti / Open Bill (Pay Later)',
                          desc: 'Pesanan masuk dapur dulu, bisa tambah/revisi item, dan dibayar saat selesai.',
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
                                : 'bg-[#FAFAFA] border-[#E5E5E5] hover:border-zinc-300'
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <div
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                    active
                                      ? 'bg-[#141414] text-[#F59E0B]'
                                      : 'bg-white border border-[#E5E5E5] text-[#D97706]'
                                  }`}
                                >
                                  <Icon size={18} />
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
                            <span className="inline-block w-fit font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white border border-[#E5E5E5] text-[#52525B]">
                              {opt.badge}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage('');
                        setOtpSent(false);
                        setStep(1);
                      }}
                      className="px-4 py-3 rounded-xl bg-white border border-[#E5E5E5] hover:bg-[#FAFAFA] text-xs font-bold text-[#141414] inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft size={14} /> Kembali
                    </button>

                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 sm:flex-none px-7 py-3.5 bg-[#F59E0B] hover:bg-[#D97706] text-[#141414] font-extrabold rounded-xl text-xs sm:text-sm inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors"
                    >
                      <span>Lanjut Pilih Paket</span>
                      <ArrowRight size={15} />
                    </motion.button>
                  </div>
                </motion.form>
              )}

              {/* SLIDE 3: PEMILIHAN PAKET & METODE PEMBAYARAN */}
              {step === 3 && (
                <motion.form
                  key="reg-slide-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                  onSubmit={handleSubmitStep3}
                  className="space-y-6"
                >
                  {/* Grid Paket */}
                  <div className="space-y-2.5">
                    <label className="block text-xs font-bold text-[#141414]">
                      Pilih Paket Langganan
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {SUBSCRIPTION_PLANS.map((plan) => {
                        const selected = selectedPlanId === plan.id;
                        const PlanIcon = plan.icon || Briefcase;
                        return (
                          <button
                            key={plan.id}
                            type="button"
                            onClick={() => handlePlanSelect(plan.id)}
                            className={`text-left p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                              selected
                                ? 'bg-[#FEF3C7]/45 border-[#F59E0B] shadow-sm'
                                : 'bg-[#FAFAFA] border-[#E5E5E5] hover:border-zinc-300'
                            }`}
                          >
                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between gap-1.5">
                                <span
                                  className={`font-mono text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                                    selected || plan.highlight
                                      ? 'bg-[#F59E0B] text-[#141414] border-[#F59E0B]'
                                      : 'bg-white text-[#52525B] border-[#E5E5E5]'
                                  }`}
                                >
                                  {plan.badge}
                                </span>
                                <span
                                  className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0 ${
                                    selected
                                      ? 'bg-[#F59E0B] border-[#F59E0B] text-[#141414]'
                                      : 'bg-white border-zinc-300 text-transparent'
                                  }`}
                                >
                                  <Check size={11} strokeWidth={3} />
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                    selected
                                      ? 'bg-[#141414] text-[#F59E0B]'
                                      : 'bg-white border border-[#E5E5E5] text-[#D97706]'
                                  }`}
                                >
                                  <PlanIcon size={15} />
                                </div>
                                <span className="text-xs font-extrabold text-[#141414] leading-tight">
                                  {plan.name.replace('Paket ', '')}
                                </span>
                              </div>

                              <div>
                                <p className="font-mono text-base font-black text-[#141414]">
                                  {plan.price}
                                  <span className="text-[10px] font-semibold text-[#52525B] ml-0.5">
                                    {plan.period}
                                  </span>
                                </p>
                                <p className="text-[10px] text-[#52525B] font-semibold mt-0.5">
                                  {plan.subtitle}
                                </p>
                              </div>

                              <ul className="space-y-1 pt-2 border-t border-zinc-200/70">
                                {(plan.included || []).slice(0, 3).map((feat, idx) => (
                                  <li
                                    key={idx}
                                    className="flex items-start gap-1.5 text-[10px] text-[#52525B] font-medium leading-snug"
                                  >
                                    <Check size={11} className="text-[#D97706] shrink-0 mt-0.5" />
                                    <span className="line-clamp-2">{feat}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Metode Pembayaran */}
                  <div className="space-y-2.5">
                    <label className="block text-xs font-bold text-[#141414]">
                      Metode Pembayaran Langganan
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {PAYMENT_METHODS.map((pm) => {
                        const active = paymentMethod === pm.id;
                        const Icon = pm.icon;
                        return (
                          <button
                            key={pm.id}
                            type="button"
                            onClick={() => setPaymentMethod(pm.id)}
                            className={`text-left p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                              active
                                ? 'bg-[#FEF3C7]/40 border-[#F59E0B] shadow-sm'
                                : 'bg-[#FAFAFA] border-[#E5E5E5] hover:border-zinc-300'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                  active
                                    ? 'bg-[#141414] text-[#F59E0B]'
                                    : 'bg-white border border-[#E5E5E5] text-[#D97706]'
                                }`}
                              >
                                <Icon size={17} />
                              </div>
                              <span
                                className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0 ${
                                  active
                                    ? 'bg-[#F59E0B] border-[#F59E0B] text-[#141414]'
                                    : 'bg-white border-zinc-300 text-transparent'
                                }`}
                              >
                                <Check size={11} strokeWidth={3} />
                              </span>
                            </div>
                            <div>
                              <p className="text-xs font-extrabold text-[#141414] leading-snug">
                                {pm.title}
                              </p>
                              <p className="text-[10px] text-[#52525B] font-medium mt-0.5 leading-snug">
                                {pm.desc}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Ringkasan Pilihan */}
                  <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-2xl p-4 text-xs space-y-2">
                    <div className="flex flex-wrap justify-between gap-2">
                      <span className="text-[#52525B] font-medium">Usaha &amp; Operasional</span>
                      <span className="font-extrabold text-[#141414]">
                        {formData.businessName} • {businessType === 'retail' ? 'Ritel' : 'F&B'} (
                        {paymentFlow === 'pay_later' ? 'Pay Later' : 'Pay First'})
                      </span>
                    </div>
                    <div className="flex flex-wrap justify-between gap-2 pt-2 border-t border-[#E5E5E5]">
                      <span className="text-[#52525B] font-medium">Paket &amp; Pembayaran</span>
                      <span className="font-extrabold text-[#B45309]">
                        {activePlan.name} ({activePlan.price}
                        {activePlan.period}) • {activePaymentLabel}
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
                      className="px-4 py-3 rounded-xl bg-white border border-[#E5E5E5] hover:bg-[#FAFAFA] text-xs font-bold text-[#141414] inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft size={14} /> Kembali
                    </button>
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 sm:flex-none px-7 py-3.5 bg-[#F59E0B] hover:bg-[#D97706] text-[#141414] font-extrabold rounded-xl text-xs sm:text-sm inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors disabled:opacity-60"
                    >
                      <span>Konfirmasi Paket &amp; Lanjut</span>
                      <ArrowRight size={15} />
                    </motion.button>
                  </div>
                </motion.form>
              )}

              {/* SLIDE 4: AKUN STAF AWAL BERBASIS USERNAME */}
              {step === 4 && (
                <motion.div
                  key="reg-slide-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
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
                          : 'bg-[#FAFAFA] border-[#E5E5E5] hover:border-zinc-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-extrabold text-[#141414]">
                          Lewati, Tambah Nanti Saja
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
                        Langsung masuk ke Dashboard Admin perusahaan sekarang.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setWantAddStaff(true)}
                      className={`text-left p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        wantAddStaff
                          ? 'bg-[#FEF3C7]/45 border-[#F59E0B] shadow-sm'
                          : 'bg-[#FAFAFA] border-[#E5E5E5] hover:border-zinc-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-extrabold text-[#141414]">
                          Ya, Tambah Staf Awal
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
                        Buat akun Kasir atau Stocker eksklusif berbasis username sebelum masuk.
                      </p>
                    </button>
                  </div>

                  {wantAddStaff && (
                    <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-2xl p-4 sm:p-5 space-y-4">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Users size={15} className="text-[#D97706]" />
                          <span className="text-xs font-extrabold text-[#141414]">
                            {editingStaffId ? 'Edit Draft Akun Staf' : 'Form Akun Staf Baru'}
                          </span>
                        </div>
                        {isStarter && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
                            <Lock size={10} /> Starter: Maks. 1 Kasir (Stocker Terkunci)
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => setStaffDraft({ ...staffDraft, role: 'kasir' })}
                          className={`py-2.5 px-3 rounded-xl text-xs font-extrabold border transition-colors cursor-pointer ${
                            staffDraft.role === 'kasir'
                              ? 'bg-[#141414] text-[#F59E0B] border-[#141414]'
                              : 'bg-white text-[#52525B] border-[#E5E5E5] hover:text-[#141414]'
                          }`}
                        >
                          Kasir POS
                        </button>
                        <button
                          type="button"
                          disabled={isStarter}
                          onClick={() => !isStarter && setStaffDraft({ ...staffDraft, role: 'stocker' })}
                          className={`py-2.5 px-3 rounded-xl text-xs font-extrabold border inline-flex items-center justify-center gap-1.5 transition-colors ${
                            isStarter
                              ? 'bg-zinc-100 text-zinc-400 border-[#E5E5E5] cursor-not-allowed'
                              : staffDraft.role === 'stocker'
                              ? 'bg-[#141414] text-[#F59E0B] border-[#141414] cursor-pointer'
                              : 'bg-white text-[#52525B] border-[#E5E5E5] hover:text-[#141414] cursor-pointer'
                          }`}
                        >
                          {isStarter && <Lock size={11} />}
                          <span>Stocker Gudang {isStarter ? '(Pro)' : ''}</span>
                        </button>
                      </div>

                      {!starterKasirFull && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-[#52525B] mb-1">
                                Username Karyawan
                              </label>
                              <input
                                type="text"
                                placeholder="Mis. budi_s / rina_kasir"
                                value={staffDraft.fullName}
                                onChange={(e) =>
                                  setStaffDraft({ ...staffDraft, fullName: e.target.value })
                                }
                                className="w-full bg-white border border-[#E5E5E5] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#141414] focus:outline-none focus:border-[#F59E0B]"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-[#52525B] mb-1">
                                Password Login
                              </label>
                              <div className="relative">
                                <input
                                  type={showStaffPass ? 'text' : 'password'}
                                  placeholder="Minimal 6 karakter"
                                  value={staffDraft.password}
                                  onChange={(e) =>
                                    setStaffDraft({ ...staffDraft, password: e.target.value })
                                  }
                                  className="w-full bg-white border border-[#E5E5E5] rounded-xl px-3.5 py-2.5 pr-9 text-xs font-semibold text-[#141414] focus:outline-none focus:border-[#F59E0B]"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowStaffPass((v) => !v)}
                                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-[#141414] cursor-pointer"
                                  aria-label="Tampilkan atau sembunyikan password staf"
                                >
                                  {showStaffPass ? <EyeOff size={13} /> : <Eye size={13} />}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Live Preview Format Email Staf */}
                          <div className="bg-white border border-[#E5E5E5] rounded-xl px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <AtSign size={14} className="text-[#D97706] shrink-0" />
                              <div className="min-w-0">
                                <span className="block text-[10px] font-bold text-[#52525B]">
                                  Preview ID Autentikasi Staf (Login cukup pakai Username)
                                </span>
                                <span className="block font-mono text-xs font-extrabold text-[#141414] truncate">
                                  {previewStaffEmail}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {editingStaffId && (
                                <button
                                  type="button"
                                  onClick={handleCancelEditStaff}
                                  className="px-3 py-2 rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] hover:bg-zinc-100 text-xs font-bold text-[#52525B] cursor-pointer"
                                >
                                  Batal
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={handleAddOrUpdateStaffDraft}
                                className="px-4 py-2 rounded-xl bg-[#141414] hover:bg-zinc-800 text-[#F59E0B] text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
                              >
                                {editingStaffId ? <Check size={13} /> : <Plus size={13} />}
                                <span>{editingStaffId ? 'Simpan Staf' : 'Tambah ke Daftar'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {staffList.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-zinc-200/70">
                          <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#52525B]">
                            Daftar Staf Awal ({staffList.length})
                          </span>
                          {staffList.map((st) => {
                            const internalMail =
                              st.email || usernameToInternalAuthEmail(st.username || st.fullName);
                            return (
                              <div
                                key={st.id}
                                className={`bg-white border rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs ${
                                  editingStaffId === st.id
                                    ? 'border-[#F59E0B] bg-[#FEF3C7]/30'
                                    : 'border-[#E5E5E5]'
                                }`}
                              >
                                <div className="min-w-0 flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5] text-[#D97706] flex items-center justify-center shrink-0">
                                    <Briefcase size={14} />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      <span className="font-extrabold text-[#141414] truncate">
                                        {st.fullName}
                                      </span>
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] shrink-0">
                                        {st.role === 'kasir' ? 'Kasir' : 'Stocker'}
                                      </span>
                                    </div>
                                    <span className="block font-mono text-[10px] text-[#52525B] truncate">
                                      {internalMail}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleEditStaffDraft(st)}
                                    className="p-1.5 rounded-lg bg-[#FAFAFA] hover:bg-zinc-100 border border-[#E5E5E5] text-[#141414] cursor-pointer"
                                    aria-label={`Edit ${st.fullName}`}
                                    title="Edit Staf"
                                  >
                                    <Edit3 size={13} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveStaff(st.id)}
                                    className="p-1.5 rounded-lg bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 cursor-pointer transition-colors"
                                    aria-label={`Hapus ${st.fullName}`}
                                    title="Hapus Staf"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
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
                      className="px-4 py-3 rounded-xl bg-white border border-[#E5E5E5] hover:bg-[#FAFAFA] text-xs font-bold text-[#141414] inline-flex items-center gap-1.5 cursor-pointer"
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
                          <span>Menyiapkan Workspace...</span>
                        </>
                      ) : (
                        <>
                          <span>
                            {wantAddStaff && staffList.length > 0
                              ? `Simpan ${staffList.length} Staf & Masuk Dashboard`
                              : 'Selesai & Masuk Dashboard'}
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
