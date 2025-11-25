"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  Eye,
  Trash2,
  Clock,
  CheckCircle2,
  Building2,
  Briefcase,
  XCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  UserSessionSummaryDto,
  AiInterviewSessionStatus,
} from "@/types/aiInterview.types";

interface SessionCardProps {
  session: UserSessionSummaryDto;
  onContinue: (id: string) => void;
  onViewResults: (id: string) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

const statusConfig: Record<
  AiInterviewSessionStatus,
  {
    label: string;
    className: string;
    icon: typeof Clock;
  }
> = {
  [AiInterviewSessionStatus.STARTED]: {
    label: "Started",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    icon: Clock,
  },
  [AiInterviewSessionStatus.IN_PROGRESS]: {
    label: "In Progress",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    icon: Play,
  },
  [AiInterviewSessionStatus.COMPLETED]: {
    label: "Completed",
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    icon: CheckCircle2,
  },
  [AiInterviewSessionStatus.CANCELLED]: {
    label: "Cancelled",
    className: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
    icon: XCircle,
  },
};

export function SessionCard({
  session,
  onContinue,
  onViewResults,
  onDelete,
  isDeleting,
}: SessionCardProps) {
  const progress = (session.answeredQuestions / session.totalQuestions) * 100;
  const status = statusConfig[session.status];
  const StatusIcon = status.icon;

  const isCompleted = session.status === AiInterviewSessionStatus.COMPLETED;
  const isCancelled = session.status === AiInterviewSessionStatus.CANCELLED;
  const canContinue = !isCompleted && !isCancelled;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Main Content */}
          <div className="flex-1 p-4 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-muted-foreground shrink-0" />
                  <h3 className="font-semibold truncate">{session.jobTitle}</h3>
                </div>
                {session.companyName && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{session.companyName}</span>
                  </div>
                )}
              </div>
              <Badge className={cn("gap-1 shrink-0", status.className)}>
                <StatusIcon className="w-3 h-3" />
                {status.label}
              </Badge>
            </div>

            {/* Progress */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">
                  {session.answeredQuestions}/{session.totalQuestions} questions
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Meta Info */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {formatDate(session.createdAt)}
              </span>
              {session.overallScore !== null && (
                <span className={cn("font-medium", getScoreColor(session.overallScore))}>
                  Score: {session.overallScore}%
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex sm:flex-col justify-end gap-2 p-4 bg-muted/50 sm:w-32">
            {isCompleted && session.hasFeedback && (
              <Button
                variant="default"
                size="sm"
                className="flex-1 sm:flex-none"
                onClick={() => onViewResults(session.id)}
              >
                <Eye className="w-4 h-4 mr-1" />
                Results
              </Button>
            )}

            {canContinue && (
              <Button
                variant="default"
                size="sm"
                className="flex-1 sm:flex-none"
                onClick={() => onContinue(session.id)}
              >
                <Play className="w-4 h-4 mr-1" />
                Continue
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(session.id)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}