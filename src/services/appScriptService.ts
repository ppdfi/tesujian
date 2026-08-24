/**
 * ============================================================================
 * LAYANAN INTEGRASI GOOGLE APPS SCRIPT, SPREADSHEET & DRIVE
 * CBT SMP DARUL FAWAID ILMIYAH
 * ============================================================================
 * Fitur:
 * 1. Template Google Apps Script lengkap dengan Sheet & Header Bahasa Indonesia
 * 2. Inisialisasi struktur Sheet (PENGGUNA, PAKET_UJIAN, BANK_SOAL, LEMBAR_JAWABAN, RINGKASAN_STATISTIK, PROFIL_LEMBAGA)
 * 3. Rumus otomatis Google Spreadsheet untuk persentase nilai dan ringkasan statistik
 * 4. Sinkronisasi bi-directional (Bisa dibaca & ditulis langsung dari webapp atau spreadsheet)
 * 5. Unggah berkas gambar/foto soal langsung ke Google Drive
 */

import { AppScriptConfig, Exam, ExamSubmission, Question, User, InstitutionProfile } from '../types';

export const DEFAULT_APPSCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxXFaiwQDGXMeuKCnNrvaM4AgVPavw96uMfYQazIYM6JFLRYp68mVrnwJAhL9QYoJGS5w/exec';
export const DRIVE_FOLDER_ID = '1lVPvFZGlPYQgb1hMoTANO05nXeDMZClh';
export const DRIVE_FOLDER_URL = 'https://drive.google.com/drive/folders/1lVPvFZGlPYQgb1hMoTANO05nXeDMZClh?usp=sharing';
export const SMP_LOGO_URL = 'https://i.ibb.co.com/TDzHjMjZ/Logo-SMP.png';

/**
 * SKRIP GOOGLE APPS SCRIPT DENGAN NAMA SHEET & HEADER BAHASA INDONESIA
 * Dilengkapi fungsi inisialisasi tabel, rumus spreadsheet otomatis, dan data placeholder
 */
