// src/components/practice/aptitude/test-timer.tsx

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertTriangle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { formatTime } from '../../../lib/constants/aptitude.constants';

interface TestTimerProps {
  expiresAt: string | null;
  timeLimit: number;
  onExpire: () => void;
  onTimeUpdate?: (secondsRemaining: number) => void;
  showProgress?: boolean;
  warningThreshold?: number;
  criticalThreshold?: number;
}

export function TestTimer({
  expiresAt,
  timeLimit,
  onExpire,
  onTimeUpdate,
  showProgress = true,
  warningThreshold = 300,
  criticalThreshold = 60,
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

  const calculateTimeRemaining = useCallback(() => {
    if (!expiresAt) return 0;
    const expiry = new Date(expiresAt).getTime();
    const now = Date.now();
    return Math.max(0, Math.floor((expiry - now) / 1000));
  }, [expiresAt]);

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

    tick();
    intervalRef.current = setInterval(tick, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [expiresAt, calculateTimeRemaining, onExpire, onTimeUpdate, isExpired]);

  return (
    <div className="space-y-2">
      {/* Timer Display */}
      <motion.div
        animate={isCritical ? { scale: [1, 1.02, 1] } : {}}
        transition={{ repeat: isCritical ? Infinity : 0, duration: 1 }}
        className={cn(
          'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 font-mono text-lg font-semibold transition-all duration-300',
          // Normal state
          !isWarning && !isCritical && !isExpired && 'bg-muted',
          // Warning state
          isWarning && 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
          // Critical state
          isCritical && 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
          // Expired state
          isExpired && 'bg-rose-500 text-white'
        )}
      >
        <AnimatePresence mode="wait">
          {(isCritical || isExpired) ? (
            <motion.div
              key="alert"
              initial={{ rotate: -10 }}
              animate={{ rotate: [10, -10, 10] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
            >
              <AlertTriangle className="h-5 w-5" />
            </motion.div>
          ) : (
            <motion.div key="clock">
              <Clock className="h-5 w-5" />
            </motion.div>
          )}
        </AnimatePresence>
        
        <span>
          {isExpired ? "Time's Up!" : formatTime(timeRemaining)}
        </span>
      </motion.div>

      {/* Progress Bar */}
      {showProgress && !isExpired && (
        <div className="space-y-1.5">
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              className={cn(
                'absolute inset-y-0 left-0 rounded-full transition-colors duration-300',
                !isWarning && !isCritical && 'bg-primary',
                isWarning && 'bg-amber-500',
                isCritical && 'bg-rose-500'
              )}
              initial={{ width: '100%' }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <AnimatePresence>
            {(isWarning || isCritical) && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className={cn(
                  'text-xs font-medium',
                  isWarning && 'text-amber-600 dark:text-amber-400',
                  isCritical && 'text-rose-600 dark:text-rose-400'
                )}
              >
                {isCritical
                  ? 'Less than 1 minute remaining!'
                  : `${Math.ceil(timeRemaining / 60)} minutes left`}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}