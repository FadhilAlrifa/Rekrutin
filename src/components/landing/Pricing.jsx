import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Sparkles, Store, Layers, Building2, ArrowRight } from 'lucide-react';

export const SUBSCRIPTION_PLANS = [
  {
    id: 'starter',
    name: 'Paket Starter',
    subtitle: 'Basic POS & Kasir Mandiri',
    price: 'Rp79.000',
    period: '/ bulan',
    badge: 'UMKM Mikro & Pemula',
    icon: Store,
    target: 'UMKM F&B mikro, kedai kopi kecil, atau pedagang pop-up pemula yang baru beralih dari kasir konvensional.',
    highlight: false,
    included: [
      'Modul POS Kasir lengkap (pencarian menu & catatan dapur)',
      'Pembayaran Tunai (kalkulator kembalian), QRIS, & Kartu',
      'Cetak struk senyap (Silent Hidden Iframe)',
      'Manajemen Menu dasar (Katalog Produk)',
      'Akses terbatas: 1 Superadmin & maks. 1 Kasir'
    ],
    excluded: [
      'Mesin pemotong stok resep otomatis (BOM Engine)',
      'Validasi stok lintas menu & Peringatan FIFO/FEFO',
      'Modul Self-Order Kiosk Meja & Role Stocker Gudang'
    ]
  },
  {
    id: 'pro',
    name: 'Paket Pro / Business',
    subtitle: 'Smart Inventory & Automated BOM',
    price: 'Rp149.000',
    period: '/ bulan',
    badge: 'Core Product • Paling Populer',
    icon: Layers,
    target: 'Kafe, restoran menengah, atau kedai dengan inventaris bahan baku aktif yang ingin mencegah kerugian & food waste.',
    highlight: true,
    included: [
      'Real-Time Automated BOM Engine (konversi gram/ml ke kg/liter presisi 3 desimal)',
      'Cross-Menu Validation (cegah pesanan jika stok bahan gudang kurang)',
      'FIFO/FEFO Early Warning (peringatan bahan ≤ 30 hari & stok kritis)',
      'Modul Self-Order Kiosk (pesan mandiri dari meja pelanggan)',
      'Full RBAC: Superadmin, Kasir POS, dan Stocker Gudang',
      'Advanced Reporting (4 metrik utama, tren, produk terlaris, metode bayar, & CSV)'
    ],
    excluded: [
      'Manajemen Multi-Outlet & Central Kitchen Sync',
      'Advanced Log Mutasi Stok Antar-Cabang'
    ]
  },
  {
    id: 'enterprise',
    name: 'Paket Enterprise / Franchise',
    subtitle: 'Multi-Outlet & Central Kitchen',
    price: 'Rp299.000',
    period: '/ outlet / bln',
    badge: 'Waralaba & Cloud Kitchen',
    icon: Building2,
    target: 'Bisnis F&B berantai, waralaba (franchise), atau cloud kitchen dengan banyak cabang dan gudang pusat.',
    highlight: false,
    included: [
      'Seluruh fitur lengkap dari Paket Pro / Business',
      'Manajemen Multi-Outlet (inventaris & laporan terpusat semua cabang)',
      'Central Kitchen Integration (sinkronisasi pasokan gudang pusat ke gerai)',
      'Advanced Log Mutasi Stok (pelacakan riwayat keluar-masuk antar-cabang)',
      'Akun karyawan tanpa batas & Dukungan teknis prioritas 24/7'
    ],
    excluded: []
  }
];

