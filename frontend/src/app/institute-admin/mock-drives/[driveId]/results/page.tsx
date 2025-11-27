// src/app/institute-admin/mock-drives/[driveId]/results/page.tsx

'use client';

import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ResultsTable } from '@/components/institute-admin/mock-drive/results/results-table';
import { ResultsStatisticsCards } from '@/components/institute-admin/mock-drive/results/results-statistics-cards';
import { ExportResultsDialog } from '@/components/institute-admin/mock-drive/results/export-results-dialog';
import { useMockDriveDetail } from '@/lib/hooks/institute-admin/use-mockdrive';
import { useResultsPage } from '@/lib/hooks/institute-admin/use-mockdrive-results';
import { useBatches } from '@/lib/hooks/institute-admin/use-mockdrive-batches';
import { MockDriveAttemptStatus } from '@/types/admin.mockdrive.types';
import { ATTEMPT_STATUS_CONFIG } from '@/lib/constants/admin.mockdrive.constants';
import {
  ArrowLeft,
  Search,
  X,
  RefreshCcw,
  Download,
  Calculator,
  FileText,
} from 'lucide-react';

export default function ResultsPage() {
  const params = useParams();
  const driveId = params.driveId as string;

  const [searchInput, setSearchInput] = useState('');
  const [showExportDialog, setShowExportDialog] = useState(false);

  // Fetch mock drive details
  const { data: drive, isLoading: isDriveLoading } = useMockDriveDetail(driveId);

  // Fetch batches for filter
  const { data: batchesData } = useBatches(driveId);
  const batches = batchesData?.data ?? [];

  // Results hook
  const {
    results,
    statistics,
    pagination,
    isLoading,
    isFetching,
    isLoadingStatistics,
    params: queryParams,
    setPage,
    setSearch,
    setStatus,
    setBatchId,
    setSorting,
    resetFilters,
    calculateRankings,
    exportResults,
    generateAllReports,
    isCalculatingRankings,
    isExporting,
    isGeneratingAllReports,
    refetch,
  } = useResultsPage(driveId);

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
        setStatus(value as MockDriveAttemptStatus);
      }
    },
    [setStatus]
  );

  const handleBatchChange = useCallback(
    (value: string) => {
      if (value === 'all') {
        setBatchId(undefined);
      } else {
        setBatchId(value);
      }
    },
    [setBatchId]
  );

  const hasActiveFilters = !!(queryParams.search || queryParams.status || queryParams.batchId);

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
            <h1 className="text-2xl font-bold tracking-tight">Results</h1>
            <p className="text-sm text-muted-foreground">{drive?.title}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => calculateRankings()}
            disabled={isCalculatingRankings}
          >
            <Calculator className="mr-2 h-4 w-4" />
            Calculate Rankings
          </Button>
          <Button
            variant="outline"
            onClick={() => generateAllReports()}
            disabled={isGeneratingAllReports}
          >
            <FileText className="mr-2 h-4 w-4" />
            Generate Reports
          </Button>
          <Button onClick={() => setShowExportDialog(true)}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <ResultsStatisticsCards statistics={statistics} isLoading={isLoadingStatistics} />

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
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
                {Object.entries(ATTEMPT_STATUS_CONFIG).map(([status, config]) => (
                  <SelectItem key={status} value={status}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Batch Filter */}
            <Select
              value={queryParams.batchId || 'all'}
              onValueChange={handleBatchChange}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Batch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Batches</SelectItem>
                {batches.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id}>
                    {batch.name}
                  </SelectItem>
                ))}
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
        </CardContent>
      </Card>

      {/* Results Table */}
      <ResultsTable
        results={results}
        isLoading={isLoading}
        driveId={driveId}
        pagination={pagination}
        onPageChange={setPage}
        onSortChange={setSorting}
        currentSort={{
          sortBy: queryParams.sortBy,
          sortOrder: queryParams.sortOrder,
        }}
      />

      {/* Export Dialog */}
      <ExportResultsDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        onExport={exportResults}
        isExporting={isExporting}
        batches={batches}
      />
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