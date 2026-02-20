// src/components/practice/machine/session-result.tsx

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  SessionResultsResponse,
  ResultQuestion,
  PerformanceRank,
} from "@/types/machine.types";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  Code2,
  RotateCcw,
  Home,
  ChevronDown,
  ChevronRight,
  Trophy,
  Lightbulb,
  Send,
  Timer,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SessionResultProps {
  result: SessionResultsResponse;
}

const RANK_CONFIG: Record<PerformanceRank, { color: string; bg: string; label: string }> = {
  EXCELLENT: {
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    label: "Excellent!",
  },
  GOOD: {
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
    label: "Good Job!",
  },
  AVERAGE: {
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
    label: "Keep Practicing",
  },
  NEEDS_IMPROVEMENT: {
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-500/10",
    label: "Needs Improvement",
  },
};

export function SessionResult({ result }: SessionResultProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins} min`;
  };

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  };

  const rankConfig = RANK_CONFIG[result.performance.rank];
  const scorePercentage = result.summary.solvedPercentage;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Hero Score Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 text-center"
      >
        {/* Decorative Elements */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="relative">
          {/* Trophy */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            className={cn(
              "mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full",
              rankConfig.bg
            )}
          >
            <Trophy className={cn("h-10 w-10", rankConfig.color)} />
          </motion.div>

          {/* Score */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-2"
          >
            <span className="text-6xl font-bold">{scorePercentage.toFixed(0)}</span>
            <span className="text-2xl text-muted-foreground">%</span>
          </motion.div>

          {/* Rank Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Badge className={cn("px-4 py-1.5 text-base", rankConfig.bg, rankConfig.color, "border-0")}>
              <Sparkles className="mr-1.5 h-4 w-4" />
              {rankConfig.label}
            </Badge>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-3 text-muted-foreground"
          >
            {result.performance.message}
          </motion.p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-4 sm:grid-cols-4"
      >
        <StatCard
          icon={CheckCircle2}
          value={result.summary.totalSolved}
          label="Solved"
          color="text-emerald-500"
        />
        <StatCard
          icon={Target}
          value={result.summary.totalQuestions}
          label="Total"
        />
        <StatCard
          icon={Trophy}
          value={result.summary.totalScore}
          label="Score"
          color="text-amber-500"
        />
        <StatCard
          icon={Send}
          value={result.summary.totalSubmissions}
          label="Submissions"
        />
      </motion.div>

      {/* Session Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid gap-3 rounded-xl bg-muted/30 p-4 sm:grid-cols-2"
      >
        <div className="flex items-center justify-between rounded-lg bg-background p-3">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Timer className="h-4 w-4" />
            Time Taken
          </span>
          <span className="font-semibold">{formatTime(result.timeTaken)}</span>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-background p-3">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Time Limit
          </span>
          <span className="font-semibold">{formatTime(result.timeLimit)}</span>
        </div>
      </motion.div>

      {/* Suggestions */}
      {result.performance.suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border-2 border-amber-500/30 bg-amber-500/5 p-6"
        >
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-amber-700 dark:text-amber-300">
            <Lightbulb className="h-5 w-5" />
            Tips for Improvement
          </h3>
          <ul className="space-y-3">
            {result.performance.suggestions.map((suggestion, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20">
                  <CheckCircle2 className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-sm text-muted-foreground">{suggestion}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Question Results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-4"
      >
        <h3 className="flex items-center gap-2 font-semibold">
          <Code2 className="h-5 w-5" />
          Problem Results
        </h3>

        <div className="space-y-3">
          {result.questions.map((question, index) => (
            <QuestionResultItem
              key={question.id}
              question={question}
              isExpanded={expandedQuestions.has(question.id)}
              onToggle={() => toggleQuestion(question.id)}
              index={index}
            />
          ))}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <Button asChild variant="outline" size="lg" className="h-14">
          <Link href="/practice/machine">
            <RotateCcw className="mr-2 h-5 w-5" />
            Practice Again
          </Link>
        </Button>
        <Button asChild size="lg" className="h-14">
          <Link href="/dashboard">
            <Home className="mr-2 h-5 w-5" />
            Back to Dashboard
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: React.ElementType;
  value: number;
  label: string;
  color?: string;
}) {
  return (
    <div className="rounded-xl bg-muted/50 p-4 text-center">
      <Icon className={cn("mx-auto mb-2 h-6 w-6", color || "text-muted-foreground")} />
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function QuestionResultItem({
  question,
  isExpanded,
  onToggle,
  index,
}: {
  question: ResultQuestion;
  isExpanded: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 + index * 0.05 }}
      className={cn(
        "overflow-hidden rounded-xl border-2",
        question.isSolved
          ? "border-emerald-500/30 bg-emerald-500/5"
          : "border-border bg-muted/30"
      )}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-muted/30"
      >
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              question.isSolved ? "bg-emerald-500" : "bg-muted"
            )}
          >
            {question.isSolved ? (
              <CheckCircle2 className="h-5 w-5 text-white" />
            ) : (
              <XCircle className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0">
            <span className="font-semibold">
              Q{question.order}: {question.title}
            </span>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <Badge variant="secondary" className="text-xs">
                {question.difficulty}
              </Badge>
              {question.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="font-semibold">{question.score} pts</div>
            <div className="text-xs text-muted-foreground">
              {question.submissionCount} submission{question.submissionCount !== 1 ? "s" : ""}
            </div>
          </div>
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && question.bestSubmission && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border/50"
          >
            <div className="bg-muted/20 p-4">
              <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Best Submission
              </h4>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <div className="text-xs text-muted-foreground">Status</div>
                  <div className="mt-1 flex items-center gap-1.5">
                    {question.bestSubmission.status === "ACCEPTED" ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-rose-500" />
                    )}
                    <span className="text-sm font-medium">
                      {question.bestSubmission.status}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Language</div>
                  <div className="mt-1 text-sm font-medium">
                    {question.bestSubmission.language}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Runtime</div>
                  <div className="mt-1 text-sm font-medium">
                    {question.bestSubmission.executionTime?.toFixed(2) || "—"} ms
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Memory</div>
                  <div className="mt-1 text-sm font-medium">
                    {question.bestSubmission.memoryUsed
                      ? (question.bestSubmission.memoryUsed / 1024).toFixed(1)
                      : "—"}{" "}
                    MB
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
