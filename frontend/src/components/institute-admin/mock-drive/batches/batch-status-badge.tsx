// src/components/institute-admin/mock-drive/batches/batch-status-badge.tsx

'use client';

import { Badge } from '@/components/ui/badge';
import { MockDriveBatchStatus } from '@/types/admin.mockdrive.types';
import { BATCH_STATUS_CONFIG } from '@/lib/constants/admin.mockdrive.constants';
import { cn } from '@/lib/utils';

interface BatchStatusBadgeProps {
  status: MockDriveBatchStatus;
  size?: 'sm' | 'md';
}

export function BatchStatusBadge({ status, size = 'md' }: BatchStatusBadgeProps) {
  const config = BATCH_STATUS_CONFIG[status];

  return (
    <Badge
      variant="outline"
      className={cn(
        config.bgColor,
        config.color,
        config.borderColor,
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-0.5'
      )}
    >
      {config.label}
    </Badge>
  );
}