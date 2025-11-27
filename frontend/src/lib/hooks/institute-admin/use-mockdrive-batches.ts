// src/lib/hooks/institute-admin/use-mockdrive-batches.ts

'use client';

import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';

import { mockDriveBatchesService } from '@/lib/api/services/institute-admin/mockdrive-batches.service';
import { ApiError } from '@/lib/api/services/institute-admin/api-utils';
import { batchKeys, registrationKeys } from './query-keys';

import type {
  BatchDetails,
  BatchListItem,
  BatchStudent,
  AssignResult,
  UnassignResult,
  CreateBatchInput,
  UpdateBatchInput,
  AutoCreateBatchesInput,
  AssignStudentsInput,
  ListBatchesParams,
  MockDriveBatchStatus,
} from '@/types/admin.mockdrive.types';

// ============================================
// Types
// ============================================

interface UseBatchesOptions {
  enabled?: boolean;
}

// ============================================
// List Batches Hook
// ============================================

export function useBatches(
  mockDriveId: string | undefined | null,
  params: ListBatchesParams = {},
  options: UseBatchesOptions = {}
) {
  const { enabled = true } = options;
  const isEnabled = enabled && !!mockDriveId;

  return useQuery({
    queryKey: batchKeys.list(mockDriveId ?? '', params),
    queryFn: async () => {
      if (!mockDriveId) throw new Error('Mock drive ID is required');
      return mockDriveBatchesService.listBatches(mockDriveId, params);
    },
    enabled: isEnabled,
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
  });
}

// ============================================
// Batch Detail Hook
// ============================================

export function useBatchDetail(
  mockDriveId: string | undefined | null,
  batchId: string | undefined | null,
  options: UseBatchesOptions = {}
) {
  const { enabled = true } = options;
  const isEnabled = enabled && !!mockDriveId && !!batchId;

  return useQuery({
    queryKey: batchKeys.detail(mockDriveId ?? '', batchId ?? ''),
    queryFn: async () => {
      if (!mockDriveId || !batchId) {
        throw new Error('Mock drive ID and batch ID are required');
      }
      return mockDriveBatchesService.getBatch(mockDriveId, batchId);
    },
    enabled: isEnabled,
    staleTime: 30 * 1000,
  });
}

// ============================================
// Batch Students Hook
// ============================================

export function useBatchStudents(
  mockDriveId: string | undefined | null,
  batchId: string | undefined | null,
  options: UseBatchesOptions = {}
) {
  const { enabled = true } = options;
  const isEnabled = enabled && !!mockDriveId && !!batchId;

  return useQuery({
    queryKey: batchKeys.students(mockDriveId ?? '', batchId ?? ''),
    queryFn: async () => {
      if (!mockDriveId || !batchId) {
        throw new Error('Mock drive ID and batch ID are required');
      }
      return mockDriveBatchesService.getBatchStudents(mockDriveId, batchId);
    },
    enabled: isEnabled,
    staleTime: 30 * 1000,
  });
}

// ============================================
// Create Batch Hook
// ============================================

export function useCreateBatch(mockDriveId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateBatchInput) =>
      mockDriveBatchesService.createBatch(mockDriveId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: batchKeys.all(mockDriveId) });
      toast({
        title: 'Success',
        description: 'Batch created successfully',
      });
    },
    onError: (error: ApiError) => {
      toast({
        variant: 'destructive',
        title: 'Error creating batch',
        description: error.message,
      });
    },
  });
}

// ============================================
// Update Batch Hook
// ============================================

interface UpdateBatchParams {
  batchId: string;
  data: UpdateBatchInput;
}

export function useUpdateBatch(mockDriveId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ batchId, data }: UpdateBatchParams) =>
      mockDriveBatchesService.updateBatch(mockDriveId, batchId, data),
    onSuccess: (_, { batchId }) => {
      queryClient.invalidateQueries({ queryKey: batchKeys.all(mockDriveId) });
      queryClient.invalidateQueries({
        queryKey: batchKeys.detail(mockDriveId, batchId),
      });
      toast({
        title: 'Success',
        description: 'Batch updated successfully',
      });
    },
    onError: (error: ApiError) => {
      toast({
        variant: 'destructive',
        title: 'Error updating batch',
        description: error.message,
      });
    },
  });
}

