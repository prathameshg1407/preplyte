// src/components/mock-drive/attempt/countdown-timer.tsx

'use client';

import { FC, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useModuleTimer } from '@/lib/hooks/mock-drive/use-module-timer';
import { useAttemptStore } from '@/lib/store/mock-drive/attempt-store';

interface CountdownTimerProps {
  expiresAt: string | null;
  onExpire: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const CountdownTimer: FC<CountdownTimerProps> = ({
  expiresAt,
  onExpire,
  size = 'md',
}) => {
  const setShowTimeWarning = useAttemptStore((state) => state.setShowTimeWarning);

  const { remainingFormatted, isWarning, isExpired } = useModuleTimer({
    expiresAt,
    onExpire,
    onWarning: () => setShowTimeWarning(true),
    warningThresholdSeconds: 300, // 5 minutes
  });

  const sizeClasses = {
    sm: 'text-sm px-2 py-1',
    md: 'text-lg px-4 py-2',
    lg: 'text-2xl px-6 py-3',
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg font-mono font-semibold',
        sizeClasses[size],
        isWarning ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-muted',
        isExpired && 'bg-red-500 text-white'
      )}
    >
      {isWarning ? (
        <AlertTriangle className="h-5 w-5" />
      ) : (
        <Clock className="h-5 w-5" />
      )}
      <span>{isExpired ? 'Time Up!' : remainingFormatted}</span>
    </div>
  );
};