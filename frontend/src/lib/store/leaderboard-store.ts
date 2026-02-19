// src/lib/store/leaderboard-store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LeaderboardCategory, LeaderboardScope } from '@/types/leaderboard.types';

// =====================================================
// STORE TYPES
// =====================================================

interface LeaderboardFilters {
  scope: LeaderboardScope;
  category: LeaderboardCategory;
  page: number;
  limit: number;
}

interface LeaderboardStore {
  filters: LeaderboardFilters;
  setScope: (scope: LeaderboardScope) => void;
  setCategory: (category: LeaderboardCategory) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  resetFilters: () => void;
}

// =====================================================
// DEFAULT STATE
// =====================================================

const DEFAULT_FILTERS: LeaderboardFilters = {
  scope: 'global',
  category: 'overall',
  page: 1,
  limit: 20,
};

// =====================================================
// STORE IMPLEMENTATION
// =====================================================

export const useLeaderboardStore = create<LeaderboardStore>()(
  persist(
    (set) => ({
      filters: DEFAULT_FILTERS,

      setScope: (scope) =>
        set((state) => ({
          filters: { ...state.filters, scope, page: 1 },
        })),

      setCategory: (category) =>
        set((state) => ({
          filters: { ...state.filters, category, page: 1 },
        })),

      setPage: (page) =>
        set((state) => ({
          filters: { ...state.filters, page },
        })),

      setLimit: (limit) =>
        set((state) => ({
          filters: { ...state.filters, limit, page: 1 },
        })),

      resetFilters: () =>
        set({
          filters: DEFAULT_FILTERS,
        }),
    }),
    {
      name: 'leaderboard-filters',
      partialize: (state) => ({ filters: state.filters }),
    }
  )
);