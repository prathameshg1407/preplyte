// src/components/practice/ai-interview/question-progress.tsx

"use client";

import { Progress } from "../../ui/progress";
import { Badge } from "../../ui/badge";
import { cn } from "../../../lib/utils";
import { AiInterviewQuestionCategory, Progress as ProgressType } from "../../../types/aiInterview.types";

interface QuestionProgressProps {
  currentIndex: number;
  totalQuestions: number;
  category: AiInterviewQuestionCategory;
  progress?: ProgressType | null;
  showTopics?: boolean;
  className?: string;
}

const categoryLabels: Record<AiInterviewQuestionCategory, string> = {
  [AiInterviewQuestionCategory.INTRODUCTORY]: "Intro",
  [AiInterviewQuestionCategory.TECHNICAL]: "Technical",
  [AiInterviewQuestionCategory.BEHAVIORAL]: "Behavioral",
  [AiInterviewQuestionCategory.SITUATIONAL]: "Situational",
  [AiInterviewQuestionCategory.CLOSING]: "Closing",
};

export function QuestionProgress({
  currentIndex,
  totalQuestions,
  category,
  progress,
  showTopics = true,
  className,
}: QuestionProgressProps) {
  const percentComplete = progress?.percentComplete ?? ((currentIndex + 1) / totalQuestions) * 100;
  const questionNumber = progress?.questionNumber ?? currentIndex + 1;
  const estimatedTotal = progress?.estimatedTotal ?? totalQuestions;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Header Row */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-medium">
            {categoryLabels[category]}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {questionNumber} of {estimatedTotal}
          </span>
        </div>
        <span className="text-sm tabular-nums text-muted-foreground">
          {Math.round(percentComplete)}%
        </span>
      </div>

      {/* Progress Bar */}
      <Progress value={percentComplete} className="h-1" />

      {/* Topics Covered */}
      {showTopics && progress?.topicsCovered && progress.topicsCovered.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Covered:</span>
          {progress.topicsCovered.slice(0, 4).map((topic) => (
            <span 
              key={topic} 
              className="text-xs text-muted-foreground"
            >
              {topic.replace('_', ' ')}
              {progress.topicsCovered!.indexOf(topic) < Math.min(progress.topicsCovered!.length - 1, 3) && ','}
            </span>
          ))}
          {progress.topicsCovered.length > 4 && (
            <span className="text-xs text-muted-foreground">
              +{progress.topicsCovered.length - 4} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}