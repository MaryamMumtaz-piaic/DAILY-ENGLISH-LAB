import axios from 'axios';
import { authApi } from './api';
import { useAuthStore } from '@/store/auth';

export async function initializeAuth() {
  const { setAuth, clearAuth, setLoading } = useAuthStore.getState();
  setLoading(true);
  try {
    // Restore access token from the refresh cookie first, then fetch user data.
    // Without this, window.__accessToken is always empty after a page refresh
    // because it lives only in memory.
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh`,
      {},
      { withCredentials: true },
    );
    const accessToken: string = data.data?.accessToken ?? '';
    if (accessToken && typeof window !== 'undefined') {
      window.__accessToken = accessToken;
    }
    const meRes = await authApi.getMe();
    setAuth(meRes.data.data, accessToken);
  } catch {
    clearAuth();
  }
}
