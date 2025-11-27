// src/components/practice/machine/test-timer.tsx

"use client";

import { useEffect } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { cn } from "../../../lib/utils";
import { useMachineTimer } from "../../../lib/hooks/use-machine";

interface TestTimerProps {
  expiresAt?: string | null;
  onExpire?: () => void;
}

export function TestTimer({ expiresAt, onExpire }: TestTimerProps) {
  const { formattedTime, isLowTime, isCriticalTime, isExpired } = useMachineTimer();

  useEffect(() => {
    if (isExpired && onExpire) {
      onExpire();
    }
  }, [isExpired, onExpire]);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border px-4 py-2 font-mono text-sm transition-all",
        isExpired
          ? "border-foreground bg-foreground text-background"
          : isCriticalTime
          ? "animate-pulse border-foreground bg-secondary"
          : isLowTime
          ? "border-border bg-secondary"
          : "border-border bg-card"
      )}
    >
      {isCriticalTime || isExpired ? (
        <AlertTriangle className="h-4 w-4" />
      ) : (
        <Clock className="h-4 w-4 text-muted-foreground" />
      )}
      <span className="font-semibold">
        {isExpired ? "Time's Up!" : formattedTime}
      </span>
    </div>
  );
}