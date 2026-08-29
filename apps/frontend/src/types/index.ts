export interface User {
  id: string;
  email: string;
  name: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  dailyGoalMin: number;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  user: User;
}

export interface PracticeSession {
  id: string;
  userId: string;
  type: 'CONVERSATION' | 'READ_SPEAK' | 'FIX_ENGLISH';
  status: 'ACTIVE' | 'COMPLETED' | 'ABANDONED';
  startedAt: string;
  endedAt?: string;
  durationSec?: number;
}

export interface PracticeMessage {
  id: string;
  sessionId: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  createdAt: string;
}

export interface MistakeDetail {
  type: string;
  category: string;
  original: string;
  corrected: string;
  explanation: string;
  severity: 'low' | 'medium' | 'high';
}

export interface Correction {
  id: string;
  originalText: string;
  correctedText: string;
  isCorrect: boolean;
  overallScore: number;
  mistakes: MistakeDetail[];
  naturalAlternative?: string;
  shouldRetry: boolean;
  encouragement: string;
}

export interface UserMistake {
  id: string;
  category: string;
  frequency: number;
  severity: string;
  firstSeen: string;
  lastSeen: string;
  improvement: number;
}

export interface ProgressSnapshot {
  id: string;
  sessionId: string;
  durationMin: number;
  sentencesPracticed: number;
  areasPracticed: string[];
  recurringMistakes: string[];
  improvementSignals: string[];
  recommendedFocus?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: null | { code: string; message: string };
  meta?: Record<string, unknown>;
}
