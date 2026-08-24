/**
 * ============================================================================
 * DATA AWAL (DEFAULT DATA) APLIKASI CBT SMP DARUL FAWAID ILMIYAH
 * ============================================================================
 * File ini berisi data bawaan saat aplikasi pertama kali dijalankan.
 * Anda dapat dengan mudah mengubah nama sekolah, guru, siswa, maupun paket soal di sini.
 */

import { User, Exam, Question, ExamSubmission, InstitutionProfile } from '../types';
import { SMP_LOGO_URL, DRIVE_FOLDER_URL } from '../services/appScriptService';

/**
 * 1. PROFIL SEKOLAH
 * Silakan sesuaikan nama sekolah, alamat, kepala sekolah, dan tahun ajaran.
 */
export const INITIAL_INSTITUTION: InstitutionProfile = {
  name: 'SMP Darul Fawaid Ilmiyah',
  tagline: 'Membentuk Insan Cerdas Berkarakter, Unggul dalam IPTEK & Berakhlak Mulia',
  address: 'Jl. Pendidikan Nasional No. 45, Indonesia',
  academicYear: '2025/2026',
  semester: 'Genap',
  kepalaSekolah: 'Drs. H. M. Fauzan, M.Pd.',
  ketuaPanitia: 'Abdullah Robbani, S.Pd.',
  phone: '0812-3456-7890',
  email: 'smp.darulfawaid@gmail.com',
  logoUrl: SMP_LOGO_URL,
  driveFolderUrl: DRIVE_FOLDER_URL,
};

/**
 * 2. DATA PENGGUNA (ADMIN, GURU, & SISWA)
 * Catatan:
 * - Guru dan Admin menggunakan Nomor HP / WhatsApp
 * - Siswa menggunakan NIS (Nomor Induk Siswa) dan Kelas (misal: Kelas 7A, 8A, 9A)
 * - Password default semua akun adalah: 123
 */
export const INITIAL_USERS: User[] = [
  // Akun Admin / Panitia CBT
  {
    id: 'u-admin-1',
    username: 'admin',
    password: '123',
    nama: 'Abdullah Robbani, S.Pd. (Panitia)',
    role: 'admin',
    nisOrNip: '081299887766',
    phone: '081299887766',
    email: 'admin.cbt@smpdf.sch.id',
  },
  // Akun Guru 1: Matematika & Informatika
  {
    id: 'u-guru-1',
    username: 'budi.santoso',
    password: '123',
    nama: 'Budi Santoso, S.Pd.',
    role: 'guru',
    nisOrNip: '081311223344',
    phone: '081311223344',
    email: 'budi.santoso@smpdf.sch.id',
    subjectSpecialty: 'Matematika & Informatika',
  },
  // Akun Guru 2: IPA Terpadu
  {
    id: 'u-guru-2',
    username: 'siti.rahmawati',
    password: '123',
    nama: 'Siti Rahmawati, M.Pd.',
    role: 'guru',
    nisOrNip: '081355667788',
    phone: '081355667788',
    email: 'siti.rahmawati@smpdf.sch.id',
    subjectSpecialty: 'Ilmu Pengetahuan Alam (IPA)',
  },
  // Akun Guru 3: Bahasa Indonesia & Inggris
  {
    id: 'u-guru-3',
    username: 'ahmad.fauzi',
    password: '123',
    nama: 'Ahmad Fauzi, S.Pd.',
    role: 'guru',
    nisOrNip: '081399001122',
    phone: '081399001122',
    email: 'ahmad.fauzi@smpdf.sch.id',
    subjectSpecialty: 'Bahasa Indonesia & Bahasa Inggris',
  },
  // Data Siswa Kelas 7A
  {
    id: 'u-siswa-1',
    username: 'andi.pratama',
    password: '123',
    nama: 'Andi Pratama',
    role: 'siswa',
    nisOrNip: '2025.07.001',
    kelas: 'Kelas 7A',
    email: 'andi.p@siswa.smpdf.sch.id',
    phone: '085712345671',
  },
  {
    id: 'u-siswa-2',
    username: 'fatimah.zahra',
    password: '123',
    nama: 'Fatimah Az-Zahra',
    role: 'siswa',
    nisOrNip: '2025.07.002',
    kelas: 'Kelas 7A',
    email: 'fatimah.z@siswa.smpdf.sch.id',
    phone: '085712345672',
  },
  {
    id: 'u-siswa-3',
    username: 'muhammad.faiz',
    password: '123',
    nama: 'Muhammad Faiz',
    role: 'siswa',
    nisOrNip: '2025.07.003',
    kelas: 'Kelas 7A',
    email: 'm.faiz@siswa.smpdf.sch.id',
    phone: '085712345673',
  },
  // Data Siswa Kelas 7B
  {
    id: 'u-siswa-4',
    username: 'nurul.hidayah',
    password: '123',
    nama: 'Nurul Hidayah',
    role: 'siswa',
    nisOrNip: '2025.07.004',
    kelas: 'Kelas 7B',
    email: 'nurul.h@siswa.smpdf.sch.id',
    phone: '085712345674',
  },
  // Data Siswa Kelas 8A
  {
    id: 'u-siswa-5',
    username: 'rizky.ramadhan',
    password: '123',
    nama: 'Rizky Ramadhan',
    role: 'siswa',
    nisOrNip: '2024.08.015',
    kelas: 'Kelas 8A',
    email: 'rizky.r@siswa.smpdf.sch.id',
    phone: '085712345675',
  },
  // Data Siswa Kelas 8B
  {
    id: 'u-siswa-6',
    username: 'aisyah.putri',
    password: '123',
    nama: 'Aisyah Putri Maharani',
    role: 'siswa',
    nisOrNip: '2024.08.020',
    kelas: 'Kelas 8B',
    email: 'aisyah.p@siswa.smpdf.sch.id',
    phone: '085712345676',
  },
  // Data Siswa Kelas 9A
  {
    id: 'u-siswa-7',
    username: 'dimas.setiawan',
    password: '123',
    nama: 'Dimas Setiawan',
    role: 'siswa',
    nisOrNip: '2023.09.009',
    kelas: 'Kelas 9A',
    email: 'dimas.s@siswa.smpdf.sch.id',
    phone: '085712345677',
  },
];

