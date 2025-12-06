// src/components/institute-admin/mock-drive/mock-drives-page-content.tsx
'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useMockDriveListPage } from '@/lib/hooks/institute-admin/use-mockdrive';
import { DriveList } from '@/components/institute-admin/mock-drive/drive-list';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { MockDriveStatus } from '@/types/admin.mockdrive.types';
import { MOCK_DRIVE_STATUS_CONFIG } from '@/lib/constants/admin.mockdrive.constants';
import { Plus, Search, X, RefreshCcw } from 'lucide-react';

export function MockDrivesPageContent() {
  const [searchInput, setSearchInput] = useState('');

  const {
    items,
    isLoading,
    isFetching,
    pagination,
    params,
    setPage,
    setSearch,
    setStatus,
    resetFilters,
    deleteMockDrive,
    publishMockDrive,
    cancelMockDrive,
    duplicateMockDrive,
    isDeleting,
    isPublishing,
    isCancelling,
    isDuplicating,
    refetch,
  } = useMockDriveListPage();

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
        setStatus(value as MockDriveStatus);
      }
    },
    [setStatus]
  );

  const handleDuplicate = useCallback(
    (id: string) => {
      duplicateMockDrive({ id });
    },
    [duplicateMockDrive]
  );

  const hasActiveFilters = !!(params.search || params.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mock Drives</h1>
          <p className="text-muted-foreground">
            Create and manage mock placement drives for your students
          </p>
        </div>
        <Button asChild>
          <Link href="/institute-admin/mock-drives/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Mock Drive
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search mock drives..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-64 pl-9 pr-9"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Search
          </Button>
        </form>

        {/* Status Filter */}
        <Select value={params.status || 'all'} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(MOCK_DRIVE_STATUS_CONFIG).map(([status, config]) => (
              <SelectItem key={status} value={status}>
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${config.color.replace('text-', 'bg-')}`}
                  />
                  {config.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Refresh Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => refetch()}
          disabled={isFetching}
          title="Refresh"
        >
          <RefreshCcw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          <span className="sr-only">Refresh</span>
        </Button>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <X className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {pagination.totalItems} mock drive
          {pagination.totalItems !== 1 ? 's' : ''} found
        </p>
        {isFetching && !isLoading && (
          <p className="text-sm text-muted-foreground">Updating...</p>
        )}
      </div>

      {/* Drive List */}
      <DriveList
        drives={items}
        isLoading={isLoading}
        onPublish={publishMockDrive}
        onCancel={cancelMockDrive}
        onDelete={deleteMockDrive}
        onDuplicate={handleDuplicate}
        isPublishing={isPublishing}
        isCancelling={isCancelling}
        isDeleting={isDeleting}
        isDuplicating={isDuplicating}
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage(pagination.currentPage - 1)}
                  className={
                    !pagination.hasPrevPage
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>

              {/* Generate page numbers */}
              {generatePageNumbers(
                pagination.currentPage,
                pagination.totalPages
              ).map((pageNum, idx) => (
                <PaginationItem key={idx}>
                  {pageNum === '...' ? (
                    <span className="px-4 py-2">...</span>
                  ) : (
                    <PaginationLink
                      onClick={() => setPage(pageNum as number)}
                      isActive={pageNum === pagination.currentPage}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage(pagination.currentPage + 1)}
                  className={
                    !pagination.hasNextPage
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}

/**
 * Generate array of page numbers with ellipsis for pagination
 */
function generatePageNumbers(
  currentPage: number,
  totalPages: number
): (number | string)[] {
  const pages: (number | string)[] = [];

  if (totalPages <= 7) {
    // Show all pages if total is 7 or less
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Always show first page
    pages.push(1);

    if (currentPage > 3) {
      pages.push('...');
    }

    // Show pages around current page
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('...');
    }

    // Always show last page
    pages.push(totalPages);
  }

  return pages;
}