// src/types/auth.types.ts

export type UserRole = 'PLATFORM_ADMIN' | 'INSTITUTE_ADMIN' | 'USER';

export interface Institute {
  id: string;
  name: string;
  domain: string;
  logo?: string | null;
  isActive?: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  isActive: boolean;
  instituteId: string | null;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt: string | null;
  institute: Institute | null;
}

export type AuthUser = User;

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name?: string;
}

// Matches backend auth.service.ts login response
export interface LoginResponseData {
  user: User;
  token: string;
  expiresIn: string;
  context: 'PLATFORM' | 'INSTITUTE';
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: LoginResponseData;
}

// Matches backend auth.service.ts register response
export interface RegisterResponse {
  success: boolean;
  message: string;
  data: User;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  context: 'PLATFORM' | 'INSTITUTE' | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
}

export type AuthContext = 'PLATFORM' | 'INSTITUTE';