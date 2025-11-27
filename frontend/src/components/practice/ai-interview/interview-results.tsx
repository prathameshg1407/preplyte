// src/components/practice/ai-interview/interview-results.tsx

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Progress } from "../../ui/progress";
import {
  ArrowLeft,
  Download,
  Share2,
  RefreshCw,
  Trophy,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Lightbulb,
  ArrowRight,
} from "lucide-react";
import { FeedbackResponse } from "../../../types/aiInterview.types";

interface InterviewResultsProps {
  sessionId: string;
  feedback: FeedbackResponse | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function InterviewResults({
  sessionId,
  feedback,
  loading,
  error,
  onRetry,
}: InterviewResultsProps) {
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="h-12 w-12 rounded-full border border-border flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <p className="font-medium">Analyzing your interview...</p>
          <p className="text-sm text-muted-foreground">
            This may take a moment
          </p>
        </div>
      </div>
    );
  }

  if (error || !feedback) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="h-12 w-12 rounded-full border border-border flex items-center justify-center">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div className="text-center space-y-1">
          <p className="font-medium">{error || "Failed to load feedback"}</p>
          <p className="text-sm text-muted-foreground">
            Please try again
          </p>
        </div>
        <Button onClick={onRetry} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Work";
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/practice/ai-interview")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Score Card */}
      <Card className="border-border">
        <CardContent className="pt-8 pb-8">
          <div className="flex flex-col items-center text-center">
            {/* Score Circle */}
            <div className="relative w-28 h-28 mb-6">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-secondary"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeDasharray={`${(feedback.overallScore / 100) * 301.6} 301.6`}
                  className="text-foreground transition-all duration-1000"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-semibold tabular-nums">
                  {feedback.overallScore}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold">
                {getScoreLabel(feedback.overallScore)}
              </h2>
              <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                {feedback.summary}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-2.5">
              {feedback.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2.5 text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-foreground mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Areas to Improve
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-2.5">
              {feedback.improvements.map((area, index) => (
                <li key={index} className="flex items-start gap-2.5 text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{area}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Category Scores */}
      {feedback.categoryScores && feedback.categoryScores.length > 0 && (
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Performance by Category
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {feedback.categoryScores.map((category, index) => (
                <div key={index} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span>{category.category}</span>
                    <span className="font-mono text-muted-foreground">
                      {category.score}
                    </span>
                  </div>
                  <Progress value={category.score} className="h-1" />
                  {category.feedback && (
                    <p className="text-xs text-muted-foreground">
                      {category.feedback}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {feedback.recommendations && feedback.recommendations.length > 0 && (
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {feedback.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50"
                >
                  <span className="h-5 w-5 rounded-full border border-border bg-background flex items-center justify-center text-xs font-medium shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-sm leading-relaxed">{rec}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 pb-8">
        <Button
          onClick={() => router.push("/practice/ai-interview")}
          className="h-11"
        >
          Start New Interview
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push("/practice/ai-interview")}
          className="h-11"
        >
          View History
        </Button>
      </div>
    </div>
  );
}