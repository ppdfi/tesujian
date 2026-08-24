import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Exam,
  Question,
  ExamSubmission,
  User,
  InstitutionProfile,
  AppScriptConfig,
  StudentAnswer,
} from '../types';
import { StorageService } from '../services/storageService';
import { AppScriptService } from '../services/appScriptService';
import { useAuth } from './AuthContext';

interface ActiveCbtSession {
  exam: Exam;
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<string, StudentAnswer>;
  startTime: number;
  endTime: number;
  timeRemainingSeconds: number;
  cheatWarnings: number;
  isCompleted: boolean;
}

interface ExamContextType {
  exams: Exam[];
  questions: Question[];
  submissions: ExamSubmission[];
  users: User[];
  institution: InstitutionProfile;
  appScriptConfig: AppScriptConfig;
  isSyncing: boolean;
  syncStatus: { status: 'idle' | 'syncing' | 'success' | 'error'; message: string };

  // CRUD Exams
  addExam: (exam: Omit<Exam, 'id'>) => Exam;
  updateExam: (exam: Exam) => void;
  deleteExam: (examId: string) => void;

  // CRUD Questions
  addQuestion: (question: Omit<Question, 'id'>) => Question;
  updateQuestion: (question: Question) => void;
  deleteQuestion: (questionId: string) => void;
  bulkAddQuestions: (examId: string, questions: Omit<Question, 'id'>[]) => void;
  getQuestionsByExamId: (examId: string) => Question[];

  // CRUD Users
  addUser: (user: Omit<User, 'id'>) => User;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;

  // Institution profile
  updateInstitution: (profile: Partial<InstitutionProfile>) => void;

  // Apps Script & Google Sheets
  updateAppScriptConfig: (config: Partial<AppScriptConfig>) => void;
  testAppScriptConnection: () => Promise<{ success: boolean; message: string }>;
  syncAllWithSheet: () => Promise<void>;
  initDatabaseOnSheet: () => Promise<{ success: boolean; message: string }>;
  uploadQuestionImage: (base64Data: string, fileName?: string) => Promise<{ success: boolean; fileUrl?: string; directUrl?: string; message: string }>;
  exportToCsv: (type: 'users' | 'exams' | 'submissions' | 'recap') => void;

  // CBT Active Exam Session
  activeSession: ActiveCbtSession | null;
  startExamSession: (examId: string, token: string) => { success: boolean; message: string };
  recordAnswer: (questionId: string, answer: any, isDoubtful?: boolean) => void;
  incrementCheatWarning: () => number;
  finishExamSession: () => ExamSubmission | null;
  cancelActiveSession: () => void;
  goToQuestion: (index: number) => void;

  // Grading
  gradeSubmission: (
    submissionId: string,
    answersGrade: Record<string, { scoreAwarded: number; teacherFeedback?: string }>,
    notes?: string
  ) => void;
  deleteSubmission: (submissionId: string) => void;