/**
 * 3. DATA PAKET UJIAN (EXAMS)
 * Catatan: KKM telah dihapus sesuai permintaan.
 */
export const INITIAL_EXAMS: Exam[] = [
  {
    id: 'exam-1',
    title: 'Asesmen Sumatif Tengah Semester - Matematika',
    subject: 'Matematika',
    targetClass: 'Kelas 7',
    teacherId: 'u-guru-1',
    teacherName: 'Budi Santoso, S.Pd.',
    durationMinutes: 60,
    token: 'MTK7SMP',
    status: 'published',
    startDate: '2026-08-20T07:30:00.000Z',
    endDate: '2026-08-31T17:00:00.000Z',
    instructions: '1. Berdoalah sebelum mulai mengerjakan.\n2. Siapkan kertas coretan buram untuk perhitungan.\n3. Soal Pilihan Ganda dinilai otomatis oleh sistem.\n4. Soal Isian Singkat dan Uraian akan dikoreksi manual oleh Guru Pengampu.\n5. Dilarang berpindah jendela/tab selama ujian berlangsung.',
    randomizeQuestions: true,
    randomizeOptions: true,
    antiCheatEnabled: true,
    totalQuestions: 5,
    maxScore: 100,
  },
  {
    id: 'exam-2',
    title: 'Evaluasi Pembelajaran IPA Terpadu: Sistem Organ & Energi',
    subject: 'Ilmu Pengetahuan Alam (IPA)',
    targetClass: 'Kelas 8',
    teacherId: 'u-guru-2',
    teacherName: 'Siti Rahmawati, M.Pd.',
    durationMinutes: 50,
    token: 'IPA8SMP',
    status: 'published',
    startDate: '2026-08-21T07:30:00.000Z',
    endDate: '2026-08-31T17:00:00.000Z',
    instructions: 'Cermati setiap diagram gambar struktur organ dan proses fotosintesis dengan seksama sebelum menjawab.',
    randomizeQuestions: false,
    randomizeOptions: true,
    antiCheatEnabled: true,
    totalQuestions: 4,
    maxScore: 100,
  },
  {
    id: 'exam-3',
    title: 'Penilaian Akhir Jenjang - Bahasa Indonesia',
    subject: 'Bahasa Indonesia',
    targetClass: 'Kelas 9',
    teacherId: 'u-guru-3',
    teacherName: 'Ahmad Fauzi, S.Pd.',
    durationMinutes: 45,
    token: 'BINDO99',
    status: 'published',
    startDate: '2026-08-22T08:00:00.000Z',
    endDate: '2026-08-30T15:00:00.000Z',
    instructions: 'Bacalah kutipan teks cerita inspiratif dan laporan percobaan dengan cermat sebelum memilih jawaban.',
    randomizeQuestions: true,
    randomizeOptions: false,
    antiCheatEnabled: true,
    totalQuestions: 3,
    maxScore: 100,
  },
];

