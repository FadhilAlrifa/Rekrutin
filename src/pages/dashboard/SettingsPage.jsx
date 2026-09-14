import React from 'react';

export default function SettingsPage() {
  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl">
      <h1 className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight">Pengaturan & Langganan</h1>
      <div className="bg-white border border-zinc-200/80 rounded-3xl p-8 shadow-sm space-y-6">
        <h3 className="font-bold text-zinc-900 text-lg">Paket Aktif: Enterprise Free Trial</h3>
      </div>
    </div>
  );
}