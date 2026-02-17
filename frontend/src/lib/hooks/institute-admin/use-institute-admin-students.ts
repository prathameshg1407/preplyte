'use client';

import { useState, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { instituteAdminService, type InstituteStudentFiltersExtended, type InstituteStudentsResponse, type InstituteStudent } from '@/lib/api/services/institute-admin/institute-admin.service';

export type Filters = {
  search?: string;
  departmentId?: string;
  minCgpa?: number;
  status?: 'all' | 'active' | 'inactive';
};

export type PaginationState = {
  page: number;
  pageSize: number;
  total: number;
};

// Transform API student to component student format
type ComponentStudent = {
  id: string;
  email: string;
  name?: string;
  studentId: string;
  departmentId?: string;
  departmentName?: string;
  courseYear?: string;
  averageCgpa?: number;
  isActive: boolean;
  createdAt: string;
};

function transformStudent(student: InstituteStudent): ComponentStudent {
  return {
    id: student.id,
    email: student.email,
    name: student.name || undefined,
    studentId: student.profile?.studentId || '',
    departmentId: student.profile?.departmentId,
    departmentName: student.profile?.department?.name,
    courseYear: student.profile?.courseYear,
    averageCgpa: student.profile?.averageCgpa,
    isActive: student.isActive,
    createdAt: student.createdAt || new Date().toISOString(),
  };
}

export function useInstituteAdminStudents(instituteId: string) {
  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState<Filters>({});
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    total: 0
  });

  const fetchStudents = useCallback(async (): Promise<InstituteStudentsResponse> => {
    if (!instituteId) {
      throw new Error('No institute ID');
    }
    
    const serviceFilters: InstituteStudentFiltersExtended = {
      page: pagination.page,
      limit: pagination.pageSize,
      search: filters.search,
      departmentId: filters.departmentId,
      cgpa: filters.minCgpa,
      status: filters.status !== 'all' ? filters.status : undefined,
    };

    const response = await instituteAdminService.getInstituteStudents(instituteId, serviceFilters);
    return response;
  }, [instituteId, pagination, filters]);

  // Always call useQuery - it will be disabled if instituteId is empty
  const query = useQuery({
    queryKey: ['institute-students', instituteId, filters, pagination],
    queryFn: fetchStudents,
    enabled: !!instituteId && instituteId.length > 0,
    staleTime: 5 * 60 * 1000, // 5 min
  });

  // Transform students to component format
  const transformedStudents = useMemo(() => {
    return (query.data?.students || []).map(transformStudent);
  }, [query.data?.students]);

  // Transform pagination
  const transformedPagination = useMemo(() => {
    if (query.data?.pagination) {
      return {
        page: query.data.pagination.currentPage || pagination.page,
        pageSize: query.data.pagination.itemsPerPage || pagination.pageSize,
        total: query.data.pagination.totalItems || pagination.total,
      };
    }
    return pagination;
  }, [query.data?.pagination, pagination]);

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['institute-students', instituteId] });
  }, [queryClient, instituteId]);

  return {
    // Data
    students: transformedStudents,
    loading: query.isPending || query.isFetching,
    error: !instituteId 
      ? 'No institute ID provided' 
      : query.error instanceof Error 
        ? query.error.message 
        : query.error 
          ? String(query.error)
          : undefined,
    
    // State
    filters,
    setFilters,
    pagination: transformedPagination,
    setPagination,
    
    // Actions
    refetch,
  };
}
