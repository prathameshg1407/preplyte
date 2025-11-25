// src/lib/hooks/use-timer.ts

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTimerProps {
  expiresAt: string | null;
  onExpire?: () => void;
  warningThreshold?: number; // seconds before showing warning
  criticalThreshold?: number; // seconds before showing critical
}

interface UseTimerReturn {
  timeLeft: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  isWarning: boolean;
  isCritical: boolean;
  formattedTime: string;
  percentage: number;
  totalDuration: number;
}

export function useTimer({
  expiresAt,
  onExpire,
  warningThreshold = 300, // 5 minutes default
  criticalThreshold = 60, // 1 minute default
}: UseTimerProps): UseTimerReturn {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [totalDuration, setTotalDuration] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);
  const onExpireRef = useRef(onExpire);
  const hasExpiredRef = useRef(false);
  const initializedRef = useRef(false);

  // Update callback ref when it changes
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  const calculateTimeLeft = useCallback(() => {
    if (!expiresAt) return 0;

    const end = new Date(expiresAt).getTime();
    const now = Date.now();
    const difference = Math.max(0, Math.floor((end - now) / 1000));

    return difference;
  }, [expiresAt]);

  // Initialize on mount or when expiresAt changes
  useEffect(() => {
    if (expiresAt) {
      const initial = calculateTimeLeft();
      setTimeLeft(initial);

      // Only set total duration on first initialization
      if (!initializedRef.current) {
        setTotalDuration(initial);
        initializedRef.current = true;
      }

      if (initial <= 0) {
        setIsExpired(true);
        if (!hasExpiredRef.current) {
          hasExpiredRef.current = true;
          onExpireRef.current?.();
        }
      } else {
        setIsExpired(false);
        hasExpiredRef.current = false;
      }
    }
  }, [expiresAt, calculateTimeLeft]);

  // Timer tick effect
  useEffect(() => {
    if (!expiresAt || isExpired) return;

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining <= 0 && !hasExpiredRef.current) {
        setIsExpired(true);
        hasExpiredRef.current = true;
        onExpireRef.current?.();
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, isExpired, calculateTimeLeft]);

  // Calculate time components
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  // Format time string
  const formattedTime =
    hours > 0
      ? `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      : `${minutes.toString().padStart(2, '0')}:${seconds
          .toString()
          .padStart(2, '0')}`;

  // Calculate percentage remaining
  const percentage =
    totalDuration > 0 ? Math.round((timeLeft / totalDuration) * 100) : 0;

  // Warning states
  const isWarning = timeLeft <= warningThreshold && timeLeft > criticalThreshold;
  const isCritical = timeLeft <= criticalThreshold && timeLeft > 0;

  return {
    timeLeft,
    hours,
    minutes,
    seconds,
    isExpired,
    isWarning,
    isCritical,
    formattedTime,
    percentage,
    totalDuration,
  };
}

// =====================================================
// COUNTDOWN DISPLAY HOOK
// =====================================================

export function useCountdownDisplay(timeLeft: number) {
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const display = hours > 0
    ? `${hours}h ${minutes}m ${seconds}s`
    : minutes > 0
      ? `${minutes}m ${seconds}s`
      : `${seconds}s`;

  const shortDisplay = hours > 0
    ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    : `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return { display, shortDisplay, hours, minutes, seconds };
}