// src/components/practice/machine/session-result.tsx

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import type {
  SessionResultsResponse,
  ResultQuestion,
  DifficultyLevel,
  PerformanceRank,
} from "../../../types/machine.types";
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
  Calendar,
  Gauge,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "../../../lib/utils";

interface SessionResultProps {
  result: SessionResultsResponse;
}

export function SessionResult({ result }: SessionResultProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} min`;
  };

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  const getRankLabel = (rank: PerformanceRank) => {
    const labels: Record<PerformanceRank, string> = {
      EXCELLENT: "Excellent",
      GOOD: "Good",
      AVERAGE: "Average",
      NEEDS_IMPROVEMENT: "Needs Improvement",
    };
    return labels[rank];
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Score Card */}
      <Card className="border-border">
        <CardContent className="pt-8 pb-6">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-border bg-secondary">
              <span className="text-3xl font-bold">
                {result.summary.solvedPercentage.toFixed(0)}%
              </span>
            </div>
            <h2 className="text-xl font-semibold">{getRankLabel(result.performance.rank)}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {result.performance.message}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              icon={CheckCircle2}
              value={result.summary.totalSolved}
              label="Solved"
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
            />
            <StatCard
              icon={Send}
              value={result.summary.totalSubmissions}
              label="Submissions"
            />
          </div>
        </CardContent>
      </Card>

      {/* Session Summary */}
      <Card className="border-border">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Session Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-0 divide-y divide-border">
            <SummaryRow
              icon={Timer}
              label="Time Taken"
              value={formatTime(result.timeTaken)}
            />
            <SummaryRow
              icon={Clock}
              label="Time Limit"
              value={formatTime(result.timeLimit)}
            />
            <SummaryRow
              icon={Gauge}
              label="Difficulty"
              value={result.difficulty}
            />
            <SummaryRow
              icon={Calendar}
              label="Completed"
              value={new Date(result.completedAt).toLocaleString()}
            />
          </div>
        </CardContent>
      </Card>

      {/* Suggestions */}
      {result.performance.suggestions.length > 0 && (
        <Card className="border-border">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
              Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5">
              {result.performance.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-3 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground" />
                  <span className="text-muted-foreground">{suggestion}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Question Results */}
      <Card className="border-border">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Code2 className="h-4 w-4 text-muted-foreground" />
            Problem Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {result.questions.map((question) => (
            <QuestionResultItem
              key={question.id}
              question={question}
              isExpanded={expandedQuestions.has(question.id)}
              onToggle={() => toggleQuestion(question.id)}
            />
          ))}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button asChild variant="outline" className="flex-1">
          <Link href="/practice/machine">
            <RotateCcw className="mr-2 h-4 w-4" />
            Practice Again
          </Link>
        </Button>
        <Button asChild className="flex-1">
          <Link href="/dashboard">
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ElementType;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-lg border border-border p-4 text-center">
      <Icon className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

// Summary Row Component
function SummaryRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

// Question Result Item Component
function QuestionResultItem({
  question,
  isExpanded,
  onToggle,
}: {
  question: ResultQuestion;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-secondary/50"
      >
        <div className="flex items-center gap-3">
          {question.isSolved ? (
            <CheckCircle2 className="h-5 w-5 shrink-0" />
          ) : (
            <XCircle className="h-5 w-5 shrink-0 text-muted-foreground" />
          )}
          <div className="min-w-0">
            <span className="font-medium">
              Q{question.order}: {question.title}
            </span>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <span className="rounded border border-border bg-secondary px-2 py-0.5 text-xs">
                {question.difficulty}
              </span>
              {question.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="rounded border border-border px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-medium">{question.score} pts</div>
            <div className="text-xs text-muted-foreground">
              {question.submissionCount} submission{question.submissionCount !== 1 ? "s" : ""}
            </div>
          </div>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {isExpanded && question.bestSubmission && (
        <div className="border-t border-border bg-secondary/30 p-4">
          <h4 className="mb-3 text-xs font-medium text-muted-foreground">
            Best Submission
          </h4>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <div className="text-xs text-muted-foreground">Status</div>
              <div className="mt-1 flex items-center gap-1.5">
                {question.bestSubmission.status === "ACCEPTED" ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <XCircle className="h-3.5 w-3.5" />
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
      )}
    </div>
  );
}