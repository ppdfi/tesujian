/**
 * ============================================================================
 * DASBOR PANITIA & ADMINISTRATOR (ADMIN DASHBOARD) - SMP DARUL FAWAID ILMIYAH
 * ============================================================================
 * Fitur:
 * 1. Ringkasan Statistik Siswa, Guru, Paket Ujian, dan Partisipasi CBT
 * 2. Manajemen Pengguna (Siswa Kelas 7, 8, 9 & Guru Mapel) dengan Nomor HP & NIS
 * 3. Pemantauan Ujian & Generator Token CBT
 * 4. Rekapitulasi Data & Cetak Kartu Ujian / Berita Acara
 * 5. Sinkronisasi Data dengan Google Spreadsheet & Google Drive
 * 6. Tampilan bersih dan responsif di smartphone maupun desktop
 */

import React, { useState } from 'react';
import { useExam } from '../../context/ExamContext';
import { useAuth } from '../../context/AuthContext';
import { User, Exam, UserRole } from '../../types';
import { PrintExamCardsModal } from './PrintExamCardsModal';
import { PrintBeritaAcaraModal } from './PrintBeritaAcaraModal';
import {
  Users,
  GraduationCap,
  BookOpen,
  FileCheck,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Sheet,
  Printer,
  Download,
  KeyRound,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  Sliders,
  Settings,
  AlertTriangle,
  Building,
  Save,
  Check,
  Phone,
} from 'lucide-react';

