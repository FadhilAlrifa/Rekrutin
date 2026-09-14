import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TrustedBy from './components/TrustedBy';
import Features from './components/Features';
import WhyChooseUs from './components/WhyChooseUs';
import Benefits from './components/Benefits';
import FAQ from './components/FAQ';
import CTA from './components/CTA';
import Footer from './components/Footer';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CandidatePortalPage from './pages/candidate/CandidatePortalPage';
import InterviewerPortalPage from './pages/interviewer/InterviewerPortalPage';
import JobBoardPage from './pages/candidate/JobBoardPage';

export default function App() {
  // State halaman aktif: 'home', 'careers', 'register', 'login', 'dashboard', 'candidate', 'interviewer'
  const [currentPage, setCurrentPage] = useState('home');

  // State global untuk daftar pelamar (menghubungkan Public Career Board dengan Talent Pool HRD)
  const [globalApplicants, setGlobalApplicants] = useState([
    { id: 1, name: "Andi Pratama", role: "Senior Frontend Engineer", email: "andi.pratama@example.com", phone: "+62 812-3456-7890", score: "94%", status: "Siap Wawancara" },
    { id: 2, name: "Budi Santoso", role: "Backend Developer (Node.js)", email: "budi.santoso@example.com", phone: "+62 821-9876-5432", score: "89%", status: "Review AI" },
    { id: 3, name: "Siti Rahma", role: "UI/UX Product Designer", email: "siti.rahma@example.com", phone: "+62 813-1122-3344", score: "96%", status: "Review AI" }
  ]);

  // Mengatur posisi gulir ke paling atas setiap halaman berubah
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, [currentPage]);

  // Handler saat pelamar mengirimkan lamaran dari Public Job Board
  const handleAddNewApplicantFromPublic = (newApp) => {
    setGlobalApplicants(prev => [newApp, ...prev]);
    alert(`Berhasil! Lamaran Anda untuk posisi "${newApp.role}" telah masuk ke sistem Talent Pool perusahaan.`);
  };

  // Handler saat login berhasil berdasarkan role
  const handleLoginSuccess = (role) => {
    if (role === 'hrd') {
      setCurrentPage('dashboard');
    } else if (role === 'candidate') {
      setCurrentPage('candidate');
    } else if (role === 'interviewer') {
      setCurrentPage('interviewer');
    }
  };

  // Routing Halaman
  if (currentPage === 'careers') {
    return (
      <JobBoardPage 
        onBackToHome={() => setCurrentPage('home')} 
        onSubmitApplication={handleAddNewApplicantFromPublic}
      />
    );
  }

  if (currentPage === 'register') {
    return <Register onBack={() => setCurrentPage('home')} />;
  }

  if (currentPage === 'login') {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  if (currentPage === 'dashboard') {
    return (
      <Dashboard 
        applicants={globalApplicants}
        controller={{
          handleUpdateStatus: (id, newStatus) => {
            setGlobalApplicants(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
          }
        }}
        onLogout={() => setCurrentPage('home')} 
      />
    );
  }

  if (currentPage === 'candidate') {
    return <CandidatePortalPage onLogout={() => setCurrentPage('home')} />;
  }

  if (currentPage === 'interviewer') {
    return <InterviewerPortalPage onLogout={() => setCurrentPage('home')} />;
  }

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 overflow-x-hidden selection:bg-[#E87F24] selection:text-white">
      <Navbar 
        onOpenRegister={() => setCurrentPage('register')} 
        onOpenLogin={() => setCurrentPage('login')} 
        onOpenCareers={() => setCurrentPage('careers')} 
      />
      
      <Hero onOpenRegister={() => setCurrentPage('register')} />
      <TrustedBy />
      <Features />
      <WhyChooseUs />
      <Benefits />
      <FAQ />
      <CTA onOpenRegister={() => setCurrentPage('register')} />
      <Footer onOpenRegister={() => setCurrentPage('register')} />
    </div>
  );
}