// src/components/institute-admin/mock-drive/drive-status-badge.tsx

'use client';

import { Badge } from '@/components/ui/badge';
import { MockDriveStatus } from '@/types/admin.mockdrive.types';
import { MOCK_DRIVE_STATUS_CONFIG } from '@/lib/constants/admin.mockdrive.constants';
import { cn } from '@/lib/utils';

interface DriveStatusBadgeProps {
  status: MockDriveStatus;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export function DriveStatusBadge({
  status,
  size = 'md',
  showDot = true,
}: DriveStatusBadgeProps) {
  const config = MOCK_DRIVE_STATUS_CONFIG[status];

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        config.bgColor,
        config.color,
        config.borderColor,
        sizeClasses[size],
        'font-medium'
      )}
    >
      {showDot && (
        <span
          className={cn(
            'mr-1.5 inline-block h-2 w-2 rounded-full',
            status === MockDriveStatus.IN_PROGRESS && 'animate-pulse',
            config.color.replace('text-', 'bg-')
          )}
        />
      )}
      {config.label}
    </Badge>
  );
}