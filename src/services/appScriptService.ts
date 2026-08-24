import { AppScriptConfig, Exam, ExamSubmission, Question, User } from '../types';

export const DEFAULT_APPSCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxXFaiwQDGXMeuKCnNrvaM4AgVPavw96uMfYQazIYM6JFLRYp68mVrnwJAhL9QYoJGS5w/exec';
export const DRIVE_FOLDER_ID = '1lVPvFZGlPYQgb1hMoTANO05nXeDMZClh';
export const DRIVE_FOLDER_URL = 'https://drive.google.com/drive/folders/1lVPvFZGlPYQgb1hMoTANO05nXeDMZClh?usp=sharing';
export const SMP_LOGO_URL = 'https://i.ibb.co.com/TDzHjMjZ/Logo-SMP.png';

export const APPSCRIPT_CODE_TEMPLATE = `/**
 * =========================================================================
 * GOOGLE APPS SCRIPT DATABASE & DRIVE ENDPOINT - CBT SMP DARUL FAWAID ILMIYAH
 * =========================================================================
 * 
 * PETUNJUK SETUP DATABASE GOOGLE SPREADSHEET:
 * 1. Buka Google Spreadsheet baru di Google Drive Anda (misal: "Database CBT SMP").
 * 2. Klik menu "Ekstensi" (Extensions) -> "Apps Script".
 * 3. Hapus seluruh isi default, lalu salin dan tempel (Paste) seluruh skrip ini.
 * 4. Klik tombol "Deploy" (Terapkan) di kanan atas -> "New deployment" (Penerapan baru).
 * 5. Pilih Jenis (Select type): "Web App" (Aplikasi Web).
 * 6. Set Description: "CBT SMP Production v1".
 * 7. Pada 'Execute as' (Jalankan sebagai): Pilih "Me" (Saya / Akun Anda).
 * 8. Pada 'Who has access' (Siapa yang memiliki akses): Pilih "Anyone" (Siapa saja).
 * 9. Klik "Deploy", izinkan hak akses (Authorize access / Advance -> Go to Script), lalu salin URL Web App.
 * 10. Buka Webapp CBT SMP -> Pengaturan Spreadsheet -> Tempel Web App URL.
 */

var DRIVE_FOLDER_ID = "1lVPvFZGlPYQgb1hMoTANO05nXeDMZClh"; // Folder Google Drive untuk Upload Gambar Soal

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
    
    var params = {};
    if (e && e.parameter) {
      params = e.parameter;
    }
    
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
      result.message = 'Koneksi Google Apps Script CBT SMP Aktif!';
      result.spreadsheetTitle = ss.getName();
      result.spreadsheetUrl = ss.getUrl();
      result.driveFolderId = DRIVE_FOLDER_ID;
    } 
    else if (action === 'initDatabase') {
      initSpreadsheetStructure(ss);
      result.message = 'Struktur tabel Spreadsheet (Users, Exams, Questions, Submissions) berhasil diinisialisasi!';
    }
    else if (action === 'getAllData') {
      result.users = getSheetData(ss, 'Users');
      result.exams = getSheetData(ss, 'Exams');
      result.questions = getSheetData(ss, 'Questions');
      result.submissions = getSheetData(ss, 'Submissions');
      result.message = 'Data berhasil dimuat dari Google Sheets';
    }
    else if (action === 'saveUsers') {
      if (Array.isArray(payload)) {
        setSheetData(ss, 'Users', payload);
        result.message = 'Data ' + payload.length + ' pengguna (Admin/Guru/Siswa) berhasil disimpan.';
      }
    }
    else if (action === 'saveExams') {
      if (Array.isArray(payload)) {
        setSheetData(ss, 'Exams', payload);
        result.message = 'Data ' + payload.length + ' paket ujian berhasil disimpan.';
      }
    }
    else if (action === 'saveQuestions') {
      if (Array.isArray(payload)) {
        setSheetData(ss, 'Questions', payload);
        result.message = 'Data ' + payload.length + ' butir soal berhasil disimpan.';
      }
    }
    else if (action === 'saveSubmissions' || action === 'submitExam') {
      var submissions = Array.isArray(payload) ? payload : [payload];
      appendOrUpdateSubmissions(ss, submissions);
      result.message = 'Hasil ujian siswa berhasil dicatat ke Google Sheets!';
    }
    else if (action === 'uploadImage') {
      // Upload question image to Google Drive folder
      var uploadResult = handleDriveImageUpload(payload);
      result.fileUrl = uploadResult.fileUrl;
      result.directUrl = uploadResult.directUrl;
      result.fileId = uploadResult.fileId;
      result.message = 'Gambar soal berhasil diunggah ke Google Drive!';
    }
    else if (action === 'syncAll') {
      if (payload) {
        if (payload.users) setSheetData(ss, 'Users', payload.users);
        if (payload.exams) setSheetData(ss, 'Exams', payload.exams);
        if (payload.questions) setSheetData(ss, 'Questions', payload.questions);
        if (payload.submissions) setSheetData(ss, 'Submissions', payload.submissions);
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
 * Inisialisasi Sheet & Header Kolom Otomatis
 */
function initSpreadsheetStructure(ss) {
  var requiredSheets = {
    'Users': ['id', 'username', 'password', 'nama', 'role', 'nisOrNip', 'kelas', 'email', 'phone', 'subjectSpecialty'],
    'Exams': ['id', 'title', 'subject', 'targetClass', 'teacherId', 'teacherName', 'durationMinutes', 'passingGrade', 'token', 'status', 'startDate', 'endDate', 'instructions', 'randomizeQuestions', 'randomizeOptions', 'showResultDirectly', 'antiCheatEnabled', 'totalQuestions', 'maxScore'],
    'Questions': ['id', 'examId', 'number', 'type', 'questionText', 'imageUrl', 'optionsJson', 'correctAnswer', 'points', 'explanation'],
    'Submissions': ['id', 'examId', 'examTitle', 'subject', 'studentId', 'studentName', 'studentNis', 'studentClass', 'startTime', 'submitTime', 'status', 'totalScore', 'maxScore', 'percentageScore', 'passed', 'cheatWarningsCount', 'answersJson']
  };
  
  for (var sheetName in requiredSheets) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(requiredSheets[sheetName]);
      sheet.getRange(1, 1, 1, requiredSheets[sheetName].length)
        .setFontWeight('bold')
        .setBackground('#1E293B')
        .setFontColor('#FFFFFF');
      sheet.setFrozenRows(1);
    }
  }
}

/**
 * Upload Image ke Google Drive Folder
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
  
  // Set permission to anyone with link viewable
  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (err) {}
  
  var fileId = file.getId();
  var directUrl = "https://lh3.googleusercontent.com/d/" + fileId;
  var viewUrl = file.getUrl();
  
  return {
    fileId: fileId,
    fileUrl: viewUrl,
    directUrl: directUrl
  };
}

function getSheetData(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  var values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  
  var headers = values[0];
  var rows = [];
  
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var item = {};
    for (var j = 0; j < headers.length; j++) {
      var val = row[j];
      var key = headers[j];
      if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
        try { val = JSON.parse(val); } catch (e) {}
      }
      item[key] = val;
    }
    rows.push(item);
  }
  return rows;
}

function setSheetData(ss, sheetName, dataArray) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    initSpreadsheetStructure(ss);
    sheet = ss.getSheetByName(sheetName);
  }
  
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn() || 1).getValues()[0];
  if (!headers || headers.length === 0 || headers[0] === '') {
    initSpreadsheetStructure(ss);
    headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  }
  
  sheet.clearContents();
  sheet.appendRow(headers);
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#1E293B')
    .setFontColor('#FFFFFF');
  sheet.setFrozenRows(1);
  
  if (dataArray.length === 0) return;
  
  var rows = [];
  for (var i = 0; i < dataArray.length; i++) {
    var item = dataArray[i];
    var row = [];
    for (var j = 0; j < headers.length; j++) {
      var key = headers[j];
      var val = item[key];
      if (val === undefined || val === null) {
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

function appendOrUpdateSubmissions(ss, submissions) {
  var sheet = ss.getSheetByName('Submissions');
  if (!sheet) {
    initSpreadsheetStructure(ss);
    sheet = ss.getSheetByName('Submissions');
  }
  
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var existingValues = sheet.getDataRange().getValues();
  var idIndex = headers.indexOf('id');
  
  submissions.forEach(function(sub) {
    var rowData = [];
    for (var j = 0; j < headers.length; j++) {
      var key = headers[j];
      var val = sub[key];
      if (key === 'answersJson') {
        val = JSON.stringify(sub.answers || {});
      } else if (typeof val === 'object' && val !== null) {
        val = JSON.stringify(val);
      } else if (val === undefined || val === null) {
        val = '';
      }
      rowData.push(val);
    }
    
    var updated = false;
    if (existingValues.length > 1 && idIndex !== -1) {
      for (var r = 1; r < existingValues.length; r++) {
        if (existingValues[r][idIndex] == sub.id) {
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
   * Test connection to Google Apps Script Web App
   */
  public async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    if (!this.config.webAppUrl || !this.config.webAppUrl.trim().startsWith('http')) {
      return {
        success: false,
        message: 'URL Google Apps Script belum diisi dengan benar.',
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
        message: data.message || 'Koneksi ke Google Sheets & Apps Script berhasil terverifikasi!',
        details: data,
      };
    } catch (err: any) {
      console.warn('Apps Script direct test warning:', err);
      return {
        success: false,
        message: `Gagal menghubungkan ke Apps Script: ${err.message || 'Pastikan deployment disetel ke "Anyone" (Siapa Saja) dan URL Web App valid.'}`,
      };
    }
  }

  /**
   * Send data to Google Apps Script endpoint
   */
  public async sendToSheet(action: string, data: any): Promise<{ success: boolean; message: string; resultData?: any }> {
    if (!this.config.webAppUrl || !this.config.webAppUrl.trim().startsWith('http')) {
      return {
        success: false,
        message: 'Google Apps Script URL belum dikonfigurasi. Data tersimpan di penyimpanan lokal browser.',
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
          'Content-Type': 'text/plain;charset=utf-8', // Apps Script handles text/plain without CORS preflight block
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      return {
        success: result.success ?? true,
        message: result.message || 'Data berhasil dikirim ke Google Sheets',
        resultData: result,
      };
    } catch (err: any) {
      console.warn('Apps Script sync notice:', err);
      return {
        success: false,
        message: `Penyimpanan online tertunda: ${err.message}. Data aman tersimpan di lokal.`,
      };
    }
  }

  /**
   * Upload image to Google Drive folder via Apps Script
   */
  public async uploadImageToDrive(
    base64Data: string,
    fileName?: string,
    mimeType?: string
  ): Promise<{ success: boolean; fileUrl?: string; directUrl?: string; message: string }> {
    if (!this.config.webAppUrl || !this.config.webAppUrl.trim().startsWith('http')) {
      // Fallback: If not connected to Apps Script, return local base64 preview
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
        // Fallback to base64 so user's work is never lost
        return {
          success: true,
          directUrl: base64Data,
          fileUrl: base64Data,
          message: 'Gambar disimpan sebagai data lokal (Apps Script Drive fallback).',
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
   * Sync all data (Users, Exams, Questions, Submissions) to Google Sheet
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
   * Fetch all data from Google Sheet
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
        message: 'Google Apps Script URL belum dikonfigurasi.',
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
        message: 'Berhasil memuat data terbaru dari Google Sheets',
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Gagal mengambil data: ${err.message}`,
      };
    }
  }
}

