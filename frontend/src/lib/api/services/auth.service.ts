// src/lib/api/services/auth.service.ts
import { apiClient } from '../axios-instance';
import { API_ENDPOINTS } from '../endpoints';
import { AUTH_STORAGE_KEYS } from '@/lib/utils/storage';
import type { ApiResponse } from '@/types/api.types';
import type {
  LoginCredentials,
  RegisterCredentials,
  AuthData,
  User,
} from '@/types/auth.types';

type LoginResponse = ApiResponse<AuthData>;
type RegisterResponse = ApiResponse<User>;

const unwrap = <T>(promise: Promise<{ data: T }>): Promise<T> =>
  promise.then((res) => res.data);

// Save token to localStorage
const saveTokenSync = (token: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
    const saved = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
    console.log('[AuthService] Token save:', saved === token ? '✅ SUCCESS' : '❌ FAILED');
    return saved === token;
  } catch (error) {
    console.error('[AuthService] Token save error:', error);
    return false;
  }
};

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await unwrap(
      apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials)
    );

    console.log('[AuthService] Login response:', response);

    // Save accessToken (not token!)
    if (response.success && response.data?.accessToken) {
      saveTokenSync(response.data.accessToken);
    } else {
      console.error('[AuthService] No accessToken in response');
    }

    return response;
  },

  register: (credentials: RegisterCredentials): Promise<RegisterResponse> =>
    unwrap(apiClient.post(API_ENDPOINTS.AUTH.REGISTER, credentials)),

  logout: async (): Promise<ApiResponse<void>> => {
    try {
      const response = await unwrap(
        apiClient.post<ApiResponse<void>>(API_ENDPOINTS.AUTH.LOGOUT)
      );
      return response;
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
        localStorage.removeItem(AUTH_STORAGE_KEYS.STORE);
      }
    }
  },

  getCurrentUser: (): Promise<ApiResponse<User>> =>
    unwrap(apiClient.get(API_ENDPOINTS.AUTH.ME)),

  refreshToken: async (): Promise<LoginResponse> => {
    const response = await unwrap(
      apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.REFRESH)
    );

    if (response.success && response.data?.accessToken) {
      saveTokenSync(response.data.accessToken);
    }

    return response;
  },
};