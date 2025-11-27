// src/components/institute-admin/mock-drive/results/attempt-status-badge.tsx

'use client';

import { Badge } from '@/components/ui/badge';
import { MockDriveAttemptStatus } from '@/types/admin.mockdrive.types';
import { ATTEMPT_STATUS_CONFIG } from '@/lib/constants/admin.mockdrive.constants';
import { cn } from '@/lib/utils';

interface AttemptStatusBadgeProps {
  status: MockDriveAttemptStatus;
  size?: 'sm' | 'md';
}

export function AttemptStatusBadge({ status, size = 'md' }: AttemptStatusBadgeProps) {
  const config = ATTEMPT_STATUS_CONFIG[status];

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