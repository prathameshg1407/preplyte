// src/components/institute-admin/mock-drive/registrations/registration-status-badge.tsx

'use client';

import { Badge } from '@/components/ui/badge';
import { MockDriveRegistrationStatus } from '@/types/admin.mockdrive.types';
import { REGISTRATION_STATUS_CONFIG } from '@/lib/constants/admin.mockdrive.constants';
import { cn } from '@/lib/utils';

interface RegistrationStatusBadgeProps {
  status: MockDriveRegistrationStatus;
  size?: 'sm' | 'md';
}

export function RegistrationStatusBadge({
  status,
  size = 'md',
}: RegistrationStatusBadgeProps) {
  const config = REGISTRATION_STATUS_CONFIG[status];

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