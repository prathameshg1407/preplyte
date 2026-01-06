'use client';

import { useCallback } from 'react';
import { InstituteStudentsList } from '@/components/institute-admin/institute-students-list';
import { useInstituteAdminStudents } from '@/lib/hooks/institute-admin/use-institute-admin-students';
import { useAuth } from '@/lib/hooks/use-auth';
import { Users } from 'lucide-react';

export default function InstituteStudentsPage() {
  const { user } = useAuth();
  const instituteId = user?.instituteId || '';

  // Always call hooks before any conditional returns
  const {
    students,
    loading,
    error,
    filters,
    setFilters,
    pagination,
    setPagination,
    refetch,
  } = useInstituteAdminStudents(instituteId);

  const handleFiltersChange = useCallback(
    (newFilters: typeof filters) => {
      setFilters(newFilters);
      setPagination(prev => ({ ...prev, page: 1 }));
    },
    [setFilters, setPagination],
  );

  const handlePaginationChange = useCallback(
    (newPagination: typeof pagination) => {
      setPagination(newPagination);
    },
    [setPagination],
  );

  // Show error state if no institute access
  if (!instituteId) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No institute access
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center gap-3 p-6 border-b">
        <Users className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Students</h1>
          <p className="text-muted-foreground">
            View and manage students from your institute
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <InstituteStudentsList
          students={students}
          loading={loading}
          error={error}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          pagination={pagination}
          onPaginationChange={handlePaginationChange}
          onRefresh={refetch}
          showActions
        />
      </div>
    </div>
  );
}
