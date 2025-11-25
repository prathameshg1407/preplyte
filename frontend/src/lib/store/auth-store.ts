// src/lib/store/auth-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthUser, AuthContext } from '@/types/auth.types';

interface AuthStore {
  // State
  user: AuthUser | null;
  token: string | null;
  context: AuthContext | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;

  // Actions
  setAuth: (user: AuthUser, token: string, context: AuthContext) => void;
  logout: () => void;
  updateUser: (user: Partial<AuthUser>) => void;
  setLoading: (loading: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
}

// Helper to safely access localStorage
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch {
      console.error('Failed to save to localStorage');
    }
  },
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch {
      console.error('Failed to remove from localStorage');
    }
  },
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      context: null,
      isAuthenticated: false,
      isLoading: true, // Start as loading until hydrated
      isHydrated: false,

      setAuth: (user, token, context) => {
        console.log('[AuthStore] Setting auth for:', user?.email);

        // Store token separately for axios interceptor
        safeLocalStorage.setItem('auth_token', token);

        set({
          user,
          token,
          context,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        console.log('[AuthStore] Logging out');

        // Clear auth data
        safeLocalStorage.removeItem('auth_token');
        safeLocalStorage.removeItem('auth_user');

        set({
          user: null,
          token: null,
          context: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setHydrated: (hydrated) => {
        set({ isHydrated: hydrated, isLoading: false });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => {
        // Return a no-op storage for SSR
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        context: state.context,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);
          
          // Sync token to separate localStorage key for axios
          if (state.token) {
            safeLocalStorage.setItem('auth_token', state.token);
          }
        }
      },
    }
  )
);

// Selector hooks for optimized re-renders
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthContext = () => useAuthStore((state) => state.context);