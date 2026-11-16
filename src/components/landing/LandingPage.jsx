import React from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import Features from './Features';
import WhyChooseUs from './WhyChooseUs';
import Benefits from './Benefits';
import Pricing from './Pricing';
import FAQ from './FAQ';
import CTA from './CTA';
import Footer from './Footer';

export default function LandingPage({ onOpenApp, onOpenRegister, onOpenLogin, onSelectPlan, onSimulatePlan }) {
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
      <Pricing 
        onSelectPlan={onSelectPlan}
        onSimulatePlan={onSimulatePlan}
      />
      <FAQ />
      <CTA 
        onOpenApp={onOpenApp} 
        onOpenRegister={onOpenRegister} 
      />
      <Footer 
        onOpenApp={onOpenApp}
        onOpenRegister={onOpenRegister} 
        onOpenLogin={onOpenLogin}
      />

    </div>
  );
}
