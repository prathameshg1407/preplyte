// src/components/practice/aptitude/test-timer.tsx

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, AlertTriangle, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTime } from '@/lib/constants/aptitude.constants';

interface TestTimerProps {
  expiresAt: string | null;
  timeLimit: number; // in minutes
  onExpire: () => void;
  onTimeUpdate?: (secondsRemaining: number) => void;
  showProgress?: boolean;
  warningThreshold?: number; // seconds
  criticalThreshold?: number; // seconds
}

export function TestTimer({
  expiresAt,
  timeLimit,
  onExpire,
  onTimeUpdate,
  showProgress = false,
  warningThreshold = 300, // 5 minutes
  criticalThreshold = 60, // 1 minute
}: TestTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(() => {
    if (!expiresAt) return timeLimit * 60;
    const expiry = new Date(expiresAt).getTime();
    const now = Date.now();
    return Math.max(0, Math.floor((expiry - now) / 1000));
  });

  const [isExpired, setIsExpired] = useState(false);
  const hasCalledExpire = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const isWarning = timeRemaining <= warningThreshold && timeRemaining > criticalThreshold;
  const isCritical = timeRemaining <= criticalThreshold && timeRemaining > 0;

  const totalSeconds = timeLimit * 60;
  const percentage = totalSeconds > 0 ? (timeRemaining / totalSeconds) * 100 : 0;

  // Calculate time remaining
  const calculateTimeRemaining = useCallback(() => {
    if (!expiresAt) return 0;
    const expiry = new Date(expiresAt).getTime();
    const now = Date.now();
    return Math.max(0, Math.floor((expiry - now) / 1000));
  }, [expiresAt]);

  // Timer effect
  useEffect(() => {
    if (!expiresAt || isExpired) return;

    const tick = () => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);

      if (onTimeUpdate) {
        onTimeUpdate(remaining);
      }

      if (remaining <= 0 && !hasCalledExpire.current) {
        hasCalledExpire.current = true;
        setIsExpired(true);
        onExpire();
      }
    };

    // Initial tick
    tick();

    // Set up interval
    intervalRef.current = setInterval(tick, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [expiresAt, calculateTimeRemaining, onExpire, onTimeUpdate, isExpired]);

  const getTimerStyles = () => {
    if (isExpired) {
      return 'bg-red-500 text-white border-red-500';
    }
    if (isCritical) {
      return 'bg-red-500/10 text-red-500 border-red-500 animate-pulse';
    }
    if (isWarning) {
      return 'bg-yellow-500/10 text-yellow-500 border-yellow-500';
    }
    return 'bg-muted';
  };

  const getIcon = () => {
    if (isExpired || isCritical) {
      return <AlertTriangle className="h-4 w-4" />;
    }
    if (isWarning) {
      return <Timer className="h-4 w-4" />;
    }
    return <Clock className="h-4 w-4" />;
  };

  const getProgressColor = () => {
    if (isCritical) return '[&>div]:bg-red-500';
    if (isWarning) return '[&>div]:bg-yellow-500';
    return '';
  };

  return (
    <div className="space-y-2">
      <Badge
        variant="outline"
        className={cn(
          'text-lg font-mono px-4 py-2 transition-all duration-300',
          getTimerStyles()
        )}
      >
        {getIcon()}
        <span className="ml-2">
          {isExpired ? "Time's Up!" : formatTime(timeRemaining)}
        </span>
      </Badge>

      {showProgress && !isExpired && (
        <div className="space-y-1">
          <Progress
            value={percentage}
            className={cn('h-1.5', getProgressColor())}
          />
          {(isWarning || isCritical) && (
            <p
              className={cn(
                'text-xs font-medium',
                isCritical ? 'text-red-500' : 'text-yellow-500'
              )}
            >
              {isCritical
                ? `Less than ${criticalThreshold} seconds remaining!`
                : `Less than ${Math.ceil(warningThreshold / 60)} minutes remaining`}
            </p>
          )}
        </div>
      )}
    </div>
  );
}