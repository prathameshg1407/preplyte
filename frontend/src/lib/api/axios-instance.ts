// lib/api/axios-instance.ts
import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { API_CONFIG, isPublicPath } from './config';
import { API_ENDPOINTS } from './endpoints';
import { AUTH_STORAGE_KEYS, clearAuthStorage, storage } from '@/lib/utils/storage';
import { logger } from '@/lib/utils/logger';

interface RetryConfig extends InternalAxiosRequestConfig {
  _retryCount?: number;
  _isRetryRequest?: boolean;
}

export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// ============================================
// Token Management
// ============================================

let refreshPromise: Promise<string> | null = null;



const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return storage.getRaw(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
};

const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return storage.getRaw(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
};

const generateRequestId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const isAuthEndpoint = (url?: string): boolean => {
  if (!url) return false;
  const authPaths = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];
  return authPaths.some(path => url.includes(path));
};

const redirectToLogin = (reason?: string): void => {
  if (typeof window === 'undefined') return;

  logger.debug('[API] Redirecting to login', { reason });
  
  clearAuthStorage();
  
  // Reset refresh state
  refreshPromise = null;

  const currentPath = window.location.pathname + window.location.search;
  if (!isPublicPath(currentPath) && !window.location.pathname.includes('/login')) {
    const redirectUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;
    window.location.href = reason ? `${redirectUrl}&reason=${encodeURIComponent(reason)}` : redirectUrl;
  }
};

// ============================================
// Refresh Token Function
// ============================================

