// src/lib/hooks/institute-admin/use-mockdrive-modules.ts

'use client';

import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';

import { mockDriveModulesService } from '@/lib/api/services/institute-admin/mockdrive-modules.service';
import { ApiError } from '@/lib/api/services/institute-admin/api-utils';
import { moduleKeys, mockDriveKeys } from './query-keys';

import type {
  MockDriveModule,
  ModuleWithAvailability,
  ModulesSummary,
  CreateModuleInput,
  UpdateModuleInput,
  ReorderModulesInput,
  ListModulesParams,
} from '@/types/admin.mockdrive.types';

// ============================================
// Types
// ============================================

interface UseModulesOptions {
  enabled?: boolean;
  checkAvailability?: boolean;
  includeInactive?: boolean;
}

interface UseModuleDetailOptions {
  enabled?: boolean;
}

// ============================================
// List Modules Hook
// ============================================

export function useModules(
  mockDriveId: string | undefined | null,
  options: UseModulesOptions = {}
) {
  const { 
    enabled = true, 
    checkAvailability = false, 
    includeInactive = false 
  } = options;
  const { toast } = useToast();
  const isEnabled = enabled && !!mockDriveId;

  const params: ListModulesParams = {
    checkAvailability,
    includeInactive,
  };

  return useQuery({
    queryKey: moduleKeys.list(mockDriveId ?? '', params),
    queryFn: async () => {
      if (!mockDriveId) throw new Error('Mock drive ID is required');
      return mockDriveModulesService.getModules(mockDriveId, params);
    },
    enabled: isEnabled,
    staleTime: 30 * 1000,
  });
}

// ============================================
// Modules Summary Hook
// ============================================

export function useModulesSummary(
  mockDriveId: string | undefined | null,
  options: { enabled?: boolean } = {}
) {
  const { enabled = true } = options;
  const isEnabled = enabled && !!mockDriveId;

  return useQuery({
    queryKey: moduleKeys.summary(mockDriveId ?? ''),
    queryFn: async () => {
      if (!mockDriveId) throw new Error('Mock drive ID is required');
      return mockDriveModulesService.getModulesSummary(mockDriveId);
    },
    enabled: isEnabled,
    staleTime: 30 * 1000,
  });
}

// ============================================
// Module Detail Hook
// ============================================

export function useModuleDetail(
  mockDriveId: string | undefined | null,
  moduleId: string | undefined | null,
  options: UseModuleDetailOptions = {}
) {
  const { enabled = true } = options;
  const isEnabled = enabled && !!mockDriveId && !!moduleId;

  return useQuery({
    queryKey: moduleKeys.detail(mockDriveId ?? '', moduleId ?? ''),
    queryFn: async () => {
      if (!mockDriveId || !moduleId) {
        throw new Error('Mock drive ID and module ID are required');
      }
      return mockDriveModulesService.getModule(mockDriveId, moduleId);
    },
    enabled: isEnabled,
    staleTime: 60 * 1000,
  });
}

// ============================================
// Add Module Hook
// ============================================

export function useAddModule(mockDriveId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateModuleInput) =>
      mockDriveModulesService.addModule(mockDriveId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moduleKeys.all(mockDriveId) });
      queryClient.invalidateQueries({ queryKey: mockDriveKeys.detail(mockDriveId) });
      toast({
        title: 'Success',
        description: 'Module added successfully',
      });
    },
    onError: (error: ApiError) => {
      toast({
        variant: 'destructive',
        title: 'Error adding module',
        description: error.message,
      });
    },
  });
}

// ============================================
// Update Module Hook
// ============================================

interface UpdateModuleParams {
  moduleId: string;
  data: UpdateModuleInput;
}

export function useUpdateModule(mockDriveId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ moduleId, data }: UpdateModuleParams) =>
      mockDriveModulesService.updateModule(mockDriveId, moduleId, data),
    onSuccess: (_, { moduleId }) => {
      queryClient.invalidateQueries({ queryKey: moduleKeys.all(mockDriveId) });
      queryClient.invalidateQueries({ 
        queryKey: moduleKeys.detail(mockDriveId, moduleId) 
      });
      toast({
        title: 'Success',
        description: 'Module updated successfully',
      });
    },
    onError: (error: ApiError) => {
      toast({
        variant: 'destructive',
        title: 'Error updating module',
        description: error.message,
      });
    },
  });
}

