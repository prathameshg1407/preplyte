// src/lib/hooks/institute-admin/use-mockdrive-registrations.ts

'use client';

import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';

import { mockDriveRegistrationsService } from '@/lib/api/services/institute-admin/mockdrive-registrations.service';
import { ApiError } from '@/lib/api/services/institute-admin/api-utils';
import { registrationKeys, batchKeys } from './query-keys';

import {
  RegistrationDetails,
  RegistrationListItem,
  RegistrationSummary,
  BulkUpdateResult,
  UpdateRegistrationInput,
  BulkUpdateRegistrationInput,
  ListRegistrationsParams,
  MockDriveRegistrationStatus,
} from '@/types/admin.mockdrive.types';

// ============================================
// Types
// ============================================

interface UseRegistrationsOptions {
  enabled?: boolean;
}

// ============================================
// List Registrations Hook
// ============================================

export function useRegistrations(
  mockDriveId: string | undefined | null,
  params: ListRegistrationsParams = {},
  options: UseRegistrationsOptions = {}
) {
  const { enabled = true } = options;
  const isEnabled = enabled && !!mockDriveId;

  return useQuery({
    queryKey: registrationKeys.list(mockDriveId ?? '', params),
    queryFn: async () => {
      if (!mockDriveId) throw new Error('Mock drive ID is required');
      return mockDriveRegistrationsService.listRegistrations(mockDriveId, params);
    },
    enabled: isEnabled,
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
  });
}

// ============================================
// Registration Detail Hook
// ============================================

export function useRegistrationDetail(
  mockDriveId: string | undefined | null,
  registrationId: string | undefined | null,
  options: UseRegistrationsOptions = {}
) {
  const { enabled = true } = options;
  const isEnabled = enabled && !!mockDriveId && !!registrationId;

  return useQuery({
    queryKey: registrationKeys.detail(mockDriveId ?? '', registrationId ?? ''),
    queryFn: async () => {
      if (!mockDriveId || !registrationId) {
        throw new Error('Mock drive ID and registration ID are required');
      }
      return mockDriveRegistrationsService.getRegistration(mockDriveId, registrationId);
    },
    enabled: isEnabled,
    staleTime: 60 * 1000,
  });
}

// ============================================
// Registration Summary Hook
// ============================================

export function useRegistrationSummary(
  mockDriveId: string | undefined | null,
  options: UseRegistrationsOptions = {}
) {
  const { enabled = true } = options;
  const isEnabled = enabled && !!mockDriveId;

  return useQuery({
    queryKey: registrationKeys.summary(mockDriveId ?? ''),
    queryFn: async () => {
      if (!mockDriveId) throw new Error('Mock drive ID is required');
      return mockDriveRegistrationsService.getRegistrationSummary(mockDriveId);
    },
    enabled: isEnabled,
    staleTime: 30 * 1000,
  });
}

// ============================================
// Update Registration Hook
// ============================================

interface UpdateRegistrationParams {
  registrationId: string;
  data: UpdateRegistrationInput;
}

export function useUpdateRegistration(mockDriveId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ registrationId, data }: UpdateRegistrationParams) =>
      mockDriveRegistrationsService.updateRegistration(mockDriveId, registrationId, data),
    onSuccess: (_, { registrationId }) => {
      queryClient.invalidateQueries({ queryKey: registrationKeys.all(mockDriveId) });
      queryClient.invalidateQueries({
        queryKey: registrationKeys.detail(mockDriveId, registrationId),
      });
      toast({
        title: 'Success',
        description: 'Registration updated successfully',
      });
    },
    onError: (error: ApiError) => {
      toast({
        variant: 'destructive',
        title: 'Error updating registration',
        description: error.message,
      });
    },
  });
}

// ============================================
// Bulk Update Registrations Hook
// ============================================

export function useBulkUpdateRegistrations(mockDriveId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: BulkUpdateRegistrationInput) =>
      mockDriveRegistrationsService.bulkUpdateRegistrations(mockDriveId, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: registrationKeys.all(mockDriveId) });
      toast({
        title: 'Bulk Update Complete',
        description: `${result.success} updated, ${result.failed} failed`,
        variant: result.failed > 0 ? 'default' : 'default',
      });
    },
    onError: (error: ApiError) => {
      toast({
        variant: 'destructive',
        title: 'Error updating registrations',
        description: error.message,
      });
    },
  });
}

// ============================================
// Approve All Pending Hook
// ============================================

export function useApproveAllPending(mockDriveId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () =>
      mockDriveRegistrationsService.approveAllPending(mockDriveId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: registrationKeys.all(mockDriveId) });
      toast({
        title: 'Success',
        description: `${result.approved} registrations approved, ${result.skipped} skipped`,
      });
    },
    onError: (error: ApiError) => {
      toast({
        variant: 'destructive',
        title: 'Error approving registrations',
        description: error.message,
      });
    },
  });
}

// ============================================
// Export Registrations Hook
// ============================================

