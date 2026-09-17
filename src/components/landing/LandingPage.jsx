import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

import Navbar from './Navbar';
import Hero from './Hero';
import Features from './Features';
import WhyChooseUs from './WhyChooseUs';
import Benefits from './Benefits';
import FAQ from './FAQ';
import CTA from './CTA';
import Footer from './Footer';

export default function LandingPage({ onOpenApp, onOpenRegister, onOpenLogin }) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-[#E87F24] selection:text-white overflow-x-hidden">
      
      <Navbar 
        onOpenApp={onOpenApp} 
        onOpenRegister={onOpenRegister} 
        onOpenLogin={onOpenLogin} 
      />
      
      <Hero 
        onOpenApp={onOpenApp} 
        onOpenRegister={onOpenRegister} 
      />
      
      <Features />
      <WhyChooseUs />
      <Benefits />
      <FAQ />
      <CTA 
        onOpenApp={onOpenApp} 
        onOpenRegister={onOpenRegister} 
      />
      <Footer 
        onOpenRegister={onOpenRegister} 
        onOpenLogin={onOpenLogin}/>

    </div>
  );
}