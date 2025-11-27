// src/lib/store/mock-drive/discovery-store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MockDriveStatus, MOCKDRIVE_CONSTANTS } from '@/types/mockdrive.types';

interface DiscoveryFilters {
  status: MockDriveStatus[];
  search: string;
  registrationOpen: boolean;
  instituteId?: string;
}

interface DiscoveryStoreState {
  filters: DiscoveryFilters;
  page: number;
  limit: number;

  // Actions
  setFilters: (filters: Partial<DiscoveryFilters>) => void;
  setStatus: (status: MockDriveStatus[]) => void;
  setSearch: (search: string) => void;
  setRegistrationOpen: (open: boolean) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  resetFilters: () => void;
  reset: () => void;
}

const defaultFilters: DiscoveryFilters = {
  status: [
    MockDriveStatus.PUBLISHED,
    MockDriveStatus.REGISTRATION_OPEN,
    MockDriveStatus.REGISTRATION_CLOSED,
    MockDriveStatus.IN_PROGRESS,
  ],
  search: '',
  registrationOpen: false,
};

const initialState = {
  filters: defaultFilters,
  page: 1,
  limit: MOCKDRIVE_CONSTANTS.DEFAULT_PAGE_SIZE,
};

export const useDiscoveryStore = create<DiscoveryStoreState>()(
  persist(
    (set) => ({
      ...initialState,

      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
          page: 1, // Reset page when filters change
        })),

      setStatus: (status) =>
        set((state) => ({
          filters: { ...state.filters, status },
          page: 1,
        })),

      setSearch: (search) =>
        set((state) => ({
          filters: { ...state.filters, search },
          page: 1,
        })),

      setRegistrationOpen: (registrationOpen) =>
        set((state) => ({
          filters: { ...state.filters, registrationOpen },
          page: 1,
        })),

      setPage: (page) => set({ page }),

      setLimit: (limit) =>
        set({
          limit,
          page: 1, // Reset page when limit changes
        }),

      resetFilters: () => set({ filters: defaultFilters, page: 1 }),

      reset: () => set(initialState),
    }),
    {
      name: 'mockdrive-discovery',
      partialize: (state) => ({
        limit: state.limit,
      }),
    }
  )
);

// Selector hooks
export const useDiscoveryFilters = () => useDiscoveryStore((state) => state.filters);
export const useDiscoveryPage = () => useDiscoveryStore((state) => state.page);