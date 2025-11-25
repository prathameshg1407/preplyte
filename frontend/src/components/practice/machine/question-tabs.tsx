// src/components/practice/machine/question-tabs.tsx

"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { QuestionListItem, SubmitCodeResponse } from "@/types/machine.types";
import { CheckCircle, Circle, XCircle, AlertCircle } from "lucide-react";

interface QuestionTabsProps {
  questions: QuestionListItem[];
  currentIndex: number;
  submitResults: Record<string, SubmitCodeResponse>;
  solvedQuestionIds: Set<string> | string[];
  onSelect: (index: number) => void;
}

export function QuestionTabs({
  questions,
  currentIndex,
  submitResults,
  solvedQuestionIds,
  onSelect,
}: QuestionTabsProps) {
  // Convert to Set if array
  const solvedSet = solvedQuestionIds instanceof Set 
    ? solvedQuestionIds 
    : new Set(solvedQuestionIds);

  const getStatusIcon = (question: QuestionListItem) => {
    // Check if solved (from store or question itself)
    if (solvedSet.has(question.id) || question.isSolved) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }

    // Check submit results
    const result = submitResults[question.id];
    if (result) {
      if (result.isSolved) {
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      }
      if (result.testCasesPassed > 0) {
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      }
      return <XCircle className="h-4 w-4 text-red-500" />;
    }

    // Check if has any submissions from question data
    if (question.submissionCount > 0) {
      if (question.bestSubmission?.status === "ACCEPTED") {
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      }
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }

    return <Circle className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="flex items-center gap-1 p-2 bg-muted/30 border-b overflow-x-auto">
      {questions.map((question, index) => (
        <button
          key={question.id}
          onClick={() => onSelect(index)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
            currentIndex === index
              ? "bg-background shadow-sm border"
              : "hover:bg-muted"
          )}
        >
          {getStatusIcon(question)}
          <span>Q{question.order}</span>
        </button>
      ))}
    </div>
  );
}