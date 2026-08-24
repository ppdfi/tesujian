/**
 * ============================================================================
 * DASBOR UTAMA SISWA (SISWA DASHBOARD) - SMP DARUL FAWAID ILMIYAH
 * ============================================================================
 * Fitur:
 * 1. Tampilan bersih dan responsif di smartphone/HP maupun laptop
 * 2. Daftar Jadwal Ujian Tersedia dengan tombol Masuk Ujian & Masukkan Token
 * 3. Riwayat Ujian Selesai (Tanpa Menampilkan Nilai ke Siswa sesuai permintaan)
 * 4. Tanpa KKM
 */

import React, { useState } from 'react';
import { useExam } from '../../context/ExamContext';
import { useAuth } from '../../context/AuthContext';
import { Exam } from '../../types';
import {
  BookOpen,
  Clock,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Play,
  FileCheck,
  Sparkles,
  Check,
  HelpCircle,
} from 'lucide-react';

export const SiswaDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    exams,
    startExamSession,
    getStudentSubmissions,
    getQuestionsByExamId,
  } = useExam();

  const [selectedExamToStart, setSelectedExamToStart] = useState<Exam | null>(null);
  const [tokenInput, setTokenInput] = useState('');
  const [tokenError, setTokenError] = useState('');
  const [activeTab, setActiveTab] = useState<'available' | 'history'>('available');

  const studentSubs = currentUser ? getStudentSubmissions(currentUser.id) : [];

  // Filter hanya ujian yang berstatus 'published'
  const publishedExams = exams.filter((e) => e.status === 'published');

  const handleOpenStartExamModal = (exam: Exam) => {
    setSelectedExamToStart(exam);
    setTokenInput('');
    setTokenError('');
  };

  const handleConfirmStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamToStart) return;

    if (!tokenInput.trim()) {
      setTokenError('Silakan masukkan token ujian dari pengawas ruang.');
      return;
    }

    const res = startExamSession(selectedExamToStart.id, tokenInput.trim());
    if (!res.success) {
      setTokenError(res.message);
    } else {
      setSelectedExamToStart(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 space-y-6">
      
      {/* 1. BANNER SELAMAT DATANG SISWA (RESPONSIF MOBILE) */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-5 sm:p-7 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-800/60 border border-blue-500/40 text-blue-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Portal CBT Siswa</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black tracking-tight leading-tight">
              Selamat Datang, {currentUser?.nama}
            </h2>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-blue-200">
              <span className="bg-blue-800/80 px-2.5 py-1 rounded-lg border border-blue-600/50">
                NIS: <strong className="text-white font-mono">{currentUser?.nisOrNip}</strong>
              </span>
              <span className="bg-blue-800/80 px-2.5 py-1 rounded-lg border border-blue-600/50">
                Kelas: <strong className="text-white">{currentUser?.kelas || 'Kelas 7A'}</strong>
              </span>
              <span className="text-blue-300 font-medium">
                SMP Darul Fawaid Ilmiyah
              </span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center min-w-[140px] sm:min-w-[160px] self-start md:self-auto">
            <span className="text-[11px] text-blue-200 uppercase tracking-wider font-bold block mb-1">
              Ujian Selesai
            </span>
            <div className="text-2xl sm:text-3xl font-black text-amber-300">{studentSubs.length}</div>
            <p className="text-[10px] sm:text-[11px] text-blue-200 mt-0.5">Mata Pelajaran</p>
          </div>
        </div>
      </div>

      {/* 2. TAB NAVIGASI */}
      <div className="flex border-b border-slate-200 gap-2 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('available')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'available'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Jadwal Ujian Tersedia ({publishedExams.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'history'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Riwayat Ujian Selesai ({studentSubs.length})</span>
        </button>
      </div>

      {/* 3. TAB: JADWAL UJIAN TERSEDIA */}
      {activeTab === 'available' && (
        <div className="space-y-4">
          {publishedExams.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 space-y-2">
              <BookOpen className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">Belum ada jadwal ujian yang aktif saat ini.</p>
              <p className="text-[11px] text-slate-400">Silakan cek kembali secara berkala sesuai arahan pengawas ruang.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {publishedExams.map((exam) => {
                const alreadySubmitted = studentSubs.some((s) => s.examId === exam.id);
                const totalQs = getQuestionsByExamId(exam.id).length;

                return (
                  <div
                    key={exam.id}
                    className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2 gap-2">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200 truncate">
                          {exam.subject}
                        </span>
                        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 shrink-0">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {exam.durationMinutes} Menit
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-slate-900 mb-1 leading-snug">{exam.title}</h3>
                      <p className="text-xs text-slate-500 mb-3">
                        Guru Pengampu: <span className="font-semibold text-slate-700">{exam.teacherName}</span>
                      </p>

                      <div className="text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Jumlah Soal:</span>
                        <span className="font-bold text-slate-800">{totalQs} Butir Soal</span>
                      </div>
                    </div>

                    <div>
                      {alreadySubmitted ? (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-center text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Sudah Selesai Dikerjakan</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenStartExamModal(exam)}
                          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-900/10 active:scale-[0.98]"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Mulai Masuk Ujian</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. TAB: RIWAYAT UJIAN SELESAI (TANPA MENAMPILKAN NILAI KE SISWA) */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-900">Riwayat Ujian CBT yang Telah Dikerjakan</h3>
            <p className="text-xs text-slate-500">Daftar evaluasi pembelajaran yang telah berhasil dikumpulkan dan tersimpan</p>
          </div>

          {studentSubs.length === 0 ? (
            <div className="p-10 text-center text-slate-400 space-y-2">
              <FileCheck className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">Anda belum mengerjakan ujian apapun.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studentSubs.map((sub) => (
                <div
                  key={sub.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-blue-100 text-blue-900">
                        {sub.subject}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" />
                        Tersimpan di Sistem
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900">{sub.examTitle}</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Waktu Pengumpulan: {sub.submitTime ? new Date(sub.submitTime).toLocaleString('id-ID') : '-'}
                    </p>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                    <span>Status Lembar Jawaban:</span>
                    <span className="font-semibold text-slate-800">Telah Diterima Guru</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. MODAL MASUKKAN TOKEN UJIAN */}
      {selectedExamToStart && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-slate-900 text-white p-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-700 text-blue-200">
                  {selectedExamToStart.subject}
                </span>
              </div>
              <h3 className="text-base font-bold">{selectedExamToStart.title}</h3>
              <p className="text-xs text-slate-400 mt-1">
                Durasi Ujian: {selectedExamToStart.durationMinutes} Menit
              </p>
            </div>

            <form onSubmit={handleConfirmStart} className="p-5 sm:p-6 space-y-4 text-xs">
              {/* Tata Tertib */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-700" />
                  <span>Tata Tertib Ujian CBT:</span>
                </h4>
                <div className="text-slate-600 text-[11px] whitespace-pre-wrap leading-relaxed">
                  {selectedExamToStart.instructions || '1. Berdoalah sebelum mulai.\n2. Dilarang berpindah tab atau keluar dari jendela ujian selama pengerjaan.'}
                </div>
              </div>

              {tokenError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{tokenError}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Masukkan Token Ujian (Dari Pengawas Ruang):
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                    placeholder="Contoh: SMP2026"
                    className="w-full pl-9 pr-4 py-3 rounded-2xl border-2 border-slate-300 font-mono text-sm font-bold tracking-widest text-blue-900 uppercase focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Petunjuk demo: Token ujian ini adalah <code className="font-bold text-blue-800 bg-blue-50 px-1 py-0.5 rounded">{selectedExamToStart.token}</code>
                </p>
              </div>

              <div className="pt-2 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedExamToStart(null)}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Mulai Kerjakan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
