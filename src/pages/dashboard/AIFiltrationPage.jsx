import React from 'react';
import { Bot } from 'lucide-react';

export default function AIFiltrationPage() {
  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight">AI CV Filtration Engine</h1>
        <p className="text-zinc-500 text-sm font-medium">Atur parameter dan kriteria penyaringan otomatis untuk posisi pekerjaan Anda.</p>
      </div>
      <div className="bg-white border border-zinc-200/80 rounded-3xl p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 p-4 rounded-2xl text-amber-900 text-sm">
          <Bot size={24} className="text-[#E87F24] shrink-0" />
          <span>Model AI RecruitIn aktif menggunakan <strong>Standard Enterprise v3.2</strong>.</span>
        </div>
      </div>
    </div>
  );
}