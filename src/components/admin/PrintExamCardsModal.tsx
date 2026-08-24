/**
 * ============================================================================
 * MODAL CETAK KARTU PESERTA UJIAN SISWA - SMP DARUL FAWAID ILMIYAH
 * ============================================================================
 * Fitur:
 * 1. Format resmi kartu ujian CBT per siswa (Nama, NIS, Kelas, Username, Password)
 * 2. Kop resmi SMP Darul Fawaid Ilmiyah
 * 3. Siap cetak (Print-ready & simpan PDF)
 */

import React from 'react';
import { User, InstitutionProfile, Exam } from '../../types';
import { Printer, X } from 'lucide-react';
import { SMP_LOGO_URL } from '../../services/appScriptService';

interface PrintExamCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: User[];
  institution: InstitutionProfile;
  exams?: Exam[];
}

export const PrintExamCardsModal: React.FC<PrintExamCardsModalProps> = ({
  isOpen,
  onClose,
  students,
  institution,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden my-6">
        
        {/* Header Action (Sembunyi saat dicetak) */}
        <div className="no-print bg-slate-900 text-white px-6 py-4 flex justify-between items-center border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold">Cetak Kartu Peserta Ujian Siswa SMP</h3>
            <p className="text-xs text-slate-400">
              Format cetak resmi kartu peserta CBT SMP Darul Fawaid Ilmiyah
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Lembar Kartu Ujian (Siap Cetak) */}
        <div className="p-6 max-h-[80vh] overflow-y-auto bg-slate-100 print:bg-white print:p-0 print:max-h-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4">
            {students.map((student) => (
              <div
                key={student.id}
                className="bg-white border-2 border-blue-900 rounded-2xl p-4 shadow-xs flex flex-col justify-between"
              >
                <div>
                  {/* Kop Kartu */}
                  <div className="flex items-center gap-3 border-b-2 border-blue-900 pb-2 mb-3">
                    <img
                      src={institution.logoUrl || SMP_LOGO_URL}
                      alt="Logo SMP"
                      className="w-11 h-11 object-contain shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1">
                      <div className="text-[11px] font-black uppercase tracking-wider text-blue-950 leading-tight">
                        {institution.name}
                      </div>
                      <div className="text-[10px] font-bold text-slate-700 py-0.5">
                        KARTU PESERTA UJIAN CBT
                      </div>
                      <div className="text-[9px] text-slate-500 font-semibold">
                        TAHUN PELAJARAN {institution.academicYear} • SEMESTER {institution.semester}
                      </div>
                    </div>
                  </div>

                  {/* Rincian Siswa */}
                  <div className="flex gap-3 items-start mb-3">
                    <div className="w-20 h-24 rounded-lg border border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-slate-400 text-[9px] shrink-0 font-medium">
                      <span>FOTO</span>
                      <span>2 x 3</span>
                    </div>

                    <div className="flex-1 space-y-1 text-xs">
                      <div className="flex">
                        <span className="w-24 text-slate-500 font-medium">Nama Siswa</span>
                        <span className="font-bold text-slate-900">: {student.nama}</span>
                      </div>
                      <div className="flex">
                        <span className="w-24 text-slate-500 font-medium">NIS Siswa</span>
                        <span className="font-mono font-bold text-blue-900">: {student.nisOrNip}</span>
                      </div>
                      <div className="flex">
                        <span className="w-24 text-slate-500 font-medium">Kelas</span>
                        <span className="font-semibold text-slate-800">: {student.kelas || 'Kelas 7A'}</span>
                      </div>
                      <div className="flex">
                        <span className="w-24 text-slate-500 font-medium">Username CBT</span>
                        <span className="font-mono text-slate-700">: {student.username}</span>
                      </div>
                      <div className="flex">
                        <span className="w-24 text-slate-500 font-medium">Password CBT</span>
                        <span className="font-mono font-bold text-slate-800">: {student.password || '123'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Kartu */}
                <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between items-end text-[10px]">
                  <div>
                    <span className="text-slate-500 block">Status:</span>
                    <span className="font-semibold text-emerald-700">Peserta Resmi CBT</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block">Ketua Panitia Ujian,</span>
                    <div className="h-6"></div>
                    <span className="font-bold text-slate-900 underline block">{institution.ketuaPanitia}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
