// src/providers/AuthProvider.tsx
'use client';

import { useEffect, type ReactNode, useCallback } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { AUTH_STORAGE_KEYS } from '@/lib/utils/storage';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const token = useAuthStore((s) => s.token);
  const setHydrated = useAuthStore((s) => s.setHydrated);

  // Sync token to direct storage whenever it changes
  const syncToken = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      if (token) {
        localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
      }
    } catch (error) {
      console.warn('[AuthProvider] Failed to sync token:', error);
    }
  }, [token]);

  // Sync token on changes
  useEffect(() => {
    if (isHydrated) {
      syncToken();
    }
  }, [isHydrated, syncToken]);

  // Fallback hydration timeout
  useEffect(() => {
    if (isHydrated) return;

    const timeout = setTimeout(() => {
      if (!useAuthStore.getState().isHydrated) {
        console.warn('[AuthProvider] Forcing hydration after timeout');
        setHydrated(true);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [isHydrated, setHydrated]);

  // Debug logging in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[AuthProvider] State:', {
        isHydrated,
        hasToken: !!token,
        directToken: typeof window !== 'undefined' 
          ? !!localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN)
          : false,
      });
    }
  }, [isHydrated, token]);

  return <>{children}</>;
}