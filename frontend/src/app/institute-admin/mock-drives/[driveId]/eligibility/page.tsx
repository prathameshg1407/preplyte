// src/app/institute-admin/mock-drives/[driveId]/eligibility/page.tsx

'use client';

import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { EligibilityForm } from '@/components/institute-admin/mock-drive/eligibility/eligibility-form';
import { EligibleStudentsTable } from '@/components/institute-admin/mock-drive/eligibility/eligible-students-table';
import { useMockDriveDetail } from '@/lib/hooks/institute-admin/use-mockdrive';
import { useEligibilityPage } from '@/lib/hooks/institute-admin/use-mockdrive-eligibility';
import { DEPARTMENT_OPTIONS, COURSE_YEAR_OPTIONS } from '@/lib/constants/admin.mockdrive.constants';
import {
  ArrowLeft,
  Search,
  X,
  RefreshCcw,
  Users,
  CheckCircle,
  Settings,
  Trash2,
  AlertCircle,
  GraduationCap,
  Building2,
} from 'lucide-react';

export default function EligibilityPage() {
  const params = useParams();
  const driveId = params.driveId as string;

  const [searchInput, setSearchInput] = useState('');
  const [activeTab, setActiveTab] = useState('criteria');

  // Fetch mock drive details
  const { data: drive, isLoading: isDriveLoading } = useMockDriveDetail(driveId);

  // Eligibility hook
  const {
    criteria,
    summary,
    students,
    studentsPagination,
    isLoadingCriteria,
    isLoadingSummary,
    isLoadingStudents,
    hasCriteria,
    studentsParams,
    setPage,
    setLimit,
    setSearch,
    setDepartment,
    setCourseYear,
    resetFilters,
    setEligibility,
    setEligibilityAsync,
    updateEligibility,
    deleteEligibility,
    isSetting,
    isUpdating,
    isDeleting,
    refetchCriteria,
    refetchStudents,
  } = useEligibilityPage(driveId);

  // Handlers
  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setSearch(searchInput);
    },
    [searchInput, setSearch]
  );

  const handleClearSearch = useCallback(() => {
    setSearchInput('');
    setSearch('');
  }, [setSearch]);

  const handleDepartmentChange = useCallback(
    (value: string) => {
      if (value === 'all') {
        setDepartment(undefined);
      } else {
        setDepartment(value);
      }
    },
    [setDepartment]
  );

  const handleCourseYearChange = useCallback(
    (value: string) => {
      if (value === 'all') {
        setCourseYear(undefined);
      } else {
        setCourseYear(value);
      }
    },
    [setCourseYear]
  );

  const handleDeleteCriteria = useCallback(() => {
    deleteEligibility();
  }, [deleteEligibility]);

  const hasActiveFilters = !!(
    studentsParams.search ||
    studentsParams.department ||
    studentsParams.courseYear
  );

  if (isDriveLoading || isLoadingCriteria) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/institute-admin/mock-drives/${driveId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Eligibility</h1>
            <p className="text-sm text-muted-foreground">{drive?.title}</p>
          </div>
        </div>
        {hasCriteria && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" disabled={isDeleting}>
                <Trash2 className="mr-2 h-4 w-4" />
                Remove Criteria
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove Eligibility Criteria</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove all eligibility restrictions. All students will
                  become eligible to register. Are you sure?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteCriteria}
                  className="bg-destructive text-destructive-foreground"
                >
                  Remove Criteria
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Eligible Students
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalEligible}</div>
              <p className="text-xs text-muted-foreground">
                {summary.totalRegistered} already registered
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Departments
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.keys(summary.byDepartment).length}
              </div>
              <p className="text-xs text-muted-foreground">
                departments with eligible students
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Course Years
              </CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.keys(summary.byCourseYear).length}
              </div>
              <p className="text-xs text-muted-foreground">
                course years with eligible students
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Registration Rate
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary.totalEligible > 0
                  ? `${((summary.totalRegistered / summary.totalEligible) * 100).toFixed(1)}%`
                  : '0%'}
              </div>
              <p className="text-xs text-muted-foreground">
                of eligible students registered
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="criteria">
            <Settings className="mr-2 h-4 w-4" />
            Criteria
          </TabsTrigger>
          <TabsTrigger value="students">
            <Users className="mr-2 h-4 w-4" />
            Eligible Students ({summary?.totalEligible ?? 0})
          </TabsTrigger>
        </TabsList>

        {/* Criteria Tab */}
        <TabsContent value="criteria" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Eligibility Criteria</CardTitle>
              <CardDescription>
                Define who can register for this mock drive. Leave fields empty to
                allow all students.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EligibilityForm
                criteria={criteria}
                onSubmit={async (data) => {
                  await setEligibilityAsync(data);
                }}
                isSubmitting={isSetting || isUpdating}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center gap-4">
                {/* Search */}
                <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or ID..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="w-64 pl-9"
                    />
                  </div>
                  <Button type="submit" variant="secondary" size="sm">
                    Search
                  </Button>
                </form>

                {/* Department Filter */}
                <Select
                  value={studentsParams.department || 'all'}
                  onValueChange={handleDepartmentChange}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {DEPARTMENT_OPTIONS.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Course Year Filter */}
                <Select
                  value={studentsParams.courseYear || 'all'}
                  onValueChange={handleCourseYearChange}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Course Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {COURSE_YEAR_OPTIONS.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Refresh */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => refetchStudents()}
                  disabled={isLoadingStudents}
                >
                  <RefreshCcw
                    className={`h-4 w-4 ${isLoadingStudents ? 'animate-spin' : ''}`}
                  />
                </Button>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={resetFilters}>
                    <X className="mr-2 h-4 w-4" />
                    Clear
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Students Table */}
          <EligibleStudentsTable
            students={students}
            isLoading={isLoadingStudents}
            pagination={studentsPagination}
            onPageChange={setPage}
            driveId={driveId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10" />
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-1 h-4 w-32" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-12 w-64" />
      <Skeleton className="h-96" />
    </div>
  );
}