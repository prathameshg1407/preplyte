// src/lib/store/admin-store.ts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  Institute,
  User,
  PlatformAnalytics,
  PaginationMeta,
  InstituteFilters,
  UserFilters,
} from '../../types/admin.types';

interface AdminState {
  // Analytics
  analytics: PlatformAnalytics | null;
  analyticsLoading: boolean;

  // Institutes
  institutes: Institute[];
  institutesPagination: PaginationMeta | null;
  institutesLoading: boolean;
  instituteFilters: InstituteFilters;
  selectedInstitute: Institute | null;

  // Users
  users: User[];
  usersPagination: PaginationMeta | null;
  usersLoading: boolean;
  userFilters: UserFilters;
  selectedUser: User | null;

  // Actions
  setAnalytics: (analytics: PlatformAnalytics | null) => void;
  setAnalyticsLoading: (loading: boolean) => void;

  setInstitutes: (institutes: Institute[], pagination: PaginationMeta) => void;
  setInstitutesLoading: (loading: boolean) => void;
  setInstituteFilters: (filters: Partial<InstituteFilters>) => void;
  setSelectedInstitute: (institute: Institute | null) => void;
  updateInstitute: (id: string, updates: Partial<Institute>) => void;
  removeInstitute: (id: string) => void;

  setUsers: (users: User[], pagination: PaginationMeta) => void;
  setUsersLoading: (loading: boolean) => void;
  setUserFilters: (filters: Partial<UserFilters>) => void;
  setSelectedUser: (user: User | null) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  removeUser: (id: string) => void;

  reset: () => void;
}

const initialState = {
  analytics: null,
  analyticsLoading: false,

  institutes: [],
  institutesPagination: null,
  institutesLoading: false,
  instituteFilters: { page: 1, limit: 10, sortBy: 'createdAt' as const, sortOrder: 'desc' as const },
  selectedInstitute: null,

  users: [],
  usersPagination: null,
  usersLoading: false,
  userFilters: { page: 1, limit: 10, sortBy: 'createdAt' as const, sortOrder: 'desc' as const },
  selectedUser: null,
};

export const useAdminStore = create<AdminState>()(
  devtools(
    (set) => ({
      ...initialState,

      // Analytics
      setAnalytics: (analytics) => set({ analytics }),
      setAnalyticsLoading: (analyticsLoading) => set({ analyticsLoading }),

      // Institutes
      setInstitutes: (institutes, institutesPagination) =>
        set({ institutes, institutesPagination }),
      setInstitutesLoading: (institutesLoading) => set({ institutesLoading }),
      setInstituteFilters: (filters) =>
        set((state) => ({
          instituteFilters: { ...state.instituteFilters, ...filters },
        })),
      setSelectedInstitute: (selectedInstitute) => set({ selectedInstitute }),
      updateInstitute: (id, updates) =>
        set((state) => ({
          institutes: state.institutes.map((inst) =>
            inst.id === id ? { ...inst, ...updates } : inst
          ),
          selectedInstitute:
            state.selectedInstitute?.id === id
              ? { ...state.selectedInstitute, ...updates }
              : state.selectedInstitute,
        })),
      removeInstitute: (id) =>
        set((state) => ({
          institutes: state.institutes.filter((inst) => inst.id !== id),
        })),

      // Users
      setUsers: (users, usersPagination) => set({ users, usersPagination }),
      setUsersLoading: (usersLoading) => set({ usersLoading }),
      setUserFilters: (filters) =>
        set((state) => ({
          userFilters: { ...state.userFilters, ...filters },
        })),
      setSelectedUser: (selectedUser) => set({ selectedUser }),
      updateUser: (id, updates) =>
        set((state) => ({
          users: state.users.map((user) =>
            user.id === id ? { ...user, ...updates } : user
          ),
          selectedUser:
            state.selectedUser?.id === id
              ? { ...state.selectedUser, ...updates }
              : state.selectedUser,
        })),
      removeUser: (id) =>
        set((state) => ({
          users: state.users.filter((user) => user.id !== id),
        })),

      reset: () => set(initialState),
    }),
    { name: 'admin-store' }
  )
);