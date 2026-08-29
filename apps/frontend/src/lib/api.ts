import axios from 'axios';
import type {
  ApiResponse,
  AuthTokens,
  User,
  PracticeSession,
  PracticeMessage,
  Correction,
  UserMistake,
  ProgressSnapshot,
} from '@/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// Inject access token from window store
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? window.__accessToken : undefined;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      try {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = data.data.accessToken;
        if (typeof window !== 'undefined') window.__accessToken = newToken;
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return api(error.config);
      } catch {
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

// Declare global
declare global {
  interface Window {
    __accessToken?: string;
  }
}

// Auth
export const authApi = {
  register: (name: string, email: string, password: string) =>
    api.post<ApiResponse<AuthTokens>>('/api/v1/auth/register', { name, email, password }),
  login: (email: string, password: string) =>
    api.post<ApiResponse<AuthTokens>>('/api/v1/auth/login', { email, password }),
  logout: () => api.post('/api/v1/auth/logout'),
  getMe: () => api.get<ApiResponse<User>>('/api/v1/users/me'),
};

// Practice
export const practiceApi = {
  createSession: (type: string, topic?: string) =>
    api.post<ApiResponse<{ session: PracticeSession; aiMessage: string }>>(
      '/api/v1/practice/sessions',
      { type, topic }
    ),
  sendMessage: (sessionId: string, content: string) =>
    api.post<
      ApiResponse<{
        userMessage: PracticeMessage;
        aiMessage: PracticeMessage;
        correction?: Correction;
      }>
    >(`/api/v1/practice/sessions/${sessionId}/messages`, { content }),
  endSession: (sessionId: string) =>
    api.post<ApiResponse<{ summary: unknown }>>(
      `/api/v1/practice/sessions/${sessionId}/end`
    ),
  analyzeText: (text: string) =>
    api.post<ApiResponse<Correction>>('/api/v1/practice/analyze', { text }),
  getSessions: () =>
    api.get<ApiResponse<PracticeSession[]>>('/api/v1/practice/sessions'),
};

// Speech
export const speechApi = {
  transcribe: (audioBlob: Blob, sessionId: string) => {
    const form = new FormData();
    form.append('audio', audioBlob, 'recording.webm');
    form.append('sessionId', sessionId);
    return api.post<ApiResponse<{ transcript: string; correction?: Correction }>>(
      '/api/v1/speech/transcribe',
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },
};

// Progress
export const progressApi = {
  getProgress: () =>
    api.get<
      ApiResponse<{
        snapshots: ProgressSnapshot[];
        streak: number;
        totalMinutes: number;
        totalSessions: number;
      }>
    >('/api/v1/progress'),
  getMistakes: () => api.get<ApiResponse<UserMistake[]>>('/api/v1/mistakes'),
};
