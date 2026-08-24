/**
 * ============================================================================
 * KOMPONEN LEMBAR PENGERJAAN CBT SISWA (CBT PLAYER)
 * ============================================================================
 * Fitur:
 * 1. Tampilan responsif di Smartphone/HP maupun Laptop/PC
 * 2. Timer hitung mundur ujian otomatis
 * 3. Deteksi anti-curang (pindah tab / jendela kehilangan fokus)
 * 4. Navigasi soal (Sebelumnya, Ragu-ragu, Selanjutnya, Lompat Nomor)
 * 5. Dukungan foto soal (terhubung Google Drive) dengan fitur perbesar (lightbox zoom)
 * 6. Tidak menampilkan nilai ke siswa setelah selesai (sesuai permintaan)
 * 7. Bebas KKM
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useExam } from '../../context/ExamContext';
import { useAuth } from '../../context/AuthContext';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Send,
  BookOpen,
  ZoomIn,
  X,
  LayoutGrid,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export const CbtPlayer: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    activeSession,
    recordAnswer,
    incrementCheatWarning,
    finishExamSession,
    cancelActiveSession,
    goToQuestion,
  } = useExam();

  const [fontSizeOffset, setFontSizeOffset] = useState<number>(0); // Pengatur ukuran huruf (-2, 0, +2, +4)
  const [showConfirmFinishModal, setShowConfirmFinishModal] = useState(false);
  const [cheatAlertText, setCheatAlertText] = useState<string | null>(null);
  const [submittedResult, setSubmittedResult] = useState<any | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [showMobilePalette, setShowMobilePalette] = useState<boolean>(false);

  if (!activeSession) return null;

  const {
    exam,
    questions,
    currentQuestionIndex,
    answers,
    timeRemainingSeconds,
  } = activeSession;

  const currentQ = questions[currentQuestionIndex];
  const currentAnsObj = currentQ ? answers[currentQ.id] : null;
  const currentAnswerVal = currentAnsObj?.answer;
  const isCurrentDoubtful = !!currentAnsObj?.isDoubtful;

  // Format waktu hitung mundur (Menit:Detik)
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const isLowTime = timeRemainingSeconds <= 300; // Kurang dari 5 menit

  // Anti-curang: Deteksi jika siswa membuka tab lain atau meminimize browser
  useEffect(() => {
    if (!exam.antiCheatEnabled || submittedResult) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const count = incrementCheatWarning();
        setCheatAlertText(
          `Peringatan #${count}: Anda terdeteksi berpindah tab! Pengawas ruang ujian mencatat aktivitas ini.`
        );
      }
    };

    const handleWindowBlur = () => {
      const count = incrementCheatWarning();
      setCheatAlertText(
        `Peringatan #${count}: Jendela ujian tidak aktif. Harap tetap berada pada halaman ujian CBT.`
      );
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [exam.antiCheatEnabled, incrementCheatWarning, submittedResult]);

  // Navigasi keyboard (Panah Kanan / Kiri untuk laptop)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'ArrowRight' && currentQuestionIndex < questions.length - 1) {
        goToQuestion(currentQuestionIndex + 1);
      } else if (e.key === 'ArrowLeft' && currentQuestionIndex > 0) {
        goToQuestion(currentQuestionIndex - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestionIndex, questions.length, goToQuestion]);

  // Selesaikan ujian
  const handleFinalSubmit = () => {
    setShowConfirmFinishModal(false);
    const result = finishExamSession();
    setSubmittedResult(result);

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {}
  };

  // Hitung jumlah soal yang telah dijawab
  const totalQuestionsCount = questions.length;
  let answeredCount = 0;
  let doubtfulCount = 0;

  questions.forEach((q) => {
    const ans = answers[q.id];
    if (ans && ans.answer !== undefined && String(ans.answer).trim() !== '') {
      answeredCount++;
    }
    if (ans?.isDoubtful) {
      doubtfulCount++;
    }
  });

  const unansweredCount = totalQuestionsCount - answeredCount;

  // =========================================================================
  // TAMPILAN SETELAH SELESAI UJIAN (TIDAK MENAMPILKAN NILAI KEPADA MURID)
  // =========================================================================
  if (submittedResult) {
    return (
      <div className="min-h-screen bg-slate-900/90 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 max-w-md w-full text-center space-y-6 animate-in zoom-in-95 duration-200">
          
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner ring-8 ring-emerald-50">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Lembar Jawaban Terkirim</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Ujian Berhasil Diselesaikan!
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Terima kasih telah mengerjakan ujian <strong>{submittedResult.examTitle}</strong> dengan jujur dan tertib. Jawaban Anda telah tersimpan rapi di sistem.
            </p>
          </div>

          {/* Rincian Pengerjaan Siswa (Tanpa Nilai & Tanpa KKM) */}
          <div className="text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-2">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500">Mata Pelajaran:</span>
              <span className="font-bold text-blue-900">{submittedResult.subject}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Nama Siswa:</span>
              <span className="font-bold text-slate-900">{submittedResult.studentName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">NIS / Kelas:</span>
              <span className="font-mono font-bold text-slate-800">{submittedResult.studentNis} • {submittedResult.studentClass}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Waktu Selesai:</span>
              <span className="font-mono text-slate-700">
                {new Date(submittedResult.submitTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
              </span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-slate-200">
              <span className="text-slate-500">Status Soal:</span>
              <span className="font-semibold text-emerald-700">
                {answeredCount} dari {totalQuestionsCount} Soal Dijawab
              </span>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-[11px] leading-relaxed">
            Hasil koreksi dan rekapitulasi nilai akan diolah langsung oleh Bapak/Ibu Guru pengampu mata pelajaran.
          </div>

          <button
            onClick={cancelActiveSession}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98]"
          >
            Kembali ke Halaman Siswa
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // TAMPILAN RUANG UJIAN AKTIF (CBT RUNNER)
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between select-none">
      
      {/* 1. TOP BAR UJIAN (RESPONSIF DI HP & LAPTOP) */}
      <header className="bg-slate-900 text-white px-3 sm:px-6 py-2.5 shadow-md border-b border-slate-800 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          
          {/* Judul Ujian & Mapel */}
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-700 truncate max-w-[120px] sm:max-w-none">
                  {exam.subject}
                </span>
                <span className="text-xs text-slate-300 font-semibold truncate hidden sm:inline">
                  {exam.title}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                {currentUser?.nama} <span className="font-mono">({currentUser?.nisOrNip})</span>
              </p>
            </div>
          </div>

          {/* Kontrol Kanan: Tombol Nomor Soal (Mobile) & Timer Countdown */}
          <div className="flex items-center space-x-2 shrink-0">
            
            {/* Tombol Buka Palet Nomor Soal di Layar HP */}
            <button
              onClick={() => setShowMobilePalette(!showMobilePalette)}
              className="lg:hidden p-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1"
              title="Daftar Nomor Soal"
            >
              <LayoutGrid className="w-4 h-4 text-blue-400" />
              <span className="text-[11px]">{currentQuestionIndex + 1}/{questions.length}</span>
            </button>

            {/* Pengatur Ukuran Huruf Soal (A- / A+) */}
            <div className="hidden sm:flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700 text-slate-300 text-xs">
              <button
                onClick={() => setFontSizeOffset((prev) => Math.max(-2, prev - 2))}
                className="px-2 py-0.5 hover:text-white rounded font-bold"
                title="Perkecil Ukuran Huruf"
              >
                A-
              </button>
              <span className="px-1 text-[10px] text-slate-400 font-mono">Ukuran</span>
              <button
                onClick={() => setFontSizeOffset((prev) => Math.min(4, prev + 2))}
                className="px-2 py-0.5 hover:text-white rounded font-bold"
                title="Perbesar Ukuran Huruf"
              >
                A+
              </button>
            </div>

            {/* Kotak Timer Hitung Mundur */}
            <div
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-mono font-bold tracking-wider ${
                isLowTime
                  ? 'bg-rose-950/90 border-rose-600 text-rose-300 animate-pulse'
                  : 'bg-blue-950/80 border-blue-600 text-blue-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              <span>{formatTime(timeRemainingSeconds)}</span>
            </div>
          </div>

        </div>
      </header>

      {/* Peringatan Anti-Curang (Jika Siswa Pindah Tab) */}
      {cheatAlertText && (
        <div className="bg-rose-600 text-white text-xs font-semibold px-4 py-2 text-center flex items-center justify-center gap-2 animate-in slide-in-from-top duration-200 shadow-md">
          <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />
          <span>{cheatAlertText}</span>
          <button
            onClick={() => setCheatAlertText(null)}
            className="ml-2 bg-white/20 hover:bg-white/30 text-white px-2 py-0.5 rounded text-[11px] font-bold"
          >
            Tutup
          </button>
        </div>
      )}

      {/* 2. AREA UTAMA PENGERJAAN SOAL */}
      <main className="max-w-7xl mx-auto w-full p-3 sm:p-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Kolom Kiri: Lembar Soal & Pilihan Jawaban */}
        <div className="lg:col-span-8 bg-white rounded-3xl shadow-xs border border-slate-200 p-4 sm:p-6 space-y-6 flex flex-col justify-between min-h-[460px]">
          
          <div className="space-y-4">
            
            {/* Header Butir Soal */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-blue-600 text-white font-bold text-xs sm:text-sm">
                  Soal No. {currentQuestionIndex + 1}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                  {currentQ.type === 'multiple_choice'
                    ? 'Pilihan Ganda'
                    : currentQ.type === 'true_false'
                    ? 'Benar / Salah'
                    : currentQ.type === 'short_answer'
                    ? 'Isian Singkat'
                    : 'Uraian / Essay'}
                </span>
              </div>

              {isCurrentDoubtful && (
                <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold">
                  Status: Ragu-ragu
                </span>
              )}
            </div>

            {/* Foto Soal (Jika ada lampiran gambar dari guru / Google Drive) */}
            {currentQ.imageUrl && (
              <div className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 max-w-lg mx-auto">
                <img
                  src={currentQ.imageUrl}
                  alt="Lampiran Soal"
                  className="w-full max-h-64 object-contain mx-auto p-2 cursor-pointer transition-transform hover:scale-[1.01]"
                  referrerPolicy="no-referrer"
                  onClick={() => setExpandedImage(currentQ.imageUrl || null)}
                />
                <button
                  type="button"
                  onClick={() => setExpandedImage(currentQ.imageUrl || null)}
                  className="absolute bottom-2 right-2 px-2.5 py-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>Perbesar Gambar</span>
                </button>
              </div>
            )}

            {/* Teks Pertanyaan Soal */}
            <div
              className="text-slate-800 font-medium leading-relaxed whitespace-pre-wrap select-text"
              style={{ fontSize: `${15 + fontSizeOffset}px` }}
            >
              {currentQ.questionText}
            </div>

            {/* Pilihan Jawaban */}
            <div className="pt-2 space-y-2.5">
              
              {/* Opsi Pilihan Ganda & Benar-Salah */}
              {(currentQ.type === 'multiple_choice' || currentQ.type === 'true_false') && (
                <div className="space-y-2.5">
                  {currentQ.options?.map((opt) => {
                    const isSelected = String(currentAnswerVal || '') === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => recordAnswer(currentQ.id, opt.key)}
                        className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border-2 transition-all flex items-start gap-3.5 cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/90 border-blue-600 text-blue-950 font-semibold shadow-xs ring-1 ring-blue-600'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span
                          className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center shrink-0 text-xs transition-colors ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 border border-slate-300'
                          }`}
                        >
                          {opt.key}
                        </span>
                        <div
                          className="flex-1 pt-1 select-text leading-snug"
                          style={{ fontSize: `${14 + fontSizeOffset}px` }}
                        >
                          {opt.text}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Soal Isian Singkat */}
              {currentQ.type === 'short_answer' && (
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Tuliskan Jawaban Singkat Anda:
                  </label>
                  <input
                    type="text"
                    value={String(currentAnswerVal || '')}
                    onChange={(e) => recordAnswer(currentQ.id, e.target.value)}
                    placeholder="Ketik jawaban di sini..."
                    className="w-full p-3.5 rounded-2xl border-2 border-slate-300 focus:border-blue-600 focus:outline-none text-sm font-medium"
                    style={{ fontSize: `${14 + fontSizeOffset}px` }}
                  />
                </div>
              )}

              {/* Soal Uraian / Essay */}
              {currentQ.type === 'essay' && (
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Tuliskan Penjelasan Lengkap Jawaban Anda:
                  </label>
                  <textarea
                    rows={6}
                    value={String(currentAnswerVal || '')}
                    onChange={(e) => recordAnswer(currentQ.id, e.target.value)}
                    placeholder="Tuliskan uraian jawaban secara rinci dan jelas..."
                    className="w-full p-3.5 rounded-2xl border-2 border-slate-300 focus:border-blue-600 focus:outline-none text-sm font-normal leading-relaxed"
                    style={{ fontSize: `${14 + fontSizeOffset}px` }}
                  />
                </div>
              )}

            </div>
          </div>

          {/* 3. TOMBOL NAVIGASI BAWAH (SEBELUMNYA, RAGU-RAGU, BERIKUTNYA, KUMPULKAN) */}
          <div className="pt-4 border-t border-slate-200 grid grid-cols-3 sm:flex sm:justify-between items-center gap-2">
            
            {/* Tombol Sebelumnya */}
            <button
              type="button"
              disabled={currentQuestionIndex === 0}
              onClick={() => goToQuestion(currentQuestionIndex - 1)}
              className="py-3 px-3 sm:px-5 rounded-2xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Soal</span> Sebelumnya
            </button>

            {/* Tombol Ragu-ragu */}
            <button
              type="button"
              onClick={() => recordAnswer(currentQ.id, currentAnswerVal, !isCurrentDoubtful)}
              className={`py-3 px-3 sm:px-5 rounded-2xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                isCurrentDoubtful
                  ? 'bg-amber-400 border-amber-500 text-slate-900 shadow-xs'
                  : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
              }`}
            >
              <span>{isCurrentDoubtful ? 'Batal Ragu' : 'Ragu-Ragu'}</span>
            </button>

            {/* Tombol Berikutnya / Selesai */}
            {currentQuestionIndex < questions.length - 1 ? (
              <button
                type="button"
                onClick={() => goToQuestion(currentQuestionIndex + 1)}
                className="py-3 px-3 sm:px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <span>Berikutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmFinishModal(true)}
                className="py-3 px-3 sm:px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md col-span-3 sm:col-span-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kumpulkan</span>
              </button>
            )}
          </div>

        </div>

        {/* Kolom Kanan: Palet Daftar Nomor Soal (Desktop & Drawer Mobile) */}
        <div className={`lg:col-span-4 ${showMobilePalette ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white rounded-3xl shadow-xs border border-slate-200 p-5 space-y-4">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <LayoutGrid className="w-4 h-4 text-blue-600" />
                <span>Daftar Nomor Soal</span>
              </h3>
              <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                {answeredCount} / {totalQuestionsCount} Terisi
              </span>
            </div>

            {/* Grid Tombol Nomor Soal */}
            <div className="grid grid-cols-5 gap-2 max-h-[300px] sm:max-h-[360px] overflow-y-auto p-1">
              {questions.map((q, idx) => {
                const ans = answers[q.id];
                const isAnswered = ans && ans.answer !== undefined && String(ans.answer).trim() !== '';
                const isDoubtful = ans?.isDoubtful;
                const isCurrent = idx === currentQuestionIndex;

                let btnClass = 'bg-white border-slate-300 text-slate-700 hover:border-slate-400';
                if (isCurrent) {
                  btnClass = 'ring-2 ring-blue-600 ring-offset-1 border-blue-600 font-black';
                }
                if (isDoubtful) {
                  btnClass += ' bg-amber-400 border-amber-500 text-slate-900 font-bold';
                } else if (isAnswered) {
                  btnClass += ' bg-blue-600 border-blue-600 text-white font-bold';
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      goToQuestion(idx);
                      setShowMobilePalette(false);
                    }}
                    className={`h-11 rounded-xl border flex flex-col items-center justify-center text-xs transition-all active:scale-95 ${btnClass}`}
                  >
                    <span className="font-bold">{idx + 1}</span>
                    {isAnswered && (
                      <span className="text-[9px] uppercase font-mono leading-none mt-0.5">
                        {String(ans.answer).substring(0, 1)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Keterangan Warna Palet */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-[10px] font-semibold text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-blue-600"></span>
                <span>Terjawab</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-400"></span>
                <span>Ragu</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-white border border-slate-300"></span>
                <span>Kosong</span>
              </div>
            </div>

            {/* Tombol Kumpulkan Jawaban */}
            <button
              type="button"
              onClick={() => setShowConfirmFinishModal(true)}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-900/10 mt-2"
            >
              <Send className="w-4 h-4" />
              <span>Kumpulkan Lembar Ujian</span>
            </button>
          </div>
        </div>

      </main>

      {/* MODAL PERBESAR GAMBAR SOAL (LIGHTBOX) */}
      {expandedImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-3xl p-4 overflow-hidden flex flex-col items-center shadow-2xl">
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute top-3 right-3 p-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={expandedImage}
              alt="Pratinjau Gambar Soal"
              className="max-w-full max-h-[80vh] object-contain rounded-xl"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI PENGUMPULAN UJIAN */}
      {showConfirmFinishModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Selesaikan Ujian?</h3>
                <p className="text-xs text-slate-500">Periksa kembali ringkasan jawaban Anda</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Total Soal:</span>
                <span className="font-bold text-slate-900">{totalQuestionsCount} Soal</span>
              </div>
              <div className="flex justify-between text-blue-700">
                <span>Sudah Dijawab:</span>
                <span className="font-bold">{answeredCount} Soal</span>
              </div>
              {doubtfulCount > 0 && (
                <div className="flex justify-between text-amber-700">
                  <span>Masih Ragu-ragu:</span>
                  <span className="font-bold">{doubtfulCount} Soal</span>
                </div>
              )}
              {unansweredCount > 0 && (
                <div className="flex justify-between text-rose-600 font-bold">
                  <span>Belum Terisi:</span>
                  <span>{unansweredCount} Soal</span>
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Setelah dikumpulkan, lembar jawaban akan langsung tersimpan dan tidak dapat diubah kembali.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmFinishModal(false)}
                className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                Lanjutkan
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-colors"
              >
                Ya, Kumpulkan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
