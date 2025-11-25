// src/lib/api/axios-instance.ts
import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const REQUEST_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Helper to safely access localStorage
const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('auth_token');
  } catch {
    return null;
  }
};

const clearAuthData = (): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  } catch {
    // Ignore errors
  }
};

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request ID for tracking
    config.headers['X-Request-ID'] = crypto.randomUUID?.() || Date.now().toString();

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Retry logic helper
const shouldRetry = (error: AxiosError, retryCount: number): boolean => {
  if (retryCount >= MAX_RETRIES) return false;

  // Don't retry on auth errors
  if (error.response?.status === 401 || error.response?.status === 403) {
    return false;
  }

  // Retry on network errors or 5xx server errors
  if (!error.response || (error.response.status >= 500 && error.response.status < 600)) {
    return true;
  }

  // Retry on timeout
  if (error.code === 'ECONNABORTED') {
    return true;
  }

  return false;
};

const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & { _retryCount?: number };

    // Initialize retry count
    if (!config._retryCount) {
      config._retryCount = 0;
    }

    // Retry logic
    if (shouldRetry(error, config._retryCount)) {
      config._retryCount += 1;
      await delay(RETRY_DELAY * config._retryCount);
      return apiClient(config);
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      clearAuthData();

      // Redirect to login if not already there
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        const publicPaths = ['/login', '/register', '/forgot-password'];
        
        if (!publicPaths.some((path) => currentPath.startsWith(path))) {
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        }
      }
    }

    return Promise.reject(error);
  }
);

// Export for direct usage in specific cases
export { API_BASE_URL };