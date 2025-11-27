// src/lib/api/config.ts

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  TIMEOUT: 30000,
  RETRY: {
    MAX_ATTEMPTS: 3,
    BASE_DELAY: 1000,
  },
} as const;

export const PUBLIC_PATHS = ['/login', '/register', '/forgot-password'] as const;

export const isPublicPath = (path: string): boolean =>
  PUBLIC_PATHS.some((p) => path.toLowerCase().startsWith(p.toLowerCase()));