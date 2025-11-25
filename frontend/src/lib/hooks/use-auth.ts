// src/hooks/useAuth.ts
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { authService } from '@/lib/api/services/auth.service';
import { LoginCredentials, RegisterCredentials, AuthUser, AuthContext } from '@/types/auth.types';
import { showErrorToast, showSuccessToast } from '@/lib/api/error-handler';

export const useAuth = () => {
  const router = useRouter();
  const {
    user,
    token,
    context,
    isAuthenticated,
    isLoading,
    isHydrated,
    setAuth,
    logout: storeLogout,
    updateUser,
    setLoading,
  } = useAuthStore();

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<boolean> => {
      setLoading(true);
      try {
        const response = await authService.login(credentials);

        if (response.success && response.data) {
          const { user, token, context } = response.data;
          setAuth(user, token, context);
          showSuccessToast('Login successful!');
          return true;
        }

        return false;
      } catch (error) {
        showErrorToast(error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [setAuth, setLoading]
  );

  const register = useCallback(
    async (credentials: RegisterCredentials): Promise<boolean> => {
      setLoading(true);
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
        setLoading(false);
      }
    },
    [setLoading]
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore logout API errors
    } finally {
      storeLogout();
      router.push('/login');
    }
  }, [storeLogout, router]);

  const refreshUser = useCallback(async () => {
    if (!token) return;

    try {
      const response = await authService.getCurrentUser();
      if (response.success && response.data) {
        updateUser(response.data);
      }
    } catch (error) {
      // If refresh fails, logout
      storeLogout();
    }
  }, [token, updateUser, storeLogout]);

  return {
    // State
    user,
    token,
    context,
    isAuthenticated,
    isLoading,
    isHydrated,

    // Actions
    login,
    register,
    logout,
    updateUser,
    refreshUser,

    // Helpers
    isAdmin: user?.role === 'PLATFORM_ADMIN' || user?.role === 'INSTITUTE_ADMIN',
    isPlatformAdmin: user?.role === 'PLATFORM_ADMIN',
    isInstituteAdmin: user?.role === 'INSTITUTE_ADMIN',
    hasInstitute: !!user?.instituteId,
  };
};