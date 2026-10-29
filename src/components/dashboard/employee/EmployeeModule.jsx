import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, ShieldCheck, Mail, Lock, X, Trash2, CheckCircle2, UserCog, Briefcase, Store, Package } from 'lucide-react';
import { fetchEmployees, addEmployee, deleteEmployeeRole } from '../../../services/stockoService';

export default function EmployeeModule() {
  const [employees, setEmployees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ email: '', password: '', role: 'kasir' });
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Ambil data asli dari Supabase saat menu dibuka
  const loadEmployees = async () => {
    const result = await fetchEmployees();
    if (result.success) setEmployees(result.data || []);
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    
    // Panggil fungsi mendaftarkan ke Supabase
    const result = await addEmployee(newEmployee.email, newEmployee.password, newEmployee.role);
    
    if (result.success) {
      await loadEmployees(); // Refresh tabel
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
    if(window.confirm('Yakin ingin mencabut akses karyawan ini? Mereka tidak akan bisa login lagi.')) {
      const result = await deleteEmployeeRole(emp.id);
      if (result.success) {
         setEmployees(employees.filter(e => e.id !== emp.id));
      } else {
         alert('Gagal menghapus karyawan: ' + result.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white border border-zinc-200/80 rounded-[2.5rem] p-7 md:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10">
          <span className="bg-purple-100 text-purple-700 border border-purple-200 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5">
            <ShieldCheck size={13} /> Manajemen Akses
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight">Kelola Karyawan</h2>
          <p className="text-xs font-medium text-zinc-500 max-w-md">
            Tambahkan akun karyawan baru dan tentukan apakah mereka bertugas sebagai Kasir atau Stocker Gudang.
          </p>
        </div>
        
        <motion.button 
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => setIsModalOpen(true)}
          className="bg-zinc-900 text-white font-black text-xs px-6 py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 cursor-pointer z-10"
        >
          <Plus size={16} /> Tambah Karyawan
        </motion.button>
      </div>

      {/* SUCCESS ALERT */}
      <AnimatePresence>
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-4 rounded-2xl flex items-center gap-3 text-sm font-bold shadow-sm"
          >
            <CheckCircle2 size={20} className="text-emerald-500" /> {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* TABEL KARYAWAN */}
      <div className="bg-white border border-zinc-200/80 rounded-3xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100 text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                <th className="p-5 pl-6 w-12">#</th>
                <th className="p-5">Email Karyawan</th>
                <th className="p-5">Jabatan (Role)</th>
                <th className="p-5 text-right pr-6">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {employees.map((emp, index) => (
                <tr key={emp.id} className="hover:bg-zinc-50/50 transition-colors group">
                  <td className="p-5 pl-6 text-xs font-bold text-zinc-400">{index + 1}</td>
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-500 flex items-center justify-center">
                        <UserCog size={18} />
                      </div>
                      <span className="font-bold text-zinc-900 text-sm">{emp.email}</span>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 w-max ${
                      emp.role === 'kasir' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      <Briefcase size={14} />
                      {emp.role === 'kasir' ? 'Kasir POS' : 'Stocker Gudang'}
                    </span>
                  </td>
                  <td className="p-5 text-right pr-6">
                    <button 
                      onClick={() => handleDelete(emp)}
                      className="w-8 h-8 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center ml-auto transition-colors cursor-pointer"
                      title="Hapus / Pecat"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-zinc-400 text-sm font-medium">
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
                  <div className="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-100 text-[#E87F24] flex items-center justify-center shadow-2xs">
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
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 pl-11 text-sm text-zinc-900 font-bold placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-[#E87F24] focus:ring-3 focus:ring-[#E87F24]/15 transition-all"
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
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 pl-11 text-sm text-zinc-900 font-bold placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-[#E87F24] focus:ring-3 focus:ring-[#E87F24]/15 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 mb-2">Pilih Jabatan (Hak Akses Sistem)</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setNewEmployee({...newEmployee, role: 'kasir'})}
                        className={`p-4 rounded-2xl border text-xs font-black transition-all flex flex-col items-center gap-2 cursor-pointer ${
                          newEmployee.role === 'kasir' 
                          ? 'bg-orange-50 border-[#E87F24] text-[#E87F24] ring-3 ring-[#E87F24]/15' 
                          : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100'
                        }`}
                      >
                        <Store size={22} className={newEmployee.role === 'kasir' ? 'text-[#E87F24]' : 'text-zinc-400'} />
                        <span>Kasir POS</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setNewEmployee({...newEmployee, role: 'stocker'})}
                        className={`p-4 rounded-2xl border text-xs font-black transition-all flex flex-col items-center gap-2 cursor-pointer ${
                          newEmployee.role === 'stocker' 
                          ? 'bg-orange-50 border-[#E87F24] text-[#E87F24] ring-3 ring-[#E87F24]/15' 
                          : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100'
                        }`}
                      >
                        <Package size={22} className={newEmployee.role === 'stocker' ? 'text-[#E87F24]' : 'text-zinc-400'} />
                        <span>Stocker Gudang</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer Modal */}
                <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-end gap-3 shrink-0">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    className="px-5 py-3 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-100 text-xs font-black text-zinc-600 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#E87F24] to-[#FFC81E] hover:from-[#d6731f] hover:to-[#e6b419] text-zinc-950 text-xs font-black shadow-lg shadow-[#E87F24]/20 inline-flex items-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
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
