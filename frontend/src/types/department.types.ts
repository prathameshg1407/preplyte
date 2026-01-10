// src/types/department.types.ts

// =====================================================
// DEPARTMENT TYPES
// =====================================================

export interface Department {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  isActive: boolean;
  studentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentListResponse {
  departments: Department[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface DepartmentStats {
  totalDepartments: number;
  activeDepartments: number;
  inactiveDepartments: number;
  totalStudents: number;
  departmentWiseStudents: {
    departmentId: string;
    departmentName: string;
    departmentCode: string | null;
    studentCount: number;
  }[];
}

export interface CreateDepartmentInput {
  name: string;
  code?: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateDepartmentInput {
  name?: string;
  code?: string;
  description?: string | null;
  isActive?: boolean;
}

export interface BulkCreateDepartmentInput {
  departments: CreateDepartmentInput[];
}

export interface BulkCreateResult {
  created: number;
  failed: number;
  errors: {
    index: number;
    name: string;
    error: string;
  }[];
}

export interface DepartmentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'code' | 'createdAt' | 'studentCount';
  sortOrder?: 'asc' | 'desc';
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface DepartmentApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// =====================================================
// DROPDOWN TYPE (for selects)
// =====================================================

export interface DepartmentOption {
  id: string;
  name: string;
  code: string | null;
}