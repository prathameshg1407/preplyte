// src/components/practice/aptitude/test-result.tsx

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { SessionResultsResponse, SolutionFilter } from '@/types/aptitude.types';
import {
  QUESTION_TYPE_CONFIG,
  DIFFICULTY_CONFIG,
  getScoreGrade,
  getPerformanceColor,
  formatDuration,
} from '@/lib/constants/aptitude.constants';
import {
  CheckCircle2,
  XCircle,
  MinusCircle,
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
import { cn } from '@/lib/utils';

interface TestResultProps {
  result: SessionResultsResponse;
  onViewSolutions?: (filter: SolutionFilter) => void;
}

export function TestResult({ result, onViewSolutions }: TestResultProps) {
  const [activeTab, setActiveTab] = useState('summary');

  const grade = getScoreGrade(result.summary.scorePercentage, result.difficulty);
  const difficultyConfig = DIFFICULTY_CONFIG[result.difficulty];
  const performanceColors = getPerformanceColor(result.performance.rank);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero Score Card */}
      <Card className="border-2 overflow-hidden">
        <div
          className={cn(
            'py-8 px-6 text-center',
            grade.bgColor,
            'bg-gradient-to-br from-transparent to-background'
          )}
        >
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-background shadow-lg mb-4">
            <Trophy className={cn('h-8 w-8', grade.color)} />
          </div>

          <div className={cn('text-6xl font-bold mb-2', grade.color)}>
            {result.summary.scorePercentage}%
          </div>
          <div className="text-xl font-medium text-foreground mb-2">
            {grade.label}
          </div>
          <Badge className={cn('mb-4', performanceColors.bg, performanceColors.text)}>
            {result.performance.rank.replace('_', ' ')}
          </Badge>

          <div className="flex justify-center gap-6 text-sm mt-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>{result.summary.totalCorrect} Correct</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span>{result.summary.totalWrong} Wrong</span>
            </div>
            <div className="flex items-center gap-2">
              <MinusCircle className="h-4 w-4 text-muted-foreground" />
              <span>{result.summary.totalUnanswered} Skipped</span>
            </div>
          </div>
        </div>

        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-500/10 rounded-xl">
              <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-3xl font-bold text-green-600">
                {result.summary.totalCorrect}
              </div>
              <div className="text-sm text-muted-foreground">Correct</div>
            </div>
            <div className="text-center p-4 bg-red-500/10 rounded-xl">
              <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <div className="text-3xl font-bold text-red-600">
                {result.summary.totalWrong}
              </div>
              <div className="text-sm text-muted-foreground">Wrong</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-xl">
              <MinusCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <div className="text-3xl font-bold">{result.summary.totalUnanswered}</div>
              <div className="text-sm text-muted-foreground">Skipped</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-6 mt-6">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Test Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Time Taken</span>
                  </div>
                  <span className="font-semibold">
                    {formatDuration(result.timeTaken)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">Time Limit</span>
                  <span className="font-semibold">
                    {formatDuration(result.timeLimit)}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Accuracy</span>
                  <Badge variant="outline">{result.summary.accuracy}%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Attempt Rate</span>
                  <Badge variant="outline">{result.summary.attemptRate}%</Badge>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-sm">Difficulty</span>
                <Badge
                  variant="outline"
                  className={cn(
                    difficultyConfig?.color,
                    'border-current bg-current/10'
                  )}
                >
                  {difficultyConfig?.label || result.difficulty}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Total Questions</span>
                <span className="font-semibold">{result.summary.totalQuestions}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Breakdown Tab */}
        <TabsContent value="breakdown" className="space-y-6 mt-6">
          {/* By Type */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
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
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={config?.color}>
                          {config?.label || type}
                        </Badge>
                      </div>
                      <span className="text-sm font-medium">
                        {data.correct}/{data.total} ({accuracy}%)
                      </span>
                    </div>
                    <Progress
                      value={accuracy}
                      className={cn(
                        'h-2',
                        accuracy >= 70 && '[&>div]:bg-green-500',
                        accuracy >= 40 && accuracy < 70 && '[&>div]:bg-yellow-500',
                        accuracy < 40 && '[&>div]:bg-red-500'
                      )}
                    />
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

          {/* By Difficulty (if multiple difficulties in breakdown) */}
          {Object.keys(result.breakdown.byDifficulty).length > 0 && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
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
                        <Badge
                          variant="outline"
                          className={cn(config?.color, 'border-current bg-current/10')}
                        >
                          {config?.label || diff}
                        </Badge>
                        <span className="text-sm font-medium">
                          {data.correct}/{data.total} ({percentage}%)
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Suggestions Tab */}
        <TabsContent value="suggestions" className="space-y-6 mt-6">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                Performance Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={cn('p-4 rounded-lg', performanceColors.bg)}>
                <p className={cn('font-medium', performanceColors.text)}>
                  {result.performance.message}
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <p className="font-medium text-sm">Suggestions for Improvement:</p>
                <ul className="space-y-2">
                  {result.performance.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
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
        <Card className="border-2">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  Review Solutions
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
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
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild variant="outline" className="flex-1 h-12">
          <Link href="/practice/aptitude">
            <RotateCcw className="mr-2 h-4 w-4" />
            Practice Again
          </Link>
        </Button>
        <Button asChild className="flex-1 h-12">
          <Link href="/dashboard">
            <Home className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}