// src/hooks/useAuth.ts
import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { authService } from '@/lib/api/services/auth.service';
import { showErrorToast, showSuccessToast } from '@/lib/api/error-handler';
import { AUTH_STORAGE_KEYS } from '@/lib/utils/storage';
import type { LoginCredentials, RegisterCredentials, AuthContext } from '@/types/auth.types';

export function useAuth() {
  const router = useRouter();
  const store = useAuthStore();

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<boolean> => {
      store.setLoading(true);
      
      try {
        console.log('[useAuth] Starting login...');
        
        const response = await authService.login(credentials);
        
        console.log('[useAuth] Response received:', {
          success: response.success,
          hasData: !!response.data,
          hasAccessToken: !!response.data?.accessToken,  // Changed!
        });

        if (response.success && response.data) {
          const { user, accessToken, refreshToken, expiresIn } = response.data;

          if (!accessToken) {
            console.error('[useAuth] ❌ No accessToken in response.data');
            showErrorToast('Login failed: No authentication token received');
            return false;
          }

          // Ensure token is in localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, accessToken);
            console.log('[useAuth] ✅ Token saved to localStorage');
          }

          // Determine context from user role
          const context: AuthContext = user.role === 'PLATFORM_ADMIN' 
            ? 'PLATFORM' 
            : 'INSTITUTE';

          // Update Zustand store
          store.setAuth(user, accessToken, context);
          
          console.log('[useAuth] ✅ Login complete');
          showSuccessToast('Login successful!');
          
          return true;
        }

        console.error('[useAuth] ❌ Login failed:', response);
        showErrorToast(response.message || 'Login failed');
        return false;
        
      } catch (error) {
        console.error('[useAuth] ❌ Login exception:', error);
        showErrorToast(error);
        return false;
      } finally {
        store.setLoading(false);
      }
    },
    [store]
  );

  const register = useCallback(
    async (credentials: RegisterCredentials): Promise<boolean> => {
      store.setLoading(true);
      try {
        const response = await authService.register(credentials);
        if (response.success) {
          showSuccessToast('Registration successful! Please login.');
          return true;
        }
        return false;
      } catch (error) {
        showErrorToast(error);
        return false;
      } finally {
        store.setLoading(false);
      }
    },
    [store]
  );

  const logout = useCallback(async () => {
    console.log('[useAuth] Logging out...');
    
    try {
      await authService.logout();
    } catch (error) {
      console.warn('[useAuth] Logout API error (ignored):', error);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
        localStorage.removeItem(AUTH_STORAGE_KEYS.STORE);
      }
      store.logout();
      router.push('/login');
    }
  }, [store, router]);

  const refreshUser = useCallback(async () => {
    if (!store.token) return;
    
    try {
      const response = await authService.getCurrentUser();
      if (response.success && response.data) {
        store.updateUser(response.data);
      }
    } catch {
      store.logout();
    }
  }, [store]);

  const roleHelpers = useMemo(
    () => ({
      isAdmin:
        store.user?.role === 'PLATFORM_ADMIN' ||
        store.user?.role === 'INSTITUTE_ADMIN',
      isPlatformAdmin: store.user?.role === 'PLATFORM_ADMIN',
      isInstituteAdmin: store.user?.role === 'INSTITUTE_ADMIN',
      hasInstitute: !!store.user?.instituteId,
    }),
    [store.user?.role, store.user?.instituteId]
  );

  return {
    user: store.user,
    token: store.token,
    context: store.context,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    isHydrated: store.isHydrated,
    login,
    register,
    logout,
    refreshUser,
    updateUser: store.updateUser,
    ...roleHelpers,
  };
}