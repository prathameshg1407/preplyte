// src/lib/api/axios-instance.ts
import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { API_CONFIG, isPublicPath } from './config';
import { AUTH_STORAGE_KEYS } from '@/lib/utils/storage';

interface RetryConfig extends InternalAxiosRequestConfig {
  _retryCount?: number;
}

export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

const generateRequestId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

// Get token from all possible sources
const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;

  try {
    // Source 1: Direct localStorage
    const directToken = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
    if (directToken) {
      return directToken;
    }

    // Source 2: Zustand persisted store
    const storeRaw = localStorage.getItem(AUTH_STORAGE_KEYS.STORE);
    if (storeRaw) {
      try {
        const store = JSON.parse(storeRaw);
        const storeToken = store?.state?.token;
        
        if (storeToken) {
          // Sync to direct storage for future requests
          localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, storeToken);
          console.log('[Axios] Synced token from store to direct storage');
          return storeToken;
        }
      } catch (parseError) {
        console.warn('[Axios] Failed to parse store:', parseError);
      }
    }

    return null;
  } catch (error) {
    console.error('[Axios] Token retrieval error:', error);
    return null;
  }
};

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    
    // Debug log for non-auth endpoints
    const isAuthEndpoint = config.url?.includes('/auth/');
    if (!isAuthEndpoint) {
      console.log(`[Axios] ${config.method?.toUpperCase()} ${config.url}`, {
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 15)}...` : 'none',
      });
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers['X-Request-ID'] = generateRequestId();
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryConfig | undefined;
    if (!config) return Promise.reject(error);

    const retryCount = config._retryCount ?? 0;
    const status = error.response?.status;

    // Debug 401 errors
    if (status === 401 && typeof window !== 'undefined') {
      console.error('[Axios] 🔴 401 Unauthorized:', {
        url: config.url,
        method: config.method,
        hasAuthHeader: !!config.headers?.Authorization,
        authHeaderPreview: config.headers?.Authorization 
          ? `${String(config.headers.Authorization).substring(0, 20)}...` 
          : 'none',
        directToken: !!localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN),
        storeExists: !!localStorage.getItem(AUTH_STORAGE_KEYS.STORE),
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
      await new Promise((r) =>
        setTimeout(r, API_CONFIG.RETRY.BASE_DELAY * config._retryCount!)
      );
      return apiClient(config);
    }

    // Handle 401 - but NOT for login/register endpoints
    const isAuthEndpoint = config.url?.includes('/auth/login') || 
                           config.url?.includes('/auth/register');
    
    if (status === 401 && !isAuthEndpoint && typeof window !== 'undefined') {
      console.log('[Axios] Clearing auth and redirecting to login...');
      
      localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
      localStorage.removeItem(AUTH_STORAGE_KEYS.STORE);

      const currentPath = window.location.pathname + window.location.search;
      if (!isPublicPath(currentPath)) {
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }
    }

    return Promise.reject(error);
  }
);