/**
 * 4. BUTIR-BUTIR SOAL UJIAN (QUESTIONS)
 */
export const INITIAL_QUESTIONS: Question[] = [
  // --- SOAL EXAM 1: Matematika Kelas 7 ---
  {
    id: 'q-101',
    examId: 'exam-1',
    number: 1,
    type: 'multiple_choice',
    questionText: 'Suhu di dalam ruang pendingin mula-mula adalah -4°C. Jika suhu dinaikkan sebesar 12°C, maka suhu ruangan tersebut sekarang adalah:',
    options: [
      { key: 'A', text: '8°C' },
      { key: 'B', text: '-8°C' },
      { key: 'C', text: '16°C' },
      { key: 'D', text: '-16°C' },
    ],
    correctAnswer: 'A',
    points: 20,
    explanation: 'Perhitungan: -4°C + 12°C = 8°C. (Dinilai otomatis sistem)',
  },
  {
    id: 'q-102',
    examId: 'exam-1',
    number: 2,
    type: 'multiple_choice',
    questionText: 'Perhatikan gambar bangun datar segitiga siku-siku berikut. Jika panjang sisi alas (a) = 6 cm dan tinggi (t) = 8 cm, maka panjang sisi miring (hipotenusa) adalah:',
    imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
    options: [
      { key: 'A', text: '9 cm' },
      { key: 'B', text: '10 cm' },
      { key: 'C', text: '12 cm' },
      { key: 'D', text: '14 cm' },
    ],
    correctAnswer: 'B',
    points: 20,
    explanation: 'Dengan Teorema Pythagoras: c = √(6² + 8²) = √(36 + 64) = √100 = 10 cm.',
  },
  {
    id: 'q-103',
    examId: 'exam-1',
    number: 3,
    type: 'true_false',
    questionText: 'Bentuk sederhana dari bentuk aljabar 3(2x - 5) + 4x adalah 10x - 15.',
    options: [
      { key: 'A', text: 'Benar' },
      { key: 'B', text: 'Salah' },
    ],
    correctAnswer: 'A',
    points: 20,
    explanation: '3(2x - 5) + 4x = 6x - 15 + 4x = 10x - 15. Pernyataan adalah BENAR.',
  },
  {
    id: 'q-104',
    examId: 'exam-1',
    number: 4,
    type: 'short_answer',
    questionText: 'Sebuah persegi panjang memiliki keliling 48 cm. Jika perbandingan panjang dan lebar adalah 5 : 3, berapakah luas persegi panjang tersebut (dalam cm²)? Tuliskan hanya angka hasil akhirnya.',
    correctAnswer: '135',
    points: 20,
    explanation: '2(5x + 3x) = 48 -> 16x = 48 -> x = 3. Panjang = 15 cm, Lebar = 9 cm. Luas = 15 x 9 = 135 cm².',
  },
  {
    id: 'q-105',
    examId: 'exam-1',
    number: 5,
    type: 'essay',
    questionText: 'Dalam sebuah kelas yang terdiri dari 36 siswa, terdapat 20 siswa gemar Matematika, 18 siswa gemar IPA, dan 6 siswa tidak gemar keduanya.\na. Gambarkan konsep diagram Venn yang menyatakan situasi tersebut!\nb. Hitunglah berapa banyak siswa yang gemar KEDUA mata pelajaran tersebut!',
    points: 20,
    explanation: 'Jawaban: (20-x) + x + (18-x) + 6 = 36 -> 44 - x = 36 -> x = 8 siswa. Nilai maksimal 20.',
  },

  // --- SOAL EXAM 2: IPA Terpadu Kelas 8 ---
  {
    id: 'q-201',
    examId: 'exam-2',
    number: 1,
    type: 'multiple_choice',
    questionText: 'Organ tubuh manusia yang berfungsi utama menyaring darah dari zat sisa metabolisme dan menghasilkan urine adalah:',
    imageUrl: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=600&q=80',
    options: [
      { key: 'A', text: 'Jantung' },
      { key: 'B', text: 'Ginjal' },
      { key: 'C', text: 'Paru-paru' },
      { key: 'D', text: 'Lambung' },
    ],
    correctAnswer: 'B',
    points: 25,
    explanation: 'Ginjal merupakan organ ekskresi utama penyaring darah.',
  },
  {
    id: 'q-202',
    examId: 'exam-2',
    number: 2,
    type: 'true_false',
    questionText: 'Gas yang dihasilkan tumbuhan sebagai hasil samping proses fotosintesis yang bermanfaat bagi pernapasan makhluk hidup adalah Karbon Dioksida (CO₂).',
    options: [
      { key: 'A', text: 'Benar' },
      { key: 'B', text: 'Salah' },
    ],
    correctAnswer: 'B',
    points: 25,
    explanation: 'Pernyataan SALAH. Gas yang dihasilkan adalah Oksigen (O₂).',
  },
  {
    id: 'q-203',
    examId: 'exam-2',
    number: 3,
    type: 'short_answer',
    questionText: 'Sebutkan pigmen hijau daun pada kloroplas tumbuhan yang bertugas menangkap energi cahaya matahari!',
    correctAnswer: 'klorofil',
    points: 25,
    explanation: 'Klorofil (zat hijau daun).',
  },
  {
    id: 'q-204',
    examId: 'exam-2',
    number: 4,
    type: 'essay',
    questionText: 'Jelaskan secara runtut bagaimana proses peredaran darah besar dan peredaran darah kecil pada tubuh manusia!',
    points: 25,
    explanation: 'Peredaran darah besar: Jantung (bilik kiri) -> seluruh tubuh -> Jantung (serambi kanan). Peredaran darah kecil: Jantung (bilik kanan) -> paru-paru -> Jantung (serambi kiri).',
  },

  // --- SOAL EXAM 3: Bahasa Indonesia Kelas 9 ---
  {
    id: 'q-301',
    examId: 'exam-3',
    number: 1,
    type: 'multiple_choice',
    questionText: 'Ciri utama dari teks laporan percobaan yang membedakannya dengan teks narasi adalah:',
    options: [
      { key: 'A', text: 'Disusun berdasarkan fakta empiris hasil observasi/uji coba' },
      { key: 'B', text: 'Menggunakan alur cerita rekaan tokoh fiktif' },
      { key: 'C', text: 'Bersifat menghibur pembaca' },
      { key: 'D', text: 'Menggunakan bahasa kiasan dan majas personifikasi' },
    ],
    correctAnswer: 'A',
    points: 35,
    explanation: 'Teks laporan percobaan bersifat objektif dan berdasarkan fakta uji coba ilmiah.',
  },
  {
    id: 'q-302',
    examId: 'exam-3',
    number: 2,
    type: 'short_answer',
    questionText: 'Tuliskan istilah struktur teks pidato persuasif yang berisi pengantar mengenai topik/isu yang akan dibahas!',
    correctAnswer: 'pendahuluan',
    points: 30,
    explanation: 'Pendahuluan / Pembukaan pidato persuasif.',
  },
  {
    id: 'q-303',
    examId: 'exam-3',
    number: 3,
    type: 'essay',
    questionText: 'Tuliskan sebuah paragraf pembuka pidato persuasif bertema "Pentingnya Menjaga Kebersihan Lingkungan Sekolah SMP" dengan santun dan menggugah!',
    points: 35,
    explanation: 'Kriteria penilaian: kesesuaian tema, keruntutan kalimat, penggunaan kata persuasif, dan tata bahasa baku.',
  },
];

