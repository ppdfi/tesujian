/**
 * ============================================================================
 * FORM LOGIN PENGGUNA (LOGIN FORM) - SMP DARUL FAWAID ILMIYAH
 * ============================================================================
 * Fitur:
 * 1. Tampilan bersih, profesional, dan responsif (nyaman di HP & Desktop)
 * 2. Login Siswa menggunakan NIS (Nomor Induk Siswa) atau Username
 * 3. Login Guru & Panitia menggunakan Nomor HP / WhatsApp atau Username
 * 4. Fokus pada penggunaan nyata (tanpa tombol demo/trial)
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { SMP_LOGO_URL } from '../../services/appScriptService';
import {
  ShieldCheck,
  GraduationCap,
  UserCheck,
  BookOpen,
  ArrowRight,
  Sparkles,
  KeyRound,
  User,
  Phone,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

interface LoginFormProps {
  onOpenAppScriptModal: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onOpenAppScriptModal }) => {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('siswa');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!username.trim()) {
      setErrorMessage(
        selectedRole === 'siswa'
          ? 'Silakan masukkan NIS atau Username Siswa.'
          : 'Silakan masukkan Nomor HP / WhatsApp atau Username.'
      );
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Silakan masukkan kata sandi (password).');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = login(username, password, selectedRole);
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.message);
      } else {
        setSuccessMessage(res.message);
      }
    }, 200);
  };

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage('');
    setUsername('');
    setPassword('');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-3 sm:p-6 lg:p-8 bg-gradient-to-b from-slate-100 via-blue-50/30 to-slate-100">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
        
        {/* Kolom Kiri: Profil & Informasi Sekolah */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-6 text-center lg:text-left">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-900 border border-blue-300 text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Portal CBT SMP Darul Fawaid Ilmiyah</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <img
                src={SMP_LOGO_URL}
                alt="Logo SMP"
                className="w-12 h-12 object-contain rounded-2xl bg-white p-1 shadow-xs border border-slate-200 shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="text-left">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                  SMP Darul Fawaid Ilmiyah
                </h2>
                <p className="text-xs text-blue-800 font-semibold">
                  Aplikasi Ujian CBT & Penilaian Interaktif
                </p>
              </div>
            </div>

            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed pt-1">
              Sistem ujian berbasis komputer resmi untuk pelaksanaan Asesmen Sumatif, Ujian Madrasah/Sekolah, dan Penilaian Harian.
            </p>
          </div>

          {/* Informasi Fitur */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-start gap-3 text-left p-3.5 rounded-2xl bg-white/90 border border-slate-200 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-800 shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Keamanan Ujian & Anti-Curang</h4>
                <p className="text-[11px] text-slate-500">Pencatatan aktivitas siswa dan deteksi otomatis saat jendela ujian ditinggalkan.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-left p-3.5 rounded-2xl bg-white/90 border border-slate-200 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0 mt-0.5">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Rekap Nilai Siswa Per Kelas</h4>
                <p className="text-[11px] text-slate-500">Guru mapel dapat langsung mengunduh hasil dan rekapitulasi nilai masing-masing kelas.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Kotak Login */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            
            {/* Header Login & Tab Peran */}
            <div className="bg-slate-900 text-white p-5 sm:p-6 pb-5">
              <h3 className="text-base sm:text-lg font-bold">Masuk ke Ruang Ujian</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Pilih peran Anda dan masukkan akun yang telah diberikan pihak sekolah
              </p>

              {/* Tab Pemilihan Peran (Siswa, Guru, Admin) */}
              <div className="grid grid-cols-3 gap-2 mt-4 p-1 bg-slate-950 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => handleSelectRole('siswa')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    selectedRole === 'siswa'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 shrink-0" />
                  <span>Siswa</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectRole('guru')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    selectedRole === 'guru'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <UserCheck className="w-4 h-4 shrink-0" />
                  <span>Guru</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectRole('admin')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    selectedRole === 'admin'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Panitia</span>
                </button>
              </div>
            </div>

            {/* Formulir Input */}
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
              
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2">
                  <span className="font-semibold">{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{successMessage}</span>
                </div>
              )}

              {/* Input Username / NIS / No. HP */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {selectedRole === 'siswa'
                    ? 'Nomor Induk Siswa (NIS) atau Username:'
                    : 'Nomor WhatsApp / HP atau Username:'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    {selectedRole === 'siswa' ? <User className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={
                      selectedRole === 'siswa'
                        ? 'Ketik NIS Anda (misal: 2025.07.001)'
                        : 'Ketik Nomor HP Anda (misal: 081311223344)'
                    }
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-slate-200 text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
                  />
                </div>
              </div>

              {/* Input Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Kata Sandi (Password):
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi akun..."
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-slate-200 text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
                  />
                </div>
              </div>

              {/* Tombol Submit Login */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-900/10 active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Memverifikasi Akun...</span>
                ) : (
                  <>
                    <span>Masuk sebagai {selectedRole === 'admin' ? 'Panitia Ujian' : selectedRole === 'guru' ? 'Guru Mapel' : 'Siswa'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <p className="text-[11px] text-slate-500">
                  Lupa kata sandi atau akun belum terdaftar? Hubungi Panitia Ujian CBT SMP.
                </p>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
};