export default function Pricing({ onSelectPlan, onSimulatePlan }) {
  return (
    <section id="harga" className="py-28 bg-white relative border-t border-zinc-200/80 overflow-hidden">
      {/* Dekorasi Latar */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[450px] bg-gradient-to-b from-[#FEFDDF]/70 via-[#E87F24]/5 to-transparent rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200/80 px-4 py-1.5 rounded-full text-xs font-black text-[#E87F24] uppercase tracking-wider"
          >
            <Sparkles size={14} /> Skema Berlangganan Fleksibel
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="text-3xl md:text-5xl font-black text-zinc-900 tracking-tight leading-tight"
          >
            Pilih Paket Sesuai Skala <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E87F24] to-[#FFC81E]">
              Operasional Bisnis Anda.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-zinc-500 font-medium text-sm md:text-base"
          >
            Mulai dari kasir mandiri untuk kedai rintisan, otomatisasi penuh resep gudang (BOM), hingga manajemen multi-cabang terpusat.
          </motion.p>
        </div>

        {/* Grid 3 Paket */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {SUBSCRIPTION_PLANS.map((plan, idx) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className={`rounded-[2.5rem] p-8 flex flex-col justify-between relative transition-all duration-300 ${
                  plan.highlight
                    ? 'bg-zinc-950 text-white border-2 border-[#E87F24] shadow-2xl shadow-[#E87F24]/15 lg:-translate-y-3'
                    : 'bg-white text-zinc-900 border border-zinc-200/90 shadow-xl shadow-zinc-200/40 hover:border-zinc-300'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#E87F24] to-[#FFC81E] text-zinc-950 text-[11px] font-black uppercase tracking-wider px-4 py-1.5 rounded-full shadow-md whitespace-nowrap">
                    ⭐ Core Product • Paling Direkomendasikan
                  </div>
                )}

                <div className="space-y-6">
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-4 pt-1">
                    <div>
                      <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full mb-2 ${
                        plan.highlight
                          ? 'bg-[#E87F24]/20 text-[#FFC81E] border border-[#E87F24]/30'
                          : 'bg-zinc-100 text-zinc-600'
                      }`}>
                        {plan.badge}
                      </span>
                      <h3 className="text-2xl font-black tracking-tight">{plan.name}</h3>
                      <p className={`text-xs font-bold mt-0.5 ${plan.highlight ? 'text-[#FFC81E]' : 'text-[#E87F24]'}`}>
                        {plan.subtitle}
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      plan.highlight
                        ? 'bg-gradient-to-br from-[#E87F24] to-[#FFC81E] text-zinc-950'
                        : 'bg-orange-50 text-[#E87F24] border border-orange-100'
                    }`}>
                      <Icon size={22} />
                    </div>
                  </div>

                  {/* Price */}
                  <div className={`pb-5 border-b ${plan.highlight ? 'border-zinc-800' : 'border-zinc-100'}`}>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl md:text-4xl font-black tracking-tight">{plan.price}</span>
                      <span className={`text-xs font-bold ${plan.highlight ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        {plan.period}
                      </span>
                    </div>
                    <p className={`text-xs font-medium mt-3 leading-relaxed ${plan.highlight ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      {plan.target}
                    </p>
                  </div>

                  {/* Included Features */}
                  <div className="space-y-3">
                    <p className={`text-[11px] font-black uppercase tracking-wider ${plan.highlight ? 'text-zinc-400' : 'text-zinc-400'}`}>
                      Fitur Utama yang Didapat:
                    </p>
                    {plan.included.map((feat, i) => (
                      <div key={i} className="flex items-start gap-3 text-xs font-medium leading-relaxed">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          plan.highlight ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          <Check size={12} />
                        </div>
                        <span className={plan.highlight ? 'text-zinc-200' : 'text-zinc-700'}>{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Excluded Features */}
                  {plan.excluded.length > 0 && (
                    <div className={`space-y-2.5 pt-4 border-t ${plan.highlight ? 'border-zinc-800/80' : 'border-zinc-100'}`}>
                      <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                        Tidak Termasuk:
                      </p>
                      {plan.excluded.map((ex, i) => (
                        <div key={i} className="flex items-start gap-3 text-xs font-medium leading-relaxed opacity-60">
                          <div className="w-5 h-5 rounded-full bg-zinc-200/40 text-zinc-400 flex items-center justify-center shrink-0 mt-0.5">
                            <X size={11} />
                          </div>
                          <span className={plan.highlight ? 'text-zinc-400' : 'text-zinc-500'}>{ex}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-8 mt-6 space-y-2.5">
                  <button
                    onClick={() => onSelectPlan?.(plan.id)}
                    className={`w-full py-3.5 px-6 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                      plan.highlight
                        ? 'bg-gradient-to-r from-[#E87F24] to-[#FFC81E] hover:from-[#d6731f] hover:to-[#e6b419] text-zinc-950 shadow-lg shadow-[#E87F24]/25'
                        : 'bg-zinc-900 hover:bg-zinc-800 text-white shadow-md'
                    }`}
                  >
                    Pilih {plan.name} <ArrowRight size={15} />
                  </button>
                  <button
                    onClick={() => onSimulatePlan?.(plan.id)}
                    className={`w-full py-2.5 px-4 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                      plan.highlight
                        ? 'text-zinc-300 hover:text-white hover:bg-white/5'
                        : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
                    }`}
                  >
                    Coba Simulasi Mode {plan.name.replace('Paket ', '')} →
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
