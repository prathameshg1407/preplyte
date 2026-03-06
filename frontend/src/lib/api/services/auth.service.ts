import { apiClient } from '../axios-instance';
import { API_ENDPOINTS } from '../endpoints';
import { AUTH_STORAGE_KEYS, clearAuthStorage, storage } from '@/lib/utils/storage';
import { logger } from '@/lib/utils/logger';
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

const saveTokens = (accessToken: string, refreshToken: string): void => {
  storage.set(AUTH_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  storage.set(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  logger.debug('[AuthService] Tokens saved');
};

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await unwrap(
      apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials)
    );

    if (response.success && response.data?.accessToken && response.data?.refreshToken) {
      saveTokens(response.data.accessToken, response.data.refreshToken);
    }

    return response;
  },

  register: (credentials: RegisterCredentials): Promise<RegisterResponse> =>
    unwrap(apiClient.post(API_ENDPOINTS.AUTH.REGISTER, credentials)),

  sendOTP: (email: string): Promise<ApiResponse<null>> =>
    unwrap(apiClient.post(API_ENDPOINTS.AUTH.SEND_OTP, { email })),

  verifyOTP: (email: string, otp: string): Promise<ApiResponse<{ verified: boolean }>> =>
    unwrap(apiClient.post(API_ENDPOINTS.AUTH.VERIFY_OTP, { email, otp })),

  logout: async (): Promise<ApiResponse<null>> => {
    try {
      const refreshToken = storage.getRaw(AUTH_STORAGE_KEYS.REFRESH_TOKEN);

      if (refreshToken) {
        await unwrap(
          apiClient.post<ApiResponse<null>>(API_ENDPOINTS.AUTH.LOGOUT, { refreshToken })
        );
      }

      return { success: true, data: null };
    } catch (error) {
      logger.warn('[AuthService] Logout API error (ignored)', error);
      return { success: true, data: null };
    } finally {
      clearAuthStorage();
    }
  },

  getCurrentUser: (): Promise<ApiResponse<User>> =>
    unwrap(apiClient.get(API_ENDPOINTS.AUTH.ME)),

  refreshToken: async (): Promise<LoginResponse> => {
    const refreshToken = storage.getRaw(AUTH_STORAGE_KEYS.REFRESH_TOKEN);

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await unwrap(
      apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.REFRESH, { refreshToken })
    );

    if (response.success && response.data?.accessToken && response.data?.refreshToken) {
      saveTokens(response.data.accessToken, response.data.refreshToken);
    }

    return response;
  },
};