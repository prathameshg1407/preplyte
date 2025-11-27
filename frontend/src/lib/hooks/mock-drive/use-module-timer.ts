// src/lib/hooks/mock-drive/use-module-timer.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import { MOCKDRIVE_CONSTANTS } from '@/types/mockdrive.types';

interface UseModuleTimerOptions {
  expiresAt: string | null;
  onExpire?: () => void;
  onWarning?: (remainingSeconds: number) => void;
  warningThresholdSeconds?: number;
}

interface UseModuleTimerReturn {
  remainingSeconds: number;
  remainingFormatted: string;
  isExpired: boolean;
  isWarning: boolean;
  isCritical: boolean;
  progress: number;
}

export function useModuleTimer({
  expiresAt,
  onExpire,
  onWarning,
  warningThresholdSeconds = MOCKDRIVE_CONSTANTS.AUTO_SUBMIT_WARNING_MINUTES * 60,
}: UseModuleTimerOptions): UseModuleTimerReturn {
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);
  const [isWarning, setIsWarning] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const hasCalledExpire = useRef(false);
  const hasCalledWarning = useRef(false);

  const calculateRemaining = useCallback(() => {
    if (!expiresAt) return 0;
    const expires = new Date(expiresAt).getTime();
    const now = Date.now();
    return Math.max(0, Math.floor((expires - now) / 1000));
  }, [expiresAt]);

  useEffect(() => {
    if (!expiresAt) return;

    // Initialize
    const initial = calculateRemaining();
    setRemainingSeconds(initial);
    setTotalSeconds(initial);
    setIsExpired(initial <= 0);
    setIsWarning(initial <= warningThresholdSeconds && initial > 0);
    hasCalledExpire.current = false;
    hasCalledWarning.current = false;

    // Update every second
    const interval = setInterval(() => {
      const remaining = calculateRemaining();
      setRemainingSeconds(remaining);

      // Check for warning
      if (remaining <= warningThresholdSeconds && remaining > 0 && !hasCalledWarning.current) {
        setIsWarning(true);
        hasCalledWarning.current = true;
        onWarning?.(remaining);
      }

      // Check for expiry
      if (remaining <= 0 && !hasCalledExpire.current) {
        setIsExpired(true);
        hasCalledExpire.current = true;
        onExpire?.();
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, calculateRemaining, onExpire, onWarning, warningThresholdSeconds]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0;

  // Critical when less than 1 minute remaining
  const isCritical = remainingSeconds > 0 && remainingSeconds <= 60;

  return {
    remainingSeconds,
    remainingFormatted: formatTime(remainingSeconds),
    isExpired,
    isWarning,
    isCritical,
    progress,
  };
}