import { Question, QuizResult, QuizSettings } from '../types';
import { DEFAULT_QUESTIONS, DEFAULT_QUIZ_SETTINGS, INITIAL_SAMPLE_RESULTS } from '../data/defaultQuiz';

const STORAGE_KEYS = {
  QUESTIONS: 'kao_merchandising_questions_v2',
  SETTINGS: 'kao_merchandising_settings_v2',
  RESULTS: 'kao_merchandising_results_v2',
  ADMIN_PIN: 'kao_merchandising_admin_pin_v2',
  APP_MODE: 'kao_merchandising_mode_v2',
};

// Sort results: highest score first; if tied, faster duration first; if tied, newer first
export function sortResultsDescending(results: QuizResult[]): QuizResult[] {
  return [...results].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    if (a.durationSeconds !== b.durationSeconds) {
      return a.durationSeconds - b.durationSeconds;
    }
    return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
  });
}

export function loadQuestions(): Question[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(DEFAULT_QUESTIONS));
      return DEFAULT_QUESTIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_QUESTIONS;
  } catch (err) {
    console.error('Error loading questions from localStorage:', err);
    return DEFAULT_QUESTIONS;
  }
}

export function saveQuestions(questions: Question[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  } catch (err) {
    console.error('Error saving questions to localStorage:', err);
  }
}

export function loadQuizSettings(): QuizSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_QUIZ_SETTINGS));
      return DEFAULT_QUIZ_SETTINGS;
    }
    return { ...DEFAULT_QUIZ_SETTINGS, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Error loading quiz settings:', err);
    return DEFAULT_QUIZ_SETTINGS;
  }
}

export function saveQuizSettings(settings: QuizSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving quiz settings:', err);
  }
}

export function loadQuizResults(): QuizResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RESULTS);
    if (!raw) {
      const sorted = sortResultsDescending(INITIAL_SAMPLE_RESULTS);
      localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(sorted));
      return sorted;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return sortResultsDescending(parsed);
    }
    return sortResultsDescending(INITIAL_SAMPLE_RESULTS);
  } catch (err) {
    console.error('Error loading quiz results:', err);
    return sortResultsDescending(INITIAL_SAMPLE_RESULTS);
  }
}

export function addQuizResult(newResult: QuizResult): QuizResult[] {
  try {
    const current = loadQuizResults();
    const updated = sortResultsDescending([newResult, ...current]);
    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error adding quiz result:', err);
    return [];
  }
}

export function deleteQuizResult(id: string): QuizResult[] {
  try {
    const current = loadQuizResults();
    const updated = current.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error deleting quiz result:', err);
    return [];
  }
}

export function clearAllQuizResults(): QuizResult[] {
  try {
    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify([]));
    return [];
  } catch (err) {
    console.error('Error clearing quiz results:', err);
    return [];
  }
}

export function resetAllToDefault(): {
  questions: Question[];
  settings: QuizSettings;
  results: QuizResult[];
} {
  saveQuestions(DEFAULT_QUESTIONS);
  saveQuizSettings(DEFAULT_QUIZ_SETTINGS);
  const sortedSample = sortResultsDescending(INITIAL_SAMPLE_RESULTS);
  localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(sortedSample));
  return {
    questions: DEFAULT_QUESTIONS,
    settings: DEFAULT_QUIZ_SETTINGS,
    results: sortedSample,
  };
}

export const DEFAULT_ADMIN_PIN = '1234';

export function getAdminPin(): string {
  try {
    const pin = localStorage.getItem(STORAGE_KEYS.ADMIN_PIN);
    if (!pin) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_PIN, DEFAULT_ADMIN_PIN);
      return DEFAULT_ADMIN_PIN;
    }
    return pin;
  } catch {
    return DEFAULT_ADMIN_PIN;
  }
}

export function saveAdminPin(newPin: string): boolean {
  try {
    if (!/^\d{4,6}$/.test(newPin)) {
      return false;
    }
    localStorage.setItem(STORAGE_KEYS.ADMIN_PIN, newPin);
    return true;
  } catch (err) {
    console.error('Error saving admin pin:', err);
    return false;
  }
}

export function verifyAdminPin(enteredPin: string): boolean {
  const currentPin = getAdminPin();
  return currentPin === enteredPin;
}

export function resetAdminPin(): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ADMIN_PIN, DEFAULT_ADMIN_PIN);
  } catch (err) {
    console.error('Error resetting admin pin:', err);
  }
}

export function getSavedAppMode(): 'md' | 'admin' {
  // Mode MD is always the default mode upon application launch
  return 'md';
}

export function saveAppMode(mode: 'md' | 'admin'): void {
  try {
    if (mode === 'admin') {
      sessionStorage.setItem(STORAGE_KEYS.APP_MODE, 'admin');
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.APP_MODE);
      localStorage.removeItem(STORAGE_KEYS.APP_MODE);
    }
  } catch (err) {
    console.error('Error saving app mode:', err);
  }
}

export function formatDuration(seconds: number): string {
  if (seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return isoString;
  }
}

// Convert results to CSV string
export function exportResultsToCSV(results: QuizResult[]): string {
  const sorted = sortResultsDescending(results);
  const headers = [
    'Peringkat',
    'Nama Karyawan Merchandiser',
    'Area / Store / NIK Karyawan',
    'Skor',
    'Skor Maksimal',
    'Persentase (%)',
    'Jumlah Benar',
    'Total Soal',
    'Status Standar',
    'Waktu Pengerjaan (detik)',
    'Waktu Pengerjaan (menit:detik)',
    'Waktu Submit',
  ];

  const rows = sorted.map((item, index) => {
    return [
      index + 1,
      `"${item.participantName.replace(/"/g, '""')}"`,
      `"${(item.participantIdentifier || '-').replace(/"/g, '""')}"`,
      item.score,
      item.maxScore,
      `${item.percentage}%`,
      item.correctCount,
      item.totalQuestions,
      item.isPassed ? 'KOMPETEN (LULUS)' : 'PERLU PEMBINAAN',
      item.durationSeconds,
      formatDuration(item.durationSeconds),
      `"${formatDate(item.submittedAt)}"`,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

// Convert results to TSV (Tab Separated Values) for copy-paste straight into Google Sheets or Excel
export function exportResultsToTSV(results: QuizResult[]): string {
  const sorted = sortResultsDescending(results);
  const headers = [
    'Peringkat',
    'Nama Karyawan Merchandiser',
    'Area / Store / NIK Karyawan',
    'Skor',
    'Skor Maksimal',
    'Akurasi (%)',
    'Benar / Total',
    'Status Standar',
    'Durasi',
    'Waktu Submit',
  ];

  const rows = sorted.map((item, index) => {
    return [
      index + 1,
      item.participantName,
      item.participantIdentifier || '-',
      item.score,
      item.maxScore,
      `${item.percentage}%`,
      `${item.correctCount}/${item.totalQuestions}`,
      item.isPassed ? 'KOMPETEN (LULUS)' : 'PERLU PEMBINAAN',
      formatDuration(item.durationSeconds),
      formatDate(item.submittedAt),
    ].join('\t');
  });

  return [headers.join('\t'), ...rows].join('\n');
}
