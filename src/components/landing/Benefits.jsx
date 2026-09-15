import React from 'react';
import { motion } from 'framer-motion';
import { Package, Store, Check } from 'lucide-react';

export default function Benefits() {
  const ownerBenefits = [
    "Pemantauan pergerakan stok secara real-time",
    "Peringatan dini bahan baku hampir basi (FEFO)",
    "Otomatisasi laporan omzet & analitik produk terlaris",
    "Mencegah kebocoran dan selisih stok fisik vs sistem"
  ];

  const cashierBenefits = [
    "Proses checkout transaksi secepat kilat",
    "Pencatatan kustomisasi pesanan (catatan dapur) akurat",
    "Pencetakan struk instan & dukungan pembayaran digital",
    "Antarmuka intuitif tanpa perlu pelatihan khusus"
  ];

  return (
    <section id="benefits" className="py-24 bg-zinc-950 text-white border-t border-zinc-900 overflow-hidden relative">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#E87F24]/5 rounded-full blur-[120px] -z-10 translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight">Sinergi Operasional Menyeluruh</h2>
          <p className="text-zinc-400 font-medium text-sm md:text-lg max-w-2xl mx-auto">
            Menghubungkan kecepatan pelayanan di meja kasir dengan akurasi dan keamanan inventaris di gudang.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Pilar Pemilik / Gudang (Back-of-House) */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-[2rem] p-8 lg:p-12 hover:bg-zinc-900 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8 pb-8 border-b border-zinc-800">
              <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-700">
                <Package className="text-[#E87F24]" size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white">Untuk Pemilik & Gudang</h3>
                <p className="text-zinc-400 font-medium mt-1">Kontrol Penuh & Efisiensi Biaya</p>
              </div>
            </div>
            <div className="space-y-4">
              {ownerBenefits.map((item, i) => (
                <div key={i} className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <Check size={14} className="text-emerald-500" />
                  </div>
                  <span className="font-medium text-zinc-300 text-sm md:text-base">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Pilar Kasir / Operasional (Front-of-House) */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="bg-white rounded-[2rem] p-8 lg:p-12 border border-zinc-200 shadow-2xl hover:shadow-[#E87F24]/10 transition-shadow text-zinc-900"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8 pb-8 border-b border-zinc-100">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100">
                <Store className="text-[#E87F24]" size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-zinc-900">Untuk Kasir & Pramusaji</h3>
                <p className="text-zinc-500 font-medium mt-1">Kecepatan & Kemudahan</p>
              </div>
            </div>
            <div className="space-y-4">
              {cashierBenefits.map((item, i) => (
                <div key={i} className="flex items-center gap-4 bg-zinc-50 border border-zinc-200/60 p-4 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-[#E87F24]/10 flex items-center justify-center shrink-0">
                    <Check size={14} className="text-[#E87F24]" />
                  </div>
                  <span className="font-medium text-zinc-700 text-sm md:text-base">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}