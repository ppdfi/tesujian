import {
  User,
  Exam,
  Question,
  ExamSubmission,
  InstitutionProfile,
  AppScriptConfig,
} from '../types';
import {
  INITIAL_INSTITUTION,
  INITIAL_USERS,
  INITIAL_EXAMS,
  INITIAL_QUESTIONS,
  INITIAL_SUBMISSIONS,
} from '../data/initialData';
import { DEFAULT_APPSCRIPT_URL, DRIVE_FOLDER_ID } from './appScriptService';

const KEYS = {
  VERSION: 'smp_cbt_v2_initialized',
  INSTITUTION: 'smp_cbt_institution',
  USERS: 'smp_cbt_users',
  EXAMS: 'smp_cbt_exams',
  QUESTIONS: 'smp_cbt_questions',
  SUBMISSIONS: 'smp_cbt_submissions',
  APPSCRIPT_CONFIG: 'smp_cbt_appscript_config',
  CURRENT_USER: 'smp_cbt_current_user',
};

// Ensure fresh SMP initialization
function checkVersionInit() {
  try {
    const initialized = localStorage.getItem(KEYS.VERSION);
    if (!initialized) {
      localStorage.setItem(KEYS.INSTITUTION, JSON.stringify(INITIAL_INSTITUTION));
      localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
      localStorage.setItem(KEYS.EXAMS, JSON.stringify(INITIAL_EXAMS));
      localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(INITIAL_QUESTIONS));
      localStorage.setItem(KEYS.SUBMISSIONS, JSON.stringify(INITIAL_SUBMISSIONS));
      localStorage.setItem(
        KEYS.APPSCRIPT_CONFIG,
        JSON.stringify({
          webAppUrl: DEFAULT_APPSCRIPT_URL,
          driveFolderId: DRIVE_FOLDER_ID,
          autoSync: true,
          isConnected: true,
          statusMessage: 'Terhubung ke Google Apps Script Spreadsheet & Drive SMP',
        })
      );
      localStorage.setItem(KEYS.VERSION, 'true');
    }
  } catch (e) {}
}

checkVersionInit();

export const StorageService = {
  getInstitution(): InstitutionProfile {
    try {
      const data = localStorage.getItem(KEYS.INSTITUTION);
      return data ? JSON.parse(data) : INITIAL_INSTITUTION;
    } catch {
      return INITIAL_INSTITUTION;
    }
  },

  saveInstitution(profile: InstitutionProfile): void {
    localStorage.setItem(KEYS.INSTITUTION, JSON.stringify(profile));
  },

  getUsers(): User[] {
    try {
      const data = localStorage.getItem(KEYS.USERS);
      return data ? JSON.parse(data) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  },

  saveUsers(users: User[]): void {
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  },

  getExams(): Exam[] {
    try {
      const data = localStorage.getItem(KEYS.EXAMS);
      return data ? JSON.parse(data) : INITIAL_EXAMS;
    } catch {
      return INITIAL_EXAMS;
    }
  },

  saveExams(exams: Exam[]): void {
    localStorage.setItem(KEYS.EXAMS, JSON.stringify(exams));
  },

  getQuestions(): Question[] {
    try {
      const data = localStorage.getItem(KEYS.QUESTIONS);
      return data ? JSON.parse(data) : INITIAL_QUESTIONS;
    } catch {
      return INITIAL_QUESTIONS;
    }
  },

  saveQuestions(questions: Question[]): void {
    localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(questions));
  },

  getSubmissions(): ExamSubmission[] {
    try {
      const data = localStorage.getItem(KEYS.SUBMISSIONS);
      return data ? JSON.parse(data) : INITIAL_SUBMISSIONS;
    } catch {
      return INITIAL_SUBMISSIONS;
    }
  },

  saveSubmissions(submissions: ExamSubmission[]): void {
    localStorage.setItem(KEYS.SUBMISSIONS, JSON.stringify(submissions));
  },

  getAppScriptConfig(): AppScriptConfig {
    try {
      const data = localStorage.getItem(KEYS.APPSCRIPT_CONFIG);
      return data
        ? JSON.parse(data)
        : {
            webAppUrl: DEFAULT_APPSCRIPT_URL,
            driveFolderId: DRIVE_FOLDER_ID,
            autoSync: true,
            isConnected: true,
            statusMessage: 'Terhubung ke Google Apps Script',
          };
    } catch {
      return {
        webAppUrl: DEFAULT_APPSCRIPT_URL,
        driveFolderId: DRIVE_FOLDER_ID,
        autoSync: true,
        isConnected: true,
      };
    }
  },

  saveAppScriptConfig(config: AppScriptConfig): void {
    localStorage.setItem(KEYS.APPSCRIPT_CONFIG, JSON.stringify(config));
  },

  getCurrentUser(): User | null {
    try {
      const data = localStorage.getItem(KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(KEYS.CURRENT_USER);
    }
  },

  resetToDefault(): void {
    localStorage.setItem(KEYS.INSTITUTION, JSON.stringify(INITIAL_INSTITUTION));
    localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(KEYS.EXAMS, JSON.stringify(INITIAL_EXAMS));
    localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(INITIAL_QUESTIONS));
    localStorage.setItem(KEYS.SUBMISSIONS, JSON.stringify(INITIAL_SUBMISSIONS));
    localStorage.setItem(
      KEYS.APPSCRIPT_CONFIG,
      JSON.stringify({
        webAppUrl: DEFAULT_APPSCRIPT_URL,
        driveFolderId: DRIVE_FOLDER_ID,
        autoSync: true,
        isConnected: true,
      })
    );
  },
};

