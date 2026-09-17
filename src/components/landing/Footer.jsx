import React from 'react';
import { motion } from 'framer-motion';
import logoKominfo from '../../assets/logo_kominfo.svg';
import { MapPin, Phone, Mail, Globe, Zap, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Footer({ onOpenApp, onOpenRegister, onOpenLogin }) {
  return (
    <footer className="bg-[#f8f9fb] text-zinc-600 pt-20 pb-36 font-sans relative overflow-hidden border-t border-zinc-200/80">

      {/* 1. Background Glow & Ornaments (Disesuaikan untuk mode terang) */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[400px] bg-gradient-to-t from-[#E87F24]/15 via-[#FFC81E]/10 to-transparent blur-[120px] pointer-events-none -z-10"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none -z-10"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* Grid Footer Utama */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-zinc-200/80">

          {/* Kolom 1: Logo & Kontak Perusahaan */}
          <div className="md:col-span-5 space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#E87F24] to-[#FFC81E] flex items-center justify-center shadow-md shadow-[#E87F24]/20">
                <Zap className="text-white fill-white" size={16} />
              </div>
              <span className="text-2xl font-black tracking-tight text-zinc-900">
                Stocko<span className="text-[#E87F24]">.</span>
              </span>
            </div>

            <p className="text-sm text-zinc-500 font-medium leading-relaxed max-w-md">
              Sistem Smart Inventory & POS berbasis integrasi BOM dan FEFO di bawah ekosistem teknologi PT. Duluin Solusi Indonesia untuk efisiensi bisnis F&B modern.
            </p>

            <div className="space-y-3 text-sm font-medium pt-2">
              <div className="flex items-start gap-3 hover:text-zinc-900 transition-colors">
                <MapPin size={18} className="text-[#E87F24] shrink-0 mt-0.5" />
                <span>Jl. Batununggal Indah Raya No.365, Batununggal, Kec. Bandung Kidul, Kota Bandung, Jawa Barat 40266</span>
              </div>
              <div className="flex items-center gap-3 hover:text-zinc-900 transition-colors">
                <Phone size={18} className="text-[#E87F24] shrink-0" />
                <span>081910031000</span>
              </div>
              <div className="flex items-center gap-3 hover:text-zinc-900 transition-colors">
                <Mail size={18} className="text-[#E87F24] shrink-0" />
                <span>hello@duluin.com</span>
              </div>
              <div className="flex items-center gap-3 hover:text-zinc-900 transition-colors">
                <Globe size={18} className="text-[#E87F24] shrink-0" />
                <span>duluinstocko.com</span>
              </div>
            </div>
          </div>

          {/* Kolom 2: Legalitas / Kominfo & ISO */}
          <div className="md:col-span-4 space-y-6">
            <div className="space-y-3 bg-white border border-zinc-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                {/* Menggunakan file SVG Logo Kominfo */}
                <img
                  src={logoKominfo}
                  alt="Logo Kominfo"
                  className="h-8 w-auto object-contain"
                />
              </div>
              <p className="text-xs font-medium text-zinc-500 leading-relaxed mt-1">
                <strong className="text-zinc-900">PT. Duluin Solusi Indonesia</strong><br />
                Terdaftar di Penyelenggara Sistem Elektronik<br />
                {/* Warna kode diubah dari kuning ke oranye agar lebih mudah dibaca di background terang */}
                <span className="font-mono text-[11px] text-[#E87F24] font-bold">018780.01/DJAI.PSE/06/2025</span>
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white border border-zinc-200 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <ShieldCheck className="text-emerald-500 shrink-0" size={24} />
              <div className="text-[11px] font-bold text-zinc-900">
                ISO/IEC 27001:2022
                <span className="block font-medium text-zinc-500 text-[10px]">Certified Security Management</span>
              </div>
            </div>
          </div>

          {/* Kolom 3: Navigasi Halaman */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="font-bold text-zinc-900 text-sm uppercase tracking-wider">Navigasi</h4>
            <ul className="space-y-3 text-sm font-medium text-zinc-500">
              <li><a href="#" className="hover:text-[#E87F24] transition-colors flex items-center gap-2">Beranda</a></li>
              <li><a href="#features" className="hover:text-[#E87F24] transition-colors flex items-center gap-2">Fitur POS & BOM</a></li>
              <li><a href="#why-us" className="hover:text-[#E87F24] transition-colors flex items-center gap-2">Keunggulan FEFO</a></li>
              <li><a href="#benefits" className="hover:text-[#E87F24] transition-colors flex items-center gap-2">Manfaat Bisnis</a></li>
              <li><a href="#faq" className="hover:text-[#E87F24] transition-colors flex items-center gap-2">FAQ</a></li>
              <li><a href="#" className="hover:text-[#E87F24] transition-colors flex items-center gap-2">Kebijakan Privasi</a></li>
            </ul>
          </div>

        </div>

        {/* Hak Cipta */}
        <div className="pt-8 text-center text-xs font-medium text-zinc-400">
          &copy; {new Date().getFullYear()} PT. Duluin Solusi Indonesia. Hak cipta dilindungi undang-undang.
        </div>

      </div>

      {/* ========================================== */}
      {/* STICKY FLOATING CARD (Glassmorphism + Gradasi Tombol) */}
      {/* ========================================== */}
      <div className="fixed bottom-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="pointer-events-auto bg-white/90 backdrop-blur-xl border border-zinc-200/80 text-zinc-900 py-3 sm:py-3.5 px-5 sm:px-6 rounded-[2rem] sm:rounded-full shadow-[0_10px_30px_rgb(0,0,0,0.15)] flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6 group transition-all duration-300 w-full max-w-xl text-center sm:text-left"
        >
          <div className="text-xs sm:text-sm font-bold flex items-center justify-center sm:justify-start gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E87F24] animate-ping shrink-0"></span>
            <span className="leading-snug">
              Optimalkan Bisnis Anda Mulai <span className="text-[#E87F24] font-black underline decoration-wavy decoration-[#E87F24]">Rp249.000/bln</span>
            </span>
          </div>

          <button
            onClick={onOpenRegister}
            className="w-full sm:w-auto bg-gradient-to-r from-[#E87F24] to-[#FFC81E] hover:from-[#c96a1a] hover:to-[#e6b419] text-white/90 font-black text-xs sm:text-sm px-5 py-2.5 rounded-full shadow-lg transition-transform hover:scale-105 shrink-0 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            Daftar Sekarang <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>

    </footer>
  );
}