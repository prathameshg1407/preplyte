// src/lib/hooks/institute-admin/use-mockdrive-eligibility.ts

'use client';

import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';

import { mockDriveEligibilityService } from '@/lib/api/services/institute-admin/mockdrive-eligibility.service';
import { ApiError } from '@/lib/api/services/institute-admin/api-utils';
import { eligibilityKeys, mockDriveKeys } from './query-keys';

import type {
  EligibilityCriteria,
  EligibilityCheckResult,
  EligibleStudent,
  EligibilitySummary,
  SetEligibilityInput,
  ListEligibleStudentsParams,
  PaginatedResponse,
} from '@/types/admin.mockdrive.types';

// ============================================
// Types
// ============================================

interface UseEligibilityOptions {
  enabled?: boolean;
}

// ============================================
// Get Eligibility Criteria Hook
// ============================================

export function useEligibilityCriteria(
  mockDriveId: string | undefined | null,
  options: UseEligibilityOptions = {}
) {
  const { enabled = true } = options;
  const isEnabled = enabled && !!mockDriveId;

  return useQuery({
    queryKey: eligibilityKeys.criteria(mockDriveId ?? ''),
    queryFn: async () => {
      if (!mockDriveId) throw new Error('Mock drive ID is required');
      return mockDriveEligibilityService.getEligibility(mockDriveId);
    },
    enabled: isEnabled,
    staleTime: 60 * 1000,
  });
}

// ============================================
// Eligibility Summary Hook
// ============================================

export function useEligibilitySummary(
  mockDriveId: string | undefined | null,
  options: UseEligibilityOptions = {}
) {
  const { enabled = true } = options;
  const isEnabled = enabled && !!mockDriveId;

  return useQuery({
    queryKey: eligibilityKeys.summary(mockDriveId ?? ''),
    queryFn: async () => {
      if (!mockDriveId) throw new Error('Mock drive ID is required');
      return mockDriveEligibilityService.getEligibilitySummary(mockDriveId);
    },
    enabled: isEnabled,
    staleTime: 30 * 1000,
  });
}

// ============================================
// Eligible Students Hook
// ============================================

export function useEligibleStudents(
  mockDriveId: string | undefined | null,
  params: ListEligibleStudentsParams = {},
  options: UseEligibilityOptions = {}
) {
  const { enabled = true } = options;
  const isEnabled = enabled && !!mockDriveId;

  return useQuery({
    queryKey: eligibilityKeys.students(mockDriveId ?? '', params),
    queryFn: async () => {
      if (!mockDriveId) throw new Error('Mock drive ID is required');
      return mockDriveEligibilityService.getEligibleStudents(mockDriveId, params);
    },
    enabled: isEnabled,
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
  });
}

// ============================================
// Check Student Eligibility Hook
// ============================================

export function useCheckStudentEligibility(
  mockDriveId: string | undefined | null,
  userId: string | undefined | null,
  options: UseEligibilityOptions = {}
) {
  const { enabled = true } = options;
  const isEnabled = enabled && !!mockDriveId && !!userId;

  return useQuery({
    queryKey: eligibilityKeys.check(mockDriveId ?? '', userId ?? ''),
    queryFn: async () => {
      if (!mockDriveId || !userId) {
        throw new Error('Mock drive ID and user ID are required');
      }
      return mockDriveEligibilityService.checkStudentEligibility(mockDriveId, userId);
    },
    enabled: isEnabled,
    staleTime: 60 * 1000,
  });
}

// ============================================
// Set Eligibility Hook
// ============================================

export function useSetEligibility(mockDriveId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: SetEligibilityInput) =>
      mockDriveEligibilityService.setEligibility(mockDriveId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eligibilityKeys.all(mockDriveId) });
      queryClient.invalidateQueries({ queryKey: mockDriveKeys.detail(mockDriveId) });
      toast({
        title: 'Success',
        description: 'Eligibility criteria saved successfully',
      });
    },
    onError: (error: ApiError) => {
      toast({
        variant: 'destructive',
        title: 'Error saving eligibility criteria',
        description: error.message,
      });
    },
  });
}

// ============================================
// Update Eligibility Hook
// ============================================

