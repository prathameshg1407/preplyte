// Match Prisma schema enum exactly
export type UserRole = 'PLATFORM_ADMIN' | 'INSTITUTE_ADMIN' | 'USER';

export type AuthContext = 'PLATFORM' | 'INSTITUTE';

export interface Institute {
  id: string;
  name: string;
  domain: string;
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

export interface AuthData {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  context: AuthContext | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
}