'use client';
import { create } from 'zustand';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  setAuth: (user: User, accessToken: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isLoading: true,
  setAuth: (user, accessToken) => {
    if (typeof window !== 'undefined') window.__accessToken = accessToken;
    set({ user, accessToken, isLoading: false });
  },
  clearAuth: () => {
    if (typeof window !== 'undefined') delete window.__accessToken;
    set({ user: null, accessToken: null, isLoading: false });
  },
  setLoading: (isLoading) => set({ isLoading }),
}));
