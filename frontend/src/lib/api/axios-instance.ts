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

interface RefreshSubscriber {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
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

let isRefreshing = false;
let refreshSubscribers: RefreshSubscriber[] = [];
let refreshPromise: Promise<string> | null = null;

const subscribeTokenRefresh = (
  resolve: (token: string) => void,
  reject: (error: Error) => void
): void => {
  refreshSubscribers.push({ resolve, reject });
};

const onTokenRefreshed = (token: string): void => {
  refreshSubscribers.forEach(({ resolve }) => resolve(token));
  refreshSubscribers = [];
  refreshPromise = null;
};

const onRefreshFailed = (error: Error): void => {
  refreshSubscribers.forEach(({ reject }) => reject(error));
  refreshSubscribers = [];
  refreshPromise = null;
};

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
  isRefreshing = false;
  refreshSubscribers = [];
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
  // If there's already a refresh in progress, return that promise
  if (refreshPromise) {
    logger.debug('[API] Reusing existing refresh promise');
    return refreshPromise;
  }

  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  logger.debug('[API] Attempting token refresh');

  // Create and store the refresh promise to prevent concurrent refreshes
  refreshPromise = (async () => {
    try {
      // Use a separate axios instance to avoid interceptor loops
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
        { refreshToken },
        { 
          headers: { 'Content-Type': 'application/json' },
          timeout: API_CONFIG.TIMEOUT,
        }
      );

      const data = response.data;
      
      // Handle both wrapped and unwrapped responses
      const authData = data?.data || data;
      const newAccessToken = authData?.accessToken;
      const newRefreshToken = authData?.refreshToken;

      if (!newAccessToken || !newRefreshToken) {
        logger.error('[API] Invalid refresh response structure', { data });
        throw new Error('Invalid refresh response');
      }

      // Save new tokens atomically
      storage.set(AUTH_STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
      storage.set(AUTH_STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
      
      // Broadcast token update to other tabs
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('token-updated', Date.now().toString());
      }
      
      logger.debug('[API] Token refresh successful');
      
      return newAccessToken;
    } catch (error) {
      refreshPromise = null;
      throw error;
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
      isRefreshing,
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

      // If already refreshing, queue this request
      if (isRefreshing) {
        logger.debug('[API] Token refresh in progress, queueing request');
        
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh(
            (token: string) => {
              config.headers.Authorization = `Bearer ${token}`;
              config._isRetryRequest = true;
              resolve(apiClient(config));
            },
            (refreshError: Error) => {
              reject(refreshError);
            }
          );
        });
      }

      // Start refresh process
      isRefreshing = true;

      try {
        const newAccessToken = await performTokenRefresh();
        
        // Notify all queued requests
        onTokenRefreshed(newAccessToken);

        // Retry the original request
        config.headers.Authorization = `Bearer ${newAccessToken}`;
        config._isRetryRequest = true;
        
        return apiClient(config);
      } catch (refreshError: any) {
        logger.error('[API] Token refresh failed', refreshError);
        
        // Check if it's a token reuse error
        const refreshErrorMessage = refreshError?.response?.data?.error?.message || 
                                   refreshError?.response?.data?.message || 
                                   refreshError?.message;
        
        const isTokenReuse = refreshErrorMessage?.toLowerCase().includes('token reuse');
        
        const error = refreshError instanceof Error 
          ? refreshError 
          : new Error('Token refresh failed');
        
        // Notify all queued requests of failure
        onRefreshFailed(error);
        
        // Redirect to login with appropriate reason
        redirectToLogin(isTokenReuse ? 'token_reuse' : 'refresh_failed');
        
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
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
  isRefreshing = false;
  refreshSubscribers = [];
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
      logger.debug('[API] Token updated in another tab, reloading tokens');
      
      // If we're currently refreshing, cancel it
      if (isRefreshing) {
        logger.debug('[API] Cancelling current refresh due to external update');
        isRefreshing = false;
        refreshPromise = null;
        
        // Resolve all pending requests with the new token
        const newToken = getAccessToken();
        if (newToken) {
          onTokenRefreshed(newToken);
        } else {
          onRefreshFailed(new Error('Token cleared in another tab'));
        }
      }
    }
    
    // Auth was cleared in another tab
    if (event.key === AUTH_STORAGE_KEYS.ACCESS_TOKEN && !event.newValue) {
      logger.debug('[API] Auth cleared in another tab');
      redirectToLogin('logged_out_elsewhere');
    }
  });
}