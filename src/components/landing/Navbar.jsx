import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ArrowRight, Menu, X, Store } from 'lucide-react';

export default function Navbar({ onOpenRegister, onOpenLogin, onOpenApp }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('beranda');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;

      if (scrollPosition < 500) {
        setActiveSection('beranda');
      } else if (scrollPosition >= 500 && scrollPosition < totalHeight - 400) {
        setActiveSection('fitur');
      } else {
        setActiveSection('harga');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed w-full top-0 z-50 px-4 md:px-6 py-4"
    >
      <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-xl border border-zinc-200/80 rounded-full px-6 py-3 flex items-center justify-between shadow-[0_10px_30px_rgb(0,0,0,0.05)]">

        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#E87F24] to-[#FFC81E] flex items-center justify-center shadow-md shadow-[#E87F24]/20">
            <Zap className="text-white fill-white" size={16} />
          </div>
          <span className="text-xl font-black tracking-tight text-zinc-900">
            Stocko<span className="text-[#E87F24]">.</span>
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 font-bold text-sm text-zinc-600">
          <a
            href="#"
            onClick={() => setActiveSection('beranda')}
            className={`transition-colors relative py-1 ${activeSection === 'beranda' ? 'text-[#E87F24]' : 'hover:text-[#E87F24]'}`}
          >
            Beranda
            {activeSection === 'beranda' && (
              <motion.div layoutId="activeIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E87F24] rounded-full" />
            )}
          </a>

          <a
            href="#features"
            onClick={() => setActiveSection('fitur')}
            className={`transition-colors relative py-1 ${activeSection === 'fitur' ? 'text-[#E87F24]' : 'hover:text-[#E87F24]'}`}
          >
            Fitur
            {activeSection === 'fitur' && (
              <motion.div layoutId="activeIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E87F24] rounded-full" />
            )}
          </a>

          <a
            href="#harga"
            onClick={(e) => {
              e.preventDefault();
              setActiveSection('harga');
              onOpenRegister?.(); // Memanggil fungsi untuk membuka modal/halaman Register
            }}
            className={`transition-colors relative py-1 cursor-pointer ${activeSection === 'harga' ? 'text-[#E87F24]' : 'hover:text-[#E87F24]'}`}
          >
            Harga
            {activeSection === 'harga' && (
              <motion.div layoutId="activeIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E87F24] rounded-full" />
            )}
          </a>

          <a href="https://duluin.com/about" className="hover:text-[#E87F24] transition-colors py-1">Tentang Duluin</a>

        </div>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={onOpenLogin}
            className="font-bold text-sm text-zinc-700 hover:text-[#E87F24] transition-colors cursor-pointer"
          >
            Login
          </button>
          <button
            onClick={onOpenRegister}
            className="bg-gradient-to-r from-[#E87F24] to-[#FFC81E] hover:from-[#c96a1a] hover:to-[#e6b419] text-white/90 font-black text-xs sm:text-sm px-6 py-2.5 rounded-full shadow-lg transition-transform hover:scale-105 shrink-0 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            Coba Gratis <ArrowRight size={16} />
          </button>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-zinc-900 p-1 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-4 right-4 bg-white border border-zinc-200 p-6 rounded-3xl shadow-2xl flex flex-col gap-4 md:hidden text-zinc-900"
          >
            <a href="#" onClick={() => setIsOpen(false)} className="font-bold hover:text-[#E87F24]">Beranda</a>
            <a href="#fitur" onClick={() => setIsOpen(false)} className="font-bold hover:text-[#E87F24]">Fitur</a>
            <a href="#harga" onClick={() => setIsOpen(false)} className="font-bold hover:text-[#E87F24]">Harga</a>
            <a href="#" onClick={() => setIsOpen(false)} className="font-bold hover:text-[#E87F24]">Tentang Duluin</a>

            <button
              onClick={() => { setIsOpen(false); onOpenApp?.(); }}
              className="font-bold text-left hover:text-[#E87F24] flex items-center gap-2 text-orange-600"
            >
              <Store size={16} /> Buka Simulasi POS
            </button>

            <button
              onClick={() => { setIsOpen(false); onOpenLogin?.(); }}
              className="text-left font-bold hover:text-[#E87F24]"
            >
              Login
            </button>
            <hr className="border-zinc-100 my-2" />
            <button
              onClick={() => { setIsOpen(false); onOpenRegister?.(); }}
              className="bg-gradient-to-r from-[#E87F24] to-[#FFC81E] text-zinc-950 font-black py-3 rounded-xl flex justify-center items-center gap-2 shadow-md cursor-pointer"
            >
              Coba Gratis <ArrowRight size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}