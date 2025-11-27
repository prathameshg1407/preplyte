// src/lib/store/auth-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AUTH_STORAGE_KEYS } from '@/lib/utils/storage';
import type { User, AuthContext, AuthState } from '@/types/auth.types';

interface AuthActions {
  setAuth: (user: User, token: string, context: AuthContext) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  context: null,
  isAuthenticated: false,
  isLoading: true,
  isHydrated: false,
};

const syncTokenToStorage = (token: string | null): void => {
  if (typeof window === 'undefined') return;

  try {
    if (token) {
      localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
    }
  } catch (error) {
    console.warn('[AuthStore] Token sync failed:', error);
  }
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,

      setAuth: (user, token, context) => {
        console.log('[AuthStore] setAuth called with token:', token?.substring(0, 20) + '...');
        
        // Sync to direct storage
        syncTokenToStorage(token);

        set({
          user,
          token,
          context,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        console.log('[AuthStore] logout called');
        syncTokenToStorage(null);

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
        token: state.token,
        context: state.context,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('[AuthStore] Hydration error:', error);
          return;
        }

        if (state) {
          console.log('[AuthStore] Hydrated:', {
            hasUser: !!state.user,
            hasToken: !!state.token,
          });

          if (state.token) {
            syncTokenToStorage(state.token);
          }

          state.setHydrated(true);
        }
      },
    }
  )
);

// Selectors
export const useUser = () => useAuthStore((s) => s.user);
export const useToken = () => useAuthStore((s) => s.token);
export const useIsAuthenticated = () => useAuthStore((s) => s.isAuthenticated);
export const useAuthLoading = () => useAuthStore((s) => s.isLoading);
export const useAuthContext = () => useAuthStore((s) => s.context);
export const useIsHydrated = () => useAuthStore((s) => s.isHydrated);