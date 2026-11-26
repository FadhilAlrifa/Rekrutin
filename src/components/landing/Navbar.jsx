import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Store } from 'lucide-react';

const NAV_LINKS = [
  { key: 'beranda', label: 'Beranda', id: '#' },
  { key: 'fitur', label: 'Fitur', id: 'features' },
  { key: 'keunggulan', label: 'Alur Kerja', id: 'why-us' },
  { key: 'harga', label: 'Harga', id: 'harga' },
  { key: 'faq', label: 'FAQ', id: 'faq' }
];

export default function Navbar({ onOpenRegister, onOpenLogin, onOpenApp }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('beranda');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);

      const faqEl = document.getElementById('faq');
      const hargaEl = document.getElementById('harga');
      const whyEl = document.getElementById('why-us');
      const featuresEl = document.getElementById('features');

      if (faqEl && faqEl.getBoundingClientRect().top <= 280) {
        setActiveSection('faq');
      } else if (hargaEl && hargaEl.getBoundingClientRect().top <= 280) {
        setActiveSection('harga');
      } else if (whyEl && whyEl.getBoundingClientRect().top <= 280) {
        setActiveSection('keunggulan');
      } else if (featuresEl && featuresEl.getBoundingClientRect().top <= 280) {
        setActiveSection('fitur');
      } else {
        setActiveSection('beranda');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e, id, sectionKey) => {
    e.preventDefault();
    setActiveSection(sectionKey);
    setIsOpen(false);
    if (id === '#') {
      if (window.__lenis) {
        window.__lenis.scrollTo(0, { duration: 1.2 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }
    const target = document.getElementById(id);
    if (target) {
      if (window.__lenis) {
        window.__lenis.scrollTo(target, { offset: -20, duration: 1.2 });
      } else {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <motion.nav
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.36, 1] }}
      className="fixed w-full top-0 z-50 px-4 md:px-6 pt-4 pointer-events-none"
    >
      <div
        className={`max-w-7xl mx-auto pointer-events-auto rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-xl border border-zinc-200 shadow-[0_14px_36px_-10px_rgba(0,0,0,0.08)]'
            : 'bg-white border border-zinc-200 shadow-[0_4px_16px_-6px_rgba(0,0,0,0.04)]'
        }`}
      >
        {/* Brand Logo */}
        <div
          className="flex items-center gap-2.5 cursor-pointer group"
          onClick={(e) => scrollToSection(e, '#', 'beranda')}
        >
          <div className="w-9 h-9 rounded-full bg-[#FAFAFA] border border-zinc-200 flex items-center justify-center group-hover:border-[#F59E0B] transition-colors">
            <img src="/logo-stocko.png" alt="Stocko Logo" className="w-5 h-5 object-contain" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-[#141414]">
            Stocko<span className="text-[#F59E0B]">.</span>
          </span>
          <span className="hidden xl:inline-block text-[11px] font-semibold text-[#52525B] border-l border-zinc-200 pl-2.5">
            Kasir &amp; Stok
          </span>
        </div>

        {/* Desktop Sliding Pill Navigation */}
        <div className="hidden lg:flex items-center gap-1 bg-[#FAFAFA] p-1 rounded-full border border-zinc-200">
          {NAV_LINKS.map((link) => {
            const isActive = activeSection === link.key;
            return (
              <a
                key={link.key}
                href={link.id === '#' ? '#' : `#${link.id}`}
                onClick={(e) => scrollToSection(e, link.id, link.key)}
                className={`relative px-4 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  isActive ? 'text-white' : 'text-[#52525B] hover:text-[#141414]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="navPill"
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.36, 1] }}
                    className="absolute inset-0 bg-[#141414] rounded-full"
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </a>
            );
          })}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenApp}
            data-cursor="Try POS"
            className="font-semibold text-xs text-[#141414] hover:text-[#D97706] px-3.5 py-2 rounded-full hover:bg-[#FAFAFA] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Store size={14} className="text-[#F59E0B]" />
            <span>Simulasi POS</span>
          </button>
          <button
            type="button"
            onClick={onOpenLogin}
            className="font-semibold text-xs text-[#52525B] hover:text-[#141414] px-3.5 py-2 rounded-full hover:bg-[#FAFAFA] transition-colors cursor-pointer"
          >
            Masuk
          </button>
          <motion.button
            type="button"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.36, 1] }}
            onClick={onOpenRegister}
            data-cursor="Start"
            className="bg-[#F59E0B] hover:bg-[#D97706] text-[#141414] font-extrabold text-xs px-5 py-2.5 rounded-full transition-colors shrink-0 cursor-pointer whitespace-nowrap"
          >
            Coba Gratis
          </motion.button>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          aria-label="Toggle Menu"
          className="md:hidden text-[#141414] w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-100 cursor-pointer transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.36, 1] }}
            className="max-w-7xl mx-auto mt-2 pointer-events-auto bg-white border border-zinc-200 p-4 rounded-3xl shadow-xl flex flex-col gap-1 md:hidden text-[#141414]"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.key}
                href={link.id === '#' ? '#' : `#${link.id}`}
                onClick={(e) => scrollToSection(e, link.id, link.key)}
                className={`font-semibold text-sm py-2.5 px-4 rounded-xl transition-colors ${
                  activeSection === link.key
                    ? 'bg-[#FEF3C7] text-[#B45309]'
                    : 'text-[#52525B] hover:bg-[#FAFAFA]'
                }`}
              >
                {link.label}
              </a>
            ))}

            <hr className="border-zinc-200 my-1.5" />

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenApp?.();
              }}
              className="font-semibold text-sm text-left py-2.5 px-4 rounded-xl hover:bg-[#FAFAFA] text-[#D97706] flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Store size={16} /> Buka Simulasi POS
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenLogin?.();
              }}
              className="text-left font-semibold text-sm py-2.5 px-4 rounded-xl text-[#52525B] hover:bg-[#FAFAFA] cursor-pointer transition-colors"
            >
              Masuk ke Akun
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenRegister?.();
              }}
              className="mt-1 bg-[#F59E0B] hover:bg-[#D97706] text-[#141414] font-extrabold text-sm py-3 rounded-xl flex justify-center items-center cursor-pointer transition-colors"
            >
              Coba Gratis 14 Hari
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
