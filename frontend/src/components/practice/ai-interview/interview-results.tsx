"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InterviewFeedbackResponse, ResponseScoreDto } from "@/types/aiInterview.types";

interface InterviewResultsProps {
  sessionId: string;
  feedback: InterviewFeedbackResponse | null;
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
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">
          Generating your interview feedback...
        </p>
        <p className="text-sm text-muted-foreground">
          This may take a moment while we analyze your responses.
        </p>
      </div>
    );
  }

  if (error || !feedback) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-lg text-red-600 dark:text-red-400">
          {error || "Failed to load feedback"}
        </p>
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Very Good";
    if (score >= 70) return "Good";
    if (score >= 60) return "Fair";
    return "Needs Improvement";
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push("/practice/ai-interview")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Interviews
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Overall Score Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Score Circle */}
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={`${(feedback.overallScore / 100) * 352} 352`}
                  className={getScoreBg(feedback.overallScore)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={cn("text-3xl font-bold", getScoreColor(feedback.overallScore))}>
                  {feedback.overallScore}
                </span>
                <span className="text-xs text-muted-foreground">/100</span>
              </div>
            </div>

            {/* Score Summary */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <Trophy className={cn("w-6 h-6", getScoreColor(feedback.overallScore))} />
                <h2 className="text-2xl font-bold">
                  {getScoreLabel(feedback.overallScore)}
                </h2>
              </div>
              <p className="text-muted-foreground">{feedback.overallSummary}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Key Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-5 h-5" />
              Key Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {feedback.keyStrengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2" />
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Areas for Improvement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Target className="w-5 h-5" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {feedback.areasForImprovement.map((area, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2" />
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Per-Question Feedback */}
      {feedback.perResponseScores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Response Analysis
            </CardTitle>
            <CardDescription>
              Detailed feedback for each of your responses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {feedback.perResponseScores.map((response, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-4 text-left">
                      <Badge variant="outline">Q{index + 1}</Badge>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Response {index + 1}</span>
                          <Badge
                            className={cn(
                              "text-xs",
                              getScoreBg(
                                Math.round(
                                  (response.contentScore +
                                    response.fluencyScore +
                                    response.relevanceScore) /
                                    3 *
                                    10
                                )
                              )
                            )}
                          >
                            {Math.round(
                              (response.contentScore +
                                response.fluencyScore +
                                response.relevanceScore) /
                                3 *
                                10
                            )}
                            /100
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      {/* Score Breakdown */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Content</p>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={response.contentScore * 10}
                              className="h-2"
                            />
                            <span className="text-sm font-medium">
                              {response.contentScore}/10
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Fluency</p>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={response.fluencyScore * 10}
                              className="h-2"
                            />
                            <span className="text-sm font-medium">
                              {response.fluencyScore}/10
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Relevance</p>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={response.relevanceScore * 10}
                              className="h-2"
                            />
                            <span className="text-sm font-medium">
                              {response.relevanceScore}/10
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Feedback */}
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm">{response.feedback}</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          size="lg"
          onClick={() => router.push("/practice/ai-interview")}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Start New Interview
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => router.push("/practice/ai-interview")}
        >
          View All Sessions
        </Button>
      </div>
    </div>
  );
}