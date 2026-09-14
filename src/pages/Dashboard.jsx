import React, { useState } from 'react';
import { DashboardModel } from '../models/DashboardModel';
import { DashboardController } from '../controllers/DashboardController';
import Sidebar from '../components/dashboard/Sidebar';
import NewJobModal from '../components/dashboard/NewJobModal';

// Impor Halaman-Halaman Terpisah
import TalentPoolPage from './dashboard/TalentPoolPage';
import AIFiltrationPage from './dashboard/AIFiltrationPage';
import SchedulePage from './dashboard/SchedulePage';
import SettingsPage from './dashboard/SettingsPage';

// Inisialisasi Instance Model & Controller
const dashboardModel = new DashboardModel();

export default function Dashboard({ onLogout }) {
  const [activeMenu, setActiveMenu] = useState('talent');
  const [applicants, setApplicants] = useState(dashboardModel.getApplicants());
  const [newJobModal, setNewJobModal] = useState(false);

  // Hubungkan Controller
  const controller = new DashboardController(dashboardModel, (updatedData) => {
    setApplicants(updatedData);
  });

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans flex flex-col md:flex-row overflow-hidden selection:bg-[#E87F24] selection:text-white">
      
      {/* 1. Sidebar Navigasi */}
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} onLogout={onLogout} />

      {/* 2. Container Halaman Aktif */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-h-screen">
        {activeMenu === 'talent' && (
          <TalentPoolPage 
            applicants={applicants} 
            controller={controller} 
            onOpenNewJobModal={() => setNewJobModal(true)} 
          />
        )}
        {activeMenu === 'ai' && <AIFiltrationPage />}
        {activeMenu === 'schedule' && <SchedulePage />}
        {activeMenu === 'settings' && <SettingsPage />}
      </main>

      {/* Modal Tambah Lowongan */}
      <NewJobModal 
        isOpen={newJobModal} 
        onClose={() => setNewJobModal(false)} 
        onSave={(jobTitle) => controller.handleAddJob(jobTitle)} 
      />

    </div>
  );
}