export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  points: number;
  explanation?: string;
  category?: string;
}

export interface QuizSettings {
  title: string;
  description: string;
  passingScore: number; // e.g. 70
  timeLimitMinutes: number; // 0 for unlimited
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  allowRetake: boolean;
  showExplanationAfterQuiz: boolean;
}

export interface ParticipantAnswer {
  questionId: string;
  questionText: string;
  selectedOptionIndex: number | null;
  selectedOptionText: string | null;
  correctOptionIndex: number;
  correctOptionText: string;
  isCorrect: boolean;
  pointsEarned: number;
  explanation?: string;
}

export interface QuizResult {
  id: string;
  participantName: string;
  participantIdentifier?: string; // email, class, or student ID
  score: number;
  maxScore: number;
  percentage: number;
  correctCount: number;
  totalQuestions: number;
  isPassed: boolean;
  durationSeconds: number;
  submittedAt: string; // ISO string
  answers: ParticipantAnswer[];
}

export type AppView = 'quiz-start' | 'quiz-taking' | 'quiz-result' | 'spreadsheet' | 'admin' | 'podium';

export type AppMode = 'md' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  identifier: string; // NIK / ID Karyawan MD or ID Supervisor
  role: 'md' | 'admin';
  area?: string; // e.g. Alfamart, Indomaret, Hypermart, Superindo, dll.
  loginAt: string;
}
