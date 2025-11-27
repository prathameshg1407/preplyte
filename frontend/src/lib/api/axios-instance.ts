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

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (callback: (token: string) => void): void => {
  refreshSubscribers.push(callback);
};

const onTokenRefreshed = (token: string): void => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const onRefreshFailed = (): void => {
  refreshSubscribers = [];
};

const getAccessToken = (): string | null => {
  return storage.getRaw(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
};

const getRefreshToken = (): string | null => {
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
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/auth/refresh')
  );
};

const redirectToLogin = (): void => {
  if (typeof window === 'undefined') return;

  clearAuthStorage();

  const currentPath = window.location.pathname + window.location.search;
  if (!isPublicPath(currentPath)) {
    window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
  }
};

// ============================================
// Request Interceptor
// ============================================

apiClient.interceptors.request.use(
  (config) => {
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
    if (!config) return Promise.reject(error);

    const status = error.response?.status;
    const retryCount = config._retryCount ?? 0;

    // Handle 401 - Token Refresh
    if (status === 401 && !isAuthEndpoint(config.url) && !config._isRetryRequest) {
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        logger.debug('[API] No refresh token, redirecting to login');
        redirectToLogin();
        return Promise.reject(error);
      }

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const response = await axios.post(
            `${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
            { refreshToken },
            { headers: { 'Content-Type': 'application/json' } }
          );

          const newAccessToken = response.data?.data?.accessToken;
          const newRefreshToken = response.data?.data?.refreshToken;

          if (newAccessToken && newRefreshToken) {
            storage.set(AUTH_STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
            storage.set(AUTH_STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

            onTokenRefreshed(newAccessToken);

            // Retry original request
            config.headers.Authorization = `Bearer ${newAccessToken}`;
            config._isRetryRequest = true;
            return apiClient(config);
          }

          throw new Error('Invalid refresh response');
        } catch (refreshError) {
          logger.error('[API] Token refresh failed', refreshError);
          onRefreshFailed();
          redirectToLogin();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Queue request while refresh is in progress
      return new Promise((resolve) => {
        subscribeTokenRefresh((token) => {
          config.headers.Authorization = `Bearer ${token}`;
          config._isRetryRequest = true;
          resolve(apiClient(config));
        });
      });
    }

    // Retry logic for server errors
    const shouldRetry =
      retryCount < API_CONFIG.RETRY.MAX_ATTEMPTS &&
      !status?.toString().startsWith('4') &&
      (error.code === 'ERR_NETWORK' ||
        error.code === 'ECONNABORTED' ||
        (status && status >= 500));

    if (shouldRetry) {
      config._retryCount = retryCount + 1;
      await new Promise((resolve) =>
        setTimeout(resolve, API_CONFIG.RETRY.BASE_DELAY * config._retryCount!)
      );
      return apiClient(config);
    }

    return Promise.reject(error);
  }
);