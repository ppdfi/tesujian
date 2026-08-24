/**
 * ============================================================================
 * DASBOR GURU (GURU DASHBOARD) - SMP DARUL FAWAID ILMIYAH
 * ============================================================================
 * Fitur Lengkap:
 * 1. Manajemen Ujian & Bank Soal (Pilihan Ganda, Benar/Salah, Isian, Uraian/Esai)
 * 2. Unggah Foto Soal ke Google Drive / Link URL gambar
 * 3. Koreksi Lembar Jawaban Siswa (PG dinilai otomatis by sistem, Esai dinilai manual oleh Guru)
 * 4. Rekap Nilai Siswa Per Kelas (Kelas 7, 8, 9) dengan statistik dan ekspor data
 * 5. Tanpa KKM & Tanpa NIP (Menggunakan Nomor HP)
 * 6. Tampilan rapi dan responsif di smartphone (HP) & laptop
 */

import React, { useState, useRef } from 'react';
import { useExam } from '../../context/ExamContext';
import { useAuth } from '../../context/AuthContext';
import { Exam, Question, QuestionType, ExamSubmission, StudentAnswer } from '../../types';
import { DRIVE_FOLDER_URL } from '../../services/appScriptService';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  CheckCircle,
  Clock,
  Award,
  Users,
  Search,
  Filter,
  Eye,
  Sliders,
  Sparkles,
  FileText,
  Save,
  X,
  AlertCircle,
  HelpCircle,
  MessageSquare,
  Image as ImageIcon,
  UploadCloud,
  ExternalLink,
  Check,
  Printer,
  Download,
  GraduationCap,
  TrendingUp,
  BarChart3,
  Calendar,
} from 'lucide-react';

