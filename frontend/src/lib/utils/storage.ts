// lib/utils/storage.ts
import { logger } from './logger';

export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: 'preplyte_access_token',
  REFRESH_TOKEN: 'preplyte_refresh_token',
  STORE: 'preplyte_auth_store',
} as const;

const isClient = typeof window !== 'undefined';

export const storage = {
  set: (key: string, value: string): void => {
    if (!isClient) return;
    try {
      localStorage.setItem(key, value);
      logger.debug(`[Storage] Set ${key}`);
    } catch (error) {
      logger.error(`[Storage] Failed to set ${key}`, error);
    }
  },

  getRaw: (key: string): string | null => {
    if (!isClient) return null;
    try {
      const value = localStorage.getItem(key);
      return value;
    } catch (error) {
      logger.error(`[Storage] Failed to get ${key}`, error);
      return null;
    }
  },

  get: <T>(key: string): T | null => {
    if (!isClient) return null;
    try {
      const value = localStorage.getItem(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error(`[Storage] Failed to parse ${key}`, error);
      return null;
    }
  },

  remove: (key: string): void => {
    if (!isClient) return;
    try {
      localStorage.removeItem(key);
      logger.debug(`[Storage] Removed ${key}`);
    } catch (error) {
      logger.error(`[Storage] Failed to remove ${key}`, error);
    }
  },

  clear: (): void => {
    if (!isClient) return;
    try {
      localStorage.clear();
      logger.debug('[Storage] Cleared all');
    } catch (error) {
      logger.error('[Storage] Failed to clear', error);
    }
  },
};

export const clearAuthStorage = (): void => {
  if (!isClient) return;
  
  logger.debug('[Storage] Clearing auth storage');
  
  Object.values(AUTH_STORAGE_KEYS).forEach((key) => {
    storage.remove(key);
  });
};

// Verify tokens exist and are valid format
export const hasValidTokens = (): boolean => {
  const accessToken = storage.getRaw(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  const refreshToken = storage.getRaw(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
  
  return !!(accessToken && refreshToken && 
    accessToken.length > 10 && refreshToken.length > 10);
};