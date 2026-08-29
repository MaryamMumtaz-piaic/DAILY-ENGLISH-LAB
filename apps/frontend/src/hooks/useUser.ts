'use client';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { authApi } from '@/lib/api';

export function useUser() {
  const { user, isLoading, setAuth, clearAuth, setLoading } = useAuthStore();

  useEffect(() => {
    if (user) return;
    setLoading(true);
    authApi
      .getMe()
      .then((res) => setAuth(res.data.data, window.__accessToken || ''))
      .catch(() => clearAuth())
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { user, isLoading };
}