export function useUpdateEligibility(mockDriveId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Partial<SetEligibilityInput>) =>
      mockDriveEligibilityService.updateEligibility(mockDriveId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eligibilityKeys.all(mockDriveId) });
      toast({
        title: 'Success',
        description: 'Eligibility criteria updated successfully',
      });
    },
    onError: (error: ApiError) => {
      toast({
        variant: 'destructive',
        title: 'Error updating eligibility criteria',
        description: error.message,
      });
    },
  });
}

// ============================================
// Delete Eligibility Hook
// ============================================

export function useDeleteEligibility(mockDriveId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => mockDriveEligibilityService.deleteEligibility(mockDriveId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eligibilityKeys.all(mockDriveId) });
      queryClient.invalidateQueries({ queryKey: mockDriveKeys.detail(mockDriveId) });
      toast({
        title: 'Success',
        description: 'Eligibility criteria removed successfully',
      });
    },
    onError: (error: ApiError) => {
      toast({
        variant: 'destructive',
        title: 'Error removing eligibility criteria',
        description: error.message,
      });
    },
  });
}

// ============================================
// Combined Eligibility Page Hook
// ============================================

const DEFAULT_STUDENTS_PARAMS: ListEligibleStudentsParams = {
  page: 1,
  limit: 20,
};

export function useEligibilityPage(mockDriveId: string | undefined | null) {
  const [studentsParams, setStudentsParams] = useState<ListEligibleStudentsParams>(
    DEFAULT_STUDENTS_PARAMS
  );

  const criteriaQuery = useEligibilityCriteria(mockDriveId);
  const summaryQuery = useEligibilitySummary(mockDriveId);
  const studentsQuery = useEligibleStudents(mockDriveId, studentsParams);

  const setMutation = useSetEligibility(mockDriveId ?? '');
  const updateMutation = useUpdateEligibility(mockDriveId ?? '');
  const deleteMutation = useDeleteEligibility(mockDriveId ?? '');

  // Param setters
  const setPage = useCallback((page: number) => {
    setStudentsParams((prev) => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setStudentsParams((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  const setSearch = useCallback((search: string) => {
    setStudentsParams((prev) => ({
      ...prev,
      search: search.trim() || undefined,
      page: 1,
    }));
  }, []);

  const setDepartment = useCallback((department: string | undefined) => {
    setStudentsParams((prev) => ({ ...prev, department, page: 1 }));
  }, []);

  const setCourseYear = useCallback((courseYear: string | undefined) => {
    setStudentsParams((prev) => ({ ...prev, courseYear, page: 1 }));
  }, []);

  const resetFilters = useCallback(() => {
    setStudentsParams(DEFAULT_STUDENTS_PARAMS);
  }, []);

  const isAnyMutationPending = useMemo(
    () =>
      setMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
    [setMutation.isPending, updateMutation.isPending, deleteMutation.isPending]
  );

  return {
    // Criteria
    criteria: criteriaQuery.data,
    isLoadingCriteria: criteriaQuery.isLoading,
    hasCriteria: !!criteriaQuery.data,

    // Summary
    summary: summaryQuery.data,
    isLoadingSummary: summaryQuery.isLoading,

    // Students
    students: studentsQuery.data?.data ?? [],
    studentsPagination: studentsQuery.data?.pagination,
    isLoadingStudents: studentsQuery.isLoading,
    studentsParams,

    // Param setters
    setPage,
    setLimit,
    setSearch,
    setDepartment,
    setCourseYear,
    resetFilters,

    // Mutations
    setEligibility: setMutation.mutate,
    setEligibilityAsync: setMutation.mutateAsync,
    updateEligibility: updateMutation.mutate,
    updateEligibilityAsync: updateMutation.mutateAsync,
    deleteEligibility: deleteMutation.mutate,
    deleteEligibilityAsync: deleteMutation.mutateAsync,

    // States
    isSetting: setMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isAnyMutationPending,

    // Refetch
    refetchCriteria: criteriaQuery.refetch,
    refetchSummary: summaryQuery.refetch,
    refetchStudents: studentsQuery.refetch,
  };
}