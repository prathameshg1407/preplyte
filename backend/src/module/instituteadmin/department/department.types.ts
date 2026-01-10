// src/module/instituteadmin/department/department.types.ts

import { Department } from '@prisma/client';

// =====================================================
// REQUEST/INPUT TYPES
// =====================================================

export interface CreateDepartmentInput {
  name: string;
  code?: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateDepartmentInput {
  name?: string;
  code?: string;
  description?: string;
  isActive?: boolean;
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
// RESPONSE TYPES
// =====================================================

export interface DepartmentResponse {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  isActive: boolean;
  studentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DepartmentListResponse {
  departments: DepartmentResponse[];
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

// =====================================================
// MAPPER FUNCTIONS
// =====================================================

export interface DepartmentWithCount extends Department {
  _count?: {
    students: number;
  };
}

export const mapDepartmentToResponse = (
  department: DepartmentWithCount
): DepartmentResponse => ({
  id: department.id,
  name: department.name,
  code: department.code,
  description: department.description,
  isActive: department.isActive,
  studentCount: department._count?.students ?? 0,
  createdAt: department.createdAt,
  updatedAt: department.updatedAt,
});