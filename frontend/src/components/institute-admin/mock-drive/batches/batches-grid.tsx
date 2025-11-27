// src/components/institute-admin/mock-drive/batches/batches-grid.tsx

'use client';

import { BatchCard } from './batch-card';
import { Skeleton } from '@/components/ui/skeleton';
import { BatchListItem } from '@/types/admin.mockdrive.types';
import { Layers } from 'lucide-react';

interface BatchesGridProps {
  batches: BatchListItem[];
  isLoading?: boolean;
  driveId: string;
  onStart: (batchId: string) => void;
  onComplete: (batchId: string) => void;
  onDelete: (batchId: string) => void;
  isStarting?: boolean;
  isCompleting?: boolean;
  isDeleting?: boolean;
}

export function BatchesGrid({
  batches,
  isLoading,
  driveId,
  onStart,
  onComplete,
  onDelete,
  isStarting,
  isCompleting,
  isDeleting,
}: BatchesGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    );
  }

  if (batches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
        <Layers className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No batches found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Create batches to organize student attempts.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {batches.map((batch) => (
        <BatchCard
          key={batch.id}
          batch={batch}
          driveId={driveId}
          onStart={onStart}
          onComplete={onComplete}
          onDelete={onDelete}
          isStarting={isStarting}
          isCompleting={isCompleting}
          isDeleting={isDeleting}
        />
      ))}
    </div>
  );
}