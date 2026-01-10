// src/lib/hooks/institute-admin/use-departments.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentService } from '@/lib/api/services/institute-admin/department.service';
import type {
  DepartmentQueryParams,
  CreateDepartmentInput,
  UpdateDepartmentInput,
  BulkCreateDepartmentInput,
} from '@/types/department.types';
import { useToast } from '@/components/ui/use-toast';

// =====================================================
// QUERY KEYS
// =====================================================

export const departmentKeys = {
  all: ['departments'] as const,
  lists: () => [...departmentKeys.all, 'list'] as const,
  list: (params: DepartmentQueryParams) => [...departmentKeys.lists(), params] as const,
  details: () => [...departmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...departmentKeys.details(), id] as const,
  stats: () => [...departmentKeys.all, 'stats'] as const,
  active: () => [...departmentKeys.all, 'active'] as const,
};

// =====================================================
// GET DEPARTMENTS LIST
// =====================================================

export const useDepartments = (params: DepartmentQueryParams = {}) => {
  return useQuery({
    queryKey: departmentKeys.list(params),
    queryFn: () => departmentService.getDepartments(params),
    staleTime: 30000, // 30 seconds
  });
};

// =====================================================
// GET SINGLE DEPARTMENT
// =====================================================

export const useDepartment = (id: string) => {
  return useQuery({
    queryKey: departmentKeys.detail(id),
    queryFn: () => departmentService.getDepartment(id),
    enabled: !!id,
  });
};

// =====================================================
// GET DEPARTMENT STATS
// =====================================================

export const useDepartmentStats = () => {
  return useQuery({
    queryKey: departmentKeys.stats(),
    queryFn: () => departmentService.getDepartmentStats(),
    staleTime: 60000, // 1 minute
  });
};

// =====================================================
// GET ACTIVE DEPARTMENTS (for dropdowns)
// =====================================================

export const useActiveDepartments = () => {
  return useQuery({
    queryKey: departmentKeys.active(),
    queryFn: () => departmentService.getActiveDepartments(),
    staleTime: 300000, // 5 minutes
  });
};

// =====================================================
// CREATE DEPARTMENT
// =====================================================

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: CreateDepartmentInput) =>
      departmentService.createDepartment(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: departmentKeys.stats() });
      queryClient.invalidateQueries({ queryKey: departmentKeys.active() });
      toast({
        title: 'Department Created',
        description: `${data.name} has been created successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create department',
        variant: 'destructive',
      });
    },
  });
};

// =====================================================
// UPDATE DEPARTMENT
// =====================================================

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateDepartmentInput }) =>
      departmentService.updateDepartment(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: departmentKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: departmentKeys.active() });
      toast({
        title: 'Department Updated',
        description: `${data.name} has been updated successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update department',
        variant: 'destructive',
      });
    },
  });
};

// =====================================================
// DELETE DEPARTMENT
// =====================================================

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => departmentService.deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: departmentKeys.stats() });
      queryClient.invalidateQueries({ queryKey: departmentKeys.active() });
      toast({
        title: 'Department Deleted',
        description: 'Department has been deleted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete department',
        variant: 'destructive',
      });
    },
  });
};

// =====================================================
// TOGGLE DEPARTMENT STATUS
// =====================================================

export const useToggleDepartmentStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      departmentService.toggleDepartmentStatus(id, isActive),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: departmentKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: departmentKeys.active() });
      toast({
        title: data.isActive ? 'Department Activated' : 'Department Deactivated',
        description: `${data.name} has been ${data.isActive ? 'activated' : 'deactivated'}.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update department status',
        variant: 'destructive',
      });
    },
  });
};

// =====================================================
// BULK CREATE DEPARTMENTS
// =====================================================

export const useBulkCreateDepartments = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: BulkCreateDepartmentInput) =>
      departmentService.bulkCreateDepartments(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: departmentKeys.stats() });
      queryClient.invalidateQueries({ queryKey: departmentKeys.active() });
      toast({
        title: 'Bulk Create Complete',
        description: `Created ${data.created} department(s)${data.failed > 0 ? `, ${data.failed} failed` : ''}.`,
        variant: data.failed > 0 ? 'default' : 'default',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create departments',
        variant: 'destructive',
      });
    },
  });
};