// ============================================
// Delete Batch Hook
// ============================================

export function useDeleteBatch(mockDriveId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (batchId: string) =>
      mockDriveBatchesService.deleteBatch(mockDriveId, batchId),
    onSuccess: (_, batchId) => {
      queryClient.invalidateQueries({ queryKey: batchKeys.all(mockDriveId) });
      queryClient.removeQueries({ queryKey: batchKeys.detail(mockDriveId, batchId) });
      queryClient.invalidateQueries({ queryKey: registrationKeys.all(mockDriveId) });
      toast({
        title: 'Success',
        description: 'Batch deleted successfully',
      });
    },
    onError: (error: ApiError) => {
      toast({
        variant: 'destructive',
        title: 'Error deleting batch',
        description: error.message,
      });
    },
  });
}

// ============================================
// Auto Create Batches Hook
// ============================================

export function useAutoCreateBatches(mockDriveId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: AutoCreateBatchesInput) =>
      mockDriveBatchesService.autoCreateBatches(mockDriveId, data),
    onSuccess: (batches) => {
      queryClient.invalidateQueries({ queryKey: batchKeys.all(mockDriveId) });
      queryClient.invalidateQueries({ queryKey: registrationKeys.all(mockDriveId) });
      toast({
        title: 'Success',
        description: `${batches.length} batches created successfully`,
      });
    },
    onError: (error: ApiError) => {
      toast({
        variant: 'destructive',
        title: 'Error creating batches',
        description: error.message,
      });
    },
  });
}

// ============================================
// Assign Students Hook
// ============================================

interface AssignStudentsParams {
  batchId: string;
  data: AssignStudentsInput;
}

export function useAssignStudents(mockDriveId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ batchId, data }: AssignStudentsParams) =>
      mockDriveBatchesService.assignStudents(mockDriveId, batchId, data),
    onSuccess: (result, { batchId }) => {
      queryClient.invalidateQueries({ queryKey: batchKeys.all(mockDriveId) });
      queryClient.invalidateQueries({
        queryKey: batchKeys.students(mockDriveId, batchId),
      });
      queryClient.invalidateQueries({ queryKey: registrationKeys.all(mockDriveId) });
      toast({
        title: 'Students Assigned',
        description: `${result.assigned} assigned, ${result.failed.length} failed`,
      });
    },
    onError: (error: ApiError) => {
      toast({
        variant: 'destructive',
        title: 'Error assigning students',
        description: error.message,
      });
    },
  });
}

// ============================================
// Unassign Students Hook
// ============================================

interface UnassignStudentsParams {
  batchId: string;
  registrationIds: string[];
}

export function useUnassignStudents(mockDriveId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ batchId, registrationIds }: UnassignStudentsParams) =>
      mockDriveBatchesService.unassignStudents(mockDriveId, batchId, registrationIds),
    onSuccess: (result, { batchId }) => {
      queryClient.invalidateQueries({ queryKey: batchKeys.all(mockDriveId) });
      queryClient.invalidateQueries({
        queryKey: batchKeys.students(mockDriveId, batchId),
      });
      queryClient.invalidateQueries({ queryKey: registrationKeys.all(mockDriveId) });
      toast({
        title: 'Success',
        description: `${result.unassigned} students unassigned`,
      });
    },
    onError: (error: ApiError) => {
      toast({
        variant: 'destructive',
        title: 'Error unassigning students',
        description: error.message,
      });
    },
  });
}

// ============================================
// Start Batch Hook
// ============================================

