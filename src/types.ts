/**
 * ============================================================================
 * TIPE DATA UTAMA APLIKASI CBT SMP DARUL FAWAID ILMIYAH
 * ============================================================================
 * File ini mendefinisikan struktur data yang digunakan di seluruh aplikasi:
 * 1. User (Pengguna: Admin/Panitia, Guru, Siswa)
 * 2. Exam (Paket Ujian)
 * 3. Question (Butir Soal Pilihan Ganda, Benar/Salah, Isian, Essay)
 * 4. ExamSubmission (Hasil Jawaban & Nilai Siswa)
 * 5. InstitutionProfile (Profil Sekolah SMP)
 * 6. AppScriptConfig (Konfigurasi Google Spreadsheet & Drive)
 */

// Peran Pengguna dalam Aplikasi
export type UserRole = 'admin' | 'guru' | 'siswa';

// Data Pengguna (Admin, Guru, Siswa)
export interface User {
  id: string;
  username: string;
  password?: string;
  nama: string;
  role: UserRole;
  email?: string;
  nisOrNip: string; // NIS untuk Siswa, Nomor HP/WhatsApp untuk Guru & Admin
  phone?: string;   // Nomor HP / WhatsApp
  kelas?: string;   // Contoh: "Kelas 7A", "Kelas 7B", "Kelas 8A", "Kelas 9A"
  subjectSpecialty?: string; // Untuk Guru (contoh: "Matematika", "IPA", "Bahasa Indonesia", "Bahasa Inggris")
  avatar?: string;
}

// Jenis-jenis Soal CBT
export type QuestionType = 'multiple_choice' | 'essay' | 'short_answer' | 'true_false';

// Pilihan Jawaban Soal Pilihan Ganda
export interface QuestionOption {
  key: string; // 'A', 'B', 'C', 'D'
  text: string;
  imageUrl?: string;
}

// Struktur Butir Soal Ujian
export interface Question {
  id: string;
  examId: string;
  number: number;
  type: QuestionType;
  questionText: string;
  imageUrl?: string; // Link foto/gambar soal (misal dari Google Drive atau link web)
  options?: QuestionOption[];
  correctAnswer?: string; // Kunci jawaban (contoh: 'A', 'B', atau teks isian)
  points: number; // Bobot skor butir soal
  explanation?: string; // Pembahasan/Kunci untuk Guru
}

// Status Publikasi Ujian
export type ExamStatus = 'draft' | 'published' | 'ongoing' | 'completed' | 'archived';

// Struktur Paket Ujian
export interface Exam {
  id: string;
  title: string;
  subject: string; // Mata Pelajaran (Matematika, IPA, B. Indonesia, B. Inggris, IPS, PPKn, Informatika, dll)
  targetClass: string; // Target Kelas: "Semua Kelas", "Kelas 7", "Kelas 8", "Kelas 9", "Kelas 7A", dll
  teacherId: string;
  teacherName: string;
  durationMinutes: number; // Durasi waktu dalam menit
  token: string; // Token akses ujian (misal: SMP2026)
  status: ExamStatus;
  startDate: string;
  endDate: string;
  instructions: string;
  randomizeQuestions: boolean; // Acak urutan butir soal
  randomizeOptions: boolean; // Acak urutan opsi A-B-C-D
  antiCheatEnabled: boolean; // Deteksi otomatis pindah tab / window blur
  totalQuestions?: number;
  maxScore?: number;
}

// Jawaban Siswa per Butir Soal
export interface StudentAnswer {
  questionId: string;
  answer: string | string[];
  isDoubtful?: boolean; // Tanda Ragu-ragu
  isCorrect?: boolean;  // Benar/Salah (khusus PG & Benar-Salah dinilai otomatis)
  scoreAwarded?: number; // Skor nilai yang didapat
  teacherFeedback?: string; // Catatan koreksi dari guru
}

// Rekap Lembar Jawaban & Nilai Siswa (Hasil Ujian)
export interface ExamSubmission {
  id: string;
  examId: string;
  examTitle: string;
  subject: string;
  studentId: string;
  studentName: string;
  studentNis: string;
  studentClass: string; // Kelas siswa saat mengerjakan
  startTime: string;
  submitTime?: string;
  status: 'in_progress' | 'submitted' | 'graded'; // 'submitted' = menunggu koreksi essay dari guru, 'graded' = selesai dinilai penuh
  answers: Record<string, StudentAnswer>;
  totalScore: number;
  maxScore: number;
  percentageScore: number; // Nilai skala 0 - 100
  cheatWarningsCount: number; // Catatan peringatan keluar jendela CBT
  submittedToSheet: boolean; // Status tersinkron ke Google Sheets
}

// Profil Lembaga / Sekolah
export interface InstitutionProfile {
  name: string;
  tagline: string;
  address: string;
  academicYear: string; // Contoh: "2025/2026"
  semester: string;     // "Ganjil" atau "Genap"
  kepalaSekolah: string;
  ketuaPanitia: string;
  phone: string;
  email: string;
  logoUrl: string;
  driveFolderUrl: string;
}

// Konfigurasi Database Google Spreadsheet & Apps Script
export interface AppScriptConfig {
  webAppUrl: string;
  spreadsheetId?: string;
  driveFolderId?: string;
  autoSync: boolean;
  lastSyncTime?: string;
  isConnected: boolean;
  statusMessage?: string;
}
