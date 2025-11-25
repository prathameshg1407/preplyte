// src/lib/api/services/auth.service.ts
import { apiClient } from '../axios-instance';
import { API_ENDPOINTS } from '../endpoints';
import {
  LoginCredentials,
  RegisterCredentials,
  LoginResponse,
  RegisterResponse,
  User,
} from '@/types/auth.types';
import { ApiResponse } from '@/types/api.types';

export const authService = {
  register: async (credentials: RegisterCredentials): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      credentials
    );
    return response.data;
  },

  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    return response.data;
  },

  logout: async (): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>(
      API_ENDPOINTS.AUTH.LOGOUT
    );
    return response.data;
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get<ApiResponse<User>>(
      API_ENDPOINTS.AUTH.ME
    );
    return response.data;
  },

  // Optionally refresh token
  refreshToken: async (): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(
      API_ENDPOINTS.AUTH.REFRESH
    );
    return response.data;
  },
};