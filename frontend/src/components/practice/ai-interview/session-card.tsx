// src/components/practice/ai-interview/session-card.tsx

"use client";

import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import {
  Play,
  Eye,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  MoreHorizontal,
  ArrowRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { cn } from "../../../lib/utils";
import {
  SessionSummary,
  AiInterviewSessionStatus,
} from "../../../types/aiInterview.types";

interface SessionCardProps {
  session: SessionSummary;
  onContinue: (id: string) => void;
  onViewResults: (id: string) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

const statusConfig: Record<
  AiInterviewSessionStatus,
  { label: string; icon: typeof Clock }
> = {
  [AiInterviewSessionStatus.STARTED]: {
    label: "Started",
    icon: Clock,
  },
  [AiInterviewSessionStatus.IN_PROGRESS]: {
    label: "In Progress",
    icon: Play,
  },
  [AiInterviewSessionStatus.COMPLETED]: {
    label: "Completed",
    icon: CheckCircle2,
  },
  [AiInterviewSessionStatus.CANCELLED]: {
    label: "Cancelled",
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
  const status = statusConfig[session.status];
  const StatusIcon = status.icon;

  const isCompleted = session.status === AiInterviewSessionStatus.COMPLETED;
  const isCancelled = session.status === AiInterviewSessionStatus.CANCELLED;
  const canContinue = !isCompleted && !isCancelled;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const handlePrimaryAction = () => {
    if (isCompleted) {
      onViewResults(session.id);
    } else if (canContinue) {
      onContinue(session.id);
    }
  };

  return (
    <Card className="border-border hover:bg-secondary/30 transition-colors group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Main Content */}
          <div 
            className="flex-1 min-w-0 cursor-pointer"
            onClick={handlePrimaryAction}
          >
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium truncate">{session.jobTitle}</h3>
              {session.companyName && (
                <>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-sm text-muted-foreground truncate">
                    {session.companyName}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <StatusIcon className="h-3.5 w-3.5" />
                <span>{status.label}</span>
              </div>
              <span>·</span>
              <span>{session.questionsAnswered} answered</span>
              <span>·</span>
              <span>{formatDate(session.createdAt)}</span>
            </div>
          </div>

          {/* Score (if completed) */}
          {session.overallScore !== undefined && session.overallScore !== null && (
            <div className="text-right shrink-0">
              <div className="text-2xl font-semibold tabular-nums">
                {session.overallScore}
              </div>
              <div className="text-xs text-muted-foreground">score</div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Primary Action Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrimaryAction}
              className="hidden sm:flex"
            >
              {isCompleted ? (
                <>
                  View Results
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              ) : canContinue ? (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              ) : null}
            </Button>

            {/* More Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MoreHorizontal className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {isCompleted && (
                  <DropdownMenuItem onClick={() => onViewResults(session.id)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Results
                  </DropdownMenuItem>
                )}
                {canContinue && (
                  <DropdownMenuItem onClick={() => onContinue(session.id)}>
                    <Play className="h-4 w-4 mr-2" />
                    Continue
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={() => onDelete(session.id)}
                  className="text-muted-foreground focus:text-foreground"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}