export function useStartBatch(mockDriveId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (batchId: string) =>
      mockDriveBatchesService.startBatch(mockDriveId, batchId),
    onSuccess: (_, batchId) => {
      queryClient.invalidateQueries({ queryKey: batchKeys.all(mockDriveId) });
      queryClient.invalidateQueries({
        queryKey: batchKeys.detail(mockDriveId, batchId),
      });
      toast({
        title: 'Success',
        description: 'Batch started successfully',
      });
    },
    onError: (error: ApiError) => {
      toast({
        variant: 'destructive',
        title: 'Error starting batch',
        description: error.message,
      });
    },
  });
}

// ============================================
// Complete Batch Hook
// ============================================

export function useCompleteBatch(mockDriveId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (batchId: string) =>
      mockDriveBatchesService.completeBatch(mockDriveId, batchId),
    onSuccess: (_, batchId) => {
      queryClient.invalidateQueries({ queryKey: batchKeys.all(mockDriveId) });
      queryClient.invalidateQueries({
        queryKey: batchKeys.detail(mockDriveId, batchId),
      });
      toast({
        title: 'Success',
        description: 'Batch completed successfully',
      });
    },
    onError: (error: ApiError) => {
      toast({
        variant: 'destructive',
        title: 'Error completing batch',
        description: error.message,
      });
    },
  });
}

// ============================================
// Combined Batches Page Hook
// ============================================

const DEFAULT_PARAMS: ListBatchesParams = {
  page: 1,
  limit: 20,
  sortBy: 'scheduledStartTime',
  sortOrder: 'asc',
};

