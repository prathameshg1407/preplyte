// src/components/mock-drive/discovery/drive-list.tsx

'use client';

import { FC } from 'react';
import { MockDriveListItem } from '@/types/mockdrive.types';
import { DriveCard } from './drive-card';
import { Skeleton } from '@/components/ui/skeleton';

interface DriveListProps {
  drives: MockDriveListItem[];
  isLoading?: boolean;
}

export const DriveList: FC<DriveListProps> = ({ drives, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[280px] rounded-lg" />
        ))}
      </div>
    );
  }

  if (drives.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No mock drives found</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {drives.map((drive) => (
        <DriveCard key={drive.id} drive={drive} />
      ))}
    </div>
  );
};