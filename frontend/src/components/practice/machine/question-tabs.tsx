// src/components/practice/machine/question-tabs.tsx

"use client";

import { cn } from "../../../lib/utils";
import type { QuestionListItem, SubmitCodeResponse } from "../../../types/machine.types";
import { CheckCircle2, Circle, XCircle, AlertCircle } from "lucide-react";

interface QuestionTabsProps {
  questions: QuestionListItem[];
  currentIndex: number;
  submitResults: Record<string, SubmitCodeResponse>;
  solvedQuestionIds: Set<string> | string[];
  onSelect: (index: number) => void;
}

type QuestionStatus = "solved" | "partial" | "failed" | "unattempted";

export function QuestionTabs({
  questions,
  currentIndex,
  submitResults,
  solvedQuestionIds,
  onSelect,
}: QuestionTabsProps) {
  // Convert to Set if array
  const solvedSet =
    solvedQuestionIds instanceof Set ? solvedQuestionIds : new Set(solvedQuestionIds);

  const getStatus = (question: QuestionListItem): QuestionStatus => {
    // Check if solved (from store or question itself)
    if (solvedSet.has(question.id) || question.isSolved) {
      return "solved";
    }

    // Check submit results
    const result = submitResults[question.id];
    if (result) {
      if (result.isSolved) return "solved";
      if (result.testCasesPassed > 0) return "partial";
      return "failed";
    }

    // Check if has any submissions from question data
    if (question.submissionCount > 0) {
      if (question.bestSubmission?.status === "ACCEPTED") return "solved";
      return "partial";
    }

    return "unattempted";
  };

  const StatusIcon = ({ status }: { status: QuestionStatus }) => {
    switch (status) {
      case "solved":
        return <CheckCircle2 className="h-4 w-4" />;
      case "partial":
        return <AlertCircle className="h-4 w-4" />;
      case "failed":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b border-border bg-card px-3 py-2">
      {questions.map((question, index) => {
        const status = getStatus(question);
        const isActive = currentIndex === index;

        return (
          <button
            key={question.id}
            onClick={() => onSelect(index)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "border border-border bg-secondary shadow-sm"
                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
            )}
          >
            <StatusIcon status={status} />
            <span>Q{question.order}</span>
          </button>
        );
      })}
    </div>
  );
}