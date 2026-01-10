// ✅ Fix 1: Named import for apiClient
import { apiClient } from '@/lib/api/axios-instance';
import type {
  InstituteStudentFilters,
  PaginationMeta,
} from '@/types/admin.types';
import type { User } from '@/types/auth.types';

// ✅ Fix 2: Properly extend with union types
export interface InstituteStudentFiltersExtended extends Omit<InstituteStudentFilters, 'sortBy' | 'sortOrder'> {
  cgpa?: number;
  status?: 'all' | 'active' | 'inactive';
  sortBy?: InstituteStudentFilters['sortBy'];  // ✅ Use union from parent
  sortOrder?: InstituteStudentFilters['sortOrder'];
}

export interface InstituteStudent extends User {
  profile: {
    studentId: string;
    departmentId?: string;
    courseYear?: string;
    averageCgpa?: number;
  } | null;
  _count?: {
    aptitudeSessions: number;
    machineSessions: number;
    aiInterviewSessions: number;
    mockDriveRegistrations: number;
  };
}

export interface InstituteStudentsResponse {
  students: InstituteStudent[];
  pagination: PaginationMeta;
}

export const instituteAdminService = {
  // ── Students ───────────────────────────────────────────────────────────────
  async getInstituteStudents(
    _instituteId: string, // Not used in endpoint, extracted from auth context
    filters: InstituteStudentFiltersExtended = {}
  ): Promise<InstituteStudentsResponse> {
    const params = new URLSearchParams();

    // Pagination
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));
    
    // Filters
    if (filters.search) params.append('search', filters.search);
    if (filters.departmentId) params.append('department', filters.departmentId);
    if (filters.courseYear) params.append('courseYear', filters.courseYear);
    if (filters.cgpa !== undefined && filters.cgpa > 0) {
      params.append('minCgpa', String(filters.cgpa));
    }
    
    // Status filter
    if (filters.status && filters.status !== 'all') {
      params.append('isActive', filters.status === 'active' ? 'true' : 'false');
    }
    
    // Sorting ✅ Properly typed
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    params.append('sortOrder', (filters.sortOrder || 'desc') as string);

    // ✅ apiClient named import - endpoint doesn't need instituteId (extracted from auth)
    const response = await apiClient.get<{ success: boolean; data: InstituteStudentsResponse }>(
      `/api/institute/mock-drive/students?${params.toString()}`
    );

    if (!response.data.success) {
      throw new Error('Failed to fetch students');
    }

    return response.data.data;
  },

  // ── Bulk Actions ──────────────────────────────────────────────────────────
  async bulkUpdateStudentStatus(
    instituteId: string,
    studentIds: string[],
    isActive: boolean
  ) {
    const response = await apiClient.patch(`/institute-admin/${instituteId}/students/bulk-status`, {
      studentIds,
      isActive
    });
    return response.data;
  },

  // ── Export ─────────────────────────────────────────────────────────────────
  async exportInstituteStudents(
    instituteId: string,
    filters: InstituteStudentFiltersExtended = {}
  ) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.departmentId) params.append('department', filters.departmentId);
    if (filters.courseYear) params.append('courseYear', filters.courseYear);

    const response = await apiClient.get(
      `/institute-admin/${instituteId}/students/export?${params}`,
      { responseType: 'blob' }
    );
    return response.data;
  }
};
