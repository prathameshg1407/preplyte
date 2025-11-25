// src/components/practice/machine/test-timer.tsx

"use client";

import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMachineTimer } from "@/lib/hooks/use-machine";

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
    <Badge
      variant="outline"
      className={cn(
        "text-lg font-mono px-4 py-2 transition-colors",
        isExpired && "bg-red-500 text-white border-red-500",
        isCriticalTime &&
          !isExpired &&
          "bg-red-500/10 text-red-500 border-red-500 animate-pulse",
        isLowTime &&
          !isCriticalTime &&
          "bg-yellow-500/10 text-yellow-500 border-yellow-500"
      )}
    >
      {isCriticalTime || isExpired ? (
        <AlertTriangle className="h-4 w-4 mr-2" />
      ) : (
        <Clock className="h-4 w-4 mr-2" />
      )}
      {isExpired ? "Time's Up!" : formattedTime}
    </Badge>
  );
}