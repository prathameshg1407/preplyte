// src/app/institute-admin/mock-drives/[driveId]/batches/page.tsx

'use client';

import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { BatchesGrid } from '@/components/institute-admin/mock-drive/batches/batches-grid';
import { CreateBatchDialog } from '@/components/institute-admin/mock-drive/batches/create-batch-dialog';
import { AutoCreateBatchesDialog } from '@/components/institute-admin/mock-drive/batches/auto-create-batches-dialog';
import { useMockDriveDetail } from '@/lib/hooks/institute-admin/use-mockdrive';
import { useBatchesPage } from '@/lib/hooks/institute-admin/use-mockdrive-batches';
import { MockDriveBatchStatus } from '@/types/admin.mockdrive.types';
import { BATCH_STATUS_CONFIG } from '@/lib/constants/admin.mockdrive.constants';
import {
  ArrowLeft,
  Plus,
  Wand2,
  RefreshCcw,
  X,
  Layers,
} from 'lucide-react';

export default function BatchesPage() {
  const params = useParams();
  const driveId = params.driveId as string;

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAutoCreateDialog, setShowAutoCreateDialog] = useState(false);

  // Fetch mock drive details
  const { data: drive, isLoading: isDriveLoading } = useMockDriveDetail(driveId);

  // Batches hook
  const {
    batches,
    pagination,
    isLoading,
    isFetching,
    params: queryParams,
    setPage,
    setStatus,
    resetFilters,
    createBatch,
    createBatchAsync,
    updateBatch,
    deleteBatch,
    autoCreateBatches,
    autoCreateBatchesAsync,
    startBatch,
    completeBatch,
    isCreating,
    isUpdating,
    isDeleting,
    isAutoCreating,
    isStarting,
    isCompleting,
    refetch,
  } = useBatchesPage(driveId);

  const handleStatusChange = useCallback(
    (value: string) => {
      if (value === 'all') {
        setStatus(undefined);
      } else {
        setStatus(value as MockDriveBatchStatus);
      }
    },
    [setStatus]
  );

  const hasActiveFilters = !!queryParams.status;

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
            <h1 className="text-2xl font-bold tracking-tight">Batches</h1>
            <p className="text-sm text-muted-foreground">{drive?.title}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAutoCreateDialog(true)}>
            <Wand2 className="mr-2 h-4 w-4" />
            Auto Create
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Batch
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
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
                {Object.entries(BATCH_STATUS_CONFIG).map(([status, config]) => (
                  <SelectItem key={status} value={status}>
                    {config.label}
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

            {/* Count */}
            <span className="ml-auto text-sm text-muted-foreground">
              {pagination.totalItems} batch{pagination.totalItems !== 1 ? 'es' : ''}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Batches Grid */}
      <BatchesGrid
        batches={batches}
        isLoading={isLoading}
        driveId={driveId}
        onStart={startBatch}
        onComplete={completeBatch}
        onDelete={deleteBatch}
        isStarting={isStarting}
        isCompleting={isCompleting}
        isDeleting={isDeleting}
      />

      {/* Create Batch Dialog */}
      <CreateBatchDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={async (data) => {
          await createBatchAsync(data);
          setShowCreateDialog(false);
        }}
        isSubmitting={isCreating}
      />

      {/* Auto Create Batches Dialog */}
      <AutoCreateBatchesDialog
        open={showAutoCreateDialog}
        onOpenChange={setShowAutoCreateDialog}
        onSubmit={async (data) => {
          await autoCreateBatchesAsync(data);
          setShowAutoCreateDialog(false);
        }}
        isSubmitting={isAutoCreating}
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
      <Skeleton className="h-16" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    </div>
  );
}