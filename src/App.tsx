import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ExamProvider, useExam } from './context/ExamContext';
import { Header } from './components/Header';
import { LoginForm } from './components/auth/LoginForm';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { GuruDashboard } from './components/guru/GuruDashboard';
import { SiswaDashboard } from './components/siswa/SiswaDashboard';
import { CbtPlayer } from './components/siswa/CbtPlayer';
import { AppScriptSetupModal } from './components/admin/AppScriptSetupModal';
import { BookOpen } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentUser } = useAuth();
  const { activeSession, institution } = useExam();
  const [showAppScriptModal, setShowAppScriptModal] = useState(false);

  // If a student is currently taking an exam, render the full CBT Player Room
  if (activeSession) {
    return <CbtPlayer />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Top Header */}
      <Header onOpenAppScriptModal={() => setShowAppScriptModal(true)} />

      {/* Main Content Area */}
      <main className="flex-1">
        {!currentUser ? (
          <LoginForm onOpenAppScriptModal={() => setShowAppScriptModal(true)} />
        ) : currentUser.role === 'admin' ? (
          <AdminDashboard onOpenAppScriptModal={() => setShowAppScriptModal(true)} />
        ) : currentUser.role === 'guru' ? (
          <GuruDashboard />
        ) : (
          <SiswaDashboard />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 px-4 border-t border-slate-800 text-xs no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-slate-200">{institution.name}</span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-xs text-blue-400">Portal Ujian CBT Interaktif</span>
          </div>

          <div className="text-[11px] text-slate-400">
            Database tersimpan di Google Spreadsheet via Apps Script • Terkoneksi Google Drive
          </div>
        </div>
      </footer>

      {/* Apps Script Setup Modal */}
      <AppScriptSetupModal
        isOpen={showAppScriptModal}
        onClose={() => setShowAppScriptModal(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ExamProvider>
        <AppContent />
      </ExamProvider>
    </AuthProvider>
  );
}
