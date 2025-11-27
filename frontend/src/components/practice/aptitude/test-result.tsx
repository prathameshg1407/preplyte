// src/components/practice/aptitude/test-result.tsx

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Progress } from '../../ui/progress';
import { Separator } from '../../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import type { SessionResultsResponse, SolutionFilter } from '../../../types/aptitude.types';
import {
  QUESTION_TYPE_CONFIG,
  DIFFICULTY_CONFIG,
  getScoreGrade,
  formatDuration,
} from '../../../lib/constants/aptitude.constants';
import {
  Check,
  X,
  Minus,
  Clock,
  Target,
  TrendingUp,
  RotateCcw,
  Home,
  Trophy,
  BarChart3,
  Lightbulb,
  Eye,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '../../../lib/utils';

interface TestResultProps {
  result: SessionResultsResponse;
  onViewSolutions?: (filter: SolutionFilter) => void;
}

export function TestResult({ result, onViewSolutions }: TestResultProps) {
  const [activeTab, setActiveTab] = useState('summary');

  const grade = getScoreGrade(result.summary.scorePercentage, result.difficulty);
  const difficultyConfig = DIFFICULTY_CONFIG[result.difficulty];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Hero Score Card */}
      <Card>
        <div className="border-b border-border py-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-foreground">
            <Trophy className="h-8 w-8 text-background" />
          </div>

          <div className="mb-2 text-6xl font-bold">
            {result.summary.scorePercentage}%
          </div>
          <div className="mb-4 text-xl font-medium">{grade.label}</div>

          <div className="flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-foreground">
                <Check className="h-3 w-3 text-background" />
              </div>
              <span>{result.summary.totalCorrect} Correct</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-muted-foreground">
                <X className="h-3 w-3 text-background" />
              </div>
              <span>{result.summary.totalWrong} Wrong</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-secondary">
                <Minus className="h-3 w-3" />
              </div>
              <span>{result.summary.totalUnanswered} Skipped</span>
            </div>
          </div>
        </div>

        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-border bg-secondary/30 p-4 text-center">
              <div className="mb-2 flex h-8 w-8 mx-auto items-center justify-center rounded bg-foreground">
                <Check className="h-4 w-4 text-background" />
              </div>
              <div className="text-3xl font-bold">{result.summary.totalCorrect}</div>
              <div className="text-sm text-muted-foreground">Correct</div>
            </div>
            <div className="rounded-lg border border-border bg-secondary/30 p-4 text-center">
              <div className="mb-2 flex h-8 w-8 mx-auto items-center justify-center rounded bg-muted-foreground">
                <X className="h-4 w-4 text-background" />
              </div>
              <div className="text-3xl font-bold">{result.summary.totalWrong}</div>
              <div className="text-sm text-muted-foreground">Wrong</div>
            </div>
            <div className="rounded-lg border border-border bg-secondary/30 p-4 text-center">
              <div className="mb-2 flex h-8 w-8 mx-auto items-center justify-center rounded bg-secondary">
                <Minus className="h-4 w-4" />
              </div>
              <div className="text-3xl font-bold">{result.summary.totalUnanswered}</div>
              <div className="text-sm text-muted-foreground">Skipped</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Test Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between rounded-lg bg-secondary p-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Time Taken</span>
                  </div>
                  <span className="font-medium">{formatDuration(result.timeTaken)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-secondary p-3">
                  <span className="text-sm">Time Limit</span>
                  <span className="font-medium">{formatDuration(result.timeLimit)}</span>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Accuracy</span>
                  <Badge variant="outline">{result.summary.accuracy}%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Attempt Rate</span>
                  <Badge variant="outline">{result.summary.attemptRate}%</Badge>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Difficulty</span>
                <Badge variant="secondary">
                  {difficultyConfig?.label || result.difficulty}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Questions</span>
                <span className="font-medium">{result.summary.totalQuestions}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Breakdown Tab */}
        <TabsContent value="breakdown" className="mt-6 space-y-6">
          {/* By Type */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Performance by Type
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(result.breakdown.byType).map(([type, data]) => {
                const config = QUESTION_TYPE_CONFIG[type as keyof typeof QUESTION_TYPE_CONFIG];
                const accuracy = data.accuracy || 0;

                return (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">
                        {config?.label || type}
                      </Badge>
                      <span className="text-sm font-medium">
                        {data.correct}/{data.total} ({accuracy}%)
                      </span>
                    </div>
                    <Progress value={accuracy} className="h-1.5" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{data.correct} correct</span>
                      <span>{data.wrong} wrong</span>
                      <span>{data.unanswered} skipped</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* By Difficulty */}
          {Object.keys(result.breakdown.byDifficulty).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Performance by Difficulty
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(result.breakdown.byDifficulty).map(([diff, data]) => {
                  const config = DIFFICULTY_CONFIG[diff as keyof typeof DIFFICULTY_CONFIG];
                  const percentage = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;

                  return (
                    <div key={diff} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">
                          {config?.label || diff}
                        </Badge>
                        <span className="text-sm font-medium">
                          {data.correct}/{data.total} ({percentage}%)
                        </span>
                      </div>
                      <Progress value={percentage} className="h-1.5" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Performance Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border bg-secondary/50 p-4">
                <p className="font-medium">{result.performance.message}</p>
              </div>

              <Separator />

              <div className="space-y-3">
                <p className="text-sm font-medium">Suggestions for Improvement:</p>
                <ul className="space-y-2">
                  {result.performance.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Solutions Button */}
      {onViewSolutions && (
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="flex items-center gap-2 font-semibold">
                  <Eye className="h-4 w-4" />
                  Review Solutions
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  View detailed solutions with explanations
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onViewSolutions('wrong')}>
                  Wrong Only
                </Button>
                <Button size="sm" onClick={() => onViewSolutions('all')}>
                  View All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <Button asChild variant="outline" className="h-12 flex-1">
          <Link href="/practice/aptitude">
            <RotateCcw className="mr-2 h-4 w-4" />
            Practice Again
          </Link>
        </Button>
        <Button asChild className="h-12 flex-1">
          <Link href="/dashboard">
            <Home className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}