// src/lib/store/mock-drive/leaderboard-store.ts

import { create } from 'zustand';
import { LeaderboardFilters, MOCKDRIVE_CONSTANTS } from '@/types/mockdrive.types';

interface LeaderboardStoreState {
  // Current drive context
  currentDriveId: string | null;

  // Filters and pagination
  filters: LeaderboardFilters;
  page: number;
  limit: number;

  // UI state
  showOnlyMyBatch: boolean;

  // Actions
  setCurrentDriveId: (driveId: string | null) => void;
  setFilters: (filters: LeaderboardFilters) => void;
  setBatchId: (batchId: string | undefined) => void;
  setDepartment: (departmentId: string | undefined) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setShowOnlyMyBatch: (show: boolean) => void;
  reset: () => void;
  resetFilters: () => void;
}

const initialState = {
  currentDriveId: null,
  filters: {},
  page: 1,
  limit: 20,
  showOnlyMyBatch: true,
};

export const useLeaderboardStore = create<LeaderboardStoreState>((set) => ({
  ...initialState,

  setCurrentDriveId: (driveId) => set({ currentDriveId: driveId }),

  setFilters: (filters) =>
    set({
      filters,
      page: 1, // Reset page when filters change
    }),

  setBatchId: (batchId) =>
    set((state) => ({
      filters: { ...state.filters, batchId },
      page: 1,
    })),

  setDepartment: (department) =>
    set((state) => ({
      filters: { ...state.filters, department },
      page: 1,
    })),

  setPage: (page) => set({ page }),

  setLimit: (limit) =>
    set({
      limit,
      page: 1, // Reset page when limit changes
    }),

  setShowOnlyMyBatch: (show) => set({ showOnlyMyBatch: show }),

  resetFilters: () =>
    set({
      filters: {},
      page: 1,
    }),

  reset: () => set(initialState),
}));

// Selector hooks
export const useLeaderboardFilters = () => useLeaderboardStore((state) => state.filters);
export const useLeaderboardPage = () => useLeaderboardStore((state) => state.page);