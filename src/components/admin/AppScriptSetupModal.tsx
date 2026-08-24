/**
 * ============================================================================
 * MODAL SETUP DATABASE GOOGLE SPREADSHEET & APPS SCRIPT
 * CBT SMP DARUL FAWAID ILMIYAH
 * ============================================================================
 * Menampilkan panduan setup database, nama Sheet Bahasa Indonesia,
 * rumus spreadsheet otomatis, dan sinkronisasi data cloud.
 */

import React, { useState } from 'react';
import { useExam } from '../../context/ExamContext';
import { APPSCRIPT_CODE_TEMPLATE, DEFAULT_APPSCRIPT_URL, DRIVE_FOLDER_ID, DRIVE_FOLDER_URL } from '../../services/appScriptService';
import {
  X,
  Sheet,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Code2,
  Save,
  Download,
  UploadCloud,
  Table,
  Calculator,
  Database,
} from 'lucide-react';

interface AppScriptSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppScriptSetupModal: React.FC<AppScriptSetupModalProps> = ({ isOpen, onClose }) => {
  const {
    appScriptConfig,
    updateAppScriptConfig,
    testAppScriptConnection,
    syncAllWithSheet,
    initDatabaseOnSheet,
    isSyncing,
    syncStatus,
    exportToCsv,
  } = useExam();

