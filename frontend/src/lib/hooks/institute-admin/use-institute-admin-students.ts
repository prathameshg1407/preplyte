'use client';

import { useState, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { instituteAdminService, type InstituteStudentFiltersExtended, type InstituteStudentsResponse, type InstituteStudent } from '@/lib/api/services/institute-admin/institute-admin.service';

export type Filters = {
  search?: string;
  department?: string;
  minCgpa?: number;
  status?: 'all' | 'active' | 'inactive';
};

export type PaginationState = {
  page: number;
  pageSize: number;
  total: number;
};

// Expanded Student Type for UI
export type ComponentStudent = {
  id: string;
  email: string;
  name?: string;
  studentId: string;
  department?: string;
  courseYear?: string;
  averageCgpa?: number;
  isActive: boolean;
  createdAt: string;
  
  // New Fields
  skills: string[];
  academic: {
    marks10: number | null;
    marks12: number | null;
    backlogs: number;
  };
  resume: {
    url?: string;
    fileName?: string;
  } | null;
  stats: {
    aptitude: number;
    machine: number;
    interview: number;
    drives: number;
  };
};

function transformStudent(student: any): ComponentStudent {
  // Extract resume (prefer relation, fallback to profile)
  const resumeObj = student.resumes?.[0];
  const resumeUrl = resumeObj?.fileUrl || student.profile?.resumeUrl;
  const resumeName = resumeObj?.fileName || student.profile?.resumeName;

  return {
    id: student.id,
    email: student.email,
    name: student.name || undefined,
    studentId: student.profile?.studentId || 'N/A',
    department: student.profile?.department,
    courseYear: student.profile?.courseYear,
    averageCgpa: student.profile?.averageCgpa,
    isActive: student.isActive,
    createdAt: student.createdAt || new Date().toISOString(),
    
    // Mapped Profile Data
    skills: student.profile?.skills || [],
    academic: {
      marks10: student.profile?.marks10 || null,
      marks12: student.profile?.marks12 || null,
      backlogs: student.profile?.numberOfBacklogs || 0,
    },
    resume: resumeUrl ? { url: resumeUrl, fileName: resumeName } : null,
    stats: {
      aptitude: student._count?.aptitudeSessions || 0,
      machine: student._count?.machineSessions || 0,
      interview: student._count?.aiInterviewSessions || 0,
      drives: student._count?.mockDriveRegistrations || 0,
    }
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
      department: filters.department,
      cgpa: filters.minCgpa,
      status: filters.status !== 'all' ? filters.status : undefined,
    };

    const response = await instituteAdminService.getInstituteStudents(instituteId, serviceFilters);
    return response;
  }, [instituteId, pagination, filters]);

  const query = useQuery({
    queryKey: ['institute-students', instituteId, filters, pagination],
    queryFn: fetchStudents,
    enabled: !!instituteId && instituteId.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const transformedStudents = useMemo(() => {
    return (query.data?.students || []).map(transformStudent);
  }, [query.data?.students]);

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
    students: transformedStudents,
    loading: query.isPending || query.isFetching,
    error: !instituteId 
      ? 'No institute ID provided' 
      : query.error instanceof Error 
        ? query.error.message 
        : query.error 
          ? String(query.error)
          : undefined,
    filters,
    setFilters,
    pagination: transformedPagination,
    setPagination,
    refetch,
  };
}