/**
 * ============================================================================
 * MODAL CETAK BERITA ACARA PELAKSANAAN UJIAN CBT - SMP DARUL FAWAID ILMIYAH
 * ============================================================================
 * Fitur:
 * 1. Format berita acara resmi pelaksanaan ujian CBT
 * 2. Menampilkan informasi ruang, mata pelajaran, jumlah peserta hadir, dan catatan proktor
 * 3. Siap cetak (Print-ready & simpan PDF)
 */

import React from 'react';
import { InstitutionProfile, Exam, ExamSubmission } from '../../types';
import { Printer, X } from 'lucide-react';
import { SMP_LOGO_URL } from '../../services/appScriptService';

interface PrintBeritaAcaraModalProps {
  isOpen: boolean;
  onClose: () => void;
  institution: InstitutionProfile;
  exam: Exam;
  submissions?: ExamSubmission[];
  totalParticipants?: number;
}

export const PrintBeritaAcaraModal: React.FC<PrintBeritaAcaraModalProps> = ({
  isOpen,
  onClose,
  institution,
  exam,
  submissions = [],
  totalParticipants = 0,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const todayDateFormatted = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const examSubs = submissions.filter((s) => s.examId === exam?.id);
  const totalHadir = examSubs.length > 0 ? examSubs.length : totalParticipants || 30;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-6">
        
        {/* Header Action (Sembunyi saat cetak) */}
        <div className="no-print bg-slate-900 text-white px-6 py-4 flex justify-between items-center border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold">Cetak Berita Acara Pelaksanaan Ujian</h3>
            <p className="text-xs text-slate-400">
              Dokumen resmi pelaksanaan ujian CBT: {exam?.title || 'Asesmen CBT'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Cetak PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Lembar Berita Acara Resmi (Siap Cetak) */}
        <div className="p-8 max-h-[85vh] overflow-y-auto bg-white print:p-0 print:max-h-none text-slate-900 leading-normal">
          
          {/* Kop Surat SMP */}
          <div className="border-b-4 border-double border-slate-900 pb-4 mb-6 text-center flex items-center justify-center gap-4">
            <img
              src={institution.logoUrl || SMP_LOGO_URL}
              alt="Logo SMP"
              className="w-16 h-16 object-contain shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="text-center">
              <h2 className="text-xl font-black uppercase tracking-wider text-slate-900">
                {institution.name}
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                {institution.address} • Telp: {institution.phone} • Email: {institution.email}
              </p>
              <p className="text-xs font-bold text-blue-950 mt-1 uppercase">
                PANITIA PELAKSANA ASESMEN & UJIAN CBT TAHUN PELAJARAN {institution.academicYear}
              </p>
            </div>
          </div>

          {/* Judul Berita Acara */}
          <div className="text-center mb-6">
            <h3 className="text-base font-bold uppercase underline tracking-wide">
              BERITA ACARA PELAKSANAAN UJIAN CBT
            </h3>
            <p className="text-xs text-slate-600 font-mono">
              Nomor: BA-CBT/{exam?.id ? exam.id.toUpperCase() : 'SMP'}/{new Date().getFullYear()}
            </p>
          </div>

          {/* Isi Berita Acara */}
          <div className="text-xs space-y-3 mb-6">
            <p className="leading-relaxed">
              Pada hari ini, <strong>{todayDateFormatted}</strong>, di <strong>{institution.name}</strong>, telah diselenggarakan Ujian Computer Based Test (CBT) dengan rincian sebagai berikut:
            </p>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-500 font-medium">Mata Pelajaran:</span>
                <p className="font-bold text-slate-900">{exam?.subject || 'Matematika'}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Paket Ujian:</span>
                <p className="font-bold text-slate-900">{exam?.title || 'Asesmen CBT'}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Sasaran Kelas:</span>
                <p className="font-bold text-slate-900">{exam?.targetClass || 'Kelas 7'}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Durasi Ujian:</span>
                <p className="font-bold text-slate-900">{exam?.durationMinutes || 60} Menit</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Jumlah Peserta Terdaftar:</span>
                <p className="font-bold text-slate-900">{totalHadir} Siswa</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Status Pelaksanaan:</span>
                <p className="font-bold text-emerald-700">Tertib & Lancar</p>
              </div>
            </div>

            <p className="leading-relaxed pt-2">
              Pelaksanaan ujian berjalan dengan tertib sesuai petunjuk dan tata tertib yang telah ditetapkan panitia sekolah.
            </p>
          </div>

          {/* Kolom Tanda Tangan */}
          <div className="grid grid-cols-3 gap-6 pt-8 text-center text-xs">
            <div>
              <p className="text-slate-600">Pengawas Ruang 1,</p>
              <div className="h-16"></div>
              <p className="font-bold text-slate-900 underline">( ........................................ )</p>
            </div>

            <div>
              <p className="text-slate-600">Proktor CBT,</p>
              <div className="h-16"></div>
              <p className="font-bold text-slate-900 underline">{institution.ketuaPanitia}</p>
            </div>

            <div>
              <p className="text-slate-600">Mengetahui, Kepala Sekolah</p>
              <div className="h-16"></div>
              <p className="font-bold text-slate-900 underline">{institution.headmasterName}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
