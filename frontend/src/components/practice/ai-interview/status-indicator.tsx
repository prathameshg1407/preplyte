// src/components/practice/ai-interview/status-indicator.tsx

"use client";

import {
  Volume2,
  Mic,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Circle,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { InterviewUIStatus } from "../../../types/aiInterview.types";

interface StatusIndicatorProps {
  status: InterviewUIStatus;
  showLabel?: boolean;
  className?: string;
}

const statusConfig: Record<
  InterviewUIStatus,
  {
    label: string;
    icon: typeof Volume2;
    pulse?: boolean;
    spin?: boolean;
  }
> = {
  INITIALIZING: {
    label: "Initializing",
    icon: Circle,
    pulse: true,
  },
  AI_SPEAKING: {
    label: "AI Speaking",
    icon: Volume2,
    pulse: true,
  },
  USER_LISTENING: {
    label: "Recording",
    icon: Mic,
    pulse: true,
  },
  PROCESSING_ANSWER: {
    label: "Processing",
    icon: Loader2,
    spin: true,
  },
  ENDED: {
    label: "Completed",
    icon: CheckCircle2,
  },
  ERROR: {
    label: "Error",
    icon: AlertCircle,
  },
};

export function StatusIndicator({ 
  status, 
  showLabel = true,
  className 
}: StatusIndicatorProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-2.5 py-1 rounded-full",
        "border border-border bg-secondary/50",
        "text-sm text-muted-foreground",
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        {config.pulse && (
          <span className="absolute inline-flex h-full w-full rounded-full bg-foreground/40 animate-ping" />
        )}
        <span 
          className={cn(
            "relative inline-flex h-2 w-2 rounded-full",
            status === "ERROR" ? "bg-foreground" : "bg-muted-foreground",
            config.pulse && "bg-foreground"
          )} 
        />
      </span>
      
      {showLabel && (
        <span className="text-xs font-medium">{config.label}</span>
      )}
      
      <Icon
        className={cn(
          "h-3.5 w-3.5",
          config.spin && "animate-spin"
        )}
      />
    </div>
  );
}

// Compact variant for tight spaces
export function StatusDot({ 
  status, 
  className 
}: { 
  status: InterviewUIStatus; 
  className?: string;
}) {
  const config = statusConfig[status];
  
  return (
    <span 
      className={cn("relative flex h-2 w-2", className)}
      title={config.label}
    >
      {config.pulse && (
        <span className="absolute inline-flex h-full w-full rounded-full bg-foreground/40 animate-ping" />
      )}
      <span 
        className={cn(
          "relative inline-flex h-2 w-2 rounded-full bg-muted-foreground",
          config.pulse && "bg-foreground"
        )} 
      />
    </span>
  );
}