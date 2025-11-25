"use client";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AiInterviewQuestionCategory } from "@/types/aiInterview.types";

interface QuestionProgressProps {
  currentIndex: number;
  totalQuestions: number;
  category: AiInterviewQuestionCategory;
  className?: string;
}

export function QuestionProgress({
  currentIndex,
  totalQuestions,
  category,
  className,
}: QuestionProgressProps) {
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  const categoryConfig = {
    [AiInterviewQuestionCategory.INTRODUCTORY]: {
      label: "Introduction",
      color: "bg-blue-500",
      textColor: "text-blue-600 dark:text-blue-400",
    },
    [AiInterviewQuestionCategory.TECHNICAL]: {
      label: "Technical",
      color: "bg-purple-500",
      textColor: "text-purple-600 dark:text-purple-400",
    },
    [AiInterviewQuestionCategory.CLOSING]: {
      label: "Closing",
      color: "bg-green-500",
      textColor: "text-green-600 dark:text-green-400",
    },
  };

  const config = categoryConfig[category];

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Badge className={cn(config.color, "text-white")}>{config.label}</Badge>
        <span className="text-sm text-muted-foreground">
          Question {currentIndex + 1} of {totalQuestions}
        </span>
      </div>
      <Progress value={progress} className="h-2" />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Progress</span>
        <span>{Math.round(progress)}%</span>
      </div>
    </div>
  );
}