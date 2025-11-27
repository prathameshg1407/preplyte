// src/lib/hooks/use-admin.ts

import { useCallback, useEffect } from 'react';
import { useAdminStore } from '../store/admin-store';
import { adminService } from '../api/services/admin.service';
import type {
  InstituteFilters,
  UserFilters,
  CreateInstituteInput,
  UpdateInstituteInput,
  CreateUserInput,
  UpdateUserInput,
  InstituteStudentFilters,
  ReportFilters,
} from '../../types/admin.types';

// =====================================================
// ANALYTICS HOOK
// =====================================================

export function useAnalytics() {
  const { analytics, analyticsLoading, setAnalytics, setAnalyticsLoading } =
    useAdminStore();

  const fetchAnalytics = useCallback(
    async (params?: { startDate?: string; endDate?: string }) => {
      setAnalyticsLoading(true);
      try {
        const data = await adminService.getPlatformAnalytics(params);
        setAnalytics(data);
        return data;
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        throw error;
      } finally {
        setAnalyticsLoading(false);
      }
    },
    [setAnalytics, setAnalyticsLoading]
  );

  return {
    analytics,
    loading: analyticsLoading,
    fetchAnalytics,
  };
}

// =====================================================
// INSTITUTES HOOK
// =====================================================

export function useInstitutes() {
  const {
    institutes,
    institutesPagination,
    institutesLoading,
    instituteFilters,
    setInstitutes,
    setInstitutesLoading,
    setInstituteFilters,
    updateInstitute,
    removeInstitute,
  } = useAdminStore();

  const fetchInstitutes = useCallback(
    async (filters?: InstituteFilters) => {
      setInstitutesLoading(true);
      try {
        const mergedFilters = { ...instituteFilters, ...filters };
        const data = await adminService.getInstitutes(mergedFilters);
        setInstitutes(data.institutes, data.pagination);
        return data;
      } catch (error) {
        console.error('Failed to fetch institutes:', error);
        throw error;
      } finally {
        setInstitutesLoading(false);
      }
    },
    [instituteFilters, setInstitutes, setInstitutesLoading]
  );

  const createInstitute = useCallback(async (input: CreateInstituteInput) => {
    const institute = await adminService.createInstitute(input);
    await fetchInstitutes();
    return institute;
  }, [fetchInstitutes]);

  const editInstitute = useCallback(
    async (id: string, input: UpdateInstituteInput) => {
      const institute = await adminService.updateInstitute(id, input);
      updateInstitute(id, institute);
      return institute;
    },
    [updateInstitute]
  );

  const deleteInstitute = useCallback(
    async (id: string) => {
      await adminService.deleteInstitute(id);
      removeInstitute(id);
    },
    [removeInstitute]
  );

  const toggleStatus = useCallback(
    async (id: string) => {
      const institute = await adminService.toggleInstituteStatus(id);
      updateInstitute(id, institute);
      return institute;
    },
    [updateInstitute]
  );

  const changePage = useCallback(
    (page: number) => {
      setInstituteFilters({ page });
    },
    [setInstituteFilters]
  );

  const changeFilters = useCallback(
    (filters: Partial<InstituteFilters>) => {
      setInstituteFilters({ ...filters, page: 1 });
    },
    [setInstituteFilters]
  );

  // Auto-fetch when filters change
  useEffect(() => {
    fetchInstitutes();
  }, [instituteFilters]);

  return {
    institutes,
    pagination: institutesPagination,
    loading: institutesLoading,
    filters: instituteFilters,
    fetchInstitutes,
    createInstitute,
    editInstitute,
    deleteInstitute,
    toggleStatus,
    changePage,
    changeFilters,
  };
}

// =====================================================
// SINGLE INSTITUTE HOOK
// =====================================================

export function useInstitute(id: string) {
  const { selectedInstitute, setSelectedInstitute } = useAdminStore();

  const fetchInstitute = useCallback(async () => {
    try {
      const institute = await adminService.getInstitute(id);
      setSelectedInstitute(institute);
      return institute;
    } catch (error) {
      console.error('Failed to fetch institute:', error);
      throw error;
    }
  }, [id, setSelectedInstitute]);

  const fetchStats = useCallback(async () => {
    return adminService.getInstituteStats(id);
  }, [id]);

  const fetchStudents = useCallback(
    async (filters?: InstituteStudentFilters) => {
      return adminService.getInstituteStudents(id, filters);
    },
    [id]
  );

  const fetchAdmins = useCallback(async () => {
    return adminService.getInstituteAdmins(id);
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchInstitute();
    }
    return () => setSelectedInstitute(null);
  }, [id, fetchInstitute, setSelectedInstitute]);

  return {
    institute: selectedInstitute,
    fetchInstitute,
    fetchStats,
    fetchStudents,
    fetchAdmins,
  };
}

