import { authApi } from './api';
import { useAuthStore } from '@/store/auth';

export async function initializeAuth() {
  const { setAuth, clearAuth, setLoading } = useAuthStore.getState();
  setLoading(true);
  try {
    const res = await authApi.getMe();
    const token = typeof window !== 'undefined' ? window.__accessToken || '' : '';
    setAuth(res.data.data, token);
  } catch {
    clearAuth();
  }
}
