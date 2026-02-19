// src/components/leaderboard/score-breakdown-card.tsx

'use client';

import {
  BookOpen,
  Brain,
  Code2,
  MessageSquare,
  Trophy,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { ScoreBreakdown } from '@/types/leaderboard.types';

interface ScoreBreakdownCardProps {
  data: ScoreBreakdown | undefined;
  isLoading: boolean;
}

const CATEGORY_CONFIG = [
  {
    key: 'lms' as const,
    label: 'LMS Courses',
    icon: BookOpen,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-500/10',
    unit: 'points',
  },
  {
    key: 'aptitude' as const,
    label: 'Aptitude',
    icon: Brain,
    color: 'text-violet-600 dark:text-violet-400',
    bgColor: 'bg-violet-500/10',
    unit: 'correct answers',
  },
  {
    key: 'coding' as const,
    label: 'Coding',
    icon: Code2,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    unit: 'problems solved',
  },
  {
    key: 'aiInterview' as const,
    label: 'AI Interview',
    icon: MessageSquare,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-500/10',
    unit: 'score',
  },
  {
    key: 'mockDrive' as const,
    label: 'Mock Drives',
    icon: Trophy,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-500/10',
    unit: 'score',
  },
];

export function ScoreBreakdownCard({ data, isLoading }: ScoreBreakdownCardProps) {
  if (isLoading) {
    return <ScoreBreakdownCardSkeleton />;
  }

  if (!data) {
    return null;
  }

  // Calculate max score for progress bars
  const maxScore = Math.max(
    data.lms,
    data.aptitude,
    data.coding,
    data.aiInterview,
    data.mockDrive,
    1
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
          Your Score Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex items-center justify-between rounded-lg bg-primary/5 p-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Score</p>
            <p className="text-3xl font-bold text-primary">
              {data.overall.toLocaleString()}
            </p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Trophy className="h-7 w-7 text-primary" />
          </div>
        </div>

        <div className="space-y-4">
          {CATEGORY_CONFIG.map((cat) => {
            const score = data[cat.key];
            const percentage = (score / maxScore) * 100;

            return (
              <div key={cat.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn('rounded-lg p-1.5', cat.bgColor)}>
                      <cat.icon className={cn('h-4 w-4', cat.color)} />
                    </div>
                    <span className="text-sm font-medium">{cat.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold">{score.toLocaleString()}</span>
                    <span className="ml-1 text-xs text-muted-foreground">{cat.unit}</span>
                  </div>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function ScoreBreakdownCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent>
        <Skeleton className="mb-6 h-20 w-full rounded-lg" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}