// src/components/practice/machine/session-result.tsx

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type {
  SessionResultsResponse,
  ResultQuestion,
  DifficultyLevel,
  PerformanceRank,
} from "@/types/machine.types";
import {
  CheckCircle,
  XCircle,
  Clock,
  Target,
  Code2,
  RotateCcw,
  Home,
  ChevronDown,
  ChevronUp,
  Trophy,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Difficulty colors mapping
const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  EASY: "text-green-500 border-green-500/30 bg-green-500/10",
  MEDIUM: "text-yellow-500 border-yellow-500/30 bg-yellow-500/10",
  HARD: "text-red-500 border-red-500/30 bg-red-500/10",
};

const RANK_COLORS: Record<PerformanceRank, string> = {
  EXCELLENT: "text-green-500",
  GOOD: "text-blue-500",
  AVERAGE: "text-yellow-500",
  NEEDS_IMPROVEMENT: "text-red-500",
};

const RANK_ICONS: Record<PerformanceRank, string> = {
  EXCELLENT: "🏆",
  GOOD: "🎯",
  AVERAGE: "📈",
  NEEDS_IMPROVEMENT: "💪",
};

interface SessionResultProps {
  result: SessionResultsResponse;
}

export function SessionResult({ result }: SessionResultProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(
    new Set()
  );

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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Score Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <div
              className={cn(
                "text-6xl font-bold",
                RANK_COLORS[result.performance.rank]
              )}
            >
              {result.summary.solvedPercentage.toFixed(0)}%
            </div>
            <div className="flex items-center justify-center gap-2 text-xl text-muted-foreground mt-2">
              <span>{RANK_ICONS[result.performance.rank]}</span>
              <span>{result.performance.rank.replace(/_/g, " ")}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {result.performance.message}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-green-500/10 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-500">
                {result.summary.totalSolved}
              </div>
              <div className="text-sm text-muted-foreground">Solved</div>
            </div>
            <div className="p-4 bg-blue-500/10 rounded-lg">
              <Target className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-500">
                {result.summary.totalQuestions}
              </div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="p-4 bg-purple-500/10 rounded-lg">
              <Trophy className="h-6 w-6 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-500">
                {result.summary.totalScore}
              </div>
              <div className="text-sm text-muted-foreground">Score</div>
            </div>
            <div className="p-4 bg-orange-500/10 rounded-lg">
              <Code2 className="h-6 w-6 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-500">
                {result.summary.totalSubmissions}
              </div>
              <div className="text-sm text-muted-foreground">Submissions</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Session Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Time Taken</span>
            <span className="font-medium">{formatTime(result.timeTaken)}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span>Time Limit</span>
            <span className="font-medium">{formatTime(result.timeLimit)}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span>Difficulty</span>
            <Badge variant="outline" className={DIFFICULTY_COLORS[result.difficulty]}>
              {result.difficulty}
            </Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span>Completed</span>
            <span className="font-medium">
              {new Date(result.completedAt).toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Suggestions Card */}
      {result.performance.suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.performance.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-primary">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Question Results */}
      <Card>
        <CardHeader>
          <CardTitle>Problem Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
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
      <div className="flex gap-4">
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
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          {question.isSolved ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
          <div>
            <span className="font-medium">
              Q{question.order}: {question.title}
            </span>
            <div className="flex gap-2 mt-1">
              <Badge
                variant="outline"
                className={cn("text-xs", DIFFICULTY_COLORS[question.difficulty])}
              >
                {question.difficulty}
              </Badge>
              {question.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {question.submissionCount} submission
            {question.submissionCount !== 1 ? "s" : ""}
          </span>
          <span
            className={cn(
              "font-medium",
              question.isSolved ? "text-green-500" : "text-red-500"
            )}
          >
            {question.score} pts
          </span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </button>

      {isExpanded && question.bestSubmission && (
        <div className="p-4 border-t bg-muted/20">
          <h4 className="text-sm font-medium mb-3">Best Submission</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">Status</div>
              <Badge
                variant="outline"
                className={cn(
                  "mt-1",
                  question.bestSubmission.status === "ACCEPTED"
                    ? "text-green-500 border-green-500/30"
                    : "text-red-500 border-red-500/30"
                )}
              >
                {question.bestSubmission.status}
              </Badge>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Language</div>
              <div className="mt-1 font-medium">
                {question.bestSubmission.language}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Time</div>
              <div className="mt-1 font-medium">
                {question.bestSubmission.executionTime?.toFixed(2) || "N/A"} ms
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Memory</div>
              <div className="mt-1 font-medium">
                {question.bestSubmission.memoryUsed
                  ? (question.bestSubmission.memoryUsed / 1024).toFixed(1)
                  : "N/A"}{" "}
                MB
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}