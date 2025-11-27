// src/lib/hooks/institute-admin/use-mockdrive.ts

'use client';

import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  mockDriveService,
  ApiError,
} from '@/lib/api/services/institute-admin/mockdrive.service';
import {
  CreateMockDriveInput,
  UpdateMockDriveInput,
  ListMockDrivesParams,
  MockDriveDetails,
  MockDriveListItem,
  PaginatedResponse,
  MockDriveStatus,
} from '@/types/admin.mockdrive.types';
import { useToast } from '@/components/ui/use-toast';

// ============================================
// Query Keys Factory
// ============================================

export const mockDriveKeys = {
  all: ['mockDrives'] as const,
  lists: () => [...mockDriveKeys.all, 'list'] as const,
  list: (params: ListMockDrivesParams) =>
    [...mockDriveKeys.lists(), params] as const,
  details: () => [...mockDriveKeys.all, 'detail'] as const,
  detail: (id: string) => [...mockDriveKeys.details(), id] as const,
  stats: (id: string) => [...mockDriveKeys.all, 'stats', id] as const,
} as const;

// ============================================
// Types
// ============================================

interface UseMockDriveListOptions {
  enabled?: boolean;
  staleTime?: number;
  refetchOnWindowFocus?: boolean;
}

interface UseMockDriveDetailOptions {
  enabled?: boolean;
  staleTime?: number;
}

// ============================================
// List Mock Drives Hook
// ============================================

export function useMockDriveList(
  params: ListMockDrivesParams = {},
  options: UseMockDriveListOptions = {}
) {
  const { enabled = true, staleTime = 30 * 1000, refetchOnWindowFocus = true } = options;
  const { toast } = useToast();

  return useQuery({
    queryKey: mockDriveKeys.list(params),
    queryFn: async () => {
      try {
        return await mockDriveService.list(params);
      } catch (error) {
        const apiError = error as ApiError;
        toast({
          variant: 'destructive',
          title: 'Error fetching mock drives',
          description: apiError.message || 'An unexpected error occurred',
        });
        throw error;
      }
    },
    enabled,
    staleTime,
    refetchOnWindowFocus,
    placeholderData: (previousData) => previousData,
  });
}

// ============================================
// Get Mock Drive Detail Hook
// ============================================

export function useMockDriveDetail(
  id: string | undefined | null,
  options: UseMockDriveDetailOptions = {}
) {
  const { enabled = true, staleTime = 60 * 1000 } = options;
  const { toast } = useToast();
  const isEnabled = enabled && !!id;

  return useQuery({
    queryKey: mockDriveKeys.detail(id ?? ''),
    queryFn: async () => {
      if (!id) {
        throw new Error('Mock drive ID is required');
      }
      try {
        return await mockDriveService.getById(id);
      } catch (error) {
        const apiError = error as ApiError;
        toast({
          variant: 'destructive',
          title: 'Error fetching mock drive details',
          description: apiError.message || 'An unexpected error occurred',
        });
        throw error;
      }
    },
    enabled: isEnabled,
    staleTime,
  });
}

// ============================================
// Get Mock Drive Stats Hook
// ============================================

export function useMockDriveStats(id: string | undefined | null) {
  const { toast } = useToast();
  const isEnabled = !!id;

  return useQuery({
    queryKey: mockDriveKeys.stats(id ?? ''),
    queryFn: async () => {
      if (!id) {
        throw new Error('Mock drive ID is required');
      }
      try {
        return await mockDriveService.getStats(id);
      } catch (error) {
        const apiError = error as ApiError;
        toast({
          variant: 'destructive',
          title: 'Error fetching mock drive stats',
          description: apiError.message || 'An unexpected error occurred',
        });
        throw error;
      }
    },
    enabled: isEnabled,
    staleTime: 30 * 1000,
  });
}

// ============================================
// Create Mock Drive Hook
// ============================================

export function useCreateMockDrive() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateMockDriveInput) => mockDriveService.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: mockDriveKeys.lists() });
      toast({
        title: 'Success',
        description: 'Mock drive created successfully',
      });
      return data;
    },
    onError: (error: ApiError) => {
      toast({
        variant: 'destructive',
        title: 'Error creating mock drive',
        description: error.message || 'An unexpected error occurred',
      });
    },
  });
}