const performTokenRefresh = async (): Promise<string> => {
  // 1. Check if we already have a refresh in progress in this tab
  if (refreshPromise) {
    logger.debug('[API] Reusing existing refresh promise');
    return refreshPromise;
  }

  const getRecentToken = (): string | null => {
    const lastUpdate = typeof window !== 'undefined' ? window.localStorage.getItem('token-updated') : null;
    const now = Date.now();
    // If updated in the last 5 seconds, it's likely fresh enough
    if (lastUpdate && now - parseInt(lastUpdate) < 5000) {
      return getAccessToken();
    }
    return null;
  };

  // 2. Proactive check
  const freshToken = getRecentToken();
  if (freshToken) {
    logger.debug('[API] Using fresh token from recent update');
    return Promise.resolve(freshToken);
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  // 3. Create the refresh promise with cross-tab locking
  refreshPromise = (async () => {
    const lockKey = 'preplyte_refresh_lock';
    try {
      // Add small jitter to prevent simultaneous lock attempts from multiple tabs
      await new Promise(r => setTimeout(r, Math.random() * 200));

      // Check again after jitter - another tab might have started/finished
      const t = getRecentToken();
      if (t) return t;

      // Acquire basic lock
      const now = Date.now();
      const lock = window.localStorage.getItem(lockKey);
      
      if (lock && now - parseInt(lock) < 8000) {
        logger.debug('[API] Another tab isRefreshing. Waiting for completion...');
        // Wait up to 8 seconds for the other tab to finish
        for (let i = 0; i < 8; i++) {
          await new Promise(r => setTimeout(r, 1000));
          const updatedToken = getRecentToken();
          if (updatedToken) return updatedToken;
          
          // If lock is gone, we can try to take it
          if (!window.localStorage.getItem(lockKey)) break;
        }
      }

      // Take/Update lock
      window.localStorage.setItem(lockKey, Date.now().toString());

      logger.debug('[API] Proceeding with refresh request');

      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
        { refreshToken },
        { 
          headers: { 'Content-Type': 'application/json' },
          timeout: API_CONFIG.TIMEOUT,
        }
      );

      const data = response.data;
      const authData = data?.data || data;
      const newAccessToken = authData?.accessToken;
      const newRefreshToken = authData?.refreshToken;

      if (!newAccessToken || !newRefreshToken) {
        throw new Error('Invalid refresh response');
      }

      // Save new tokens atomically
      storage.set(AUTH_STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
      storage.set(AUTH_STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
      
      // Update the timestamp to notify other tabs
      window.localStorage.setItem('token-updated', Date.now().toString());
      
      logger.debug('[API] Token refresh successful');
      return newAccessToken;
    } catch (error: any) {
      // If the error is 401/403, and another tab updated the token while we were waiting/requesting,
      // it means our request failed because we used an old one that was already rotated.
      // But we should check if a NEW one is now available.
      const freshTokenAfterError = getRecentToken();
      if (freshTokenAfterError) {
        logger.debug('[API] Refresh failed but found a fresh token from another tab');
        return freshTokenAfterError;
      }
      
      throw error;
    } finally {
      window.localStorage.removeItem(lockKey);
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

// ============================================
// Request Interceptor
// ============================================

apiClient.interceptors.request.use(
  (config) => {
    // Skip adding token for refresh endpoint to avoid loops
    if (config.url?.includes('/auth/refresh')) {
      return config;
    }

    const token = getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers['X-Request-ID'] = generateRequestId();

    logger.debug(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
      hasToken: !!token,
    });

    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================
// Response Interceptor
// ============================================

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryConfig | undefined;
    
    if (!config) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const retryCount = config._retryCount ?? 0;

    // Log the error for debugging
    logger.debug('[API] Response error', {
      status,
      url: config.url,
      isRetryRequest: config._isRetryRequest,
      hasRefreshPromise: !!refreshPromise,
    });

    // Handle 401 - Token Refresh
    if (
      status === 401 &&
      !isAuthEndpoint(config.url) &&
      !config._isRetryRequest
    ) {
      const errorData = error.response?.data as any;
      const errorCode = errorData?.error?.code;
      const errorMessage = errorData?.error?.message || errorData?.message;

      // Check for token reuse detection
      if (errorMessage?.toLowerCase().includes('token reuse')) {
        logger.warn('[API] Token reuse detected by server, clearing all sessions');
        redirectToLogin('session_revoked');
        return Promise.reject(error);
      }

      // Check if we have a refresh token
      const refreshToken = getRefreshToken();
      
      if (!refreshToken) {
        logger.debug('[API] No refresh token available, redirecting to login');
        redirectToLogin('no_refresh_token');
        return Promise.reject(error);
      }

      // Use the shared refresh promise if one exists, or create a new one
      if (!refreshPromise) {
        logger.debug('[API] Starting token refresh process');
      } else {
        logger.debug('[API] Token refresh already in progress, waiting for completion');
      }

      // Get or create the refresh promise
      const tokenPromise = performTokenRefresh();

      // Wait for refresh and retry the original request
      return tokenPromise
        .then((newAccessToken) => {
          logger.debug('[API] Token refresh completed, retrying request');
          config.headers.Authorization = `Bearer ${newAccessToken}`;
          config._isRetryRequest = true;
          return apiClient(config);
        })
        .catch((refreshError: any) => {
          logger.error('[API] Token refresh failed', refreshError);
          
          // Check if it's a token reuse error
          const refreshErrorMessage = refreshError?.response?.data?.error?.message || 
                                     refreshError?.response?.data?.message || 
                                     refreshError?.message;
          
          const isTokenReuse = refreshErrorMessage?.toLowerCase().includes('token reuse');
          
          // Redirect to login with appropriate reason
          redirectToLogin(isTokenReuse ? 'token_reuse' : 'refresh_failed');
          
          return Promise.reject(refreshError);
        });
    }

    // Handle 403 - Forbidden (might indicate revoked token)
    if (status === 403 && !isAuthEndpoint(config.url)) {
      const errorCode = (error.response?.data as any)?.error?.code;
      
      if (errorCode === 'TOKEN_REVOKED' || errorCode === 'SESSION_INVALID') {
        logger.debug('[API] Token revoked, redirecting to login');
        redirectToLogin();
        return Promise.reject(error);
      }
    }

    // Retry logic for server errors and network issues
    const shouldRetry =
      retryCount < API_CONFIG.RETRY.MAX_ATTEMPTS &&
      !status?.toString().startsWith('4') &&
      (error.code === 'ERR_NETWORK' ||
        error.code === 'ECONNABORTED' ||
        (status && status >= 500));

    if (shouldRetry) {
      config._retryCount = retryCount + 1;
      const delay = API_CONFIG.RETRY.BASE_DELAY * Math.pow(2, retryCount);
      
      logger.debug(`[API] Retrying request (attempt ${config._retryCount})`, {
        url: config.url,
        delay,
      });
      
      await new Promise((resolve) => setTimeout(resolve, delay));
      return apiClient(config);
    }

    return Promise.reject(error);
  }
);

// ============================================
// Manual Token Refresh (for proactive refresh)
// ============================================

export const refreshTokenManually = async (): Promise<boolean> => {
  try {
    await performTokenRefresh();
    return true;
  } catch (error) {
    logger.error('[API] Manual token refresh failed', error);
    return false;
  }
};

// ============================================
// Reset Function (useful for logout)
// ============================================

export const resetApiClient = (): void => {
  refreshPromise = null;
};

// ============================================
// Cross-Tab Token Synchronization
// ============================================

if (typeof window !== 'undefined') {
  // Listen for storage changes from other tabs
  window.addEventListener('storage', (event) => {
    // Token was updated in another tab
    if (event.key === 'token-updated' && event.newValue) {
      logger.debug('[API] Token updated in another tab, clearing refresh promise');
      
      // Clear the refresh promise so new requests use the updated token
      refreshPromise = null;
    }
    
    // Auth was cleared in another tab
    if (event.key === AUTH_STORAGE_KEYS.ACCESS_TOKEN && !event.newValue) {
      logger.debug('[API] Auth cleared in another tab');
      redirectToLogin('logged_out_elsewhere');
    }
  });
}