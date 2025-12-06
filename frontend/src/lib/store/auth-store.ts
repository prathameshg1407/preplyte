// lib/store/auth-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AUTH_STORAGE_KEYS, clearAuthStorage, storage } from '@/lib/utils/storage';
import { resetApiClient } from '@/lib/api/axios-instance';
import { logger } from '@/lib/utils/logger';
import type { User, AuthContext, AuthState } from '@/types/auth.types';

interface AuthActions {
  setAuth: (
    user: User,
    accessToken: string,
    refreshToken: string,
    context: AuthContext
  ) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  updateTokens: (accessToken: string, refreshToken: string) => void;
  setLoading: (loading: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  context: null,
  isAuthenticated: false,
  isLoading: true,
  isHydrated: false,
};

const syncTokensToStorage = (
  accessToken: string | null, 
  refreshToken: string | null
): void => {
  if (typeof window === 'undefined') return;

  if (accessToken && refreshToken) {
    storage.set(AUTH_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    storage.set(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    logger.debug('[AuthStore] Tokens synced to storage');
  } else {
    clearAuthStorage();
    logger.debug('[AuthStore] Storage cleared');
  }
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setAuth: (user, accessToken, refreshToken, context) => {
        logger.debug('[AuthStore] setAuth called', { 
          userId: user.id,
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
        });
        
        // Sync to localStorage immediately
        syncTokensToStorage(accessToken, refreshToken);

        set({
          user,
          accessToken,
          refreshToken,
          context,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      updateTokens: (accessToken, refreshToken) => {
        logger.debug('[AuthStore] updateTokens called');
        syncTokensToStorage(accessToken, refreshToken);
        
        set({
          accessToken,
          refreshToken,
        });
      },

      logout: () => {
        logger.debug('[AuthStore] logout called');
        
        // Clear storage first
        syncTokensToStorage(null, null);
        
        // Reset API client state
        resetApiClient();

        set({
          ...initialState,
          isLoading: false,
          isHydrated: true,
        });
      },

      updateUser: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),

      setLoading: (isLoading) => set({ isLoading }),

      setHydrated: (isHydrated) => set({ isHydrated, isLoading: false }),
    }),
    {
      name: AUTH_STORAGE_KEYS.STORE,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        context: state.context,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          logger.error('[AuthStore] Hydration error:', error);
          clearAuthStorage();
          return;
        }

        if (state) {
          logger.debug('[AuthStore] Hydration complete', {
            hasUser: !!state.user,
            hasAccessToken: !!state.accessToken,
            hasRefreshToken: !!state.refreshToken,
          });

          // Validate and sync tokens
          if (state.accessToken && state.refreshToken) {
            syncTokensToStorage(state.accessToken, state.refreshToken);
          } else if (state.isAuthenticated) {
            // Inconsistent state - clear everything
            logger.warn('[AuthStore] Inconsistent state detected, clearing');
            state.logout();
            return;
          }

          state.setHydrated(true);
        }
      },
    }
  )
);

// ============================================
// Selectors
// ============================================

export const useUser = () => useAuthStore((s) => s.user);
export const useAccessToken = () => useAuthStore((s) => s.accessToken);
export const useRefreshToken = () => useAuthStore((s) => s.refreshToken);
export const useIsAuthenticated = () => useAuthStore((s) => s.isAuthenticated);
export const useAuthLoading = () => useAuthStore((s) => s.isLoading);
export const useAuthContext = () => useAuthStore((s) => s.context);
export const useIsHydrated = () => useAuthStore((s) => s.isHydrated);