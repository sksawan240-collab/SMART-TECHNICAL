import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OtpVerificationPage } from './pages/OtpVerificationPage';
import { AdminDashboard } from './dashboards/admin/AdminDashboard';
import { FacultyDashboard } from './dashboards/faculty/FacultyDashboard';
import { StudentDashboard } from './dashboards/student/StudentDashboard';
import { KnowledgeBasePage } from './pages/KnowledgeBasePage';
import { CampusFacilitiesPage } from './pages/CampusFacilitiesPage';
import { SystemStatusPage } from './pages/SystemStatusPage';
import { TicketDetailModal } from './components/TicketDetailModal';

export type AccentColor = 'indigo' | 'emerald' | 'sapphire' | 'violet' | 'amber';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<string>('landing');
  const [modalTicketId, setModalTicketId] = useState<string | null>(null);

  // If user is logged in and navigates to default dashboard view
  useEffect(() => {
    if (user && currentView === 'landing') {
      // Keep landing if user intentionally chose landing, otherwise allow dashboard navigation
    }
  }, [user]);

  const handleOpenTicket = (ticketId: string) => {
    setModalTicketId(ticketId);
  };

  const handleCloseTicket = () => {
    setModalTicketId(null);
  };

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('stsu_theme') as 'dark' | 'light') || 'dark';
  });

  const [accentColor, setAccentColor] = useState<AccentColor>(() => {
    return (localStorage.getItem('stsu_accent') as AccentColor) || 'indigo';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('stsu_theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.themeColor = accentColor;
    localStorage.setItem('stsu_accent', accentColor);
  }, [accentColor]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        theme={theme}
        toggleTheme={toggleTheme}
        accentColor={accentColor}
        setAccentColor={setAccentColor}
      />

      <main className="flex-1 pb-16">
        {currentView === 'landing' && <LandingPage setCurrentView={setCurrentView} />}
        {currentView === 'login' && <LoginPage setCurrentView={setCurrentView} />}
        {currentView === 'register' && <RegisterPage setCurrentView={setCurrentView} />}
        {currentView === 'otp-verify' && <OtpVerificationPage setCurrentView={setCurrentView} />}
        {currentView === 'facilities' && <CampusFacilitiesPage setCurrentView={setCurrentView} />}
        {currentView === 'knowledge-base' && <KnowledgeBasePage />}
        {currentView === 'system-status' && <SystemStatusPage setCurrentView={setCurrentView} />}
        
        {/* Role Dashboards */}
        {currentView === 'admin-dashboard' && <AdminDashboard onOpenTicket={handleOpenTicket} />}
        {currentView === 'faculty-dashboard' && <FacultyDashboard onOpenTicket={handleOpenTicket} />}
        {currentView === 'student-dashboard' && <StudentDashboard onOpenTicket={handleOpenTicket} />}
      </main>

      {/* Global Enterprise IT Footer */}
      <Footer setCurrentView={setCurrentView} />

      {/* Ticket Detail Modal */}
      {modalTicketId && (
        <TicketDetailModal
          ticketId={modalTicketId}
          onClose={handleCloseTicket}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
