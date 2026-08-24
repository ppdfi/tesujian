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
  FolderSync,
  Database,
  Table,
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

  const handleSaveUrl = () => {
    updateAppScriptConfig({
      webAppUrl: webAppUrl.trim(),
    });
    setTestResult({
      success: true,
      message: 'URL Google Apps Script & Drive berhasil disimpan secara lokal!',
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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-950 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/40 flex items-center justify-center text-blue-200 border border-blue-400/30 shadow-inner">
              <Sheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Integrasi Google Spreadsheet & Drive SMP</h3>
              <p className="text-xs text-blue-200">
                Penyimpanan database online cloud & folder gambar soal otomatis tanpa perlu membuka spreadsheet
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('setup')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'setup'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>1. Konfigurasi URL & Drive</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'code'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>2. Salin Skrip Apps Script</span>
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'schema'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>3. Skema Sheet & Data Awal</span>
          </button>

          <button
            onClick={() => setActiveTab('sync')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'sync'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>4. Sinkronisasi Data</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {activeTab === 'setup' && (
            <div className="space-y-5">
              {/* Status Alert */}
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
                  <p className="font-bold">
                    {appScriptConfig.isConnected
                      ? 'Status: Terhubung Aktif ke Google Spreadsheet & Google Drive'
                      : 'Status: Mode Penyimpanan Lokal (Belum Terkoneksi)'}
                  </p>
                  <p className="text-slate-600">
                    {appScriptConfig.isConnected
                      ? 'Semua data akun siswa/guru/admin, bank soal ujian SMP, dan hasil penilaian otomatis tersinkronisasi ke Google Spreadsheet & Google Drive.'
                      : 'Pastikan script sudah di-deploy sebagai Web App dengan izin akses "Anyone" (Siapa Saja) agar web app dapat membaca dan menulis data secara instan.'}
                  </p>
                  {appScriptConfig.lastSyncTime && (
                    <p className="text-[11px] text-slate-500 font-mono">
                      Terakhir disinkronkan: {appScriptConfig.lastSyncTime}
                    </p>
                  )}
                </div>
              </div>

              {/* Web App URL Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  URL Deployment Google Apps Script (Web App URL):
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={webAppUrl}
                    onChange={(e) => setWebAppUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleSaveUrl}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan</span>
                  </button>
                </div>
              </div>

              {/* Google Drive Folder Info */}
              <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <FolderSync className="w-5 h-5 text-indigo-600 shrink-0" />
                  <div>
                    <span className="font-bold text-indigo-950">Folder Google Drive Upload Foto Soal:</span>
                    <p className="text-[11px] text-indigo-800 font-mono truncate max-w-md">ID: {DRIVE_FOLDER_ID}</p>
                  </div>
                </div>
                <a
                  href={DRIVE_FOLDER_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold inline-flex items-center gap-1 transition-colors text-[11px] shrink-0"
                >
                  <span>Buka Drive</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Action Buttons: Test Connection & Init Database */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleRunTest}
                  disabled={isTesting || !webAppUrl.trim()}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
                >
                  <RefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Menguji Sambungan...' : 'Uji Koneksi (Ping)'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleInitDatabase}
                  disabled={isInitializing || !webAppUrl.trim()}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
                >
                  <Database className={`w-4 h-4 ${isInitializing ? 'animate-spin' : ''}`} />
                  <span>{isInitializing ? 'Menginisialisasi...' : 'Inisialisasi Tabel & Placeholder di Sheet'}</span>
                </button>
              </div>

              {testResult && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
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
                    <p className="font-semibold">{testResult.message}</p>
                  </div>
                </div>
              )}

              {/* 4-Step Illustrated Guide */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Cara Setup Google Spreadsheet Lembaga:
                </h4>
                <ol className="text-xs text-slate-700 space-y-2 list-decimal list-inside leading-relaxed">
                  <li>
                    Buka <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-blue-600 underline font-bold inline-flex items-center">Google Spreadsheet Baru <ExternalLink className="w-3 h-3 ml-0.5" /></a> di browser Anda.
                  </li>
                  <li>
                    Di spreadsheet, klik menu <strong>Ekstensi (Extensions)</strong> &rarr; <strong>Apps Script</strong>.
                  </li>
                  <li>
                    Buka tab <strong>"2. Salin Skrip Apps Script"</strong> di modal ini, salin seluruh kodenya dan timpa di <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">Code.gs</code>.
                  </li>
                  <li>
                    Klik <strong>Deploy &rarr; New Deployment &rarr; Web App</strong>. Atur <em>Execute as: "Me"</em> dan <em>Who has access: "Anyone" (Siapa saja)</em>.
                  </li>
                  <li>
                    Tempelkan URL Web App yang didapat ke input di atas, lalu klik <strong>"Inisialisasi Tabel & Placeholder di Sheet"</strong>.
                  </li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Kode Google Apps Script (Code.gs)</h4>
                  <p className="text-[11px] text-slate-500">
                    Mendukung endpoint GET & POST untuk sinkronisasi Users, Exams, Questions, Submissions, dan upload foto soal ke Google Drive.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Tersalin!' : 'Salin Semua Kode'}</span>
                </button>
              </div>

              <div className="relative">
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-[11px] font-mono leading-relaxed max-h-96 overflow-y-auto border border-slate-800 select-all">
                  {APPSCRIPT_CODE_TEMPLATE}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-4 text-xs">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Struktur Tabel Sheet & Data Placeholder yang Dibuat</h4>
                <p className="text-slate-500">
                  Script ini secara otomatis membuat 4 sheet terpisah di Google Spreadsheet Anda:
                </p>
              </div>

              <div className="space-y-3">
                <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50">
                  <span className="font-bold text-blue-700">1. Sheet `Users` (Data Akun Pengguna)</span>
                  <p className="text-slate-600 mt-1 font-mono text-[11px] bg-white p-2 rounded border border-slate-200">
                    ID | Username | Password | Nama | Role | NIS_NIP | Kelas | Email | Telepon | BidangStudi | CreatedAt
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Placeholder: Admin panitia (admin / 123), Guru Matematika (guru_budi / 123), Guru IPA (guru_siti / 123), Siswa Kelas 7A, 8A, 9A.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50">
                  <span className="font-bold text-emerald-700">2. Sheet `Exams` (Data Ujian SMP)</span>
                  <p className="text-slate-600 mt-1 font-mono text-[11px] bg-white p-2 rounded border border-slate-200">
                    ID | JudulUjian | MataPelajaran | KelasTarget | GuruPenguji | GuruId | DurasiMenit | KKM | Token | Status | AcakSoal | TotalSoal | CreatedAt
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Placeholder: Penilaian Tengah Semester (PTS) Matematika Kelas 7, Ulangan Harian IPA Biologi Kelas 8, Ujian Sekolah Bahasa Indonesia Kelas 9.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50">
                  <span className="font-bold text-amber-700">3. Sheet `Questions` (Bank Soal Ujian)</span>
                  <p className="text-slate-600 mt-1 font-mono text-[11px] bg-white p-2 rounded border border-slate-200">
                    ID | ExamId | NomorUrut | TipeSoal | TeksSoal | PilihanOpsi (JSON) | KunciJawaban | Poin | Pembahasan | FotoDriveUrl
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Placeholder: Soal pilihan ganda, benar/salah, isian singkat (auto-score/manual), dan uraian/essay matematika & IPA dengan gambar pendukung.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50">
                  <span className="font-bold text-purple-700">4. Sheet `Submissions` (Hasil Ujian & Rekap Nilai Siswa)</span>
                  <p className="text-slate-600 mt-1 font-mono text-[11px] bg-white p-2 rounded border border-slate-200">
                    ID | ExamId | JudulUjian | MataPelajaran | SiswaId | NamaSiswa | NIS | Kelas | WaktuMulai | WaktuSelesai | Status | JawabanSiswa (JSON) | TotalSkor | SkorMaksimal | Persentase | Lulus | PeringatanCurang
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Pilihan ganda dinilai otomatis oleh sistem. Uraian & isian singkat dinilai secara manual oleh guru melalui antarmuka webapp.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sync' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900">Sinkronisasi Penuh Dua Arah</h4>
                <p className="text-xs text-slate-600">
                  Kirim seluruh data bank soal, peserta siswa, akun guru, dan rekapitulasi nilai ujian ke Google Spreadsheet Anda.
                </p>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => syncAllWithSheet()}
                    disabled={isSyncing || !webAppUrl.trim()}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Sedang Menyinkronkan...' : 'Sinkronkan Sekarang ke Google Sheets'}</span>
                  </button>
                </div>

                {syncStatus.message && (
                  <p className="text-xs font-medium text-slate-700 bg-slate-100 p-2.5 rounded-lg">
                    {syncStatus.message}
                  </p>
                )}
              </div>

              {/* Export Backup CSV Files */}
              <div className="border-t border-slate-200 pt-5 space-y-3">
                <h4 className="text-xs font-bold text-slate-900">Unduh Salinan Cadangan (Offline Backup CSV)</h4>
                <p className="text-xs text-slate-500">
                  Anda juga dapat mengekspor data dalam format spreadsheet/CSV kapan saja:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => exportToCsv('users')}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-600" />
                    <span>Data Pengguna</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => exportToCsv('exams')}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-600" />
                    <span>Data Ujian</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => exportToCsv('submissions')}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-600" />
                    <span>Jawaban Siswa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => exportToCsv('recap')}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-600" />
                    <span>Rekap Nilai</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center">
          <span className="text-[11px] text-slate-500 font-medium">
            SMP Darul Fawaid Ilmiyah • Google Sheets & Drive Engine
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