export const APPSCRIPT_CODE_TEMPLATE = `/**
 * ============================================================================
 * GOOGLE APPS SCRIPT BACKEND - CBT SMP DARUL FAWAID ILMIYAH
 * ============================================================================
 * Nama Sheet & Header Berbahasa Indonesia
 * 
 * PANDUAN SETUP CEPAT (1 MENIT):
 * 1. Buat Google Spreadsheet baru di Google Drive Anda (misal: "Database CBT SMP").
 * 2. Buka menu "Ekstensi" (Extensions) -> "Apps Script".
 * 3. Hapus seluruh isi kode bawaan, lalu salin dan tempel (Paste) seluruh isi script ini.
 * 4. Klik tombol "Deploy" (Terapkan) di kanan atas -> pilih "New deployment" (Penerapan baru).
 * 5. Pilih Jenis: "Web App" (Aplikasi Web).
 * 6. Deskripsi: "CBT SMP Production v2".
 * 7. Execute as: "Me" (Akun Anda).
 * 8. Who has access: "Anyone" (Siapa saja).
 * 9. Klik "Deploy", izinkan akses akun (Authorize access), lalu salin "Web app URL".
 * 10. Tempel Web App URL pada menu Konfigurasi Database di Webapp CBT SMP.
 */

var DRIVE_FOLDER_ID = "1lVPvFZGlPYQgb1hMoTANO05nXeDMZClh"; // ID Folder Google Drive untuk foto soal

// Peta Kamus Kolom Bahasa Indonesia <-> Properti Aplikasi
var COLUMN_MAP = {
  PENGGUNA: {
    headers: ['ID_PENGGUNA', 'USERNAME', 'PASSWORD', 'NAMA_LENGKAP', 'PERAN', 'NIS_ATAU_NO_HP', 'KELAS', 'EMAIL', 'NO_WHATSAPP', 'MAPEL_PENGAMPU'],
    keys: ['id', 'username', 'password', 'nama', 'role', 'nisOrNip', 'kelas', 'email', 'phone', 'subjectSpecialty']
  },
  PAKET_UJIAN: {
    headers: ['ID_UJIAN', 'JUDUL_UJIAN', 'MATA_PELAJARAN', 'SASARAN_KELAS', 'ID_GURU', 'NAMA_GURU', 'DURASI_MENIT', 'TOKEN_MASUK', 'STATUS', 'WAKTU_MULAI', 'WAKTU_SELESAI', 'PETUNJUK', 'ACAK_SOAL', 'ACAK_PILIHAN', 'ANTI_CURANG', 'TOTAL_SOAL', 'TOTAL_POIN'],
    keys: ['id', 'title', 'subject', 'targetClass', 'teacherId', 'teacherName', 'durationMinutes', 'token', 'status', 'startDate', 'endDate', 'instructions', 'randomizeQuestions', 'randomizeOptions', 'antiCheatEnabled', 'totalQuestions', 'maxScore']
  },
  BANK_SOAL: {
    headers: ['ID_SOAL', 'ID_UJIAN', 'NOMOR_URUT', 'TIPE_SOAL', 'TEKS_SOAL', 'URL_GAMBAR', 'PILIHAN_OPSI_JSON', 'KUNCI_JAWABAN', 'BOBOT_POIN', 'PEMBAHASAN'],
    keys: ['id', 'examId', 'number', 'type', 'questionText', 'imageUrl', 'options', 'correctAnswer', 'points', 'explanation']
  },
  LEMBAR_JAWABAN: {
    headers: ['ID_JAWABAN', 'ID_UJIAN', 'JUDUL_UJIAN', 'MATA_PELAJARAN', 'ID_SISWA', 'NAMA_SISWA', 'NIS_SISWA', 'KELAS_SISWA', 'WAKTU_MULAI', 'WAKTU_SELESAI', 'STATUS', 'NILAI_TOTAL', 'NILAI_MAKSIMAL', 'NILAI_PERSEN_100', 'PERINGATAN_PINDAH_TAB', 'RINCIAN_JAWABAN_JSON'],
    keys: ['id', 'examId', 'examTitle', 'subject', 'studentId', 'studentName', 'studentNis', 'studentClass', 'startTime', 'submitTime', 'status', 'totalScore', 'maxScore', 'percentageScore', 'cheatWarningsCount', 'answers']
  },
  PROFIL_LEMBAGA: {
    headers: ['NAMA_SEKOLAH', 'TAGLINE', 'NPSN', 'TAHUN_AJARAN', 'SEMESTER', 'KEPALA_SEKOLAH', 'KETUA_PANITIA', 'ALAMAT', 'NO_KONTAK', 'EMAIL', 'URL_LOGO', 'URL_DRIVE_FOLDER'],
    keys: ['name', 'tagline', 'npsn', 'academicYear', 'semester', 'kepalaSekolah', 'ketuaPanitia', 'address', 'phone', 'email', 'logoUrl', 'driveFolderUrl']
  }
};

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(30000);
  
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    initSpreadsheetStructure(ss);
    
    var params = (e && e.parameter) ? e.parameter : {};
    var postData = null;
    if (e && e.postData && e.postData.contents) {
      try {
        postData = JSON.parse(e.postData.contents);
      } catch (err) {
        postData = e.parameter;
      }
    }
    
    var action = (postData && postData.action) || params.action || 'ping';
    var payload = (postData && postData.data) || null;
    
    var result = { 
      success: true, 
      action: action, 
      timestamp: new Date().toISOString() 
    };
    
    if (action === 'ping') {
      result.message = 'Koneksi Google Spreadsheet & Apps Script Aktif!';
      result.spreadsheetTitle = ss.getName();
      result.spreadsheetUrl = ss.getUrl();
      result.driveFolderId = DRIVE_FOLDER_ID;
    } 
    else if (action === 'initDatabase') {
      initSpreadsheetStructure(ss, true);
      result.message = 'Seluruh Sheet Bahasa Indonesia (PENGGUNA, PAKET_UJIAN, BANK_SOAL, LEMBAR_JAWABAN, RINGKASAN_STATISTIK, PROFIL_LEMBAGA) berhasil dibuat dan diformat!';
    }
    else if (action === 'getAllData') {
      result.users = getSheetRecords(ss, 'PENGGUNA');
      result.exams = getSheetRecords(ss, 'PAKET_UJIAN');
      result.questions = getSheetRecords(ss, 'BANK_SOAL');
      result.submissions = getSheetRecords(ss, 'LEMBAR_JAWABAN');
      result.message = 'Data berhasil dimuat dari Google Spreadsheet';
    }
    else if (action === 'saveUsers') {
      if (Array.isArray(payload)) {
        setSheetRecords(ss, 'PENGGUNA', payload);
        result.message = 'Data ' + payload.length + ' pengguna tersimpan di sheet PENGGUNA.';
      }
    }
    else if (action === 'saveExams') {
      if (Array.isArray(payload)) {
        setSheetRecords(ss, 'PAKET_UJIAN', payload);
        result.message = 'Data ' + payload.length + ' paket ujian tersimpan di sheet PAKET_UJIAN.';
      }
    }
    else if (action === 'saveQuestions') {
      if (Array.isArray(payload)) {
        setSheetRecords(ss, 'BANK_SOAL', payload);
        result.message = 'Data ' + payload.length + ' butir soal tersimpan di sheet BANK_SOAL.';
      }
    }
    else if (action === 'saveSubmissions' || action === 'submitExam') {
      var submissions = Array.isArray(payload) ? payload : [payload];
      appendOrUpdateSubmissions(ss, submissions);
      result.message = 'Lembar jawaban siswa berhasil dicatat ke sheet LEMBAR_JAWABAN.';
    }
    else if (action === 'uploadImage') {
      var uploadResult = handleDriveImageUpload(payload);
      result.fileUrl = uploadResult.fileUrl;
      result.directUrl = uploadResult.directUrl;
      result.fileId = uploadResult.fileId;
      result.message = 'Foto/gambar soal berhasil diunggah ke Google Drive!';
    }
    else if (action === 'syncAll') {
      if (payload) {
        if (payload.users) setSheetRecords(ss, 'PENGGUNA', payload.users);
        if (payload.exams) setSheetRecords(ss, 'PAKET_UJIAN', payload.exams);
        if (payload.questions) setSheetRecords(ss, 'BANK_SOAL', payload.questions);
        if (payload.submissions) setSheetRecords(ss, 'LEMBAR_JAWABAN', payload.submissions);
        result.message = 'Semua data CBT SMP berhasil disinkronisasi penuh ke Spreadsheet';
      }
    }
    else {
      result.success = false;
      result.message = 'Aksi ' + action + ' tidak dikenali.';
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Inisialisasi Sheet & Rumus Spreadsheet Otomatis
 */
function initSpreadsheetStructure(ss, forcePlaceholder) {
  for (var sheetName in COLUMN_MAP) {
    var sheet = ss.getSheetByName(sheetName);
    var mapping = COLUMN_MAP[sheetName];
    
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(mapping.headers);
      sheet.getRange(1, 1, 1, mapping.headers.length)
        .setFontWeight('bold')
        .setBackground('#1E293B')
        .setFontColor('#FFFFFF')
        .setHorizontalAlignment('center');
      sheet.setFrozenRows(1);
      
      if (forcePlaceholder) {
        populateSampleRows(sheet, sheetName);
      }
    }
  }
  
  // Buat Sheet Ringkasan Statistik jika belum ada
  initSummarySheet(ss);
}

/**
 * Buat Sheet Ringkasan Statistik dengan Rumus Otomatis Google Sheets
 */
function initSummarySheet(ss) {
  var sheetName = 'RINGKASAN_STATISTIK';
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName, 0); // Tempatkan di tab paling awal
    
    sheet.getRange('A1:C1').merge()
      .setValue('RINGKASAN & STATISTIK CBT SMP DARUL FAWAID ILMIYAH')
      .setFontWeight('bold')
      .setFontSize(13)
      .setBackground('#1E293B')
      .setFontColor('#FFFFFF')
      .setHorizontalAlignment('center');
      
    sheet.appendRow(['INDIKATOR STATISTIK', 'JUMLAH / HASIL', 'RUMUS FORMULA SPREADSHEET']);
    sheet.getRange(2, 1, 1, 3)
      .setFontWeight('bold')
      .setBackground('#334155')
      .setFontColor('#FFFFFF');
      
    var rows = [
      ['Total Siswa Terdaftar', '=COUNTIF(PENGGUNA!E2:E, "siswa")', '=COUNTIF(PENGGUNA!E2:E, "siswa")'],
      ['Total Guru Mata Pelajaran', '=COUNTIF(PENGGUNA!E2:E, "guru")', '=COUNTIF(PENGGUNA!E2:E, "guru")'],
      ['Total Paket Ujian CBT', '=IFERROR(COUNTA(PAKET_UJIAN!A2:A), 0)', '=IFERROR(COUNTA(PAKET_UJIAN!A2:A), 0)'],
      ['Total Lembar Jawaban Siswa', '=IFERROR(COUNTA(LEMBAR_JAWABAN!A2:A), 0)', '=IFERROR(COUNTA(LEMBAR_JAWABAN!A2:A), 0)'],
      ['Rata-Rata Nilai Siswa (Skala 100)', '=IFERROR(AVERAGE(LEMBAR_JAWABAN!N2:N), 0)', '=IFERROR(AVERAGE(LEMBAR_JAWABAN!N2:N), 0)'],
      ['Nilai Tertinggi Siswa', '=IFERROR(MAX(LEMBAR_JAWABAN!N2:N), 0)', '=IFERROR(MAX(LEMBAR_JAWABAN!N2:N), 0)'],
      ['Nilai Terendah Siswa', '=IFERROR(MIN(LEMBAR_JAWABAN!N2:N), 0)', '=IFERROR(MIN(LEMBAR_JAWABAN!N2:N), 0)']
    ];
    
    for (var r = 0; r < rows.length; r++) {
      sheet.appendRow(rows[r]);
    }
    
    sheet.setColumnWidth(1, 280);
    sheet.setColumnWidth(2, 160);
    sheet.setColumnWidth(3, 300);
    sheet.setFrozenRows(2);
  }
}

/**
 * Data Placeholder Awal saat Database Diinisialisasi
 */
function populateSampleRows(sheet, sheetName) {
  if (sheetName === 'PENGGUNA') {
    sheet.appendRow(['u-admin-1', 'admin', '123', 'Abdullah Robbani, S.Pd.', 'admin', '081299887766', '-', 'admin.cbt@smpdf.sch.id', '081299887766', '-']);
    sheet.appendRow(['u-guru-1', 'budi.santoso', '123', 'Budi Santoso, S.Pd.', 'guru', '081311223344', '-', 'budi.santoso@smpdf.sch.id', '081311223344', 'Matematika & Informatika']);
    sheet.appendRow(['u-guru-2', 'siti.rahmawati', '123', 'Siti Rahmawati, M.Pd.', 'guru', '081355667788', '-', 'siti.rahmawati@smpdf.sch.id', '081355667788', 'Ilmu Pengetahuan Alam (IPA)']);
    sheet.appendRow(['u-siswa-1', 'andi.pratama', '123', 'Andi Pratama', 'siswa', '2025.07.001', 'Kelas 7A', 'andi.p@siswa.smpdf.sch.id', '085712345671', '-']);
    sheet.appendRow(['u-siswa-2', 'fatimah.zahra', '123', 'Fatimah Az-Zahra', 'siswa', '2025.07.002', 'Kelas 7A', 'fatimah.z@siswa.smpdf.sch.id', '085712345672', '-']);
    sheet.appendRow(['u-siswa-3', 'muhammad.faiz', '123', 'Muhammad Faiz', 'siswa', '2025.07.003', 'Kelas 7A', 'm.faiz@siswa.smpdf.sch.id', '085712345673', '-']);
    sheet.appendRow(['u-siswa-4', 'nurul.hidayah', '123', 'Nurul Hidayah', 'siswa', '2025.07.004', 'Kelas 7B', 'nurul.h@siswa.smpdf.sch.id', '085712345674', '-']);
  }
}

/**
 * Unggah Gambar ke Google Drive
 */
function handleDriveImageUpload(payload) {
  if (!payload || !payload.base64Data) {
    throw new Error('Data gambar (base64Data) tidak ditemukan.');
  }
  
  var folder;
  try {
    folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  } catch (e) {
    folder = DriveApp.getRootFolder();
  }
  
  var base64Str = payload.base64Data;
  if (base64Str.indexOf('base64,') > -1) {
    base64Str = base64Str.split('base64,')[1];
  }
  
  var decoded = Utilities.base64Decode(base64Str);
  var mimeType = payload.mimeType || 'image/jpeg';
  var fileName = payload.fileName || ('soal_cbt_' + Date.now() + '.jpg');
  
  var blob = Utilities.newBlob(decoded, mimeType, fileName);
  var file = folder.createFile(blob);
  
  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (err) {}
  
  var fileId = file.getId();
  var directUrl = "https://lh3.googleusercontent.com/d/" + fileId;
  
  return {
    fileId: fileId,
    fileUrl: file.getUrl(),
    directUrl: directUrl
  };
}

/**
 * Baca Data dari Sheet dengan Pemetaan Kolom
 */
function getSheetRecords(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  
  var values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  
  var headers = values[0];
  var mapping = COLUMN_MAP[sheetName];
  var rows = [];
  
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var item = {};
    for (var j = 0; j < headers.length; j++) {
      var headerName = headers[j];
      var val = row[j];
      
      // Temukan key internal yang sesuai
      var keyIndex = mapping ? mapping.headers.indexOf(headerName) : -1;
      var propKey = (keyIndex > -1) ? mapping.keys[keyIndex] : headerName;
      
      if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
        try { val = JSON.parse(val); } catch (e) {}
      }
      item[propKey] = val;
    }
    rows.push(item);
  }
  return rows;
}

/**
 * Tulis / Timpa Data ke Sheet dengan Header Indonesia
 */
function setSheetRecords(ss, sheetName, dataArray) {
  var sheet = ss.getSheetByName(sheetName);
  var mapping = COLUMN_MAP[sheetName];
  
  if (!sheet) {
    initSpreadsheetStructure(ss, false);
    sheet = ss.getSheetByName(sheetName);
  }
  
  var headers = mapping ? mapping.headers : sheet.getRange(1, 1, 1, sheet.getLastColumn() || 1).getValues()[0];
  var keys = mapping ? mapping.keys : headers;
  
  sheet.clearContents();
  sheet.appendRow(headers);
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#1E293B')
    .setFontColor('#FFFFFF')
    .setHorizontalAlignment('center');
  sheet.setFrozenRows(1);
  
  if (!dataArray || dataArray.length === 0) return;
  
  var rows = [];
  for (var i = 0; i < dataArray.length; i++) {
    var item = dataArray[i];
    var row = [];
    for (var j = 0; j < keys.length; j++) {
      var key = keys[j];
      var val = item[key];
      
      // Khusus rumus persentase di LEMBAR_JAWABAN kolom N (NILAI_PERSEN_100)
      if (sheetName === 'LEMBAR_JAWABAN' && key === 'percentageScore') {
        var rowNum = i + 2;
        val = '=IF(M' + rowNum + '>0, ROUND((L' + rowNum + '/M' + rowNum + ')*100, 1), 0)';
      } else if (val === undefined || val === null) {
        val = '';
      } else if (typeof val === 'object') {
        val = JSON.stringify(val);
      }
      row.push(val);
    }
    rows.push(row);
  }
  
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }
}

/**
 * Tambah / Perbarui Lembar Jawaban Siswa
 */
function appendOrUpdateSubmissions(ss, submissions) {
  var sheet = ss.getSheetByName('LEMBAR_JAWABAN');
  var mapping = COLUMN_MAP['LEMBAR_JAWABAN'];
  
  if (!sheet) {
    initSpreadsheetStructure(ss, false);
    sheet = ss.getSheetByName('LEMBAR_JAWABAN');
  }
  
  var headers = mapping.headers;
  var keys = mapping.keys;
  var existingValues = sheet.getDataRange().getValues();
  var idIndex = 0; // ID_JAWABAN berada di kolom pertama (index 0)
  
  submissions.forEach(function(sub) {
    var rowData = [];
    var rowNum = existingValues.length + 1;
    
    for (var j = 0; j < keys.length; j++) {
      var key = keys[j];
      var val = sub[key];
      
      if (key === 'answers') {
        val = JSON.stringify(sub.answers || {});
      } else if (key === 'percentageScore') {
        val = '=IF(M' + rowNum + '>0, ROUND((L' + rowNum + '/M' + rowNum + ')*100, 1), 0)';
      } else if (typeof val === 'object' && val !== null) {
        val = JSON.stringify(val);
      } else if (val === undefined || val === null) {
        val = '';
      }
      rowData.push(val);
    }
    
    var updated = false;
    if (existingValues.length > 1) {
      for (var r = 1; r < existingValues.length; r++) {
        if (existingValues[r][idIndex] == sub.id) {
          // Update baris yang sudah ada
          rowData[13] = '=IF(M' + (r + 1) + '>0, ROUND((L' + (r + 1) + '/M' + (r + 1) + ')*100, 1), 0)';
          sheet.getRange(r + 1, 1, 1, headers.length).setValues([rowData]);
          updated = true;
          break;
        }
      }
    }
    
    if (!updated) {
      sheet.appendRow(rowData);
    }
  });
}
`;