/**
 * 5. CONTOH DATA HASIL PENGERJAAN SISWA (SUBMISSIONS)
 * Membantu guru langsung melihat fitur Rekap Nilai Per Kelas tanpa harus mengisi manual dari nol.
 */
export const INITIAL_SUBMISSIONS: ExamSubmission[] = [
  // Hasil Siswa 1 (Andi Pratama - Kelas 7A)
  {
    id: 'sub-1',
    examId: 'exam-1',
    examTitle: 'Asesmen Sumatif Tengah Semester - Matematika',
    subject: 'Matematika',
    studentId: 'u-siswa-1',
    studentName: 'Andi Pratama',
    studentNis: '2025.07.001',
    studentClass: 'Kelas 7A',
    startTime: '2026-08-23T08:00:00.000Z',
    submitTime: '2026-08-23T08:45:00.000Z',
    status: 'graded',
    answers: {
      'q-101': { questionId: 'q-101', answer: 'A', isCorrect: true, scoreAwarded: 20 },
      'q-102': { questionId: 'q-102', answer: 'B', isCorrect: true, scoreAwarded: 20 },
      'q-103': { questionId: 'q-103', answer: 'A', isCorrect: true, scoreAwarded: 20 },
      'q-104': { questionId: 'q-104', answer: '135', isCorrect: true, scoreAwarded: 20, teacherFeedback: 'Perhitungan tepat dan runtut.' },
      'q-105': {
        questionId: 'q-105',
        answer: 'a. Diagram Venn ada 2 lingkaran beririsan.\nb. Banyak siswa yang gemar keduanya adalah 8 siswa (44 - 36 = 8).',
        scoreAwarded: 18,
        teacherFeedback: 'Sangat baik, penjelasan rumus jelas.',
      },
    },
    totalScore: 98,
    maxScore: 100,
    percentageScore: 98,
    cheatWarningsCount: 0,
    submittedToSheet: true,
  },
  // Hasil Siswa 2 (Fatimah Az-Zahra - Kelas 7A)
  {
    id: 'sub-2',
    examId: 'exam-1',
    examTitle: 'Asesmen Sumatif Tengah Semester - Matematika',
    subject: 'Matematika',
    studentId: 'u-siswa-2',
    studentName: 'Fatimah Az-Zahra',
    studentNis: '2025.07.002',
    studentClass: 'Kelas 7A',
    startTime: '2026-08-23T08:05:00.000Z',
    submitTime: '2026-08-23T08:50:00.000Z',
    status: 'graded',
    answers: {
      'q-101': { questionId: 'q-101', answer: 'A', isCorrect: true, scoreAwarded: 20 },
      'q-102': { questionId: 'q-102', answer: 'B', isCorrect: true, scoreAwarded: 20 },
      'q-103': { questionId: 'q-103', answer: 'A', isCorrect: true, scoreAwarded: 20 },
      'q-104': { questionId: 'q-104', answer: '135', isCorrect: true, scoreAwarded: 20 },
      'q-105': {
        questionId: 'q-105',
        answer: 'Irisan = (20 + 18 + 6) - 36 = 44 - 36 = 8 siswa.',
        scoreAwarded: 20,
        teacherFeedback: 'Jawaban sempurna!',
      },
    },
    totalScore: 100,
    maxScore: 100,
    percentageScore: 100,
    cheatWarningsCount: 0,
    submittedToSheet: true,
  },
  // Hasil Siswa 3 (Nurul Hidayah - Kelas 7B)
  {
    id: 'sub-3',
    examId: 'exam-1',
    examTitle: 'Asesmen Sumatif Tengah Semester - Matematika',
    subject: 'Matematika',
    studentId: 'u-siswa-4',
    studentName: 'Nurul Hidayah',
    studentNis: '2025.07.004',
    studentClass: 'Kelas 7B',
    startTime: '2026-08-23T08:10:00.000Z',
    submitTime: '2026-08-23T08:55:00.000Z',
    status: 'graded',
    answers: {
      'q-101': { questionId: 'q-101', answer: 'A', isCorrect: true, scoreAwarded: 20 },
      'q-102': { questionId: 'q-102', answer: 'B', isCorrect: true, scoreAwarded: 20 },
      'q-103': { questionId: 'q-103', answer: 'B', isCorrect: false, scoreAwarded: 0 },
      'q-104': { questionId: 'q-104', answer: '135', isCorrect: true, scoreAwarded: 20 },
      'q-105': {
        questionId: 'q-105',
        answer: 'Jumlah siswa gemar keduanya = 8 anak.',
        scoreAwarded: 16,
        teacherFeedback: 'Diagram Venn belum dicantumkan.',
      },
    },
    totalScore: 76,
    maxScore: 100,
    percentageScore: 76,
    cheatWarningsCount: 0,
    submittedToSheet: true,
  },
];