// =====================================================
// USERS HOOK
// =====================================================

export function useUsers() {
  const {
    users,
    usersPagination,
    usersLoading,
    userFilters,
    setUsers,
    setUsersLoading,
    setUserFilters,
    updateUser,
    removeUser,
  } = useAdminStore();

  const fetchUsers = useCallback(
    async (filters?: UserFilters) => {
      setUsersLoading(true);
      try {
        const mergedFilters = { ...userFilters, ...filters };
        const data = await adminService.getUsers(mergedFilters);
        setUsers(data.users, data.pagination);
        return data;
      } catch (error) {
        console.error('Failed to fetch users:', error);
        throw error;
      } finally {
        setUsersLoading(false);
      }
    },
    [userFilters, setUsers, setUsersLoading]
  );

  const createUser = useCallback(async (input: CreateUserInput) => {
    const user = await adminService.createUser(input);
    await fetchUsers();
    return user;
  }, [fetchUsers]);

  const editUser = useCallback(
    async (id: string, input: UpdateUserInput) => {
      const user = await adminService.updateUser(id, input);
      updateUser(id, user);
      return user;
    },
    [updateUser]
  );

  const deleteUser = useCallback(
    async (id: string) => {
      await adminService.deleteUser(id);
      removeUser(id);
    },
    [removeUser]
  );

  const toggleStatus = useCallback(
    async (id: string) => {
      const user = await adminService.toggleUserStatus(id);
      updateUser(id, user);
      return user;
    },
    [updateUser]
  );

  const resetPassword = useCallback(async (id: string, newPassword: string) => {
    await adminService.resetUserPassword(id, newPassword);
  }, []);

  const changePage = useCallback(
    (page: number) => {
      setUserFilters({ page });
    },
    [setUserFilters]
  );

  const changeFilters = useCallback(
    (filters: Partial<UserFilters>) => {
      setUserFilters({ ...filters, page: 1 });
    },
    [setUserFilters]
  );

  // Auto-fetch when filters change
  useEffect(() => {
    fetchUsers();
  }, [userFilters]);

  return {
    users,
    pagination: usersPagination,
    loading: usersLoading,
    filters: userFilters,
    fetchUsers,
    createUser,
    editUser,
    deleteUser,
    toggleStatus,
    resetPassword,
    changePage,
    changeFilters,
  };
}

// =====================================================
// SINGLE USER HOOK
// =====================================================

export function useUser(id: string) {
  const { selectedUser, setSelectedUser } = useAdminStore();

  const fetchUser = useCallback(async () => {
    try {
      const user = await adminService.getUser(id);
      setSelectedUser(user);
      return user;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      throw error;
    }
  }, [id, setSelectedUser]);

  const fetchStats = useCallback(async () => {
    return adminService.getUserStats(id);
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchUser();
    }
    return () => setSelectedUser(null);
  }, [id, fetchUser, setSelectedUser]);

  return {
    user: selectedUser,
    fetchUser,
    fetchStats,
  };
}

// =====================================================
// REPORTS HOOK
// =====================================================

export function useReports() {
  const getInstitutesReport = useCallback(async (filters?: ReportFilters) => {
    return adminService.getInstitutesReport(filters);
  }, []);

  const getUsersReport = useCallback(async (filters?: ReportFilters) => {
    return adminService.getUsersReport(filters);
  }, []);

  const getActivityReport = useCallback(async (filters?: ReportFilters) => {
    return adminService.getActivityReport(filters);
  }, []);

  const downloadReport = useCallback(
    async (type: 'institutes' | 'users' | 'activity', filters?: ReportFilters) => {
      const blob = await adminService.downloadReport(type, filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    },
    []
  );

  return {
    getInstitutesReport,
    getUsersReport,
    getActivityReport,
    downloadReport,
  };
}