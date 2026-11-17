import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logoKominfo from '../../assets/logo_kominfo.svg';
import { MapPin, Phone, Mail, Globe, ShieldCheck, X } from 'lucide-react';

export default function Footer({ onOpenRegister }) {
  const [showFloatingBar, setShowFloatingBar] = useState(true);

  return (
    <footer className="bg-[#111111] text-zinc-400 pt-20 pb-32 font-sans relative overflow-hidden border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Main Editorial Footer Grid (Dark Obsidian Contrast Section #2) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-zinc-800">
          {/* Column 1: Brand & Contact */}
          <div className="md:col-span-5 space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-[#18181B] border border-zinc-800 flex items-center justify-center">
                <img src="/logo-stocko.png" alt="Stocko Logo" className="w-6 h-6 object-contain" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-[#FAFAFA]">
                Stocko<span className="text-[#F59E0B]">.</span>
              </span>
            </div>

            <p className="text-sm text-zinc-400 font-medium leading-relaxed max-w-md">
              Sistem Smart Inventory & POS berbasis integrasi BOM dan FEFO di bawah ekosistem teknologi PT. Duluin Solusi Indonesia untuk efisiensi bisnis F&B modern.
            </p>

            <div className="space-y-3 text-sm font-medium pt-1">
              <div className="flex items-start gap-3 text-zinc-400 hover:text-[#FAFAFA] transition-colors">
                <MapPin size={17} className="text-[#F59E0B] shrink-0 mt-0.5" />
                <span>Jl. Batununggal Indah Raya No.365, Batununggal, Kec. Bandung Kidul, Kota Bandung, Jawa Barat 40266</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-400 hover:text-[#FAFAFA] transition-colors">
                <Phone size={17} className="text-[#F59E0B] shrink-0" />
                <span>081910031000</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-400 hover:text-[#FAFAFA] transition-colors">
                <Mail size={17} className="text-[#F59E0B] shrink-0" />
                <span>hello@duluin.com</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-400 hover:text-[#FAFAFA] transition-colors">
                <Globe size={17} className="text-[#F59E0B] shrink-0" />
                <span>duluinstocko.com</span>
              </div>
            </div>
          </div>

          {/* Column 2: Compliance & Security */}
          <div className="md:col-span-4 space-y-4">
            <div className="bg-[#18181B] border border-zinc-800 rounded-2xl p-5 space-y-3">
              <div className="inline-flex items-center bg-white px-3 py-1.5 rounded-lg">
                <img src={logoKominfo} alt="Logo Kominfo" className="h-6 w-auto object-contain" />
              </div>
              <p className="text-xs font-medium text-zinc-400 leading-relaxed">
                <strong className="text-[#FAFAFA]">PT. Duluin Solusi Indonesia</strong>
                <br />
                Terdaftar di Penyelenggara Sistem Elektronik
                <br />
                <span className="font-mono text-[11px] text-[#F59E0B] font-bold">018780.01/DJAI.PSE/06/2025</span>
              </p>
            </div>

            <div className="bg-[#18181B] border border-zinc-800 rounded-2xl p-4 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="text-emerald-400" size={20} />
              </div>
              <div className="text-xs font-bold text-[#FAFAFA]">
                ISO/IEC 27001:2022
                <span className="block font-medium text-zinc-400 text-[11px]">Certified Security Management</span>
              </div>
            </div>
          </div>

          {/* Column 3: Quick Links */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="font-mono font-bold text-[#FAFAFA] text-xs uppercase tracking-widest">
              Navigasi
            </h4>
            <ul className="space-y-2.5 text-sm font-medium text-zinc-400">
              <li>
                <a href="#" className="hover:text-[#F59E0B] transition-colors">Beranda</a>
              </li>
              <li>
                <a href="#features" className="hover:text-[#F59E0B] transition-colors">Fitur POS & BOM</a>
              </li>
              <li>
                <a href="#why-us" className="hover:text-[#F59E0B] transition-colors">Alur Otomatisasi</a>
              </li>
              <li>
                <a href="#benefits" className="hover:text-[#F59E0B] transition-colors">Manfaat Bisnis</a>
              </li>
              <li>
                <a href="#harga" className="hover:text-[#F59E0B] transition-colors">Paket Langganan</a>
              </li>
              <li>
                <a href="#faq" className="hover:text-[#F59E0B] transition-colors">FAQ</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-xs text-zinc-500">
          <span>&copy; {new Date().getFullYear()} PT. Duluin Solusi Indonesia.</span>
          <span>SMART POS & INVENTORY ENGINE</span>
        </div>
      </div>

      {/* Dismissible Solid Floating Dock */}
      <AnimatePresence>
        {showFloatingBar && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-5 inset-x-0 z-40 flex justify-center px-4 pointer-events-none"
          >
            <div className="pointer-events-auto bg-white border border-zinc-200 text-[#141414] py-2.5 px-4 sm:px-5 rounded-full shadow-[0_18px_40px_rgba(0,0,0,0.16)] flex items-center justify-between gap-4 w-full max-w-lg">
              <div className="flex items-center gap-2.5 text-xs font-semibold truncate">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B] shrink-0" />
                <span className="truncate">
                  Mulai <strong className="text-[#D97706] font-mono">Rp79.000/bln</strong> • Gratis uji coba 14 hari
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={onOpenRegister}
                  className="bg-[#F59E0B] hover:bg-[#D97706] text-[#141414] font-extrabold text-xs px-4 py-1.5 rounded-full cursor-pointer active:scale-95 transition-all"
                >
                  Daftar
                </button>
                <button
                  type="button"
                  aria-label="Tutup banner"
                  onClick={() => setShowFloatingBar(false)}
                  className="w-7 h-7 rounded-full bg-[#FAFAFA] hover:bg-zinc-200 text-[#52525B] hover:text-[#141414] border border-zinc-200 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X size={13} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
}