// ============================================
// Update Mock Drive Hook
// ============================================

interface UpdateMockDriveParams {
  id: string;
  data: UpdateMockDriveInput;
}

export function useUpdateMockDrive() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: UpdateMockDriveParams) =>
      mockDriveService.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: mockDriveKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: mockDriveKeys.detail(variables.id),
      });
      toast({
        title: 'Success',
        description: 'Mock drive updated successfully',
      });
      return data;
    },
    onError: (error: ApiError) => {
      toast({
        variant: 'destructive',
        title: 'Error updating mock drive',
        description: error.message || 'An unexpected error occurred',
      });
    },
  });
}

// ============================================
// Delete Mock Drive Hook
// ============================================

export function useDeleteMockDrive() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => mockDriveService.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: mockDriveKeys.lists() });
      queryClient.removeQueries({ queryKey: mockDriveKeys.detail(id) });
      queryClient.removeQueries({ queryKey: mockDriveKeys.stats(id) });
      toast({
        title: 'Success',
        description: 'Mock drive deleted successfully',
      });
    },
    onError: (error: ApiError) => {
      toast({
        variant: 'destructive',
        title: 'Error deleting mock drive',
        description: error.message || 'An unexpected error occurred',
      });
    },
  });
}

// ============================================
// Publish Mock Drive Hook
// ============================================

export function usePublishMockDrive() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => mockDriveService.publish(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: mockDriveKeys.lists() });
      queryClient.invalidateQueries({ queryKey: mockDriveKeys.detail(id) });
      toast({
        title: 'Success',
        description: 'Mock drive published successfully',
      });
      return data;
    },
    onError: (error: ApiError) => {
      toast({
        variant: 'destructive',
        title: 'Error publishing mock drive',
        description: error.message || 'An unexpected error occurred',
      });
    },
  });
}

// ============================================
// Cancel Mock Drive Hook
// ============================================

export function useCancelMockDrive() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => mockDriveService.cancel(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: mockDriveKeys.lists() });
      queryClient.invalidateQueries({ queryKey: mockDriveKeys.detail(id) });
      toast({
        title: 'Success',
        description: 'Mock drive cancelled successfully',
      });
      return data;
    },
    onError: (error: ApiError) => {
      toast({
        variant: 'destructive',
        title: 'Error cancelling mock drive',
        description: error.message || 'An unexpected error occurred',
      });
    },
  });
}

// ============================================
// Duplicate Mock Drive Hook
// ============================================

interface DuplicateMockDriveParams {
  id: string;
  title?: string;
}

export function useDuplicateMockDrive() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, title }: DuplicateMockDriveParams) =>
      mockDriveService.duplicate(id, title),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: mockDriveKeys.lists() });
      toast({
        title: 'Success',
        description: 'Mock drive duplicated successfully',
      });
      return data;
    },
    onError: (error: ApiError) => {
      toast({
        variant: 'destructive',
        title: 'Error duplicating mock drive',
        description: error.message || 'An unexpected error occurred',
      });
    },
  });
}

// ============================================
// Combined Hook for List Page
// ============================================

interface UseMockDriveListPageOptions {
  initialParams?: Partial<ListMockDrivesParams>;
}