export function useExportRegistrations(mockDriveId: string) {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (status?: MockDriveRegistrationStatus) =>
      mockDriveRegistrationsService.exportRegistrations(mockDriveId, status),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Registrations exported successfully',
      });
    },
    onError: (error: ApiError) => {
      toast({
        variant: 'destructive',
        title: 'Error exporting registrations',
        description: error.message,
      });
    },
  });
}

// ============================================
// Combined Registrations Page Hook
// ============================================

const DEFAULT_PARAMS: ListRegistrationsParams = {
  page: 1,
  limit: 20,
  sortBy: 'registeredAt',
  sortOrder: 'desc',
};

export function useRegistrationsPage(mockDriveId: string | undefined | null) {
  const [params, setParams] = useState<ListRegistrationsParams>(DEFAULT_PARAMS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const registrationsQuery = useRegistrations(mockDriveId, params);
  
  const updateMutation = useUpdateRegistration(mockDriveId ?? '');
  const bulkUpdateMutation = useBulkUpdateRegistrations(mockDriveId ?? '');
  const approveAllMutation = useApproveAllPending(mockDriveId ?? '');
  const exportMutation = useExportRegistrations(mockDriveId ?? '');

  // Param setters
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

  const setStatus = useCallback((status: MockDriveRegistrationStatus | undefined) => {
    setParams((prev) => ({ ...prev, status, page: 1 }));
  }, []);

  const setBatchId = useCallback((batchId: string | undefined) => {
    setParams((prev) => ({ ...prev, batchId, page: 1 }));
  }, []);

  const setHasBatch = useCallback((hasBatch: boolean | undefined) => {
    setParams((prev) => ({ ...prev, hasBatch, page: 1 }));
  }, []);

  const setSorting = useCallback(
    (
      sortBy: ListRegistrationsParams['sortBy'],
      sortOrder: ListRegistrationsParams['sortOrder']
    ) => {
      setParams((prev) => ({ ...prev, sortBy, sortOrder }));
    },
    []
  );

  const resetFilters = useCallback(() => {
    setParams(DEFAULT_PARAMS);
  }, []);

  // Selection helpers
  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const selectAll = useCallback(() => {
    const allIds = registrationsQuery.data?.data.map((r) => r.id) ?? [];
    setSelectedIds(allIds);
  }, [registrationsQuery.data]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  // Bulk actions
  // Bulk actions
const bulkApprove = useCallback(() => {
  if (selectedIds.length === 0) return;
  bulkUpdateMutation.mutate({
    registrationIds: selectedIds,
    status: MockDriveRegistrationStatus.APPROVED,
  });
  clearSelection();
}, [selectedIds, bulkUpdateMutation, clearSelection]);

const bulkReject = useCallback(() => {
  if (selectedIds.length === 0) return;
  bulkUpdateMutation.mutate({
    registrationIds: selectedIds,
    status: MockDriveRegistrationStatus.REJECTED,
  });
  clearSelection();
}, [selectedIds, bulkUpdateMutation, clearSelection]);

  const isAnyMutationPending = useMemo(
    () =>
      updateMutation.isPending ||
      bulkUpdateMutation.isPending ||
      approveAllMutation.isPending ||
      exportMutation.isPending,
    [
      updateMutation.isPending,
      bulkUpdateMutation.isPending,
      approveAllMutation.isPending,
      exportMutation.isPending,
    ]
  );

  const pagination = useMemo(() => {
    const data = registrationsQuery.data;
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
  }, [registrationsQuery.data, params.page]);

  return {
    // Data
    registrations: registrationsQuery.data?.data ?? [],
    summary: registrationsQuery.data?.summary,
    pagination,
    isLoading: registrationsQuery.isLoading,
    isFetching: registrationsQuery.isFetching,
    isError: registrationsQuery.isError,
    error: registrationsQuery.error,

    // Params
    params,
    setPage,
    setLimit,
    setSearch,
    setStatus,
    setBatchId,
    setHasBatch,
    setSorting,
    resetFilters,

    // Selection
    selectedIds,
    selectedCount: selectedIds.length,
    toggleSelection,
    selectAll,
    clearSelection,
    isAllSelected:
      selectedIds.length > 0 &&
      selectedIds.length === (registrationsQuery.data?.data.length ?? 0),

    // Mutations
    updateRegistration: updateMutation.mutate,
    updateRegistrationAsync: updateMutation.mutateAsync,
    bulkUpdate: bulkUpdateMutation.mutate,
    bulkUpdateAsync: bulkUpdateMutation.mutateAsync,
    approveAll: approveAllMutation.mutate,
    approveAllAsync: approveAllMutation.mutateAsync,
    exportRegistrations: exportMutation.mutate,
    exportRegistrationsAsync: exportMutation.mutateAsync,

    // Bulk actions
    bulkApprove,
    bulkReject,

    // States
    isUpdating: updateMutation.isPending,
    isBulkUpdating: bulkUpdateMutation.isPending,
    isApprovingAll: approveAllMutation.isPending,
    isExporting: exportMutation.isPending,
    isAnyMutationPending,

    // Refetch
    refetch: registrationsQuery.refetch,
  };
}