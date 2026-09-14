import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function NewJobModal({ isOpen, onClose, onSave }) {
  const [jobTitleInput, setJobTitleInput] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white border border-zinc-200 p-8 rounded-3xl max-w-md w-full shadow-2xl space-y-6">
        <h3 className="text-xl font-black text-zinc-900">Buka Lowongan Pekerjaan Baru</h3>
        <input 
          type="text" placeholder="Contoh: Senior Fullstack Engineer"
          value={jobTitleInput} onChange={(e) => setJobTitleInput(e.target.value)}
          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E87F24]"
        />
        <div className="flex gap-3 justify-end pt-2">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100 cursor-pointer">Batal</button>
          <button 
            onClick={() => {
              onSave(jobTitleInput);
              setJobTitleInput('');
              onClose();
            }}
            className="bg-zinc-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-zinc-800 cursor-pointer"
          >
            Simpan Lowongan
          </button>
        </div>
      </motion.div>
    </div>
  );
}