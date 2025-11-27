// src/components/institute-admin/mock-drive/drive-list.tsx

'use client';

import { MockDriveListItem, MockDriveStatus } from '@/types/admin.mockdrive.types';
import { DriveCard } from './drive-card';
import { Skeleton } from '@/components/ui/skeleton';
import { FileX2 } from 'lucide-react';

interface DriveListProps {
  drives: MockDriveListItem[] | undefined;
  isLoading?: boolean;
  onPublish?: (id: string) => void;
  onCancel?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  isPublishing?: boolean;
  isCancelling?: boolean;
  isDeleting?: boolean;
  isDuplicating?: boolean;
}

export function DriveList({
  drives,
  isLoading,
  onPublish,
  onCancel,
  onDelete,
  onDuplicate,
  isPublishing,
  isCancelling,
  isDeleting,
  isDuplicating,
}: DriveListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <DriveCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!drives || drives.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
        <FileX2 className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No mock drives found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Create your first mock drive to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {drives.map((drive) => (
        <DriveCard
          key={drive.id}
          drive={drive}
          onPublish={onPublish}
          onCancel={onCancel}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          isPublishing={isPublishing}
          isCancelling={isCancelling}
          isDeleting={isDeleting}
          isDuplicating={isDuplicating}
        />
      ))}
    </div>
  );
}

function DriveCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-6 w-20" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 flex-1" />
      </div>
    </div>
  );
}