  const [webAppUrl, setWebAppUrl] = useState(appScriptConfig.webAppUrl || DEFAULT_APPSCRIPT_URL);
  const [copied, setCopied] = useState(false);
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'setup' | 'code' | 'schema' | 'sync'>('setup');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPSCRIPT_CODE_TEMPLATE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormula(id);
    setTimeout(() => setCopiedFormula(null), 2000);
  };

  const handleSaveUrl = () => {
    updateAppScriptConfig({
      webAppUrl: webAppUrl.trim(),
    });
    setTestResult({
      success: true,
      message: 'URL Google Apps Script berhasil disimpan!',
    });
  };

  const handleRunTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    updateAppScriptConfig({ webAppUrl: webAppUrl.trim() });
    const res = await testAppScriptConnection();
    setIsTesting(false);
    setTestResult(res);
  };

  const handleInitDatabase = async () => {
    setIsInitializing(true);
    setTestResult(null);
    updateAppScriptConfig({ webAppUrl: webAppUrl.trim() });
    const res = await initDatabaseOnSheet();
    setIsInitializing(false);
    setTestResult(res);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-6">
        
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-950 text-white p-4 sm:p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/40 flex items-center justify-center text-blue-200 border border-blue-400/30 shadow-inner shrink-0">
              <Sheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight">Database Spreadsheet & Google Drive SMP</h3>
              <p className="text-xs text-blue-200">
                Penyimpanan cloud Google Sheets Bahasa Indonesia dengan rumus statistik otomatis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigasi */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 sm:px-6 pt-3 gap-1 sm:gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('setup')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'setup'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>1. Konfigurasi URL</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'code'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>2. Skrip Apps Script</span>
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'schema'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>3. Skema & Rumus Database</span>
          </button>

          <button
            onClick={() => setActiveTab('sync')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'sync'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>4. Sinkronisasi Data</span>
          </button>
        </div>

        {/* Isi Tab Konten */}
        <div className="p-4 sm:p-6 space-y-6 max-h-[72vh] overflow-y-auto">
          
          {/* TAB 1: KONFIGURASI URL */}
          {activeTab === 'setup' && (
            <div className="space-y-5">
              <div
                className={`p-4 rounded-2xl border flex items-start gap-3 ${
                  appScriptConfig.isConnected
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                {appScriptConfig.isConnected ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="text-xs space-y-1">
                  <p className="font-bold text-sm">
                    {appScriptConfig.isConnected
                      ? 'Status: Terhubung Aktif ke Google Spreadsheet'
                      : 'Status: Penyimpanan Lokal (Belum Terkoneksi ke Apps Script)'}
                  </p>
                  <p className="text-slate-600">
                    Aplikasi CBT terhubung langsung ke Google Sheets. Semua akun, paket soal, dan lembar jawaban siswa dapat tersimpan secara otomatis.
                  </p>
                  {appScriptConfig.lastSyncTime && (
                    <p className="text-[11px] text-slate-500 font-mono">
                      Terakhir disinkronkan: {appScriptConfig.lastSyncTime}
                    </p>
                  )}
                </div>
              </div>

              {/* Input URL Web App */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  URL Google Apps Script (Web App URL):
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={webAppUrl}
                    onChange={(e) => setWebAppUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50"
                  />
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={handleSaveUrl}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Simpan</span>
                    </button>
                    <button
                      onClick={handleRunTest}
                      disabled={isTesting}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                      <span>{isTesting ? 'Menguji...' : 'Uji Koneksi'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Notifikasi Hasil Pengujian */}
              {testResult && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 animate-in fade-in ${
                    testResult.success
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-rose-50 border-rose-300 text-rose-900'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold">{testResult.success ? 'Berhasil: ' : 'Peringatan: '}</span>
                    <span>{testResult.message}</span>
                  </div>
                </div>
              )}

              {/* Tombol Buat Sheet Otomatis */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-blue-600" />
                    Inisialisasi Tabel & Rumus di Google Spreadsheet
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Otomatis membuat sheet <strong>PENGGUNA, PAKET_UJIAN, BANK_SOAL, LEMBAR_JAWABAN, RINGKASAN_STATISTIK, PROFIL_LEMBAGA</strong> lengkap dengan header dan rumus.
                  </p>
                </div>
                <button
                  onClick={handleInitDatabase}
                  disabled={isInitializing}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 shrink-0 flex items-center gap-1.5 shadow-sm"
                >
                  <Table className="w-3.5 h-3.5" />
                  <span>{isInitializing ? 'Membuat Sheet...' : 'Inisialisasi Sheet'}</span>
                </button>
              </div>

              {/* Folder Google Drive */}
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <h4 className="font-bold text-blue-900 text-xs sm:text-sm">
                    Folder Google Drive Foto Soal
                  </h4>
                  <p className="text-xs text-blue-800">
                    ID Folder Drive: <code className="bg-blue-100 px-1.5 py-0.5 rounded font-mono text-[11px] font-bold">{DRIVE_FOLDER_ID}</code>
                  </p>
                </div>
                <a
                  href={DRIVE_FOLDER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka Folder Drive</span>
                </a>
              </div>
            </div>
          )}

          {/* TAB 2: SKRIP APPS SCRIPT */}
          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="text-xs text-slate-600">
                  Salin seluruh kode di bawah ini lalu tempelkan ke <strong>Apps Script</strong> di Google Spreadsheet Anda.
                </p>
                <button
                  onClick={handleCopyCode}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tersalin ke Clipboard!' : 'Salin Seluruh Skrip'}</span>
                </button>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
                <pre className="p-4 text-slate-200 text-[11px] font-mono overflow-x-auto max-h-[50vh] leading-relaxed select-all">
                  <code>{APPSCRIPT_CODE_TEMPLATE}</code>
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: SKEMA & RUMUS SPREADSHEET */}
          {activeTab === 'schema' && (
            <div className="space-y-6 text-xs text-slate-700">
              
              {/* Header Penjelasan */}
              <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-2">
                <h4 className="font-bold text-sm text-blue-300 flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Struktur Sheet & Rumus Otomatis Google Spreadsheet
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  Semua nama sheet dan header kolom menggunakan <strong>Bahasa Indonesia</strong> agar sangat mudah dibaca, diedit, atau dicetak oleh guru dan panitia ujian.
                </p>
              </div>

              {/* 1. Sheet PENGGUNA */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                    Sheet 1: <code className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-mono font-bold">PENGGUNA</code>
                  </h5>
                  <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">10 Kolom</span>
                </div>
                <p className="text-slate-600 text-xs">
                  Menyimpan data akun Admin/Panitia, Guru Mata Pelajaran, dan Siswa SMP:
                </p>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 overflow-x-auto">
                  <div className="flex flex-wrap gap-1 font-mono text-[11px]">
                    {['ID_PENGGUNA', 'USERNAME', 'PASSWORD', 'NAMA_LENGKAP', 'PERAN', 'NIS_ATAU_NO_HP', 'KELAS', 'EMAIL', 'NO_WHATSAPP', 'MAPEL_PENGAMPU'].map((h, i) => (
                      <span key={i} className="bg-white border border-slate-300 px-2 py-1 rounded shadow-2xs font-semibold text-slate-800">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. Sheet PAKET_UJIAN */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                    Sheet 2: <code className="bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded font-mono font-bold">PAKET_UJIAN</code>
                  </h5>
                  <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">17 Kolom</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 overflow-x-auto">
                  <div className="flex flex-wrap gap-1 font-mono text-[11px]">
                    {['ID_UJIAN', 'JUDUL_UJIAN', 'MATA_PELAJARAN', 'SASARAN_KELAS', 'ID_GURU', 'NAMA_GURU', 'DURASI_MENIT', 'TOKEN_MASUK', 'STATUS', 'WAKTU_MULAI', 'WAKTU_SELESAI', 'PETUNJUK', 'ACAK_SOAL', 'ACAK_PILIHAN', 'ANTI_CURANG', 'TOTAL_SOAL', 'TOTAL_POIN'].map((h, i) => (
                      <span key={i} className="bg-white border border-slate-300 px-2 py-1 rounded shadow-2xs font-semibold text-slate-800">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Sheet BANK_SOAL */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                    Sheet 3: <code className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold">BANK_SOAL</code>
                  </h5>
                  <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">10 Kolom</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 overflow-x-auto">
                  <div className="flex flex-wrap gap-1 font-mono text-[11px]">
                    {['ID_SOAL', 'ID_UJIAN', 'NOMOR_URUT', 'TIPE_SOAL', 'TEKS_SOAL', 'URL_GAMBAR', 'PILIHAN_OPSI_JSON', 'KUNCI_JAWABAN', 'BOBOT_POIN', 'PEMBAHASAN'].map((h, i) => (
                      <span key={i} className="bg-white border border-slate-300 px-2 py-1 rounded shadow-2xs font-semibold text-slate-800">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. Sheet LEMBAR_JAWABAN & Rumus Persentase */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    Sheet 4: <code className="bg-amber-50 text-amber-900 px-2 py-0.5 rounded font-mono font-bold">LEMBAR_JAWABAN</code>
                  </h5>
                  <span className="text-[11px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-bold">Dilengkapi Rumus Otomatis</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 overflow-x-auto">
                  <div className="flex flex-wrap gap-1 font-mono text-[11px]">
                    {['ID_JAWABAN', 'ID_UJIAN', 'JUDUL_UJIAN', 'MATA_PELAJARAN', 'ID_SISWA', 'NAMA_SISWA', 'NIS_SISWA', 'KELAS_SISWA', 'WAKTU_MULAI', 'WAKTU_SELESAI', 'STATUS', 'NILAI_TOTAL', 'NILAI_MAKSIMAL', 'NILAI_PERSEN_100', 'PERINGATAN_PINDAH_TAB', 'RINCIAN_JAWABAN_JSON'].map((h, i) => (
                      <span key={i} className={`px-2 py-1 rounded shadow-2xs font-semibold border ${h === 'NILAI_PERSEN_100' ? 'bg-amber-100 border-amber-400 text-amber-900 font-bold' : 'bg-white border-slate-300 text-slate-800'}`}>
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Rumus Kolom N */}
                <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                      <Calculator className="w-3.5 h-3.5 text-amber-700" />
                      Rumus Persentase Nilai (Kolom N / NILAI_PERSEN_100):
                    </span>
                    <button
                      onClick={() => handleCopyText('=IF(M2>0, ROUND((L2/M2)*100, 1), 0)', 'formula-n')}
                      className="text-[11px] font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1"
                    >
                      {copiedFormula === 'formula-n' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedFormula === 'formula-n' ? 'Tersalin' : 'Salin Rumus'}</span>
                    </button>
                  </div>
                  <code className="block bg-white p-2 rounded-lg border border-amber-300 font-mono text-[11px] text-amber-900 select-all font-bold">
                    =IF(M2&gt;0, ROUND((L2/M2)*100, 1), 0)
                  </code>
                </div>
              </div>

              {/* 5. Sheet RINGKASAN_STATISTIK */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    Sheet 5: <code className="bg-rose-50 text-rose-900 px-2 py-0.5 rounded font-mono font-bold">RINGKASAN_STATISTIK</code>
                  </h5>
                  <span className="text-[11px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md font-bold">Dashboard Formula</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px] text-left border-collapse border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-100 text-slate-700 font-bold">
                      <tr>
                        <th className="p-2 border border-slate-200">Indikator</th>
                        <th className="p-2 border border-slate-200">Rumus Spreadsheet</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-2 border border-slate-200 font-medium">Total Siswa Terdaftar</td>
                        <td className="p-2 border border-slate-200 font-mono text-blue-700">=COUNTIF(PENGGUNA!E2:E, "siswa")</td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-slate-200 font-medium">Total Guru Mata Pelajaran</td>
                        <td className="p-2 border border-slate-200 font-mono text-blue-700">=COUNTIF(PENGGUNA!E2:E, "guru")</td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-slate-200 font-medium">Total Paket Ujian CBT</td>
                        <td className="p-2 border border-slate-200 font-mono text-blue-700">=COUNTA(PAKET_UJIAN!A2:A)-1</td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-slate-200 font-medium">Total Lembar Jawaban Siswa</td>
                        <td className="p-2 border border-slate-200 font-mono text-blue-700">=COUNTA(LEMBAR_JAWABAN!A2:A)-1</td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-slate-200 font-medium">Rata-Rata Nilai Siswa</td>
                        <td className="p-2 border border-slate-200 font-mono text-blue-700">=AVERAGE(LEMBAR_JAWABAN!N2:N)</td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-slate-200 font-medium">Nilai Tertinggi Siswa</td>
                        <td className="p-2 border border-slate-200 font-mono text-blue-700">=MAX(LEMBAR_JAWABAN!N2:N)</td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-slate-200 font-medium">Nilai Terendah Siswa</td>
                        <td className="p-2 border border-slate-200 font-mono text-blue-700">=MIN(LEMBAR_JAWABAN!N2:N)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: SINKRONISASI DATA */}
          {activeTab === 'sync' && (
            <div className="space-y-5">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-sm">
                  Sinkronisasi Data Dua Arah (Dua Arah / Bi-directional)
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Unggah seluruh data lokal saat ini ke Google Spreadsheet untuk mencadangkan data akun, paket soal, dan lembar jawaban siswa.
                </p>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={() => syncAllWithSheet()}
                    disabled={isSyncing}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang ke Spreadsheet'}</span>
                  </button>

                  <button
                    onClick={() => exportToCsv('users')}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Unduh CSV Pengguna</span>
                  </button>

                  <button
                    onClick={() => exportToCsv('submissions')}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Unduh CSV Hasil Ujian</span>
                  </button>
                </div>
              </div>

              {syncStatus.message && (
                <div
                  className={`p-4 rounded-xl border text-xs font-medium ${
                    syncStatus.status === 'success'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : syncStatus.status === 'error'
                      ? 'bg-rose-50 border-rose-300 text-rose-900'
                      : 'bg-blue-50 border-blue-300 text-blue-900'
                  }`}
                >
                  {syncStatus.message}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Modal */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-between items-center">
          <span className="text-[11px] text-slate-500">
            SMP Darul Fawaid Ilmiyah • Sistem CBT Mandiri
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
