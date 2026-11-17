import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, ShieldCheck, Mail, Lock, X, Trash2, CheckCircle2, UserCog, Briefcase, Store, Package, UserPlus } from 'lucide-react';
import { fetchEmployees, addEmployee, deleteEmployeeRole } from '../../../services/stockoService';

export default function EmployeeModule({ subscriptionPlan = 'pro', onUpgradePlan }) {
  const [employees, setEmployees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ email: '', password: '', role: 'kasir' });
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const isStarter = subscriptionPlan === 'starter';
  const kasirCount = employees.filter(e => e.role === 'kasir').length;
  const starterLimitReached = isStarter && kasirCount >= 1;

  const refreshEmployees = async () => {
    const result = await fetchEmployees();
    if (result.success) setEmployees(result.data || []);
  };

  useEffect(() => {
    let active = true;
    fetchEmployees().then((result) => {
      if (active && result.success) {
        setEmployees(result.data || []);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (isStarter && newEmployee.role === 'stocker') {
      setErrorMessage('Peran Stocker Gudang hanya tersedia pada Paket Pro & Enterprise.');
      return;
    }

    if (starterLimitReached) {
      setErrorMessage('Paket Starter dibatasi maksimal 1 akun Kasir. Upgrade ke Paket Pro untuk menambah lebih banyak karyawan.');
      return;
    }

    setIsSubmitting(true);
    const result = await addEmployee(newEmployee.email, newEmployee.password, newEmployee.role);
    
    if (result.success) {
      await refreshEmployees();
      setSuccessMsg('Karyawan berhasil didaftarkan ke sistem!');
      setNewEmployee({ email: '', password: '', role: 'kasir' });
      setIsModalOpen(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    } else {
      setErrorMessage(result.message || 'Gagal menambahkan karyawan. Coba email lain.');
    }
    
    setIsSubmitting(false);
  };

  const handleDelete = async (emp) => {
    if (window.confirm('Yakin ingin mencabut akses karyawan ini? Mereka tidak akan bisa login lagi.')) {
      const result = await deleteEmployeeRole(emp.id);
      if (result.success) {
        setEmployees(employees.filter(e => e.id !== emp.id));
      } else {
        alert('Gagal menghapus karyawan: ' + result.message);
      }
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 pb-5 border-b border-zinc-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.14em] inline-flex items-center gap-1.5">
              <ShieldCheck size={12} /> {isStarter ? 'Akses Terbatas (Paket Starter)' : '[ 05 // HAK AKSES TIM (RBAC) ]'}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#141414]">Kelola Karyawan</h1>
          <p className="text-xs font-medium text-[#52525B] max-w-lg">
            {isStarter
              ? 'Paket Starter mendukung 1 Superadmin dan maksimal 1 akun Kasir POS. Upgrade ke Paket Pro untuk mengaktifkan peran Stocker Gudang.'
              : 'Tambahkan akun staf dan pisahkan hak akses operasional antara Kasir POS dan Stocker Gudang.'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {starterLimitReached && onUpgradePlan ? (
            <button
              onClick={() => onUpgradePlan('pro')}
              className="bg-[#F59E0B] hover:bg-[#D97706] text-[#141414] font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-sm flex items-center gap-2 cursor-pointer transition-colors"
            >
              <UserPlus size={15} /> Upgrade ke Pro (Tambah Staf)
            </button>
          ) : (
            <button 
              onClick={() => {
                setErrorMessage('');
                setIsModalOpen(true);
              }}
              className="bg-[#F59E0B] hover:bg-[#D97706] text-[#141414] font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Plus size={16} /> Tambah Karyawan
            </button>
          )}
        </div>
      </div>

      {/* Ringkasan Kuota & Peran Staf */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-zinc-200 rounded-2xl p-4">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#52525B]">Total Akun Staf</span>
          <p className="text-2xl font-extrabold font-mono text-[#141414] mt-1">{employees.length}</p>
        </div>
        <div className="bg-white border border-zinc-200 rounded-2xl p-4">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#D97706]">Kasir POS</span>
          <p className="text-2xl font-extrabold font-mono text-[#141414] mt-1">{kasirCount}</p>
        </div>
        <div className="bg-white border border-zinc-200 rounded-2xl p-4">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#52525B]">Stocker Gudang</span>
          <p className="text-2xl font-extrabold font-mono text-[#141414] mt-1">
            {employees.filter(e => e.role === 'stocker').length}
          </p>
        </div>
      </div>

      {/* BANNER KUOTA STARTER */}
      {isStarter && (
        <div className="bg-[#FEF3C7]/60 border border-[#FDE68A] rounded-2xl px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs font-bold text-[#141414]">
            <Lock size={15} className="text-[#D97706] shrink-0" />
            <span>
              Kuota Akun Kasir Paket Starter: <strong className="text-[#B45309]">{kasirCount} / 1 Kasir</strong> (Peran Stocker Gudang terkunci di Paket Starter).
            </span>
          </div>
          {onUpgradePlan && (
            <button
              onClick={() => onUpgradePlan('pro')}
              className="text-[11px] font-extrabold text-[#B45309] hover:underline cursor-pointer shrink-0"
            >
              Buka Full RBAC di Paket Pro →
            </button>
          )}
        </div>
      )}

      {/* SUCCESS ALERT */}
      <AnimatePresence>
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-2xl flex items-center gap-3 text-sm font-bold shadow-sm"
          >
            <CheckCircle2 size={20} className="text-emerald-600" /> {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* TABEL KARYAWAN */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAFAFA] border-b border-zinc-200 font-mono text-[10px] font-bold text-[#52525B] uppercase tracking-wider">
                <th className="p-4 pl-6 w-12">#</th>
                <th className="p-4">Email Karyawan</th>
                <th className="p-4">Jabatan (Role)</th>
                <th className="p-4 text-right pr-6">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {employees.map((emp, index) => (
                <tr key={emp.id} className="hover:bg-[#FAFAFA] transition-colors group">
                  <td className="p-4 pl-6 font-mono text-xs font-bold text-[#52525B]">{index + 1}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#FAFAFA] border border-zinc-200 text-[#52525B] flex items-center justify-center">
                        <UserCog size={18} />
                      </div>
                      <span className="font-bold text-[#141414] text-sm">{emp.email}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-lg font-mono text-[11px] font-bold flex items-center gap-1.5 w-max ${
                      emp.role === 'kasir' ? 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]' : 'bg-[#FAFAFA] text-[#141414] border border-zinc-200'
                    }`}>
                      <Briefcase size={13} />
                      {emp.role === 'kasir' ? 'Kasir POS' : 'Stocker Gudang'}
                    </span>
                  </td>
                  <td className="p-4 text-right pr-6">
                    <button 
                      onClick={() => handleDelete(emp)}
                      className="w-8 h-8 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center ml-auto transition-colors cursor-pointer"
                      title="Cabut Akses"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-[#52525B] text-sm font-medium">
                    Belum ada karyawan yang terdaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TAMBAH KARYAWAN */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-zinc-950/50 backdrop-blur-sm cursor-pointer"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white w-full max-w-lg sm:rounded-[2rem] rounded-t-[2rem] shadow-2xl border border-zinc-200/80 relative z-10 flex flex-col max-h-[90vh] overflow-hidden"
            >
              {/* Header Modal */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 bg-white shrink-0">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] text-[#B45309] flex items-center justify-center shadow-sm">
                    <Users size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-zinc-900 text-lg tracking-tight">Tambah Karyawan Baru</h3>
                    <p className="text-xs font-medium text-zinc-500 mt-0.5">
                      Buat akun login dan tentukan jabatan akses karyawan Anda.
                    </p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)} 
                  className="w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddEmployee} className="flex flex-col flex-1 overflow-hidden">
                <div className="overflow-y-auto p-6 space-y-5 flex-1">
                  {errorMessage && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold p-3.5 rounded-xl">
                      {errorMessage}
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 mb-1.5">Email Login Karyawan</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input 
                        type="email" required placeholder="karyawan@toko.com"
                        value={newEmployee.email} onChange={e => setNewEmployee({...newEmployee, email: e.target.value})}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 pl-11 text-sm text-zinc-900 font-bold placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 mb-1.5">Kata Sandi (Password Sementara)</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input 
                        type="text" required placeholder="Buat sandi yang mudah diingat"
                        value={newEmployee.password} onChange={e => setNewEmployee({...newEmployee, password: e.target.value})}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 pl-11 text-sm text-zinc-900 font-bold placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 mb-2">Pilih Jabatan (Hak Akses Sistem)</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setNewEmployee({...newEmployee, role: 'kasir'})}
                        className={`p-4 rounded-2xl border text-xs font-extrabold transition-all flex flex-col items-center gap-2 cursor-pointer ${
                          newEmployee.role === 'kasir' 
                          ? 'bg-[#FEF3C7] border-[#F59E0B] text-[#B45309] ring-2 ring-[#F59E0B]/20' 
                          : 'bg-[#FAFAFA] border-zinc-200 text-[#52525B] hover:bg-zinc-100'
                        }`}
                      >
                        <Store size={22} className={newEmployee.role === 'kasir' ? 'text-[#D97706]' : 'text-zinc-400'} />
                        <span>Kasir POS</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          if (isStarter) {
                            setErrorMessage('Jabatan Stocker Gudang memerlukan Paket Pro / Business.');
                            return;
                          }
                          setNewEmployee({...newEmployee, role: 'stocker'});
                        }}
                        className={`p-4 rounded-2xl border text-xs font-extrabold transition-all flex flex-col items-center gap-2 cursor-pointer relative ${
                          newEmployee.role === 'stocker' 
                          ? 'bg-[#FEF3C7] border-[#F59E0B] text-[#B45309] ring-2 ring-[#F59E0B]/20' 
                          : 'bg-[#FAFAFA] border-zinc-200 text-[#52525B] hover:bg-zinc-100'
                        }`}
                      >
                        {isStarter && (
                          <span className="absolute top-2 right-2 bg-[#141414] text-[#F59E0B] text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Lock size={9} /> PRO
                          </span>
                        )}
                        <Package size={22} className={newEmployee.role === 'stocker' ? 'text-[#D97706]' : 'text-zinc-400'} />
                        <span>Stocker Gudang</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer Modal */}
                <div className="px-6 py-4 bg-[#FAFAFA] border-t border-zinc-200 flex items-center justify-end gap-3 shrink-0">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    className="px-5 py-3 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-100 text-xs font-bold text-[#52525B] transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="px-6 py-3 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#141414] text-xs font-extrabold shadow-sm inline-flex items-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Memproses...' : 'Simpan & Daftarkan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