export function useBatchesPage(mockDriveId: string | undefined | null) {
  const [params, setParams] = useState<ListBatchesParams>(DEFAULT_PARAMS);

  const batchesQuery = useBatches(mockDriveId, params);

  const createMutation = useCreateBatch(mockDriveId ?? '');
  const updateMutation = useUpdateBatch(mockDriveId ?? '');
  const deleteMutation = useDeleteBatch(mockDriveId ?? '');
  const autoCreateMutation = useAutoCreateBatches(mockDriveId ?? '');
  const assignMutation = useAssignStudents(mockDriveId ?? '');
  const unassignMutation = useUnassignStudents(mockDriveId ?? '');
  const startMutation = useStartBatch(mockDriveId ?? '');
  const completeMutation = useCompleteBatch(mockDriveId ?? '');

  // Param setters
  const setPage = useCallback((page: number) => {
    setParams((prev) => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setParams((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  const setStatus = useCallback((status: MockDriveBatchStatus | undefined) => {
    setParams((prev) => ({ ...prev, status, page: 1 }));
  }, []);

  const setSorting = useCallback(
    (
      sortBy: ListBatchesParams['sortBy'],
      sortOrder: ListBatchesParams['sortOrder']
    ) => {
      setParams((prev) => ({ ...prev, sortBy, sortOrder }));
    },
    []
  );

  const resetFilters = useCallback(() => {
    setParams(DEFAULT_PARAMS);
  }, []);

  const isAnyMutationPending = useMemo(
    () =>
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending ||
      autoCreateMutation.isPending ||
      assignMutation.isPending ||
      unassignMutation.isPending ||
      startMutation.isPending ||
      completeMutation.isPending,
    [
      createMutation.isPending,
      updateMutation.isPending,
      deleteMutation.isPending,
      autoCreateMutation.isPending,
      assignMutation.isPending,
      unassignMutation.isPending,
      startMutation.isPending,
      completeMutation.isPending,
    ]
  );

  const pagination = useMemo(() => {
    const data = batchesQuery.data;
    if (!data?.pagination) {
      return {
        currentPage: params.page ?? 1,
        totalPages: 1,
        totalItems: 0,
        hasNextPage: false,
        hasPrevPage: false,
      };
    }
    return {
      currentPage: data.pagination.page,
      totalPages: data.pagination.totalPages,
      totalItems: data.pagination.total,
      hasNextPage: data.pagination.hasNext,
      hasPrevPage: data.pagination.hasPrevious,
    };
  }, [batchesQuery.data, params.page]);

  return {
    // Data
    batches: batchesQuery.data?.data ?? [],
    pagination,
    isLoading: batchesQuery.isLoading,
    isFetching: batchesQuery.isFetching,
    isError: batchesQuery.isError,
    error: batchesQuery.error,

    // Params
    params,
    setPage,
    setLimit,
    setStatus,
    setSorting,
    resetFilters,

    // Mutations
    createBatch: createMutation.mutate,
    createBatchAsync: createMutation.mutateAsync,
    updateBatch: updateMutation.mutate,
    updateBatchAsync: updateMutation.mutateAsync,
    deleteBatch: deleteMutation.mutate,
    deleteBatchAsync: deleteMutation.mutateAsync,
    autoCreateBatches: autoCreateMutation.mutate,
    autoCreateBatchesAsync: autoCreateMutation.mutateAsync,
    assignStudents: assignMutation.mutate,
    assignStudentsAsync: assignMutation.mutateAsync,
    unassignStudents: unassignMutation.mutate,
    unassignStudentsAsync: unassignMutation.mutateAsync,
    startBatch: startMutation.mutate,
    startBatchAsync: startMutation.mutateAsync,
    completeBatch: completeMutation.mutate,
    completeBatchAsync: completeMutation.mutateAsync,

    // States
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isAutoCreating: autoCreateMutation.isPending,
    isAssigning: assignMutation.isPending,
    isUnassigning: unassignMutation.isPending,
    isStarting: startMutation.isPending,
    isCompleting: completeMutation.isPending,
    isAnyMutationPending,

    // Refetch
    refetch: batchesQuery.refetch,
  };
}

// ============================================
// Batch Detail Page Hook
// ============================================

export function useBatchDetailPage(
  mockDriveId: string | undefined | null,
  batchId: string | undefined | null
) {
  const batchQuery = useBatchDetail(mockDriveId, batchId);
  const studentsQuery = useBatchStudents(mockDriveId, batchId);

  const updateMutation = useUpdateBatch(mockDriveId ?? '');
  const deleteMutation = useDeleteBatch(mockDriveId ?? '');
  const assignMutation = useAssignStudents(mockDriveId ?? '');
  const unassignMutation = useUnassignStudents(mockDriveId ?? '');
  const startMutation = useStartBatch(mockDriveId ?? '');
  const completeMutation = useCompleteBatch(mockDriveId ?? '');

  const isAnyMutationPending = useMemo(
    () =>
      updateMutation.isPending ||
      deleteMutation.isPending ||
      assignMutation.isPending ||
      unassignMutation.isPending ||
      startMutation.isPending ||
      completeMutation.isPending,
    [
      updateMutation.isPending,
      deleteMutation.isPending,
      assignMutation.isPending,
      unassignMutation.isPending,
      startMutation.isPending,
      completeMutation.isPending,
    ]
  );

  return {
    // Batch
    batch: batchQuery.data,
    isLoadingBatch: batchQuery.isLoading,
    batchError: batchQuery.error,

    // Students
    students: studentsQuery.data ?? [],
    isLoadingStudents: studentsQuery.isLoading,
    studentsError: studentsQuery.error,

    // Mutations
    updateBatch: (data: UpdateBatchInput) =>
      batchId && updateMutation.mutate({ batchId, data }),
    deleteBatch: () => batchId && deleteMutation.mutate(batchId),
    assignStudents: (registrationIds: string[]) =>
      batchId && assignMutation.mutate({ batchId, data: { registrationIds } }),
    unassignStudents: (registrationIds: string[]) =>
      batchId && unassignMutation.mutate({ batchId, registrationIds }),
    startBatch: () => batchId && startMutation.mutate(batchId),
    completeBatch: () => batchId && completeMutation.mutate(batchId),

    // States
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isAssigning: assignMutation.isPending,
    isUnassigning: unassignMutation.isPending,
    isStarting: startMutation.isPending,
    isCompleting: completeMutation.isPending,
    isAnyMutationPending,

    // Refetch
    refetchBatch: batchQuery.refetch,
    refetchStudents: studentsQuery.refetch,
  };
}