interface AdminDashboardProps {
  onOpenAppScriptModal: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onOpenAppScriptModal }) => {
  const { currentUser } = useAuth();
  const {
    exams,
    users,
    submissions,
    institution,
    appScriptConfig,
    addUser,
    updateUser,
    deleteUser,
    updateExam,
    deleteExam,
    updateInstitution,
    exportToCsv,
    syncAllWithSheet,
    isSyncing,
  } = useExam();

  const [activeTab, setActiveTab] = useState<'ringkasan' | 'users' | 'exams' | 'recap' | 'settings'>('ringkasan');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');

  // Modal Pengguna State
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState({
    username: '',
    password: '123',
    nama: '',
    role: 'siswa' as UserRole,
    nisOrNip: '',
    kelas: 'Kelas 7A',
    email: '',
    phone: '',
    subjectSpecialty: '',
  });

  // Pengaturan Profil Sekolah
  const [instForm, setInstForm] = useState(institution);
  const [instSavedAlert, setInstSavedAlert] = useState(false);

  // Modal Cetak Kartu Ujian & Berita Acara
  const [showPrintCards, setShowPrintCards] = useState(false);
  const [showBeritaAcara, setShowBeritaAcara] = useState(false);
  const [selectedExamForPrint, setSelectedExamForPrint] = useState<Exam | null>(null);

  // Perhitungan Statistik
  const totalStudents = users.filter((u) => u.role === 'siswa').length;
  const totalTeachers = users.filter((u) => u.role === 'guru').length;
  const activeExamsCount = exams.filter((e) => e.status === 'published' || e.status === 'ongoing').length;
  const totalSubmissionsCount = submissions.length;

  const handleOpenAddUser = () => {
    setEditingUser(null);
    setUserFormData({
      username: '',
      password: '123',
      nama: '',
      role: 'siswa',
      nisOrNip: `2025.07.${String(totalStudents + 1).padStart(3, '0')}`,
      kelas: 'Kelas 7A',
      email: '',
      phone: '',
      subjectSpecialty: '',
    });
    setShowUserModal(true);
  };

  const handleOpenEditUser = (user: User) => {
    setEditingUser(user);
    setUserFormData({
      username: user.username,
      password: user.password || '123',
      nama: user.nama,
      role: user.role,
      nisOrNip: user.nisOrNip,
      kelas: user.kelas || 'Kelas 7A',
      email: user.email || '',
      phone: user.phone || '',
      subjectSpecialty: user.subjectSpecialty || '',
    });
    setShowUserModal(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.nama.trim() || !userFormData.username.trim()) return;

    if (editingUser) {
      updateUser({
        ...editingUser,
        username: userFormData.username,
        password: userFormData.password,
        nama: userFormData.nama,
        role: userFormData.role,
        nisOrNip: userFormData.nisOrNip,
        kelas: userFormData.role === 'siswa' ? userFormData.kelas : undefined,
        phone: userFormData.phone || undefined,
        email: userFormData.email || undefined,
        subjectSpecialty: userFormData.role === 'guru' ? userFormData.subjectSpecialty : undefined,
      });
    } else {
      addUser({
        username: userFormData.username,
        password: userFormData.password,
        nama: userFormData.nama,
        role: userFormData.role,
        nisOrNip: userFormData.nisOrNip,
        kelas: userFormData.role === 'siswa' ? userFormData.kelas : undefined,
        phone: userFormData.phone || undefined,
        email: userFormData.email || undefined,
        subjectSpecialty: userFormData.role === 'guru' ? userFormData.subjectSpecialty : undefined,
      });
    }
    setShowUserModal(false);
  };

  const handleSaveInstitution = (e: React.FormEvent) => {
    e.preventDefault();
    updateInstitution(instForm);
    setInstSavedAlert(true);
    setTimeout(() => setInstSavedAlert(false), 3000);
  };

  // Filter List Pengguna
  const filteredUsers = users.filter((u) => {
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchSearch =
      searchQuery.trim() === '' ||
      u.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.nisOrNip.includes(searchQuery);
    return matchRole && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 space-y-6">
      
      {/* 1. BANNER UTAMA PANITIA (RESPONSIF MOBILE) */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 rounded-3xl p-5 sm:p-7 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-600/40 text-blue-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Pusat Kendali Panitia & Proktor CBT</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black tracking-tight leading-tight">
              {institution.name}
            </h2>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-300">
              <span className="bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                Tahun Ajaran: <strong className="text-amber-300">{institution.academicYear}</strong>
              </span>
              <span className="bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                Semester: <strong className="text-white">{institution.semester}</strong>
              </span>
              <span className="text-slate-400">
                NPSN: <strong className="font-mono text-slate-200">{institution.npsn}</strong>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => syncAllWithSheet()}
              disabled={isSyncing}
              className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-950/20 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Sinkronisasi...' : 'Sinkron Spreadsheet'}</span>
            </button>
            <button
              onClick={onOpenAppScriptModal}
              className="py-2.5 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl text-xs flex items-center gap-1.5 transition-all border border-slate-700"
            >
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              <span>Konfigurasi DB</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. STATISTIK KARTU IKHTISAR */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Siswa SMP</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-800">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalStudents}</div>
          <p className="text-[11px] text-slate-400">Kelas 7, 8, & 9</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Guru Mata Pelajaran</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalTeachers}</div>
          <p className="text-[11px] text-slate-400">Penyusun & Penguji</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Paket Ujian CBT</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-800">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{exams.length}</div>
          <p className="text-[11px] text-slate-400">{activeExamsCount} Berstatus Aktif</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Lembar Jawaban</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalSubmissionsCount}</div>
          <p className="text-[11px] text-slate-400">Tersimpan di Sistem</p>
        </div>
      </div>

      {/* 3. TAB NAVIGASI PANITIA */}
      <div className="flex border-b border-slate-200 gap-2 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('ringkasan')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'ringkasan' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Ringkasan & Aksi Cepat
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'users' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Data Pengguna ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('exams')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'exams' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Paket Ujian CBT ({exams.length})
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'settings' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Identitas Lembaga
        </button>
      </div>

      {/* ===================================================================== */}
      {/* TAB: DATA PENGGUNA (SISWA & GURU) */}
      {/* ===================================================================== */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">Manajemen Siswa, Guru & Panitia</h3>
              <p className="text-xs text-slate-500">Kelola akun masuk, NIS siswa, nomor HP/WhatsApp, dan kelas</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => exportToCsv('users')}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs flex items-center gap-1.5 transition-colors"
                title="Ekspor Data Pengguna ke CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh CSV</span>
              </button>
              <button
                onClick={handleOpenAddUser}
                className="py-2 px-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Pengguna</span>
              </button>
            </div>
          </div>

          {/* Bar Filter & Pencarian */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama, NIS, atau username..."
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
              {(['all', 'siswa', 'guru', 'admin'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold capitalize transition-colors ${
                    roleFilter === r
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {r === 'all' ? 'Semua' : r}
                </button>
              ))}
            </div>
          </div>

          {/* Tabel Pengguna */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Nama Lengkap</th>
                  <th className="py-3 px-3">Peran</th>
                  <th className="py-3 px-3">NIS / No. HP</th>
                  <th className="py-3 px-3">Kelas / Mapel</th>
                  <th className="py-3 px-3">Username</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-bold text-slate-900">{u.nama}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.role === 'admin'
                            ? 'bg-blue-100 text-blue-800'
                            : u.role === 'guru'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">
                      {u.role === 'siswa' ? u.nisOrNip : (u.phone || u.nisOrNip)}
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-medium">
                      {u.role === 'siswa' ? u.kelas : u.subjectSpecialty || '-'}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500">{u.username}</td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditUser(u)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title="Edit Pengguna"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus pengguna ${u.nama}?`)) {
                              deleteUser(u.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                          title="Hapus Pengguna"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB: RINGKASAN & AKSI CEPAT */}
      {/* ===================================================================== */}
      {activeTab === 'ringkasan' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Kolom Kiri: Cetak Dokumen Ujian */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-600" />
                <span>Pusat Cetak Dokumen Ujian CBT</span>
              </h3>
              <p className="text-xs text-slate-500">
                Cetak kelengkapan administrasi ruang ujian seperti Kartu Peserta Ujian dan Berita Acara Pelaksanaan
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                    <span>Kartu Peserta Ujian Siswa</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Mencetak lembar kartu ujian berisi Nama, NIS, Kelas, Username, dan Password seluruh siswa.
                  </p>
                  <button
                    onClick={() => setShowPrintCards(true)}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
                  >
                    Buka Cetak Kartu Ujian
                  </button>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span>Berita Acara & Daftar Hadir</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Formulir resmi berita acara pelaksanaan ujian untuk ditandatangani oleh proktor dan pengawas ruang.
                  </p>
                  <button
                    onClick={() => setShowBeritaAcara(true)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
                  >
                    Buka Cetak Berita Acara
                  </button>
                </div>
              </div>
            </div>

            {/* Status Database Google Spreadsheet */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sheet className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-bold text-sm text-slate-900">Database Spreadsheet & Drive</h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  Terhubung
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Aplikasi ini terhubung langsung ke Google Sheets melalui Google Apps Script. Guru dan siswa dapat langsung mengakses webapp di browser tanpa perlu membuka spreadsheet.
              </p>
              <div className="pt-2">
                <button
                  onClick={onOpenAppScriptModal}
                  className="py-2 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Lihat URL Script & Panduan Setup
                </button>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Token Ujian Aktif */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-500" />
              <span>Token Ujian Hari Ini</span>
            </h3>
            <p className="text-xs text-slate-500">
              Bagikan token berikut kepada pengawas ruang untuk diumumkan kepada siswa
            </p>

            <div className="space-y-3">
              {exams.map((ex) => (
                <div key={ex.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900">
                      {ex.subject}
                    </span>
                    <span className="font-mono text-xs font-black bg-slate-900 text-amber-300 px-2 py-0.5 rounded">
                      {ex.token}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900">{ex.title}</h4>
                  <p className="text-[10px] text-slate-500">{ex.targetClass} • {ex.durationMinutes} Menit</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB: PAKET UJIAN CBT */}
      {/* ===================================================================== */}
      {activeTab === 'exams' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900">Daftar Seluruh Paket Ujian CBT</h3>
              <p className="text-xs text-slate-500">Dikelola oleh guru mata pelajaran dan panitia</p>
            </div>
            <button
              onClick={() => exportToCsv('exams')}
              className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Mata Pelajaran</th>
                  <th className="py-3 px-3">Judul Paket Ujian</th>
                  <th className="py-3 px-3">Guru Pengampu</th>
                  <th className="py-3 px-3">Target Kelas</th>
                  <th className="py-3 px-3">Durasi</th>
                  <th className="py-3 px-3">Token Masuk</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {exams.map((ex) => (
                  <tr key={ex.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-bold text-blue-900">{ex.subject}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{ex.title}</td>
                    <td className="py-3 px-3 text-slate-600">{ex.teacherName}</td>
                    <td className="py-3 px-3">{ex.targetClass}</td>
                    <td className="py-3 px-3">{ex.durationMinutes} Menit</td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">{ex.token}</td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {ex.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB: IDENTITAS LEMBAGA */}
      {/* ===================================================================== */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs max-w-2xl space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-900">Identitas Lembaga SMP Darul Fawaid Ilmiyah</h3>
            <p className="text-xs text-slate-500">Informasi ini akan tertera pada kop ujian, kartu peserta, dan berita acara</p>
          </div>

          {instSavedAlert && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Identitas lembaga berhasil diperbarui!</span>
            </div>
          )}

          <form onSubmit={handleSaveInstitution} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Satuan Pendidikan:</label>
              <input
                type="text"
                required
                value={instForm.name}
                onChange={(e) => setInstForm({ ...instForm, name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tahun Pelajaran:</label>
                <input
                  type="text"
                  value={instForm.academicYear}
                  onChange={(e) => setInstForm({ ...instForm, academicYear: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Semester:</label>
                <input
                  type="text"
                  value={instForm.semester}
                  onChange={(e) => setInstForm({ ...instForm, semester: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Kepala Sekolah:</label>
                <input
                  type="text"
                  value={instForm.headmasterName}
                  onChange={(e) => setInstForm({ ...instForm, headmasterName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nomor HP / Kontak Sekolah:</label>
                <input
                  type="text"
                  value={instForm.phone}
                  onChange={(e) => setInstForm({ ...instForm, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Alamat Lembaga:</label>
              <textarea
                rows={2}
                value={instForm.address}
                onChange={(e) => setInstForm({ ...instForm, address: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs transition-colors shadow-md"
              >
                Simpan Perubahan Identitas
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL TAMBAH / EDIT PENGGUNA */}
      {/* ===================================================================== */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-5 sm:p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                {editingUser ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}
              </h3>
              <button onClick={() => setShowUserModal(false)} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Peran (Role):</label>
                <select
                  value={userFormData.role}
                  onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as UserRole })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 font-semibold bg-white"
                >
                  <option value="siswa">Siswa SMP</option>
                  <option value="guru">Guru Mata Pelajaran</option>
                  <option value="admin">Panitia / Admin</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap:</label>
                <input
                  type="text"
                  required
                  value={userFormData.nama}
                  onChange={(e) => setUserFormData({ ...userFormData, nama: e.target.value })}
                  placeholder="Contoh: Andi Pratama"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {userFormData.role === 'siswa' ? 'NIS Siswa:' : 'Nomor HP / WA:'}
                  </label>
                  <input
                    type="text"
                    required
                    value={userFormData.role === 'siswa' ? userFormData.nisOrNip : userFormData.phone}
                    onChange={(e) => {
                      if (userFormData.role === 'siswa') {
                        setUserFormData({ ...userFormData, nisOrNip: e.target.value });
                      } else {
                        setUserFormData({ ...userFormData, phone: e.target.value, nisOrNip: e.target.value });
                      }
                    }}
                    placeholder={userFormData.role === 'siswa' ? '2025.07.001' : '081311223344'}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {userFormData.role === 'siswa' ? 'Kelas:' : 'Mata Pelajaran:'}
                  </label>
                  {userFormData.role === 'siswa' ? (
                    <select
                      value={userFormData.kelas}
                      onChange={(e) => setUserFormData({ ...userFormData, kelas: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white"
                    >
                      <option value="Kelas 7A">Kelas 7A</option>
                      <option value="Kelas 7B">Kelas 7B</option>
                      <option value="Kelas 8A">Kelas 8A</option>
                      <option value="Kelas 8B">Kelas 8B</option>
                      <option value="Kelas 9A">Kelas 9A</option>
                      <option value="Kelas 9B">Kelas 9B</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={userFormData.subjectSpecialty}
                      onChange={(e) => setUserFormData({ ...userFormData, subjectSpecialty: e.target.value })}
                      placeholder="Contoh: Matematika"
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Username Masuk:</label>
                  <input
                    type="text"
                    required
                    value={userFormData.username}
                    onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                    placeholder="andi.pratama"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kata Sandi:</label>
                  <input
                    type="password"
                    required
                    value={userFormData.password}
                    onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="py-2 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md"
                >
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CETAK KARTU UJIAN */}
      {showPrintCards && (
        <PrintExamCardsModal
          isOpen={showPrintCards}
          onClose={() => setShowPrintCards(false)}
          students={users.filter((u) => u.role === 'siswa')}
          institution={institution}
        />
      )}

      {/* MODAL CETAK BERITA ACARA */}
      {showBeritaAcara && (
        <PrintBeritaAcaraModal
          isOpen={showBeritaAcara}
          onClose={() => setShowBeritaAcara(false)}
          institution={institution}
          exam={exams[0]}
          totalParticipants={totalStudents}
        />
      )}

    </div>
  );
};
