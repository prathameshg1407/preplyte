import { useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { authService } from '@/lib/api/services/auth.service';
import { showErrorToast, showSuccessToast } from '@/lib/api/error-handler';
import { clearAuthStorage } from '@/lib/utils/storage';
import { logger } from '@/lib/utils/logger';
import type {
  LoginCredentials,
  RegisterCredentials,
  AuthContext,
  UserRole,
} from '@/types/auth.types';

// Helper to get default redirect based on role
function getDefaultRedirect(role: UserRole): string {
  switch (role) {
    case 'PLATFORM_ADMIN':
      return '/admin';
    case 'INSTITUTE_ADMIN':
      return '/institute-admin';
    case 'USER':
      return '/dashboard';
    default:
      return '/dashboard';
  }
}

// Helper to get context based on role
function getContextFromRole(role: UserRole): AuthContext {
  switch (role) {
    case 'PLATFORM_ADMIN':
      return 'PLATFORM';
    case 'INSTITUTE_ADMIN':
      return 'INSTITUTE';
    case 'USER':
      return 'PLATFORM'; // Regular users should use PLATFORM context, not INSTITUTE
    default:
      return 'PLATFORM';
  }
}

interface UseAuthOptions {
  /**
   * If true, will read redirect param from URL search params.
   * Only set to true in components wrapped with Suspense.
   * @default false
   */
  enableRedirectParam?: boolean;
}

export function useAuth(options: UseAuthOptions = {}) {
  const router = useRouter();
  const store = useAuthStore();
  const { enableRedirectParam = false } = options;

  // Only call useSearchParams when explicitly enabled
  // This hook will be called conditionally, but it's okay because
  // the option is static per component instance
  const searchParams = enableRedirectParam ? useSearchParams() : null;
  const redirectParam = searchParams?.get('redirect') ?? null;

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<boolean> => {
      store.setLoading(true);

      try {
        logger.debug('[useAuth] Starting login');

        const response = await authService.login(credentials);

        if (response.success && response.data) {
          const { user, accessToken, refreshToken } = response.data;

          if (!accessToken || !refreshToken) {
            logger.error('[useAuth] Missing tokens in response');
            showErrorToast('Login failed: Invalid response');
            return false;
          }

          // Log the user role for debugging
          logger.debug('[useAuth] User role received:', user.role);

          // Determine context from user role using the helper function
          const context = getContextFromRole(user.role);
          
          logger.debug('[useAuth] Context determined:', context);

          // Update store (this also syncs to storage)
          store.setAuth(user, accessToken, refreshToken, context);

          logger.debug('[useAuth] Login successful', { 
            role: user.role,
            context: context,
            instituteId: user.instituteId 
          });
          
          showSuccessToast('Login successful!');

          // Handle redirect
          const defaultRedirect = getDefaultRedirect(user.role);
          
          // Use redirect param only if it's a valid path, otherwise use role-based default
          const redirectTo = redirectParam?.startsWith('/') 
            ? redirectParam 
            : defaultRedirect;

          logger.debug('[useAuth] Redirecting to:', redirectTo);
          router.push(redirectTo);

          return true;
        }

        showErrorToast(response.message || 'Login failed');
        return false;
      } catch (error) {
        logger.error('[useAuth] Login error', error);
        showErrorToast(error);
        return false;
      } finally {
        store.setLoading(false);
      }
    },
    [store, router, redirectParam]
  );

  const register = useCallback(
    async (credentials: RegisterCredentials): Promise<boolean> => {
      store.setLoading(true);

      try {
        logger.debug('[useAuth] Starting registration');
        
        const response = await authService.register(credentials);

        if (response.success) {
          showSuccessToast('Registration successful! Please login.');
          router.push('/login');
          return true;
        }

        showErrorToast(response.message || 'Registration failed');
        return false;
      } catch (error) {
        logger.error('[useAuth] Registration error', error);
        showErrorToast(error);
        return false;
      } finally {
        store.setLoading(false);
      }
    },
    [store, router]
  );

  const logout = useCallback(async () => {
    logger.debug('[useAuth] Logging out');

    try {
      await authService.logout();
    } catch (error) {
      logger.warn('[useAuth] Logout API error (ignored)', error);
    } finally {
      clearAuthStorage();
      store.logout();
      router.push('/login');
    }
  }, [store, router]);

  const refreshUser = useCallback(async () => {
    if (!store.accessToken) {
      logger.debug('[useAuth] No access token, skipping refresh');
      return;
    }

    try {
      logger.debug('[useAuth] Refreshing user data');
      const response = await authService.getCurrentUser();
      
      if (response.success && response.data) {
        store.updateUser(response.data);
        logger.debug('[useAuth] User data refreshed successfully');
      }
    } catch (error) {
      logger.error('[useAuth] Failed to refresh user', error);
      store.logout();
    }
  }, [store]);

  const roleHelpers = useMemo(() => {
    const role = store.user?.role as UserRole | undefined;

    return {
      isAdmin: role === 'PLATFORM_ADMIN' || role === 'INSTITUTE_ADMIN',
      isPlatformAdmin: role === 'PLATFORM_ADMIN',
      isInstituteAdmin: role === 'INSTITUTE_ADMIN',
      isStudent: role === 'USER',
      isUser: role === 'USER',
      hasInstitute: !!store.user?.instituteId,
    };
  }, [store.user?.role, store.user?.instituteId]);

  return {
    // State
    user: store.user,
    accessToken: store.accessToken,
    context: store.context,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    isHydrated: store.isHydrated,

    // Actions
    login,
    register,
    logout,
    refreshUser,
    updateUser: store.updateUser,

    // Role helpers
    ...roleHelpers,
  };
}