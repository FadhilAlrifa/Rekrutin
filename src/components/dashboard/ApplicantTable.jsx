import React, { useState } from 'react';
import { Search, Mail, Phone, ArrowUpRight } from 'lucide-react';

export default function ApplicantTable({ applicants, onUpdateStatus }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = applicants.filter(app => app.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-zinc-900">Daftar Kandidat Masuk</h3>
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input 
            type="text" placeholder="Cari kandidat..." 
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-2.5 pl-10 text-xs text-zinc-900 focus:outline-none focus:border-[#E87F24]"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-100 text-xs text-zinc-400 uppercase tracking-wider">
              <th className="pb-4 font-bold">Kandidat</th>
              <th className="pb-4 font-bold">Posisi Dilamar</th>
              <th className="pb-4 font-bold">Skor AI Match</th>
              <th className="pb-4 font-bold">Status Seleksi</th>
              <th className="pb-4 font-bold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-sm font-medium">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-zinc-50 transition-colors">
                <td className="py-4">
                  <p className="font-bold text-zinc-900">{item.name}</p>
                  <p className="text-xs text-zinc-400 flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1"><Mail size={12}/> {item.email}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Phone size={12}/> {item.phone}</span>
                  </p>
                </td>
                <td className="py-4 text-zinc-600 font-semibold">{item.role}</td>
                <td className="py-4">
                  <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-black">{item.score}</span>
                </td>
                <td className="py-4 text-xs font-bold text-zinc-700">{item.status}</td>
                <td className="py-4 text-right space-x-2">
                  <button onClick={() => onUpdateStatus(item.id, 'Siap Wawancara')} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer">Terima</button>
                  <button onClick={() => onUpdateStatus(item.id, 'Ditolak')} className="bg-zinc-200 hover:bg-zinc-300 text-zinc-700 text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer">Tolak</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}