export const GuruDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    exams,
    submissions,
    addExam,
    updateExam,
    deleteExam,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    getQuestionsByExamId,
    gradeSubmission,
    uploadQuestionImage,
    exportToCsv,
  } = useExam();

  // Tab Menu Guru: 1. Ujian & Soal | 2. Koreksi Esai | 3. Rekap Nilai Per Kelas
  const [activeTab, setActiveTab] = useState<'exams' | 'grading' | 'recap'>('exams');
  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter Rekap Nilai
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [selectedExamFilter, setSelectedExamFilter] = useState<string>('all');

  // Modal Ujian State
  const [showExamModal, setShowExamModal] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [examFormData, setExamFormData] = useState({
    title: '',
    subject: currentUser?.subjectSpecialty || 'Matematika',
    targetClass: 'Kelas 7A',
    durationMinutes: 60,
    token: `SMP${Math.floor(1000 + Math.random() * 9000)}`,
    instructions: '1. Berdoalah sebelum mulai mengerjakan.\n2. Baca setiap butir soal dengan teliti.\n3. Periksa kembali seluruh lembar jawaban sebelum mengakhiri ujian.',
    randomizeQuestions: true,
    randomizeOptions: true,
    antiCheatEnabled: true,
  });

  // Modal Soal State
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [questionFormData, setQuestionFormData] = useState({
    type: 'multiple_choice' as QuestionType,
    questionText: '',
    imageUrl: '',
    points: 20,
    explanation: '',
    correctAnswer: 'A',
    options: [
      { key: 'A', text: '' },
      { key: 'B', text: '' },
      { key: 'C', text: '' },
      { key: 'D', text: '' },
    ],
  });

  // Upload Gambar State
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal Koreksi State
  const [selectedSubmissionForGrading, setSelectedSubmissionForGrading] = useState<ExamSubmission | null>(null);
  const [gradeInputs, setGradeInputs] = useState<Record<string, { score: number; feedback: string }>>({});

  // Ujian terpilih saat ini
  const currentSelectedExam = exams.find((e) => e.id === selectedExamId) || exams[0];
  const currentExamQuestions = currentSelectedExam ? getQuestionsByExamId(currentSelectedExam.id) : [];

  // Antrean koreksi ujian yang membutuhkan penilaian guru
  const pendingGradingSubmissions = submissions.filter((s) => s.status === 'submitted');

  // =========================================================================
  // HANDLERS UJIAN (BUAT, EDIT, HAPUS)
  // =========================================================================
  const handleOpenAddExam = () => {
    setEditingExam(null);
    setExamFormData({
      title: '',
      subject: currentUser?.subjectSpecialty || 'Matematika',
      targetClass: 'Kelas 7A',
      durationMinutes: 60,
      token: `SMP${Math.floor(1000 + Math.random() * 9000)}`,
      instructions: '1. Berdoalah sebelum mulai mengerjakan.\n2. Baca setiap butir soal dengan teliti.\n3. Periksa kembali seluruh lembar jawaban sebelum mengakhiri ujian.',
      randomizeQuestions: true,
      randomizeOptions: true,
      showResultDirectly: false,
      antiCheatEnabled: true,
    });
    setShowExamModal(true);
  };

  const handleOpenEditExam = (exam: Exam) => {
    setEditingExam(exam);
    setExamFormData({
      title: exam.title,
      subject: exam.subject,
      targetClass: exam.targetClass || 'Kelas 7A',
      durationMinutes: exam.durationMinutes,
      token: exam.token,
      instructions: exam.instructions,
      randomizeQuestions: exam.randomizeQuestions,
      randomizeOptions: exam.randomizeOptions,
      antiCheatEnabled: exam.antiCheatEnabled,
    });
    setShowExamModal(true);
  };

  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examFormData.title.trim()) return;

    if (editingExam) {
      updateExam({
        ...editingExam,
        title: examFormData.title,
        subject: examFormData.subject,
        targetClass: examFormData.targetClass,
        durationMinutes: Number(examFormData.durationMinutes),
        token: examFormData.token.toUpperCase(),
        instructions: examFormData.instructions,
        randomizeQuestions: examFormData.randomizeQuestions,
        randomizeOptions: examFormData.randomizeOptions,
        showResultDirectly: examFormData.showResultDirectly,
        antiCheatEnabled: examFormData.antiCheatEnabled,
      });
    } else {
      const newEx = addExam({
        title: examFormData.title,
        subject: examFormData.subject,
        teacherId: currentUser?.id || 'guru-1',
        teacherName: currentUser?.nama || 'Budi Santoso, S.Pd.',
        targetClass: examFormData.targetClass,
        durationMinutes: Number(examFormData.durationMinutes),
        token: examFormData.token.toUpperCase(),
        instructions: examFormData.instructions,
        status: 'published',
        randomizeQuestions: examFormData.randomizeQuestions,
        randomizeOptions: examFormData.randomizeOptions,
        showResultDirectly: examFormData.showResultDirectly,
        antiCheatEnabled: examFormData.antiCheatEnabled,
        questionCount: 0,
      });
      setSelectedExamId(newEx.id);
    }
    setShowExamModal(false);
  };

  // =========================================================================
  // HANDLERS BUTIR SOAL & UNGGAH GAMBAR
  // =========================================================================
  const handleOpenAddQuestion = () => {
    if (!currentSelectedExam) return;
    setEditingQuestion(null);
    setQuestionFormData({
      type: 'multiple_choice',
      questionText: '',
      imageUrl: '',
      points: 20,
      explanation: '',
      correctAnswer: 'A',
      options: [
        { key: 'A', text: '' },
        { key: 'B', text: '' },
        { key: 'C', text: '' },
        { key: 'D', text: '' },
      ],
    });
    setShowQuestionModal(true);
  };

  const handleOpenEditQuestion = (q: Question) => {
    setEditingQuestion(q);
    setQuestionFormData({
      type: q.type,
      questionText: q.questionText,
      imageUrl: q.imageUrl || '',
      points: q.points || 20,
      explanation: q.explanation || '',
      correctAnswer: q.correctAnswer || 'A',
      options: q.options || [
        { key: 'A', text: '' },
        { key: 'B', text: '' },
        { key: 'C', text: '' },
        { key: 'D', text: '' },
      ],
    });
    setShowQuestionModal(true);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Format file harus berupa gambar (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setUploadError('Ukuran gambar maksimal 3MB.');
      return;
    }

    setIsUploadingImage(true);
    setUploadError(null);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      const uploadRes = await uploadQuestionImage(base64Data, `soal_${Date.now()}_${file.name}`);

      setIsUploadingImage(false);
      if (uploadRes.success && (uploadRes.directUrl || uploadRes.fileUrl)) {
        setQuestionFormData((prev) => ({
          ...prev,
          imageUrl: uploadRes.directUrl || uploadRes.fileUrl || base64Data,
        }));
      } else {
        // Jika offline, gunakan format base64 lokal
        setQuestionFormData((prev) => ({
          ...prev,
          imageUrl: base64Data,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSelectedExam || !questionFormData.questionText.trim()) return;

    const formattedOptions =
      questionFormData.type === 'multiple_choice'
        ? questionFormData.options.filter((o) => o.text.trim() !== '')
        : questionFormData.type === 'true_false'
        ? [
            { key: 'A', text: 'Benar' },
            { key: 'B', text: 'Salah' },
          ]
        : undefined;

    if (editingQuestion) {
      updateQuestion({
        ...editingQuestion,
        type: questionFormData.type,
        questionText: questionFormData.questionText,
        imageUrl: questionFormData.imageUrl || undefined,
        points: Number(questionFormData.points),
        explanation: questionFormData.explanation,
        correctAnswer: questionFormData.correctAnswer,
        options: formattedOptions,
      });
    } else {
      addQuestion({
        examId: currentSelectedExam.id,
        type: questionFormData.type,
        questionText: questionFormData.questionText,
        imageUrl: questionFormData.imageUrl || undefined,
        points: Number(questionFormData.points),
        explanation: questionFormData.explanation,
        correctAnswer: questionFormData.correctAnswer,
        options: formattedOptions,
      });
    }
    setShowQuestionModal(false);
  };

  // =========================================================================
  // HANDLERS KOREKSI LEMBAR JAWABAN SISWA
  // =========================================================================
  const handleOpenGradingModal = (sub: ExamSubmission) => {
    setSelectedSubmissionForGrading(sub);
    const initialInputs: Record<string, { score: number; feedback: string }> = {};

    Object.entries(sub.answers).forEach(([qId, ans]) => {
      initialInputs[qId] = {
        score: ans.scoreAwarded !== undefined ? ans.scoreAwarded : 0,
        feedback: ans.teacherFeedback || '',
      };
    });
    setGradeInputs(initialInputs);
  };

  const handleSaveGrading = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmissionForGrading) return;

    const formattedPayload: Record<string, { scoreAwarded: number; teacherFeedback?: string }> = {};
    Object.entries(gradeInputs).forEach(([qId, val]: [string, { score: number; feedback: string }]) => {
      formattedPayload[qId] = {
        scoreAwarded: Number(val?.score || 0),
        teacherFeedback: val?.feedback,
      };
    });

    gradeSubmission(selectedSubmissionForGrading.id, formattedPayload);
    setSelectedSubmissionForGrading(null);
  };

  // =========================================================================
  // DATA REKAPITULASI NILAI PER KELAS
  // =========================================================================
  const filteredSubmissions = submissions.filter((sub) => {
    const matchClass = selectedClassFilter === 'all' || sub.studentClass === selectedClassFilter;
    const matchExam = selectedExamFilter === 'all' || sub.examId === selectedExamFilter;
    const matchSearch =
      searchQuery.trim() === '' ||
      sub.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.studentNis.includes(searchQuery);
    return matchClass && matchExam && matchSearch;
  });

  // Perhitungan Statistik Rekap
  const scoresList = filteredSubmissions.map((s) => s.percentageScore);
  const avgScore = scoresList.length > 0 ? Math.round(scoresList.reduce((a, b) => a + b, 0) / scoresList.length) : 0;
  const maxScore = scoresList.length > 0 ? Math.max(...scoresList) : 0;
  const minScore = scoresList.length > 0 ? Math.min(...scoresList) : 0;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 space-y-6">
      
      {/* 1. BANNER UTAMA GURU (RESPONSIF MOBILE) */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-5 sm:p-7 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-800/60 border border-blue-500/40 text-blue-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Portal Guru Mata Pelajaran</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black tracking-tight leading-tight">
              Selamat Datang, {currentUser?.nama}
            </h2>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-blue-200">
              <span className="bg-blue-900/80 px-2.5 py-1 rounded-lg border border-blue-700">
                Mata Pelajaran: <strong className="text-white">{currentUser?.subjectSpecialty || 'Matematika'}</strong>
              </span>
              <span className="bg-blue-900/80 px-2.5 py-1 rounded-lg border border-blue-700">
                No. HP: <strong className="text-white font-mono">{currentUser?.phone || '081311223344'}</strong>
              </span>
              <span className="text-blue-300 font-medium">SMP Darul Fawaid Ilmiyah</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center min-w-[120px]">
              <span className="text-[10px] text-blue-200 uppercase font-bold tracking-wider block mb-0.5">Ujian Dibuat</span>
              <div className="text-2xl sm:text-3xl font-black text-amber-300">{exams.length}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center min-w-[120px]">
              <span className="text-[10px] text-blue-200 uppercase font-bold tracking-wider block mb-0.5">Perlu Koreksi</span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-300">{pendingGradingSubmissions.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TAB NAVIGASI GURU */}
      <div className="flex border-b border-slate-200 gap-2 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('exams')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'exams'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Ujian & Bank Soal</span>
        </button>

        <button
          onClick={() => setActiveTab('grading')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'grading'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Koreksi Esai & Isian</span>
          {pendingGradingSubmissions.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black">
              {pendingGradingSubmissions.length}
            </span>
          )}
        </button>

        {/* Tab Rekap Nilai Siswa Per Kelas (Permintaan User) */}
        <button
          onClick={() => setActiveTab('recap')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'recap'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Rekap Nilai Siswa Per Kelas</span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: UJIAN & BANK SOAL */}
      {/* ===================================================================== */}
      {activeTab === 'exams' && (
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">Daftar Paket Ujian & Bank Soal</h3>
              <p className="text-xs text-slate-500">Kelola mata pelajaran, durasi waktu, token, dan butir soal CBT</p>
            </div>
            <button
              onClick={handleOpenAddExam}
              className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-900/10 active:scale-[0.98] shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Paket Ujian Baru</span>
            </button>
          </div>

          {/* Grid Daftar Ujian */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exams.map((exam) => {
              const qCount = getQuestionsByExamId(exam.id).length;
              const isSelected = exam.id === currentSelectedExam?.id;

              return (
                <div
                  key={exam.id}
                  onClick={() => setSelectedExamId(exam.id)}
                  className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                    isSelected
                      ? 'bg-white border-blue-600 shadow-md ring-1 ring-blue-600'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-blue-100 text-blue-900">
                        {exam.subject}
                      </span>
                      <span className="px-2 py-0.5 rounded-md font-mono text-xs font-bold bg-slate-900 text-amber-300">
                        Token: {exam.token}
                      </span>
                    </div>

                    <h4 className="font-bold text-base text-slate-900 leading-snug">{exam.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Kelas: <strong className="text-slate-700">{exam.targetClass || 'Semua Kelas'}</strong> • Durasi: {exam.durationMinutes} Menit
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-xl">
                      {qCount} Butir Soal
                    </span>
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpenEditExam(exam)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition-colors"
                        title="Edit Info Ujian"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Apakah Anda yakin ingin menghapus ujian "${exam.title}"?`)) {
                            deleteExam(exam.id);
                          }
                        }}
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs transition-colors"
                        title="Hapus Ujian"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Section Butir Soal untuk Ujian Terpilih */}
          {currentSelectedExam && (
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-100 text-blue-900">
                      {currentSelectedExam.subject}
                    </span>
                    <h3 className="font-bold text-base text-slate-900">
                      Bank Butir Soal: {currentSelectedExam.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Total {currentExamQuestions.length} butir soal telah tersusun untuk ujian ini
                  </p>
                </div>

                <button
                  onClick={handleOpenAddQuestion}
                  className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Butir Soal</span>
                </button>
              </div>

              {/* List Pertanyaan Soal */}
              {currentExamQuestions.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <HelpCircle className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-xs font-semibold text-slate-600">Belum ada butir soal pada ujian ini.</p>
                  <p className="text-[11px] text-slate-400">Klik tombol "Tambah Butir Soal" di atas untuk mulai membuat soal.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentExamQuestions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-white text-slate-700 border border-slate-200">
                            {q.type === 'multiple_choice'
                              ? 'Pilihan Ganda'
                              : q.type === 'true_false'
                              ? 'Benar / Salah'
                              : q.type === 'short_answer'
                              ? 'Isian Singkat'
                              : 'Uraian / Essay'}
                          </span>
                          <span className="text-xs font-semibold text-blue-700">
                            Bobot: {q.points || 10} Poin
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditQuestion(q)}
                            className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs transition-colors"
                            title="Edit Soal"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Hapus butir soal ini?')) {
                                deleteQuestion(q.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 text-xs transition-colors"
                            title="Hapus Soal"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Gambar Soal jika ada */}
                      {q.imageUrl && (
                        <div className="max-w-xs rounded-xl overflow-hidden border border-slate-200 bg-white p-1">
                          <img
                            src={q.imageUrl}
                            alt="Lampiran Soal"
                            className="w-full max-h-36 object-contain rounded-lg"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}

                      {/* Teks Soal */}
                      <div className="text-xs sm:text-sm text-slate-800 font-medium whitespace-pre-wrap leading-relaxed">
                        {q.questionText}
                      </div>

                      {/* Opsi / Kunci Jawaban */}
                      {q.options && q.options.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {q.options.map((opt) => (
                            <div
                              key={opt.key}
                              className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                                q.correctAnswer === opt.key
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                                  : 'bg-white border-slate-200 text-slate-600'
                              }`}
                            >
                              <span
                                className={`w-5 h-5 rounded-lg text-[11px] font-bold flex items-center justify-center ${
                                  q.correctAnswer === opt.key
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {opt.key}
                              </span>
                              <span>{opt.text}</span>
                              {q.correctAnswer === opt.key && (
                                <span className="ml-auto text-[10px] text-emerald-700 uppercase font-bold">
                                  Kunci Jawaban
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: KOREKSI MANUAL LEMBAR JAWABAN SISWA (ESAI & ISIAN) */}
      {/* ===================================================================== */}
      {activeTab === 'grading' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900">Koreksi Lembar Jawaban Siswa</h3>
              <p className="text-xs text-slate-500">
                Pilihan ganda dinilai otomatis oleh sistem. Berikan nilai dan masukan untuk soal isian / uraian.
              </p>
            </div>
            <span className="text-xs font-bold text-blue-800 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 self-start sm:self-auto">
              Total {submissions.length} Pengumpulan Siswa
            </span>
          </div>

          {submissions.length === 0 ? (
            <div className="p-10 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">Belum ada siswa yang mengumpulkan ujian.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3">Nama Siswa</th>
                    <th className="py-3 px-3">NIS & Kelas</th>
                    <th className="py-3 px-3">Mata Pelajaran</th>
                    <th className="py-3 px-3">Waktu Selesai</th>
                    <th className="py-3 px-3">Skor Sementara</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-bold text-slate-900">{sub.studentName}</td>
                      <td className="py-3 px-3 text-slate-600 font-mono">
                        {sub.studentNis} • <span className="font-sans font-semibold">{sub.studentClass}</span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-blue-900">{sub.subject}</td>
                      <td className="py-3 px-3 text-slate-500 font-mono">
                        {sub.submitTime ? new Date(sub.submitTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 text-sm">{sub.percentageScore}</span>
                        <span className="text-slate-400 text-[10px]"> / 100</span>
                      </td>
                      <td className="py-3 px-3">
                        {sub.status === 'graded' ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 w-max">
                            <Check className="w-3 h-3" /> Selesai Dinilai
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 w-max block">
                            Perlu Koreksi Guru
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleOpenGradingModal(sub)}
                          className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
                        >
                          Koreksi Lembar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: REKAP NILAI SISWA PER KELAS (PERMINTAAN SPESIFIK USER) */}
      {/* ===================================================================== */}
      {activeTab === 'recap' && (
        <div className="space-y-5">
          
          {/* Filter Bar & Tools */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <span>Rekapitulasi Nilai Siswa Per Kelas</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pantau capaian nilai seluruh siswa berdasarkan kelas dan mata pelajaran
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportToCsv('recap')}
                  className="py-2.5 px-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                  title="Unduh Rekap Format CSV / Excel"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Unduh CSV / Excel</span>
                </button>
              </div>
            </div>

            {/* Kontrol Filter */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
              
              {/* Filter Kelas */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Pilih Kelas:
                </label>
                <select
                  value={selectedClassFilter}
                  onChange={(e) => setSelectedClassFilter(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600 bg-white"
                >
                  <option value="all">Semua Kelas (7, 8, 9)</option>
                  <option value="Kelas 7A">Kelas 7A</option>
                  <option value="Kelas 7B">Kelas 7B</option>
                  <option value="Kelas 8A">Kelas 8A</option>
                  <option value="Kelas 8B">Kelas 8B</option>
                  <option value="Kelas 9A">Kelas 9A</option>
                  <option value="Kelas 9B">Kelas 9B</option>
                </select>
              </div>

              {/* Filter Mata Pelajaran / Paket Ujian */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Pilih Paket Ujian:
                </label>
                <select
                  value={selectedExamFilter}
                  onChange={(e) => setSelectedExamFilter(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600 bg-white"
                >
                  <option value="all">Semua Ujian Mata Pelajaran</option>
                  {exams.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.subject} - {ex.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pencarian Nama Siswa */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Cari Nama Siswa / NIS:
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ketik nama siswa..."
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Ringkasan Statistik Kelas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Jumlah Siswa
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">{filteredSubmissions.length}</div>
              <p className="text-[10px] text-slate-400">Lembar Terkumpul</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
                Rata-rata Kelas
              </span>
              <div className="text-2xl font-black text-blue-900 mt-1">{avgScore}</div>
              <p className="text-[10px] text-blue-500">Skala 0 - 100</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                Nilai Tertinggi
              </span>
              <div className="text-2xl font-black text-emerald-900 mt-1">{maxScore}</div>
              <p className="text-[10px] text-emerald-500">Peringkat 1</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
                Nilai Terendah
              </span>
              <div className="text-2xl font-black text-amber-900 mt-1">{minScore}</div>
              <p className="text-[10px] text-amber-500">Evaluasi Guru</p>
            </div>
          </div>

          {/* Tabel Rekap Nilai Siswa */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900">
                Tabel Nilai Siswa ({filteredSubmissions.length} Data)
              </h4>
              <span className="text-xs text-slate-500">
                Urut berdasarkan nilai tertinggi
              </span>
            </div>

            {filteredSubmissions.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <p className="text-xs">Tidak ditemukan data nilai siswa untuk filter yang dipilih.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3 text-center w-12">No.</th>
                      <th className="py-3 px-3">Nama Lengkap Siswa</th>
                      <th className="py-3 px-3">NIS</th>
                      <th className="py-3 px-3">Kelas</th>
                      <th className="py-3 px-3">Mata Pelajaran</th>
                      <th className="py-3 px-3 text-center">Skor PG</th>
                      <th className="py-3 px-3 text-center">Skor Uraian</th>
                      <th className="py-3 px-3 text-center">Nilai Akhir</th>
                      <th className="py-3 px-3 text-center">Catatan Tab</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[...filteredSubmissions]
                      .sort((a, b) => b.percentageScore - a.percentageScore)
                      .map((sub, index) => {
                        // Pisahkan nilai PG dan Uraian
                        let pgScore = 0;
                        let essayScore = 0;
                        Object.values(sub.answers).forEach((rawAns) => {
                          const ans = rawAns as StudentAnswer;
                          if (ans.isCorrect !== undefined) {
                            pgScore += ans.scoreAwarded || 0;
                          } else {
                            essayScore += ans.scoreAwarded || 0;
                          }
                        });

                        return (
                          <tr key={sub.id} className="hover:bg-slate-50">
                            <td className="py-3 px-3 text-center font-bold text-slate-500">{index + 1}</td>
                            <td className="py-3 px-3 font-bold text-slate-900">{sub.studentName}</td>
                            <td className="py-3 px-3 font-mono text-slate-600">{sub.studentNis}</td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded-md font-semibold bg-slate-100 text-slate-700">
                                {sub.studentClass}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-blue-900 font-semibold">{sub.subject}</td>
                            <td className="py-3 px-3 text-center font-medium text-slate-700">{pgScore}</td>
                            <td className="py-3 px-3 text-center font-medium text-slate-700">{essayScore}</td>
                            <td className="py-3 px-3 text-center">
                              <span className="px-2.5 py-1 rounded-xl font-black text-sm bg-blue-50 text-blue-950 border border-blue-200">
                                {sub.percentageScore}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              {sub.cheatWarningsCount > 0 ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                                  {sub.cheatWarningsCount}x Pindah
                                </span>
                              ) : (
                                <span className="text-[10px] text-emerald-600 font-semibold">Tertib</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 1: BUAT / EDIT PAKET UJIAN */}
      {/* ===================================================================== */}
      {showExamModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                {editingExam ? 'Edit Informasi Ujian' : 'Buat Paket Ujian Baru'}
              </h3>
              <button onClick={() => setShowExamModal(false)} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExam} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Ujian CBT:</label>
                <input
                  type="text"
                  required
                  value={examFormData.title}
                  onChange={(e) => setExamFormData({ ...examFormData, title: e.target.value })}
                  placeholder="Contoh: Asesmen Sumatif Tengah Semester Matematika"
                  className="w-full p-3 rounded-2xl border border-slate-300 text-slate-900 font-medium focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mata Pelajaran:</label>
                  <select
                    value={examFormData.subject}
                    onChange={(e) => setExamFormData({ ...examFormData, subject: e.target.value })}
                    className="w-full p-3 rounded-2xl border border-slate-300 text-slate-900 font-medium focus:outline-none focus:border-blue-600 bg-white"
                  >
                    <option value="Matematika">Matematika</option>
                    <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                    <option value="Bahasa Inggris">Bahasa Inggris</option>
                    <option value="Ilmu Pengetahuan Alam (IPA)">Ilmu Pengetahuan Alam (IPA)</option>
                    <option value="Ilmu Pengetahuan Sosial (IPS)">Ilmu Pengetahuan Sosial (IPS)</option>
                    <option value="Pendidikan Pancasila & Kewarganegaraan">PPKn</option>
                    <option value="Pendidikan Agama Islam">Pendidikan Agama Islam</option>
                    <option value="Informatika">Informatika</option>
                    <option value="Seni Budaya & Prakarya">Seni Budaya & Prakarya</option>
                    <option value="PJOK">PJOK</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sasaran Kelas SMP:</label>
                  <select
                    value={examFormData.targetClass}
                    onChange={(e) => setExamFormData({ ...examFormData, targetClass: e.target.value })}
                    className="w-full p-3 rounded-2xl border border-slate-300 text-slate-900 font-medium focus:outline-none focus:border-blue-600 bg-white"
                  >
                    <option value="Kelas 7A">Kelas 7A</option>
                    <option value="Kelas 7B">Kelas 7B</option>
                    <option value="Kelas 8A">Kelas 8A</option>
                    <option value="Kelas 8B">Kelas 8B</option>
                    <option value="Kelas 9A">Kelas 9A</option>
                    <option value="Kelas 9B">Kelas 9B</option>
                    <option value="Semua Kelas">Semua Kelas</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Durasi Pengerjaan (Menit):</label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    required
                    value={examFormData.durationMinutes}
                    onChange={(e) => setExamFormData({ ...examFormData, durationMinutes: Number(e.target.value) })}
                    className="w-full p-3 rounded-2xl border border-slate-300 text-slate-900 font-medium focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Token Ujian Masuk Siswa:</label>
                  <input
                    type="text"
                    required
                    value={examFormData.token}
                    onChange={(e) => setExamFormData({ ...examFormData, token: e.target.value.toUpperCase() })}
                    placeholder="Contoh: SMP7A2026"
                    className="w-full p-3 rounded-2xl border border-slate-300 font-mono font-bold text-slate-900 uppercase focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Petunjuk & Tata Tertib Siswa:</label>
                <textarea
                  rows={3}
                  value={examFormData.instructions}
                  onChange={(e) => setExamFormData({ ...examFormData, instructions: e.target.value })}
                  className="w-full p-3 rounded-2xl border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* Opsi Keamanan Anti-Curang */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={examFormData.antiCheatEnabled}
                    onChange={(e) => setExamFormData({ ...examFormData, antiCheatEnabled: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span className="font-semibold text-slate-800">
                    Aktifkan Fitur Anti-Kecurangan (Deteksi Pindah Tab & Jendela Blur)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={examFormData.randomizeQuestions}
                    onChange={(e) => setExamFormData({ ...examFormData, randomizeQuestions: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span className="font-semibold text-slate-800">
                    Acak Urutan Nomor Soal untuk Tiap Siswa
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowExamModal(false)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs transition-colors shadow-md"
                >
                  Simpan Paket Ujian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: BUAT / EDIT BUTIR SOAL + UNGGAH GAMBAR DRIVE */}
      {/* ===================================================================== */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                {editingQuestion ? 'Edit Butir Soal' : 'Tambah Butir Soal Baru'}
              </h3>
              <button onClick={() => setShowQuestionModal(false)} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipe Soal:</label>
                  <select
                    value={questionFormData.type}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, type: e.target.value as QuestionType })}
                    className="w-full p-2.5 rounded-2xl border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:border-blue-600 bg-white"
                  >
                    <option value="multiple_choice">Pilihan Ganda (A, B, C, D)</option>
                    <option value="true_false">Benar / Salah</option>
                    <option value="short_answer">Isian Singkat</option>
                    <option value="essay">Uraian / Essay</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bobot Nilai (Poin):</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={questionFormData.points}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, points: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-2xl border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Teks Pertanyaan */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Teks Butir Soal:</label>
                <textarea
                  rows={4}
                  required
                  value={questionFormData.questionText}
                  onChange={(e) => setQuestionFormData({ ...questionFormData, questionText: e.target.value })}
                  placeholder="Ketikkan teks pertanyaan soal di sini..."
                  className="w-full p-3 rounded-2xl border border-slate-300 text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* Unggah Foto Soal ke Google Drive Folder (Fitur Permintaan User) */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    <span>Lampirkan Foto Soal (Opsional):</span>
                  </label>
                  <a
                    href={DRIVE_FOLDER_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-blue-700 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Folder Drive</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {uploadError && (
                  <p className="text-rose-600 text-[11px] font-semibold">{uploadError}</p>
                )}

                {/* Input URL atau Unggah dari Perangkat */}
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="url"
                    value={questionFormData.imageUrl}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, imageUrl: e.target.value })}
                    placeholder="Tempel link URL gambar atau unggah file..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:border-blue-600"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={isUploadingImage}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shrink-0 transition-colors shadow-xs"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>{isUploadingImage ? 'Mengunggah...' : 'Pilih Foto'}</span>
                  </button>
                </div>

                {/* Pratinjau Gambar Soal */}
                {questionFormData.imageUrl && (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-white p-2 max-w-sm mx-auto">
                    <img
                      src={questionFormData.imageUrl}
                      alt="Pratinjau Foto Soal"
                      className="w-full max-h-40 object-contain rounded"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      type="button"
                      onClick={() => setQuestionFormData({ ...questionFormData, imageUrl: '' })}
                      className="absolute top-2 right-2 p-1 bg-rose-600 text-white rounded-full text-xs shadow-md hover:bg-rose-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Opsi Pilihan Ganda (A, B, C, D) */}
              {questionFormData.type === 'multiple_choice' && (
                <div className="space-y-2.5 pt-2 border-t border-slate-100">
                  <label className="block font-bold text-slate-800">
                    Opsi Pilihan Jawaban & Kunci:
                  </label>
                  {questionFormData.options.map((opt, idx) => (
                    <div key={opt.key} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQuestionFormData({ ...questionFormData, correctAnswer: opt.key })}
                        className={`w-9 h-9 rounded-xl font-bold flex items-center justify-center text-xs shrink-0 transition-all ${
                          questionFormData.correctAnswer === opt.key
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200'
                        }`}
                        title="Klik untuk jadikan kunci jawaban"
                      >
                        {opt.key}
                      </button>
                      <input
                        type="text"
                        required
                        value={opt.text}
                        onChange={(e) => {
                          const newOpts = [...questionFormData.options];
                          newOpts[idx].text = e.target.value;
                          setQuestionFormData({ ...questionFormData, options: newOpts });
                        }}
                        placeholder={`Teks pilihan opsi ${opt.key}...`}
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Kunci Jawaban Isian Singkat */}
              {questionFormData.type === 'short_answer' && (
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Kunci Jawaban Singkat:
                  </label>
                  <input
                    type="text"
                    required
                    value={questionFormData.correctAnswer}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, correctAnswer: e.target.value })}
                    placeholder="Contoh: 144 atau Fotosintesis"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-blue-600"
                  />
                </div>
              )}

              {/* Penjelasan / Pembahasan */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Pembahasan / Panduan Penilaian Guru (Opsional):
                </label>
                <textarea
                  rows={2}
                  value={questionFormData.explanation}
                  onChange={(e) => setQuestionFormData({ ...questionFormData, explanation: e.target.value })}
                  placeholder="Ketik catatan rubrik penilaian atau kunci konsep..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs transition-colors shadow-md"
                >
                  Simpan Butir Soal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: KOREKSI LEMBAR JAWABAN SISWA */}
      {/* ===================================================================== */}
      {selectedSubmissionForGrading && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Koreksi Lembar: {selectedSubmissionForGrading.studentName}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedSubmissionForGrading.studentNis} • {selectedSubmissionForGrading.studentClass} • {selectedSubmissionForGrading.subject}
                </p>
              </div>
              <button onClick={() => setSelectedSubmissionForGrading(null)} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGrading} className="space-y-4 text-xs">
              <div className="space-y-4">
                {Object.entries(selectedSubmissionForGrading.answers).map(([qId, rawAns], idx) => {
                  const ans = rawAns as StudentAnswer;
                  const currentInput = gradeInputs[qId] || { score: 0, feedback: '' };

                  return (
                    <div key={qId} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-slate-800 text-xs">
                          Butir Pertanyaan #{idx + 1}
                        </span>
                        {ans.isCorrect !== undefined ? (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ans.isCorrect
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            PG: {ans.isCorrect ? 'Benar (Otomatis)' : 'Salah (Otomatis)'}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900">
                            Penilaian Manual Guru
                          </span>
                        )}
                      </div>

                      {/* Jawaban Siswa */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Jawaban Siswa:
                        </span>
                        <div className="text-slate-900 font-medium whitespace-pre-wrap">
                          {String(ans.answer || '-')}
                        </div>
                      </div>

                      {/* Input Nilai & Masukan Guru */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Skor Nilai:
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={currentInput.score}
                            onChange={(e) =>
                              setGradeInputs({
                                ...gradeInputs,
                                [qId]: { ...currentInput, score: Number(e.target.value) },
                              })
                            }
                            className="w-full p-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Catatan / Masukan Guru:
                          </label>
                          <input
                            type="text"
                            value={currentInput.feedback}
                            onChange={(e) =>
                              setGradeInputs({
                                ...gradeInputs,
                                [qId]: { ...currentInput, feedback: e.target.value },
                              })
                            }
                            placeholder="Catatan untuk siswa..."
                            className="w-full p-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedSubmissionForGrading(null)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs transition-colors shadow-md"
                >
                  Simpan Hasil Penilaian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
