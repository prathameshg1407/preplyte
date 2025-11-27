// src/lib/utils/storage.ts

const isClient = typeof window !== 'undefined';

/**
 * SSR-safe localStorage wrapper with error handling
 */
export const storage = {
  get<T = string>(key: string): T | null {
    if (!isClient) return null;
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      // Try to parse as JSON, fallback to raw string
      try {
        return JSON.parse(item) as T;
      } catch {
        return item as unknown as T;
      }
    } catch (error) {
      console.warn(`[Storage] Failed to get key: ${key}`, error);
      return null;
    }
  },

  getRaw(key: string): string | null {
    if (!isClient) return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(`[Storage] Failed to get raw key: ${key}`, error);
      return null;
    }
  },

  set(key: string, value: unknown): boolean {
    if (!isClient) return false;
    try {
      const serialized =
        typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.warn(`[Storage] Failed to save key: ${key}`, error);
      return false;
    }
  },

  remove(key: string): boolean {
    if (!isClient) return false;
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`[Storage] Failed to remove key: ${key}`, error);
      return false;
    }
  },

  clear(keys: string[]): void {
    keys.forEach((key) => this.remove(key));
  },

  clearAll(): void {
    if (!isClient) return;
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('[Storage] Failed to clear all', error);
    }
  },
};

// Auth-specific storage keys
export const AUTH_STORAGE_KEYS = {
  TOKEN: 'auth_token',
  STORE: 'auth-storage',
} as const;