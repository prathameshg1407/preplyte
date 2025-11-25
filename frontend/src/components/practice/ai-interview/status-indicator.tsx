"use client";

import { Badge } from "@/components/ui/badge";
import {
  Volume2,
  Mic,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InterviewUIStatus } from "@/types/aiInterview.types";

interface StatusIndicatorProps {
  status: InterviewUIStatus;
  className?: string;
}

const statusConfig: Record<
  InterviewUIStatus,
  {
    label: string;
    icon: typeof Volume2;
    variant: "default" | "secondary" | "destructive" | "outline";
    className: string;
    animate?: boolean;
  }
> = {
  INITIALIZING: {
    label: "Initializing",
    icon: Clock,
    variant: "secondary",
    className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  },
  AI_SPEAKING: {
    label: "AI Speaking",
    icon: Volume2,
    variant: "default",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
    animate: true,
  },
  USER_LISTENING: {
    label: "Recording",
    icon: Mic,
    variant: "default",
    className: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
    animate: true,
  },
  PROCESSING_ANSWER: {
    label: "Processing",
    icon: Loader2,
    variant: "secondary",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  },
  ENDED: {
    label: "Completed",
    icon: CheckCircle2,
    variant: "default",
    className: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
  },
  ERROR: {
    label: "Error",
    icon: AlertCircle,
    variant: "destructive",
    className: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
  },
};

export function StatusIndicator({ status, className }: StatusIndicatorProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={cn(
        "gap-1.5 transition-all",
        config.className,
        config.animate && "animate-pulse",
        className
      )}
    >
      <Icon
        className={cn(
          "w-3.5 h-3.5",
          status === "PROCESSING_ANSWER" && "animate-spin"
        )}
      />
      {config.label}
    </Badge>
  );
}