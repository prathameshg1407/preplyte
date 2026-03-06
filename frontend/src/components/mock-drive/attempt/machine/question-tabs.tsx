// src/components/practice/machine/question-tabs.tsx

"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { QuestionListItem, SubmitCodeResponse } from "@/types/machine.types";
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
  const solvedSet =
    solvedQuestionIds instanceof Set ? solvedQuestionIds : new Set(solvedQuestionIds);

  const getStatus = (question: QuestionListItem): QuestionStatus => {
    if (solvedSet.has(question.id) || question.isSolved) return "solved";

    const result = submitResults[question.id];
    if (result) {
      if (result.isSolved) return "solved";
      if (result.testCasesPassed > 0) return "partial";
      return "failed";
    }

    if (question.submissionCount > 0) {
      if (question.bestSubmission?.status === "ACCEPTED") return "solved";
      return "partial";
    }

    return "unattempted";
  };

  const getStatusStyles = (status: QuestionStatus, isActive: boolean) => {
    if (isActive) {
      switch (status) {
        case "solved":
          return "bg-emerald-500 text-white border-emerald-500";
        case "partial":
          return "bg-amber-500 text-white border-amber-500";
        case "failed":
          return "bg-rose-500 text-white border-rose-500";
        default:
          return "bg-primary text-primary-foreground border-primary";
      }
    }

    switch (status) {
      case "solved":
        return "border-emerald-500/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10";
      case "partial":
        return "border-amber-500/50 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10";
      case "failed":
        return "border-rose-500/50 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10";
      default:
        return "border-border text-muted-foreground hover:bg-muted hover:text-foreground";
    }
  };

  const StatusIcon = ({ status, isActive }: { status: QuestionStatus; isActive: boolean }) => {
    const iconClass = cn("h-3.5 w-3.5", isActive && "text-white");

    switch (status) {
      case "solved":
        return <CheckCircle2 className={iconClass} />;
      case "partial":
        return <AlertCircle className={iconClass} />;
      case "failed":
        return <XCircle className={iconClass} />;
      default:
        return <Circle className={cn(iconClass, !isActive && "text-muted-foreground")} />;
    }
  };

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto border-b border-border bg-card px-4 py-2.5">
      {questions.map((question, index) => {
        const status = getStatus(question);
        const isActive = currentIndex === index;

        return (
          <motion.button
            key={question.id}
            onClick={() => onSelect(index)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "relative flex shrink-0 items-center gap-2 rounded-lg border-2 px-3 py-1.5 text-sm font-medium transition-all duration-200",
              getStatusStyles(status, isActive)
            )}
          >
            <StatusIcon status={status} isActive={isActive} />
            <span>Q{question.order}</span>

            {/* Active indicator */}
            {isActive && (
              <motion.div
                layoutId="activeQuestion"
                className="absolute -bottom-[11px] left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-current"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
