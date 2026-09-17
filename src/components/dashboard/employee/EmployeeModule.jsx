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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-900">
                    <Users size={24} />
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500 transition-colors cursor-pointer">
                    <X size={16} />
                  </button>
                </div>
                
                <div>
                  <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Karyawan Baru</h3>
                  <p className="text-xs text-zinc-500 font-medium mt-1">
                    Buat akun login dan tentukan jabatan karyawan Anda.
                  </p>
                </div>

                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold p-3 rounded-xl">
                    {errorMessage}
                  </div>
                )}

                <form onSubmit={handleAddEmployee} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-2">Email Login</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input 
                        type="email" required placeholder="karyawan@toko.com"
                        value={newEmployee.email} onChange={e => setNewEmployee({...newEmployee, email: e.target.value})}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 pl-11 text-xs text-zinc-900 font-bold focus:outline-none focus:border-[#E87F24] focus:ring-1 focus:ring-[#E87F24]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-2">Kata Sandi (Password Sementara)</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input 
                        type="text" required placeholder="Buat sandi yang mudah diingat"
                        value={newEmployee.password} onChange={e => setNewEmployee({...newEmployee, password: e.target.value})}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 pl-11 text-xs text-zinc-900 font-bold focus:outline-none focus:border-[#E87F24] focus:ring-1 focus:ring-[#E87F24]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-2">Pilih Jabatan (Akses)</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setNewEmployee({...newEmployee, role: 'kasir'})}
                        className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-2 cursor-pointer ${
                          newEmployee.role === 'kasir' 
                          ? 'bg-orange-50 border-orange-200 text-orange-700 ring-2 ring-orange-500/20' 
                          : 'bg-white border-zinc-200 text-zinc-400 hover:bg-zinc-50'
                        }`}
                      >
                        <Store size={20} className={newEmployee.role === 'kasir' ? 'text-orange-500' : 'text-zinc-300'} />
                        Kasir POS
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setNewEmployee({...newEmployee, role: 'stocker'})}
                        className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-2 cursor-pointer ${
                          newEmployee.role === 'stocker' 
                          ? 'bg-blue-50 border-blue-200 text-blue-700 ring-2 ring-blue-500/20' 
                          : 'bg-white border-zinc-200 text-zinc-400 hover:bg-zinc-50'
                        }`}
                      >
                        <Package size={20} className={newEmployee.role === 'stocker' ? 'text-blue-500' : 'text-zinc-300'} />
                        Stocker Gudang
                      </button>
                    </div>
                  </div>

                  <button 
                    type="submit" disabled={isSubmitting}
                    className="w-full mt-2 bg-zinc-900 hover:bg-zinc-800 text-white font-black py-3.5 rounded-xl text-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Memproses...' : 'Simpan & Daftarkan Karyawan'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