  // Helpers
  getStudentSubmissions: (studentId: string) => ExamSubmission[];
  getExamSubmissions: (examId: string) => ExamSubmission[];
  getTeacherExams: (teacherId: string) => Exam[];
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

export const ExamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, refreshUsers } = useAuth();

  const [exams, setExams] = useState<Exam[]>(() => StorageService.getExams());
  const [questions, setQuestions] = useState<Question[]>(() => StorageService.getQuestions());
  const [submissions, setSubmissions] = useState<ExamSubmission[]>(() => StorageService.getSubmissions());
  const [users, setUsers] = useState<User[]>(() => StorageService.getUsers());
  const [institution, setInstitution] = useState<InstitutionProfile>(() => StorageService.getInstitution());
  const [appScriptConfig, setAppScriptConfig] = useState<AppScriptConfig>(() => StorageService.getAppScriptConfig());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<{ status: 'idle' | 'syncing' | 'success' | 'error'; message: string }>({
    status: 'idle',
    message: '',
  });

  const [activeSession, setActiveSession] = useState<ActiveCbtSession | null>(null);

  const appScriptService = useMemo(() => new AppScriptService(appScriptConfig), [appScriptConfig]);

  // Persist whenever state changes
  useEffect(() => {
    StorageService.saveExams(exams);
  }, [exams]);

  useEffect(() => {
    StorageService.saveQuestions(questions);
  }, [questions]);

  useEffect(() => {
    StorageService.saveSubmissions(submissions);
  }, [submissions]);

  useEffect(() => {
    StorageService.saveUsers(users);
    refreshUsers();
  }, [users, refreshUsers]);

  useEffect(() => {
    StorageService.saveInstitution(institution);
  }, [institution]);

  useEffect(() => {
    StorageService.saveAppScriptConfig(appScriptConfig);
  }, [appScriptConfig]);

  // CBT Timer countdown
  useEffect(() => {
    if (!activeSession || activeSession.isCompleted) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((activeSession.endTime - now) / 1000));

      setActiveSession((prev) => {
        if (!prev) return null;
        if (remaining <= 0 && !prev.isCompleted) {
          // Auto submit on time out
          return { ...prev, timeRemainingSeconds: 0, isCompleted: true };
        }
        return { ...prev, timeRemainingSeconds: remaining };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeSession]);

  // Exam Operations
  const addExam = (examData: Omit<Exam, 'id'>): Exam => {
    const newExam: Exam = {
      ...examData,
      id: `exam-${Date.now()}`,
    };
    const updated = [newExam, ...exams];
    setExams(updated);
    return newExam;
  };

  const updateExam = (updatedExam: Exam) => {
    const updated = exams.map((ex) => (ex.id === updatedExam.id ? updatedExam : ex));
    setExams(updated);
  };

  const deleteExam = (examId: string) => {
    setExams(exams.filter((ex) => ex.id !== examId));
    setQuestions(questions.filter((q) => q.examId !== examId));
  };

  // Question Operations
  const addQuestion = (qData: Omit<Question, 'id'>): Question => {
    const newQ: Question = {
      ...qData,
      id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    const updated = [...questions, newQ];
    setQuestions(updated);

    // Update total questions in exam
    const examQuestions = updated.filter((q) => q.examId === qData.examId);
    const totalPoints = examQuestions.reduce((acc, q) => acc + (q.points || 0), 0);
    setExams((prev) =>
      prev.map((e) =>
        e.id === qData.examId ? { ...e, totalQuestions: examQuestions.length, maxScore: totalPoints } : e
      )
    );

    return newQ;
  };

  const updateQuestion = (updatedQ: Question) => {
    const updated = questions.map((q) => (q.id === updatedQ.id ? updatedQ : q));
    setQuestions(updated);
    const examQuestions = updated.filter((q) => q.examId === updatedQ.examId);
    const totalPoints = examQuestions.reduce((acc, q) => acc + (q.points || 0), 0);
    setExams((prev) =>
      prev.map((e) =>
        e.id === updatedQ.examId ? { ...e, totalQuestions: examQuestions.length, maxScore: totalPoints } : e
      )
    );
  };

  const deleteQuestion = (questionId: string) => {
    const qToDelete = questions.find((q) => q.id === questionId);
    const updated = questions.filter((q) => q.id !== questionId);
    setQuestions(updated);
    if (qToDelete) {
      const examQuestions = updated.filter((q) => q.examId === qToDelete.examId);
      const totalPoints = examQuestions.reduce((acc, q) => acc + (q.points || 0), 0);
      setExams((prev) =>
        prev.map((e) =>
          e.id === qToDelete.examId ? { ...e, totalQuestions: examQuestions.length, maxScore: totalPoints } : e
        )
      );
    }
  };

  const bulkAddQuestions = (examId: string, newQs: Omit<Question, 'id'>[]) => {
    const items: Question[] = newQs.map((q, idx) => ({
      ...q,
      examId,
      number: idx + 1,
      id: `q-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
    }));
    const updated = [...questions.filter((q) => q.examId !== examId), ...items];
    setQuestions(updated);
    const totalPoints = items.reduce((acc, q) => acc + (q.points || 0), 0);
    setExams((prev) =>
      prev.map((e) => (e.id === examId ? { ...e, totalQuestions: items.length, maxScore: totalPoints } : e))
    );
  };

  const getQuestionsByExamId = (examId: string): Question[] => {
    return questions.filter((q) => q.examId === examId).sort((a, b) => a.number - b.number);
  };

  // User Operations
  const addUser = (userData: Omit<User, 'id'>): User => {
    const newUser: User = {
      ...userData,
      id: `u-${Date.now()}`,
    };
    const updated = [newUser, ...users];
    setUsers(updated);
    return newUser;
  };

  const updateUser = (updatedUser: User) => {
    const updated = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
    setUsers(updated);
  };

  const deleteUser = (userId: string) => {
    const updated = users.filter((u) => u.id !== userId);
    setUsers(updated);
  };

  const updateInstitution = (profile: Partial<InstitutionProfile>) => {
    setInstitution((prev) => ({ ...prev, ...profile }));
  };

  // Apps Script Operations
  const updateAppScriptConfig = (config: Partial<AppScriptConfig>) => {
    setAppScriptConfig((prev) => {
      const updated = { ...prev, ...config };
      appScriptService.updateConfig(updated);
      return updated;
    });
  };

  const testAppScriptConnection = async () => {
    setIsSyncing(true);
    setSyncStatus({ status: 'syncing', message: 'Menguji sambungan Google Apps Script...' });
    try {
      const res = await appScriptService.testConnection();
      if (res.success) {
        updateAppScriptConfig({ isConnected: true, statusMessage: res.message });
        setSyncStatus({ status: 'success', message: res.message });
      } else {
        updateAppScriptConfig({ isConnected: false, statusMessage: res.message });
        setSyncStatus({ status: 'error', message: res.message });
      }
      return res;
    } finally {
      setIsSyncing(false);
    }
  };

  const syncAllWithSheet = async () => {
    setIsSyncing(true);
    setSyncStatus({ status: 'syncing', message: 'Menyinkronkan data dengan Google Spreadsheet...' });
    try {
      const res = await appScriptService.syncAllToSheet({
        users,
        exams,
        questions,
        submissions,
      });

      if (res.success) {
        const nowStr = new Date().toLocaleString('id-ID');
        updateAppScriptConfig({
          isConnected: true,
          lastSyncTime: nowStr,
          statusMessage: 'Sinkronisasi berhasil',
        });
        setSyncStatus({ status: 'success', message: 'Semua data tersinkronisasi ke Google Spreadsheet!' });
      } else {
        setSyncStatus({ status: 'error', message: res.message });
      }
    } catch (e: any) {
      setSyncStatus({ status: 'error', message: `Gagal sinkronisasi: ${e.message}` });
    } finally {
      setIsSyncing(false);
    }
  };

  const initDatabaseOnSheet = async (): Promise<{ success: boolean; message: string }> => {
    setIsSyncing(true);
    setSyncStatus({ status: 'syncing', message: 'Menginisialisasi struktur tabel Spreadsheet...' });
    try {
      const initRes = await appScriptService.sendToSheet('initDatabase', {});
      const syncRes = await appScriptService.syncAllToSheet({
        users,
        exams,
        questions,
        submissions,
      });

      const nowStr = new Date().toLocaleString('id-ID');
      updateAppScriptConfig({
        isConnected: true,
        lastSyncTime: nowStr,
        statusMessage: 'Database aktif & tersinkron',
      });
      setSyncStatus({ status: 'success', message: 'Struktur Spreadsheet & Data CBT SMP berhasil diinisialisasi!' });
      return {
        success: true,
        message: 'Tabel Users, Exams, Questions, Submissions berhasil dibuat dan disinkronkan ke Spreadsheet!',
      };
    } catch (e: any) {
      setSyncStatus({ status: 'error', message: `Gagal inisialisasi: ${e.message}` });
      return { success: false, message: e.message || 'Gagal inisialisasi database.' };
    } finally {
      setIsSyncing(false);
    }
  };

  const uploadQuestionImage = async (
    base64Data: string,
    fileName?: string
  ): Promise<{ success: boolean; fileUrl?: string; directUrl?: string; message: string }> => {
    return appScriptService.uploadImageToDrive(base64Data, fileName);
  };

  const exportToCsv = (type: 'users' | 'exams' | 'submissions' | 'recap') => {
    let filename = `CBT_SMP_Darul_Fawaid_${type}_${new Date().toISOString().slice(0, 10)}.csv`;
    let content = '';

    if (type === 'users') {
      content = 'ID,Username,Password,Nama Lengkap,Role,NIS/NIP,Kelas,Email,Telepon,Bidang Studi\n';
      users.forEach((u) => {
        content += `"${u.id}","${u.username}","${u.password || ''}","${u.nama}","${u.role}","${u.nisOrNip}","${u.kelas || ''}","${u.email || ''}","${u.phone || ''}","${u.subjectSpecialty || ''}"\n`;
      });
    } else if (type === 'exams') {
      content = 'ID,Judul Ujian,Mata Pelajaran,Kelas Target,Guru Penguji,Durasi (Menit),KKM,Token,Status,Jml Soal\n';
      exams.forEach((e) => {
        content += `"${e.id}","${e.title}","${e.subject}","${e.targetClass}","${e.teacherName}",${e.durationMinutes},${e.passingGrade},"${e.token}","${e.status}",${e.totalQuestions || 0}\n`;
      });
    } else if (type === 'submissions' || type === 'recap') {
      content = 'ID,Judul Ujian,Mata Pelajaran,Nama Siswa,NIS,Kelas,Waktu Submit,Status,Total Skor,Maks Skor,Persentase,Lulus/KKM,Peringatan Curang\n';
      submissions.forEach((s) => {
        content += `"${s.id}","${s.examTitle}","${s.subject}","${s.studentName}","${s.studentNis}","${s.studentClass}","${s.submitTime || s.startTime}","${s.status}",${s.totalScore},${s.maxScore},${s.percentageScore}%,"${s.passed ? 'LULUS' : 'REMIDI'}",${s.cheatWarningsCount}\n`;
      });
    }

    const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CBT Active Session Logic
  const startExamSession = (examId: string, inputToken: string): { success: boolean; message: string } => {
    if (!currentUser || currentUser.role !== 'siswa') {
      return { success: false, message: 'Hanya santri/siswa yang dapat memulai ujian CBT.' };
    }

    const exam = exams.find((e) => e.id === examId);
    if (!exam) {
      return { success: false, message: 'Ujian tidak ditemukan.' };
    }

    if (exam.token.trim().toUpperCase() !== inputToken.trim().toUpperCase()) {
      return { success: false, message: 'Token ujian yang Anda masukkan tidak valid. Hubungi pengawas.' };
    }

    // Check if student already submitted this exam
    const existing = submissions.find((s) => s.examId === examId && s.studentId === currentUser.id);
    if (existing && existing.status !== 'in_progress') {
      return { success: false, message: 'Anda sudah menyelesaikan ujian ini sebelumnya.' };
    }

    let examQs = getQuestionsByExamId(examId);
    if (examQs.length === 0) {
      return { success: false, message: 'Soal untuk ujian ini belum tersedia atau sedang disiapkan guru.' };
    }

    if (exam.randomizeQuestions) {
      // Shuffle question order copy
      examQs = [...examQs].sort(() => Math.random() - 0.5);
    }

    const durationSeconds = exam.durationMinutes * 60;
    const now = Date.now();

    const initialAnswers: Record<string, StudentAnswer> = {};
    examQs.forEach((q) => {
      initialAnswers[q.id] = {
        questionId: q.id,
        answer: '',
        isDoubtful: false,
      };
    });

    setActiveSession({
      exam,
      questions: examQs,
      currentQuestionIndex: 0,
      answers: initialAnswers,
      startTime: now,
      endTime: now + durationSeconds * 1000,
      timeRemainingSeconds: durationSeconds,
      cheatWarnings: 0,
      isCompleted: false,
    });

    return { success: true, message: 'Sesi ujian berhasil dimulai. Selamat mengerjakan!' };
  };

  const recordAnswer = (questionId: string, answer: any, isDoubtful?: boolean) => {
    if (!activeSession) return;
    setActiveSession((prev) => {
      if (!prev) return null;
      const currentAns = prev.answers[questionId] || { questionId, answer: '' };
      return {
        ...prev,
        answers: {
          ...prev.answers,
          [questionId]: {
            ...currentAns,
            answer: answer !== undefined ? answer : currentAns.answer,
            isDoubtful: isDoubtful !== undefined ? isDoubtful : currentAns.isDoubtful,
          },
        },
      };
    });
  };

  const incrementCheatWarning = (): number => {
    if (!activeSession) return 0;
    const nextCount = activeSession.cheatWarnings + 1;
    setActiveSession((prev) => (prev ? { ...prev, cheatWarnings: nextCount } : null));
    return nextCount;
  };

  const goToQuestion = (index: number) => {
    if (!activeSession) return;
    if (index >= 0 && index < activeSession.questions.length) {
      setActiveSession((prev) => (prev ? { ...prev, currentQuestionIndex: index } : null));
    }
  };

  const cancelActiveSession = () => {
    setActiveSession(null);
  };

  const finishExamSession = (): ExamSubmission | null => {
    if (!activeSession || !currentUser) return null;

    const { exam, questions: examQs, answers, startTime, cheatWarnings } = activeSession;

    let autoGradedScore = 0;
    let maxPossibleScore = 0;
    let hasEssay = false;

    const evaluatedAnswers: Record<string, StudentAnswer> = {};

    examQs.forEach((q) => {
      const studentAnsObj = answers[q.id];
      const studentAnsVal = studentAnsObj?.answer;
      const points = q.points || 10;
      maxPossibleScore += points;

      if (q.type === 'multiple_choice' || q.type === 'true_false') {
        const isCorrect = String(studentAnsVal || '').trim().toUpperCase() === String(q.correctAnswer || '').trim().toUpperCase();
        const scoreAwarded = isCorrect ? points : 0;
        autoGradedScore += scoreAwarded;
        evaluatedAnswers[q.id] = {
          questionId: q.id,
          answer: studentAnsVal,
          isCorrect,
          scoreAwarded,
          isDoubtful: false,
        };
      } else if (q.type === 'short_answer') {
        const isCorrect = String(studentAnsVal || '').trim().toLowerCase() === String(q.correctAnswer || '').trim().toLowerCase();
        const scoreAwarded = isCorrect ? points : 0;
        autoGradedScore += scoreAwarded;
        evaluatedAnswers[q.id] = {
          questionId: q.id,
          answer: studentAnsVal,
          isCorrect,
          scoreAwarded,
          isDoubtful: false,
        };
      } else if (q.type === 'essay') {
        hasEssay = true;
        evaluatedAnswers[q.id] = {
          questionId: q.id,
          answer: studentAnsVal,
          scoreAwarded: 0, // needs teacher review
          teacherFeedback: '',
          isDoubtful: false,
        };
      } else {
        evaluatedAnswers[q.id] = {
          questionId: q.id,
          answer: studentAnsVal,
          scoreAwarded: 0,
          isDoubtful: false,
        };
      }
    });

    const percentageScore = maxPossibleScore > 0 ? Math.round((autoGradedScore / maxPossibleScore) * 100) : 0;
    const passed = percentageScore >= exam.passingGrade;
    const hasManualGrading = examQs.some((q) => q.type === 'essay' || q.type === 'short_answer');
    const status = hasManualGrading ? 'submitted' : 'graded';

    const submission: ExamSubmission = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      examId: exam.id,
      examTitle: exam.title,
      subject: exam.subject,
      studentId: currentUser.id,
      studentName: currentUser.nama,
      studentNis: currentUser.nisOrNip,
      studentClass: currentUser.kelas || 'Kelas 7A',
      startTime: new Date(startTime).toISOString(),
      submitTime: new Date().toISOString(),
      status,
      answers: evaluatedAnswers,
      totalScore: autoGradedScore,
      maxScore: maxPossibleScore,
      percentageScore,
      cheatWarningsCount: cheatWarnings,
      submittedToSheet: false,
    };

    // Save locally
    const updatedSubs = [submission, ...submissions.filter((s) => !(s.examId === exam.id && s.studentId === currentUser.id))];
    setSubmissions(updatedSubs);
    setActiveSession(null);

    // Auto push to Google Apps Script if connected
    if (appScriptConfig.webAppUrl) {
      appScriptService.sendToSheet('submitExam', submission).then((res) => {
        if (res.success) {
          setSubmissions((prev) => prev.map((s) => (s.id === submission.id ? { ...s, submittedToSheet: true } : s)));
        }
      });
    }

    return submission;
  };

  // Manual Grading for Teachers
  const gradeSubmission = (
    submissionId: string,
    answersGrade: Record<string, { scoreAwarded: number; teacherFeedback?: string }>,
    _notes?: string
  ) => {
    setSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id !== submissionId) return sub;

        let newTotalScore = 0;
        const updatedAnswers = { ...sub.answers };

        // Calculate new score based on updated answers
        for (const [qId, rawAns] of Object.entries(updatedAnswers)) {
          const ans = rawAns as StudentAnswer;
          const grading = answersGrade[qId];
          if (grading !== undefined) {
            updatedAnswers[qId] = {
              ...ans,
              scoreAwarded: grading.scoreAwarded,
              teacherFeedback: grading.teacherFeedback || ans?.teacherFeedback,
              isCorrect: grading.scoreAwarded > 0,
            };
            newTotalScore += grading.scoreAwarded;
          } else {
            newTotalScore += ans?.scoreAwarded || 0;
          }
        }

        const percentageScore = sub.maxScore > 0 ? Math.round((newTotalScore / sub.maxScore) * 100) : 0;
        const exam = exams.find((e) => e.id === sub.examId);
        const kkm = exam ? exam.passingGrade : 75;
        const passed = percentageScore >= kkm;

        const updatedSub: ExamSubmission = {
          ...sub,
          answers: updatedAnswers,
          totalScore: newTotalScore,
          percentageScore,
          passed,
          status: 'graded',
        };

        // Sync to Apps Script
        if (appScriptConfig.webAppUrl) {
          appScriptService.sendToSheet('saveSubmissions', [updatedSub]);
        }

        return updatedSub;
      })
    );
  };

  const deleteSubmission = (submissionId: string) => {
    setSubmissions((prev) => prev.filter((s) => s.id !== submissionId));
  };

  const getStudentSubmissions = useCallback(
    (studentId: string): ExamSubmission[] => {
      return submissions.filter((s) => s.studentId === studentId);
    },
    [submissions]
  );

  const getExamSubmissions = useCallback(
    (examId: string): ExamSubmission[] => {
      return submissions.filter((s) => s.examId === examId);
    },
    [submissions]
  );

  const getTeacherExams = useCallback(
    (teacherId: string): Exam[] => {
      return exams.filter((e) => e.teacherId === teacherId);
    },
    [exams]
  );

  return (
    <ExamContext.Provider
      value={{
        exams,
        questions,
        submissions,
        users,
        institution,
        appScriptConfig,
        isSyncing,
        syncStatus,
        addExam,
        updateExam,
        deleteExam,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        bulkAddQuestions,
        getQuestionsByExamId,
        addUser,
        updateUser,
        deleteUser,
        updateInstitution,
        updateAppScriptConfig,
        testAppScriptConnection,
        syncAllWithSheet,
        initDatabaseOnSheet,
        uploadQuestionImage,
        exportToCsv,
        activeSession,
        startExamSession,
        recordAnswer,
        incrementCheatWarning,
        finishExamSession,
        cancelActiveSession,
        goToQuestion,
        gradeSubmission,
        deleteSubmission,
        getStudentSubmissions,
        getExamSubmissions,
        getTeacherExams,
      }}
    >
      {children}
    </ExamContext.Provider>
  );
};

export const useExam = () => {
  const context = useContext(ExamContext);
  if (!context) {
    throw new Error('useExam must be used within an ExamProvider');
  }
  return context;
};
