import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AUTH_STORAGE_KEYS, clearAuthStorage, storage } from '@/lib/utils/storage';
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

const syncTokensToStorage = (accessToken: string | null, refreshToken: string | null): void => {
  if (typeof window === 'undefined') return;

  if (accessToken && refreshToken) {
    storage.set(AUTH_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    storage.set(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  } else {
    clearAuthStorage();
  }
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,

      setAuth: (user, accessToken, refreshToken, context) => {
        logger.debug('[AuthStore] setAuth called');
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

      logout: () => {
        logger.debug('[AuthStore] logout called');
        syncTokensToStorage(null, null);

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
          return;
        }

        if (state) {
          logger.debug('[AuthStore] Hydrated', {
            hasUser: !!state.user,
            hasToken: !!state.accessToken,
          });

          // Sync tokens from store to direct storage
          if (state.accessToken && state.refreshToken) {
            syncTokensToStorage(state.accessToken, state.refreshToken);
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
export const useIsAuthenticated = () => useAuthStore((s) => s.isAuthenticated);
export const useAuthLoading = () => useAuthStore((s) => s.isLoading);
export const useAuthContext = () => useAuthStore((s) => s.context);
export const useIsHydrated = () => useAuthStore((s) => s.isHydrated);