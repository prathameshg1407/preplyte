// src/components/practice/machine/test-timer.tsx

"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    <motion.div
      animate={isCriticalTime ? { scale: [1, 1.02, 1] } : {}}
      transition={{ repeat: isCriticalTime ? Infinity : 0, duration: 1 }}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-sm font-semibold transition-all duration-300",
        // Normal
        !isLowTime && !isCriticalTime && !isExpired && "bg-muted",
        // Low time (5 min)
        isLowTime && !isCriticalTime && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        // Critical (1 min)
        isCriticalTime && "bg-rose-500/10 text-rose-600 dark:text-rose-400",
        // Expired
        isExpired && "bg-rose-500 text-white"
      )}
    >
      <AnimatePresence mode="wait">
        {isCriticalTime || isExpired ? (
          <motion.div
            key="alert"
            initial={{ rotate: 0 }}
            animate={{ rotate: [10, -10, 10] }}
            transition={{ repeat: Infinity, duration: 0.5 }}
          >
            <AlertTriangle className="h-4 w-4" />
          </motion.div>
        ) : (
          <motion.div key="clock">
            <Clock className="h-4 w-4" />
          </motion.div>
        )}
      </AnimatePresence>

      <span>{isExpired ? "Time's Up!" : formattedTime}</span>

      {/* Pulse ring for critical time */}
      {isCriticalTime && !isExpired && (
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-rose-500"
          animate={{ scale: [1, 1.1], opacity: [0.5, 0] }}
          transition={{ repeat: Infinity, duration: 1 }}
        />
      )}
    </motion.div>
  );
}