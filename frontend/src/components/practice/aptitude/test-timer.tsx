// src/components/practice/aptitude/test-timer.tsx

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { Clock, AlertCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { formatTime } from '../../../lib/constants/aptitude.constants';

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
      return 'bg-foreground text-background border-foreground';
    }
    if (isCritical) {
      return 'border-foreground bg-secondary animate-pulse';
    }
    if (isWarning) {
      return 'border-foreground/50 bg-secondary';
    }
    return 'bg-secondary';
  };

  const getIcon = () => {
    if (isExpired || isCritical || isWarning) {
      return <AlertCircle className="h-4 w-4" />;
    }
    return <Clock className="h-4 w-4" />;
  };

  return (
    <div className="space-y-2">
      <Badge
        variant="outline"
        className={cn(
          'px-4 py-2 font-mono text-base transition-all duration-300',
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
            className={cn(
              'h-1.5',
              isCritical && '[&>div]:animate-pulse'
            )}
          />
          {(isWarning || isCritical) && (
            <p className="text-xs font-medium text-muted-foreground">
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