const DEFAULT_LIST_PARAMS: ListMockDrivesParams = {
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export function useMockDriveListPage(options: UseMockDriveListPageOptions = {}) {
  const { initialParams = {} } = options;

  const [params, setParams] = useState<ListMockDrivesParams>({
    ...DEFAULT_LIST_PARAMS,
    ...initialParams,
  });

  const query = useMockDriveList(params);
  const deleteMutation = useDeleteMockDrive();
  const publishMutation = usePublishMockDrive();
  const cancelMutation = useCancelMockDrive();
  const duplicateMutation = useDuplicateMockDrive();

  // Memoized setters to prevent unnecessary re-renders
  const setPage = useCallback((page: number) => {
    setParams((prev) => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setParams((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  const setSearch = useCallback((search: string) => {
    setParams((prev) => ({
      ...prev,
      search: search.trim() || undefined,
      page: 1,
    }));
  }, []);

  const setStatus = useCallback((status: MockDriveStatus | undefined) => {
    setParams((prev) => ({ ...prev, status, page: 1 }));
  }, []);

  const setSorting = useCallback(
    (
      sortBy: ListMockDrivesParams['sortBy'],
      sortOrder: ListMockDrivesParams['sortOrder']
    ) => {
      setParams((prev) => ({ ...prev, sortBy, sortOrder }));
    },
    []
  );

  const resetFilters = useCallback(() => {
    setParams(DEFAULT_LIST_PARAMS);
  }, []);

  // Computed values
  const isAnyActionPending = useMemo(
    () =>
      deleteMutation.isPending ||
      publishMutation.isPending ||
      cancelMutation.isPending ||
      duplicateMutation.isPending,
    [
      deleteMutation.isPending,
      publishMutation.isPending,
      cancelMutation.isPending,
      duplicateMutation.isPending,
    ]
  );

 const pagination = useMemo(() => {
    if (!query.data) {
      return {
        currentPage: params.page ?? 1,
        totalPages: 1,
        totalItems: 0,
        hasNextPage: false,
        hasPrevPage: false,
      };
    }
    // Access the nested pagination object
    const { page, totalPages, total } = query.data.pagination;
    return {
      currentPage: page,
      totalPages,
      totalItems: total,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }, [query.data, params.page]);

  return {
    // Query state
    data: query.data,
    items: query.data?.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,

    // Pagination
    pagination,

    // Current params
    params,

    // Param setters
    setPage,
    setLimit,
    setSearch,
    setStatus,
    setSorting,
    resetFilters,

    // Actions
    deleteMockDrive: deleteMutation.mutate,
    deleteMockDriveAsync: deleteMutation.mutateAsync,
    publishMockDrive: publishMutation.mutate,
    publishMockDriveAsync: publishMutation.mutateAsync,
    cancelMockDrive: cancelMutation.mutate,
    cancelMockDriveAsync: cancelMutation.mutateAsync,
    duplicateMockDrive: duplicateMutation.mutate,
    duplicateMockDriveAsync: duplicateMutation.mutateAsync,

    // Action states
    isDeleting: deleteMutation.isPending,
    isPublishing: publishMutation.isPending,
    isCancelling: cancelMutation.isPending,
    isDuplicating: duplicateMutation.isPending,
    isAnyActionPending,
  };
}

// ============================================
// Combined Hook for Detail Page
// ============================================

export function useMockDriveDetailPage(id: string | undefined | null) {
  const detailQuery = useMockDriveDetail(id);
  const statsQuery = useMockDriveStats(id);
  const updateMutation = useUpdateMockDrive();
  const publishMutation = usePublishMockDrive();
  const cancelMutation = useCancelMockDrive();
  const deleteMutation = useDeleteMockDrive();

  const isAnyActionPending = useMemo(
    () =>
      updateMutation.isPending ||
      publishMutation.isPending ||
      cancelMutation.isPending ||
      deleteMutation.isPending,
    [
      updateMutation.isPending,
      publishMutation.isPending,
      cancelMutation.isPending,
      deleteMutation.isPending,
    ]
  );

  return {
    // Detail query
    mockDrive: detailQuery.data,
    isLoading: detailQuery.isLoading,
    isError: detailQuery.isError,
    error: detailQuery.error,
    refetchDetail: detailQuery.refetch,

    // Stats query
    stats: statsQuery.data,
    isLoadingStats: statsQuery.isLoading,
    refetchStats: statsQuery.refetch,

    // Actions
    updateMockDrive: updateMutation.mutate,
    updateMockDriveAsync: updateMutation.mutateAsync,
    publishMockDrive: () => id && publishMutation.mutate(id),
    cancelMockDrive: () => id && cancelMutation.mutate(id),
    deleteMockDrive: () => id && deleteMutation.mutate(id),

    // Action states
    isUpdating: updateMutation.isPending,
    isPublishing: publishMutation.isPending,
    isCancelling: cancelMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isAnyActionPending,
  };
}