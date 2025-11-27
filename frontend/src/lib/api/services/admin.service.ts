// src/lib/api/services/admin.service.ts

import { apiClient } from '../axios-instance';
import { API_ENDPOINTS } from '../endpoints';
import type {
  Institute,
  InstituteStats,
  CreateInstituteInput,
  UpdateInstituteInput,
  InstituteFilters,
  User,
  UserStats,
  CreateUserInput,
  UpdateUserInput,
  UserFilters,
  InstituteStudentFilters,
  PlatformAnalytics,
  ReportFilters,
  InstituteReport,
  UserReport,
  ActivityReport,
  PaginationMeta,
} from '@/types/admin.types';

// =====================================================
// ANALYTICS
// =====================================================

/**
 * Get platform analytics
 * GET /api/admin/analytics
 */
export async function getPlatformAnalytics(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<PlatformAnalytics> {
  const { data } = await apiClient.get(API_ENDPOINTS.ADMIN.ANALYTICS, { params });
  return data.data;
}

// =====================================================
// INSTITUTE MANAGEMENT
// =====================================================

/**
 * Get all institutes with pagination
 * GET /api/admin/institutes
 */
export async function getInstitutes(filters?: InstituteFilters): Promise<{
  institutes: Institute[];
  pagination: PaginationMeta;
}> {
  const { data } = await apiClient.get(API_ENDPOINTS.ADMIN.INSTITUTES, {
    params: filters,
  });
  return data.data;
}

/**
 * Get institute by ID
 * GET /api/admin/institutes/:id
 */
export async function getInstitute(id: string): Promise<Institute> {
  const { data } = await apiClient.get(API_ENDPOINTS.ADMIN.INSTITUTE(id));
  return data.data;
}

/**
 * Create new institute
 * POST /api/admin/institutes
 */
export async function createInstitute(input: CreateInstituteInput): Promise<Institute> {
  const { data } = await apiClient.post(API_ENDPOINTS.ADMIN.INSTITUTES, input);
  return data.data;
}

/**
 * Update institute
 * PATCH /api/admin/institutes/:id
 */
export async function updateInstitute(
  id: string,
  input: UpdateInstituteInput
): Promise<Institute> {
  const { data } = await apiClient.patch(API_ENDPOINTS.ADMIN.INSTITUTE(id), input);
  return data.data;
}

/**
 * Delete institute
 * DELETE /api/admin/institutes/:id
 */
export async function deleteInstitute(id: string): Promise<void> {
  await apiClient.delete(API_ENDPOINTS.ADMIN.INSTITUTE(id));
}

/**
 * Toggle institute status (active/inactive)
 * POST /api/admin/institutes/:id/toggle-status
 */
export async function toggleInstituteStatus(id: string): Promise<Institute> {
  const { data } = await apiClient.post(API_ENDPOINTS.ADMIN.INSTITUTE_TOGGLE(id));
  return data.data;
}

/**
 * Get institute statistics
 * GET /api/admin/institutes/:id/stats
 */
export async function getInstituteStats(id: string): Promise<InstituteStats> {
  // FIX: Use INSTITUTE_STATS instead of INSTITUTES(id)
  const { data } = await apiClient.get(API_ENDPOINTS.ADMIN.INSTITUTE_STATS(id));
  return data.data;
}

/**
 * Get institute students
 * GET /api/admin/institutes/:id/students
 */
export async function getInstituteStudents(
  id: string,
  filters?: InstituteStudentFilters
): Promise<{
  students: User[];
  pagination: PaginationMeta;
}> {
  // FIX: Use INSTITUTE_STUDENTS
  const { data } = await apiClient.get(API_ENDPOINTS.ADMIN.INSTITUTE_STUDENTS(id), {
    params: filters,
  });
  return data.data;
}

/**
 * Get institute admins
 * GET /api/admin/institutes/:id/admins
 */
export async function getInstituteAdmins(id: string): Promise<User[]> {
  // FIX: Use INSTITUTE_ADMINS
  const { data } = await apiClient.get(API_ENDPOINTS.ADMIN.INSTITUTE_ADMINS(id));
  return data.data;
}

// =====================================================
// USER MANAGEMENT
// =====================================================

/**
 * Get all users with pagination
 * GET /api/admin/users
 */
export async function getUsers(filters?: UserFilters): Promise<{
  users: User[];
  pagination: PaginationMeta;
}> {
  const { data } = await apiClient.get(API_ENDPOINTS.ADMIN.USERS, {
    params: filters,
  });
  return data.data;
}

/**
 * Get user by ID
 * GET /api/admin/users/:id
 */
export async function getUser(id: string): Promise<User> {
  const { data } = await apiClient.get(API_ENDPOINTS.ADMIN.USER(id));
  return data.data;
}

/**
 * Create new user
 * POST /api/admin/users
 */
export async function createUser(input: CreateUserInput): Promise<User> {
  const { data } = await apiClient.post(API_ENDPOINTS.ADMIN.USERS, input);
  return data.data;
}

/**
 * Update user
 * PATCH /api/admin/users/:id
 */
export async function updateUser(id: string, input: UpdateUserInput): Promise<User> {
  const { data } = await apiClient.patch(API_ENDPOINTS.ADMIN.USER(id), input);
  return data.data;
}

/**
 * Delete user
 * DELETE /api/admin/users/:id
 */
export async function deleteUser(id: string): Promise<void> {
  await apiClient.delete(API_ENDPOINTS.ADMIN.USER(id));
}

/**
 * Toggle user status (active/inactive)
 * POST /api/admin/users/:id/toggle-status
 */
export async function toggleUserStatus(id: string): Promise<User> {
  const { data } = await apiClient.post(API_ENDPOINTS.ADMIN.USER_TOGGLE(id));
  return data.data;
}

/**
 * Get user statistics
 * GET /api/admin/users/:id/stats
 */
export async function getUserStats(id: string): Promise<UserStats> {
  const { data } = await apiClient.get(API_ENDPOINTS.ADMIN.USER(id));
  return data.data;
}

/**
 * Reset user password
 * POST /api/admin/users/:id/reset-password
 */
export async function resetUserPassword(
  id: string,
  newPassword: string
): Promise<void> {
  await apiClient.post(API_ENDPOINTS.ADMIN.USER(id), { newPassword });
}

// =====================================================
// REPORTS
// =====================================================

/**
 * Get institutes report
 * GET /api/admin/reports/institutes
 */
export async function getInstitutesReport(
  filters?: ReportFilters
): Promise<InstituteReport> {
  const { data } = await apiClient.get(API_ENDPOINTS.ADMIN.REPORTS.INSTITUTES, {
    params: filters,
  });
  return data.data;
}

/**
 * Get users report
 * GET /api/admin/reports/users
 */
export async function getUsersReport(filters?: ReportFilters): Promise<UserReport> {
  const { data } = await apiClient.get(API_ENDPOINTS.ADMIN.REPORTS.USERS, {
    params: filters,
  });
  return data.data;
}

/**
 * Get activity report
 * GET /api/admin/reports/activity
 */
export async function getActivityReport(
  filters?: ReportFilters
): Promise<ActivityReport> {
  const { data } = await apiClient.get(API_ENDPOINTS.ADMIN.REPORTS.ACTIVITY, {
    params: filters,
  });
  return data.data;
}

/**
 * Download report as CSV
 */
export async function downloadReport(
  type: 'institutes' | 'users' | 'activity',
  filters?: ReportFilters
): Promise<Blob> {
  const endpoints = {
    institutes: API_ENDPOINTS.ADMIN.REPORTS.INSTITUTES,
    users: API_ENDPOINTS.ADMIN.REPORTS.USERS,
    activity: API_ENDPOINTS.ADMIN.REPORTS.ACTIVITY,
  };

  const { data } = await apiClient.get(endpoints[type], {
    params: { ...filters, format: 'csv' },
    responseType: 'blob',
  });

  return data;
}

// =====================================================
// ADMIN SERVICE CLASS
// =====================================================

class AdminService {
  // Analytics
  getPlatformAnalytics = getPlatformAnalytics;

  // Institutes
  getInstitutes = getInstitutes;
  getInstitute = getInstitute;
  createInstitute = createInstitute;
  updateInstitute = updateInstitute;
  deleteInstitute = deleteInstitute;
  toggleInstituteStatus = toggleInstituteStatus;
  getInstituteStats = getInstituteStats;
  getInstituteStudents = getInstituteStudents;
  getInstituteAdmins = getInstituteAdmins;

  // Users
  getUsers = getUsers;
  getUser = getUser;
  createUser = createUser;
  updateUser = updateUser;
  deleteUser = deleteUser;
  toggleUserStatus = toggleUserStatus;
  getUserStats = getUserStats;
  resetUserPassword = resetUserPassword;

  // Reports
  getInstitutesReport = getInstitutesReport;
  getUsersReport = getUsersReport;
  getActivityReport = getActivityReport;
  downloadReport = downloadReport;
}

// Export service instance
export const adminService = new AdminService();