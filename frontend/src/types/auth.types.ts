// src/types/auth.types.ts

export type UserRole = 'PLATFORM_ADMIN' | 'INSTITUTE_ADMIN' | 'USER';
export type AuthContext = 'PLATFORM' | 'INSTITUTE';

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
  institute: Institute | null;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name?: string;
}

// FIXED: Match actual API response
export interface AuthData {
  user: User;
  accessToken: string;      // Changed from 'token'
  refreshToken: string;     // Added
  expiresIn: string;
  context?: AuthContext;    // Made optional since API doesn't return it
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;  // Added
  context: AuthContext | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
}