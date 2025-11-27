// src/app/institute-admin/mock-drives/[driveId]/registrations/page.tsx

'use client';

import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
} from '@/components/ui/alert-dialog';
import { RegistrationsTable } from '@/components/institute-admin/mock-drive/registrations/registrations-table';
import { RegistrationsSummaryCards } from '@/components/institute-admin/mock-drive/registrations/registrations-summary-cards';
import { RegistrationDetailSheet } from '@/components/institute-admin/mock-drive/registrations/registration-detail-sheet';
import { useMockDriveDetail } from '@/lib/hooks/institute-admin/use-mockdrive';
import { useRegistrationsPage } from '@/lib/hooks/institute-admin/use-mockdrive-registrations';
import { MockDriveRegistrationStatus, RegistrationListItem } from '@/types/admin.mockdrive.types';
import { REGISTRATION_STATUS_CONFIG } from '@/lib/constants/admin.mockdrive.constants';
import {
  ArrowLeft,
  Search,
  X,
  RefreshCcw,
  CheckCircle,
  XCircle,
  Download,
  Users,
  AlertCircle,
} from 'lucide-react';

export default function RegistrationsPage() {
  const params = useParams();
  const driveId = params.driveId as string;

  const [searchInput, setSearchInput] = useState('');
  const [selectedRegistration, setSelectedRegistration] = useState<RegistrationListItem | null>(null);
  const [showApproveAllDialog, setShowApproveAllDialog] = useState(false);

  // Fetch mock drive details
  const { data: drive, isLoading: isDriveLoading } = useMockDriveDetail(driveId);

  // Registrations hook
  const {
    registrations,
    summary,
    pagination,
    isLoading,
    isFetching,
    params: queryParams,
    setPage,
    setSearch,
    setStatus,
    setBatchId,
    setHasBatch,
    resetFilters,
    selectedIds,
    selectedCount,
    toggleSelection,
    selectAll,
    clearSelection,
    isAllSelected,
    updateRegistration,
    bulkApprove,
    bulkReject,
    approveAll,
    exportRegistrations,
    isUpdating,
    isBulkUpdating,
    isApprovingAll,
    isExporting,
    refetch,
  } = useRegistrationsPage(driveId);

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

  const handleStatusChange = useCallback(
    (value: string) => {
      if (value === 'all') {
        setStatus(undefined);
      } else {
        setStatus(value as MockDriveRegistrationStatus);
      }
    },
    [setStatus]
  );

  const handleBatchFilterChange = useCallback(
    (value: string) => {
      if (value === 'all') {
        setHasBatch(undefined);
      } else if (value === 'with') {
        setHasBatch(true);
      } else {
        setHasBatch(false);
      }
    },
    [setHasBatch]
  );

  const handleApproveRegistration = useCallback(
    (registrationId: string) => {
      updateRegistration({
        registrationId,
        data: { status: MockDriveRegistrationStatus.APPROVED },
      });
    },
    [updateRegistration]
  );

  const handleRejectRegistration = useCallback(
    (registrationId: string) => {
      updateRegistration({
        registrationId,
        data: { status: MockDriveRegistrationStatus.REJECTED },
      });
    },
    [updateRegistration]
  );

  const handleApproveAll = useCallback(() => {
    approveAll();
    setShowApproveAllDialog(false);
  }, [approveAll]);

  const handleExport = useCallback(() => {
    exportRegistrations(queryParams.status);
  }, [exportRegistrations, queryParams.status]);

  const hasActiveFilters = !!(queryParams.search || queryParams.status || queryParams.hasBatch !== undefined);

  if (isDriveLoading) {
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
            <h1 className="text-2xl font-bold tracking-tight">Registrations</h1>
            <p className="text-sm text-muted-foreground">{drive?.title}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          {summary && summary.pending > 0 && (
            <Button onClick={() => setShowApproveAllDialog(true)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve All Pending ({summary.pending})
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <RegistrationsSummaryCards summary={summary} isLoading={isLoading} />

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

            {/* Status Filter */}
            <Select
              value={queryParams.status || 'all'}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(REGISTRATION_STATUS_CONFIG).map(([status, config]) => (
                  <SelectItem key={status} value={status}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Batch Filter */}
            <Select
              value={
                queryParams.hasBatch === undefined
                  ? 'all'
                  : queryParams.hasBatch
                    ? 'with'
                    : 'without'
              }
              onValueChange={handleBatchFilterChange}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Batch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="with">With Batch</SelectItem>
                <SelectItem value="without">Without Batch</SelectItem>
              </SelectContent>
            </Select>

            {/* Refresh */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCcw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            </Button>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear
              </Button>
            )}
          </div>

          {/* Bulk Actions */}
          {selectedCount > 0 && (
            <div className="mt-4 flex items-center gap-4 rounded-lg border bg-muted/50 p-3">
              <span className="text-sm font-medium">
                {selectedCount} selected
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={bulkApprove}
                  disabled={isBulkUpdating}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={bulkReject}
                  disabled={isBulkUpdating}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clearSelection}
                >
                  Clear
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Registrations Table */}
      <RegistrationsTable
        registrations={registrations}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onToggleSelection={toggleSelection}
        onSelectAll={selectAll}
        isAllSelected={isAllSelected}
        onApprove={handleApproveRegistration}
        onReject={handleRejectRegistration}
        onViewDetails={setSelectedRegistration}
        isUpdating={isUpdating}
        pagination={pagination}
        onPageChange={setPage}
      />

      {/* Registration Detail Sheet */}
      <RegistrationDetailSheet
        registration={selectedRegistration}
        open={!!selectedRegistration}
        onOpenChange={(open) => !open && setSelectedRegistration(null)}
        onApprove={handleApproveRegistration}
        onReject={handleRejectRegistration}
        isUpdating={isUpdating}
      />

      {/* Approve All Dialog */}
      <AlertDialog open={showApproveAllDialog} onOpenChange={setShowApproveAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve All Pending Registrations</AlertDialogTitle>
            <AlertDialogDescription>
              This will approve all {summary?.pending ?? 0} pending registrations.
              Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApproveAll} disabled={isApprovingAll}>
              {isApprovingAll ? 'Approving...' : 'Approve All'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
      <Skeleton className="h-16" />
      <Skeleton className="h-96" />
    </div>
  );
}