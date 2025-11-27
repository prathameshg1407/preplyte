// src/components/practice/aptitude/test-result.tsx

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
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
  Sparkles,
  ArrowRight,
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-rose-500';
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
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
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary"
          >
            <Trophy className="h-10 w-10 text-primary-foreground" />
          </motion.div>

          {/* Score */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-2"
          >
            <span className={cn('text-7xl font-bold', getScoreColor(result.summary.scorePercentage))}>
              {result.summary.scorePercentage}
            </span>
            <span className="text-3xl text-muted-foreground">%</span>
          </motion.div>

          {/* Grade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-6"
          >
            <Badge className="px-4 py-1.5 text-base">
              <Sparkles className="mr-1.5 h-4 w-4" />
              {grade.label}
            </Badge>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center gap-8"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
                <Check className="h-4 w-4 text-white" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold">{result.summary.totalCorrect}</p>
                <p className="text-xs text-muted-foreground">Correct</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500">
                <X className="h-4 w-4 text-white" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold">{result.summary.totalWrong}</p>
                <p className="text-xs text-muted-foreground">Wrong</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                <Minus className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold">{result.summary.totalUnanswered}</p>
                <p className="text-xs text-muted-foreground">Skipped</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 rounded-xl bg-muted/50 p-1">
          <TabsTrigger value="summary" className="rounded-lg">
            <Target className="mr-2 h-4 w-4" />
            Summary
          </TabsTrigger>
          <TabsTrigger value="breakdown" className="rounded-lg">
            <BarChart3 className="mr-2 h-4 w-4" />
            Breakdown
          </TabsTrigger>
          <TabsTrigger value="insights" className="rounded-lg">
            <Lightbulb className="mr-2 h-4 w-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary" className="mt-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-muted/30 p-6"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-lg bg-background p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span>Time Taken</span>
                </div>
                <span className="font-semibold">{formatDuration(result.timeTaken)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-background p-4">
                <span>Time Limit</span>
                <span className="font-semibold">{formatDuration(result.timeLimit)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-background p-4">
                <span>Accuracy</span>
                <Badge variant="secondary" className="font-semibold">
                  {result.summary.accuracy}%
                </Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-background p-4">
                <span>Attempt Rate</span>
                <Badge variant="secondary" className="font-semibold">
                  {result.summary.attemptRate}%
                </Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-background p-4">
                <span>Difficulty</span>
                <Badge variant="outline">{difficultyConfig?.label}</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-background p-4">
                <span>Total Questions</span>
                <span className="font-semibold">{result.summary.totalQuestions}</span>
              </div>
            </div>
          </motion.div>
        </TabsContent>

        {/* Breakdown Tab */}
        <TabsContent value="breakdown" className="mt-6 space-y-6">
          {/* By Type */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-muted/30 p-6"
          >
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <BarChart3 className="h-5 w-5" />
              By Question Type
            </h3>
            <div className="space-y-6">
              {Object.entries(result.breakdown.byType).map(([type, data]) => {
                const config = QUESTION_TYPE_CONFIG[type as keyof typeof QUESTION_TYPE_CONFIG];
                const accuracy = data.accuracy || 0;

                return (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{config?.label || type}</Badge>
                      <span className="font-semibold">
                        {data.correct}/{data.total}
                        <span className="ml-1 text-muted-foreground">({accuracy}%)</span>
                      </span>
                    </div>
                    <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
                      <motion.div
                        className={cn(
                          'absolute inset-y-0 left-0 rounded-full',
                          accuracy >= 80 ? 'bg-emerald-500' : accuracy >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${accuracy}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className="text-emerald-500">{data.correct} correct</span>
                      <span className="text-rose-500">{data.wrong} wrong</span>
                      <span>{data.unanswered} skipped</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* By Difficulty */}
          {Object.keys(result.breakdown.byDifficulty).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl bg-muted/30 p-6"
            >
              <h3 className="mb-4 flex items-center gap-2 font-semibold">
                <TrendingUp className="h-5 w-5" />
                By Difficulty
              </h3>
              <div className="space-y-4">
                {Object.entries(result.breakdown.byDifficulty).map(([diff, data]) => {
                  const config = DIFFICULTY_CONFIG[diff as keyof typeof DIFFICULTY_CONFIG];
                  const percentage = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;

                  return (
                    <div key={diff} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{config?.label || diff}</Badge>
                        <span className="font-semibold">{percentage}%</span>
                      </div>
                      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                        <motion.div
                          className="absolute inset-y-0 left-0 rounded-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="mt-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Message */}
            <div className="rounded-xl bg-primary/10 p-6">
              <p className="text-lg font-medium">{result.performance.message}</p>
            </div>

            {/* Suggestions */}
            <div className="rounded-xl bg-muted/30 p-6">
              <h3 className="mb-4 flex items-center gap-2 font-semibold">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                Tips for Improvement
              </h3>
              <ul className="space-y-3">
                {result.performance.suggestions.map((suggestion, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Check className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-muted-foreground">{suggestion}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* View Solutions */}
      {onViewSolutions && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center gap-4 rounded-xl bg-muted/30 p-6 sm:flex-row sm:justify-between"
        >
          <div>
            <h3 className="flex items-center gap-2 font-semibold">
              <Eye className="h-5 w-5" />
              Review Your Answers
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              See detailed solutions with explanations
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onViewSolutions('wrong')}>
              Wrong Only
            </Button>
            <Button onClick={() => onViewSolutions('all')} className="gap-2">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <Button asChild variant="outline" size="lg" className="h-14">
          <Link href="/practice/aptitude">
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