export class AppScriptService {
  private config: AppScriptConfig;

  constructor(config: AppScriptConfig) {
    this.config = config;
  }

  public updateConfig(newConfig: Partial<AppScriptConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): AppScriptConfig {
    return this.config;
  }

  /**
   * Tes koneksi ke Web App Google Apps Script
   */
  public async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    if (!this.config.webAppUrl || !this.config.webAppUrl.trim().startsWith('http')) {
      return {
        success: false,
        message: 'URL Google Apps Script belum diisi.',
      };
    }

    try {
      const targetUrl = new URL(this.config.webAppUrl);
      targetUrl.searchParams.set('action', 'ping');
      targetUrl.searchParams.set('_t', Date.now().toString());

      const response = await fetch(targetUrl.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: data.success ?? true,
        message: data.message || 'Koneksi ke Google Spreadsheet & Apps Script berhasil!',
        details: data,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Gagal menghubungi Apps Script: ${err.message || 'Pastikan deployment disetel ke "Anyone" (Siapa Saja).'}`
      };
    }
  }

  /**
   * Kirim permintaan POST data ke Google Apps Script
   */
  public async sendToSheet(action: string, data: any): Promise<{ success: boolean; message: string; resultData?: any }> {
    if (!this.config.webAppUrl || !this.config.webAppUrl.trim().startsWith('http')) {
      return {
        success: false,
        message: 'URL Google Apps Script belum dikonfigurasi. Data tersimpan di penyimpanan lokal.',
      };
    }

    try {
      const payload = {
        action,
        data,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(this.config.webAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      return {
        success: result.success ?? true,
        message: result.message || 'Data berhasil dikirim ke Google Spreadsheet',
        resultData: result,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Penyimpanan online tertunda: ${err.message}. Data aman tersimpan di lokal.`,
      };
    }
  }

  /**
   * Upload gambar soal ke Google Drive folder melalui Apps Script
   */
  public async uploadImageToDrive(
    base64Data: string,
    fileName?: string,
    mimeType?: string
  ): Promise<{ success: boolean; fileUrl?: string; directUrl?: string; message: string }> {
    if (!this.config.webAppUrl || !this.config.webAppUrl.trim().startsWith('http')) {
      return {
        success: true,
        directUrl: base64Data,
        fileUrl: base64Data,
        message: 'Gambar tersimpan di data lokal ujian.',
      };
    }

    try {
      const response = await this.sendToSheet('uploadImage', {
        base64Data,
        fileName: fileName || `soal_${Date.now()}.jpg`,
        mimeType: mimeType || 'image/jpeg',
      });

      if (response.success && response.resultData) {
        return {
          success: true,
          directUrl: response.resultData.directUrl || response.resultData.fileUrl || base64Data,
          fileUrl: response.resultData.fileUrl,
          message: 'Gambar soal berhasil diunggah ke Google Drive!',
        };
      } else {
        return {
          success: true,
          directUrl: base64Data,
          fileUrl: base64Data,
          message: 'Gambar disimpan sebagai data lokal.',
        };
      }
    } catch (err: any) {
      return {
        success: true,
        directUrl: base64Data,
        fileUrl: base64Data,
        message: 'Gambar disimpan secara lokal.',
      };
    }
  }

  /**
   * Sinkronkan semua data ke Google Spreadsheet
   */
  public async syncAllToSheet(payload: {
    users: User[];
    exams: Exam[];
    questions: Question[];
    submissions: ExamSubmission[];
  }): Promise<{ success: boolean; message: string }> {
    return this.sendToSheet('syncAll', payload);
  }

  /**
   * Ambil semua data terbaru dari Google Spreadsheet
   */
  public async fetchAllFromSheet(): Promise<{
    success: boolean;
    users?: User[];
    exams?: Exam[];
    questions?: Question[];
    submissions?: ExamSubmission[];
    message?: string;
  }> {
    if (!this.config.webAppUrl || !this.config.webAppUrl.trim().startsWith('http')) {
      return {
        success: false,
        message: 'URL Google Apps Script belum dikonfigurasi.',
      };
    }

    try {
      const targetUrl = new URL(this.config.webAppUrl);
      targetUrl.searchParams.set('action', 'getAllData');
      targetUrl.searchParams.set('_t', Date.now().toString());

      const response = await fetch(targetUrl.toString(), {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        users: data.users || [],
        exams: data.exams || [],
        questions: data.questions || [],
        submissions: data.submissions || [],
        message: 'Berhasil memuat data terbaru dari Google Spreadsheet',
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Gagal mengambil data dari Spreadsheet: ${err.message}`,
      };
    }
  }
}