// ============================================
// Delete Module Hook
// ============================================

export function useDeleteModule(mockDriveId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (moduleId: string) =>
      mockDriveModulesService.deleteModule(mockDriveId, moduleId),
    onSuccess: (_, moduleId) => {
      queryClient.invalidateQueries({ queryKey: moduleKeys.all(mockDriveId) });
      queryClient.removeQueries({ 
        queryKey: moduleKeys.detail(mockDriveId, moduleId) 
      });
      queryClient.invalidateQueries({ queryKey: mockDriveKeys.detail(mockDriveId) });
      toast({
        title: 'Success',
        description: 'Module deleted successfully',
      });
    },
    onError: (error: ApiError) => {
      toast({
        variant: 'destructive',
        title: 'Error deleting module',
        description: error.message,
      });
    },
  });
}

// ============================================
// Reorder Modules Hook
// ============================================

export function useReorderModules(mockDriveId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: ReorderModulesInput) =>
      mockDriveModulesService.reorderModules(mockDriveId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moduleKeys.all(mockDriveId) });
      toast({
        title: 'Success',
        description: 'Modules reordered successfully',
      });
    },
    onError: (error: ApiError) => {
      toast({
        variant: 'destructive',
        title: 'Error reordering modules',
        description: error.message,
      });
    },
  });
}

// ============================================
// Duplicate Module Hook
// ============================================

export function useDuplicateModule(mockDriveId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (moduleId: string) =>
      mockDriveModulesService.duplicateModule(mockDriveId, moduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moduleKeys.all(mockDriveId) });
      toast({
        title: 'Success',
        description: 'Module duplicated successfully',
      });
    },
    onError: (error: ApiError) => {
      toast({
        variant: 'destructive',
        title: 'Error duplicating module',
        description: error.message,
      });
    },
  });
}

// ============================================
// Combined Modules Page Hook
// ============================================

export function useModulesPage(mockDriveId: string | undefined | null) {
  const modulesQuery = useModules(mockDriveId, { checkAvailability: true });
  const summaryQuery = useModulesSummary(mockDriveId);
  
  const addMutation = useAddModule(mockDriveId ?? '');
  const updateMutation = useUpdateModule(mockDriveId ?? '');
  const deleteMutation = useDeleteModule(mockDriveId ?? '');
  const reorderMutation = useReorderModules(mockDriveId ?? '');
  const duplicateMutation = useDuplicateModule(mockDriveId ?? '');

  const isAnyMutationPending = useMemo(
    () =>
      addMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending ||
      reorderMutation.isPending ||
      duplicateMutation.isPending,
    [
      addMutation.isPending,
      updateMutation.isPending,
      deleteMutation.isPending,
      reorderMutation.isPending,
      duplicateMutation.isPending,
    ]
  );

  return {
    // Queries
    modules: (modulesQuery.data as ModuleWithAvailability[]) ?? [],
    summary: summaryQuery.data,
    isLoading: modulesQuery.isLoading,
    isLoadingSummary: summaryQuery.isLoading,
    isError: modulesQuery.isError,
    error: modulesQuery.error,
    refetch: modulesQuery.refetch,

    // Mutations
    addModule: addMutation.mutate,
    addModuleAsync: addMutation.mutateAsync,
    updateModule: updateMutation.mutate,
    updateModuleAsync: updateMutation.mutateAsync,
    deleteModule: deleteMutation.mutate,
    deleteModuleAsync: deleteMutation.mutateAsync,
    reorderModules: reorderMutation.mutate,
    reorderModulesAsync: reorderMutation.mutateAsync,
    duplicateModule: duplicateMutation.mutate,
    duplicateModuleAsync: duplicateMutation.mutateAsync,

    // States
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isReordering: reorderMutation.isPending,
    isDuplicating: duplicateMutation.isPending,
    isAnyMutationPending,
  };
}