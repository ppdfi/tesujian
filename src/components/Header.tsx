/**
 * ============================================================================
 * HEADER NAVIGASI UTAMA APLIKASI CBT SMP DARUL FAWAID ILMIYAH
 * ============================================================================
 * Fitur:
 * 1. Desain modern, bersih, & responsif (rapi di smartphone dan desktop)
 * 2. Status koneksi database Google Spreadsheet & Drive
 * 3. Profil pengguna & nomor HP / NIS
 * 4. Menu keluar & pengaturan database (tanpa tombol demo/trial)
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useExam } from '../context/ExamContext';
import { SMP_LOGO_URL } from '../services/appScriptService';
import {
  LogOut,
  RefreshCw,
  Sheet,
  Sliders,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  ShieldCheck,
  GraduationCap,
  UserCheck,
} from 'lucide-react';

interface HeaderProps {
  onOpenAppScriptModal: () => void;
  onOpenProfileModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAppScriptModal }) => {
  const { currentUser, logout } = useAuth();
  const { institution, appScriptConfig, isSyncing, syncAllWithSheet, syncStatus } = useExam();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const todayDateStr = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">Admin / Panitia</span>;
      case 'guru':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">Guru Mapel</span>;
      case 'siswa':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-300">Siswa SMP</span>;
      default:
        return null;
    }
  };

  return (
    <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 sticky top-0 z-30 no-print">
      {/* Top Micro Bar */}
      <div className="bg-slate-950 px-3 sm:px-4 py-1 text-[11px] sm:text-xs text-slate-300 flex flex-wrap justify-between items-center border-b border-slate-800/80 gap-1">
        <div className="flex items-center space-x-2 truncate">
          <span className="font-semibold text-blue-400">SMP Darul Fawaid Ilmiyah</span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="text-slate-400 hidden sm:inline">{institution.tagline}</span>
        </div>
        <div className="flex items-center space-x-2 text-[11px]">
          <div className="hidden sm:flex items-center space-x-1 text-slate-300">
            <Clock className="w-3 h-3 text-blue-400" />
            <span>{todayDateStr}</span>
          </div>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="font-medium text-amber-300">TA {institution.academicYear} ({institution.semester})</span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center gap-2">
          
          {/* Logo & School Name */}
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
            <img
              src={institution.logoUrl || SMP_LOGO_URL}
              alt="Logo SMP"
              className="w-10 h-10 sm:w-11 sm:h-11 object-contain rounded-xl bg-white p-1 shadow-xs border border-slate-700 shrink-0"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = SMP_LOGO_URL;
              }}
            />
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base lg:text-lg font-black tracking-tight text-white leading-tight truncate">
                {institution.name}
              </h1>
              <p className="text-[10px] sm:text-xs text-blue-300 font-medium truncate">
                Aplikasi Ujian CBT Interaktif & Penilaian
              </p>
            </div>
          </div>

          {/* Right Action Menu */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            
            {/* Status Spreadsheet Pill */}
            <div className="relative group">
              <button
                onClick={onOpenAppScriptModal}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  appScriptConfig.isConnected
                    ? 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-600/60'
                    : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-600/40'
                }`}
                title="Status Integrasi Google Spreadsheet & Drive"
              >
                <Sheet className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="hidden md:inline font-semibold">Spreadsheet:</span>
                {appScriptConfig.isConnected ? (
                  <span className="flex items-center text-emerald-300 font-semibold text-[11px]">
                    <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" /> Online
                  </span>
                ) : (
                  <span className="flex items-center text-amber-300 text-[11px]">
                    <AlertCircle className="w-3 h-3 mr-1 text-amber-400" /> Offline
                  </span>
                )}
              </button>
            </div>

            {/* Sync Button (Admin Only) */}
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => syncAllWithSheet()}
                disabled={isSyncing}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 shadow-sm"
                title="Sinkronkan Semua Data ke Google Sheets"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-300' : 'text-white'}`} />
                <span>{isSyncing ? 'Sinkron...' : 'Sinkron Sheet'}</span>
              </button>
            )}

            {/* User Profile Dropdown */}
            {currentUser && (
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center space-x-2 pl-2 pr-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all text-left"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-black ring-2 ring-blue-400/30 shrink-0">
                    {currentUser.nama.charAt(0)}
                  </div>
                  <div className="hidden lg:block text-left">
                    <div className="text-xs font-bold text-white truncate max-w-[130px]">
                      {currentUser.nama}
                    </div>
                    <div className="text-[10px] text-slate-300 truncate">
                      {currentUser.role === 'admin'
                        ? 'Panitia Ujian'
                        : currentUser.role === 'guru'
                        ? (currentUser.subjectSpecialty || 'Guru Mapel')
                        : (currentUser.kelas || 'Siswa SMP')}
                    </div>
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {/* Dropdown Menu Akun */}
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 text-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-3 border-b border-slate-100 space-y-1">
                      <p className="text-xs text-slate-500 font-medium">Akun Terdaftar:</p>
                      <p className="font-bold text-slate-900 text-sm truncate">{currentUser.nama}</p>
                      <div className="flex items-center gap-1.5 pt-0.5">
                        {getRoleBadge(currentUser.role)}
                        <span className="text-[11px] text-slate-500 font-mono">
                          {currentUser.role === 'siswa' ? `NIS: ${currentUser.nisOrNip}` : `HP: ${currentUser.phone || currentUser.nisOrNip}`}
                        </span>
                      </div>
                    </div>

                    <div className="px-2 pt-2 space-y-1">
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          onOpenAppScriptModal();
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition-colors"
                      >
                        <Sliders className="w-4 h-4 text-blue-600" />
                        <span>Pengaturan Database Spreadsheet</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          logout();
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Keluar Akun (Logout)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Banner Notifikasi Sinkronisasi */}
      {syncStatus.message && syncStatus.status !== 'idle' && (
        <div
          className={`px-4 py-1.5 text-xs text-center font-medium transition-all ${
            syncStatus.status === 'success'
              ? 'bg-emerald-700 text-emerald-100'
              : syncStatus.status === 'error'
              ? 'bg-rose-800 text-rose-100'
              : 'bg-blue-800 text-blue-100'
          }`}
        >
          {syncStatus.message}
        </div>
      )}
    </header>
  );
};
