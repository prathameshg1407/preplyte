'use client';

import { useEffect, type ReactNode, useCallback } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { AUTH_STORAGE_KEYS, storage } from '@/lib/utils/storage';
import { logger } from '@/lib/utils/logger';

interface AuthProviderProps {
  children: ReactNode;
}

const HYDRATION_TIMEOUT_MS = 500;

export function AuthProvider({ children }: AuthProviderProps) {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const setHydrated = useAuthStore((s) => s.setHydrated);

  // Sync tokens to direct storage for axios interceptor
  const syncTokens = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      if (accessToken) {
        storage.set(AUTH_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      } else {
        storage.remove(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
      }

      if (refreshToken) {
        storage.set(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      } else {
        storage.remove(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
      }
    } catch (error) {
      logger.warn('[AuthProvider] Failed to sync tokens:', error);
    }
  }, [accessToken, refreshToken]);

  // Sync tokens when they change (after hydration)
  useEffect(() => {
    if (isHydrated) {
      syncTokens();
    }
  }, [isHydrated, syncTokens]);

  // Set session cookie for middleware
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      if (accessToken) {
        document.cookie = 'has_session=true; path=/; SameSite=Strict';
      } else {
        document.cookie = 'has_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
    } catch (error) {
      logger.warn('[AuthProvider] Failed to set session cookie:', error);
    }
  }, [accessToken]);

  // Fallback hydration timeout
  useEffect(() => {
    if (isHydrated) return;

    const timeout = setTimeout(() => {
      if (!useAuthStore.getState().isHydrated) {
        logger.warn('[AuthProvider] Forcing hydration after timeout');
        setHydrated(true);
      }
    }, HYDRATION_TIMEOUT_MS);

    return () => clearTimeout(timeout);
  }, [isHydrated, setHydrated]);

  return <>{children}</>;
}