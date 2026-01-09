// src/lib/api/services/institute-admin/department.service.ts

import { apiClient } from '../../axios-instance';
import { API_ENDPOINTS } from '../../endpoints';
import type {
  Department,
  DepartmentListResponse,
  DepartmentStats,
  DepartmentOption,
  CreateDepartmentInput,
  UpdateDepartmentInput,
  BulkCreateDepartmentInput,
  BulkCreateResult,
  DepartmentQueryParams,
  DepartmentApiResponse,
} from '@/types/department.types';

// =====================================================
// GET DEPARTMENTS (LIST)
// =====================================================

export const getDepartments = async (
  params: DepartmentQueryParams = {}
): Promise<DepartmentListResponse> => {
  const response = await apiClient.get<DepartmentApiResponse<DepartmentListResponse>>(
    API_ENDPOINTS.INSTITUTE.DEPARTMENTS,
    { params }
  );
  return response.data.data;
};

// =====================================================
// GET SINGLE DEPARTMENT
// =====================================================

export const getDepartment = async (id: string): Promise<Department> => {
  const response = await apiClient.get<DepartmentApiResponse<Department>>(
    API_ENDPOINTS.INSTITUTE.DEPARTMENT(id)
  );
  return response.data.data;
};

// =====================================================
// GET DEPARTMENT STATS
// =====================================================

export const getDepartmentStats = async (): Promise<DepartmentStats> => {
  const response = await apiClient.get<DepartmentApiResponse<DepartmentStats>>(
    API_ENDPOINTS.INSTITUTE.DEPARTMENTS_STATS
  );
  return response.data.data;
};

// =====================================================
// GET ACTIVE DEPARTMENTS (for dropdowns)
// =====================================================

export const getActiveDepartments = async (): Promise<DepartmentOption[]> => {
  const response = await apiClient.get<DepartmentApiResponse<DepartmentOption[]>>(
    API_ENDPOINTS.INSTITUTE.DEPARTMENTS_ACTIVE
  );
  return response.data.data;
};

// =====================================================
// CREATE DEPARTMENT
// =====================================================

export const createDepartment = async (
  input: CreateDepartmentInput
): Promise<Department> => {
  const response = await apiClient.post<DepartmentApiResponse<Department>>(
    API_ENDPOINTS.INSTITUTE.DEPARTMENTS,
    input
  );
  return response.data.data;
};

// =====================================================
// UPDATE DEPARTMENT
// =====================================================

export const updateDepartment = async (
  id: string,
  input: UpdateDepartmentInput
): Promise<Department> => {
  const response = await apiClient.patch<DepartmentApiResponse<Department>>(
    API_ENDPOINTS.INSTITUTE.DEPARTMENT(id),
    input
  );
  return response.data.data;
};

// =====================================================
// DELETE DEPARTMENT
// =====================================================

export const deleteDepartment = async (id: string): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.INSTITUTE.DEPARTMENT(id));
};

// =====================================================
// TOGGLE DEPARTMENT STATUS
// =====================================================

export const toggleDepartmentStatus = async (
  id: string,
  isActive: boolean
): Promise<Department> => {
  const response = await apiClient.patch<DepartmentApiResponse<Department>>(
    API_ENDPOINTS.INSTITUTE.DEPARTMENT_STATUS(id),
    { isActive }
  );
  return response.data.data;
};

// =====================================================
// BULK CREATE DEPARTMENTS
// =====================================================

export const bulkCreateDepartments = async (
  input: BulkCreateDepartmentInput
): Promise<BulkCreateResult> => {
  const response = await apiClient.post<DepartmentApiResponse<BulkCreateResult>>(
    API_ENDPOINTS.INSTITUTE.DEPARTMENTS_BULK,
    input
  );
  return response.data.data;
};

// =====================================================
// EXPORT SERVICE
// =====================================================

export const departmentService = {
  getDepartments,
  getDepartment,
  getDepartmentStats,
  getActiveDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  toggleDepartmentStatus,
  bulkCreateDepartments,
};

export default departmentService;