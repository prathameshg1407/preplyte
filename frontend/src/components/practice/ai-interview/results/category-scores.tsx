// src/components/practice/ai-interview/results/category-scores.tsx

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Code,
  Users,
  MessageSquare,
  Lightbulb,
  Heart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CategoryScores as CategoryScoresType } from '@/types/interview.types';

interface CategoryScoresProps {
  categoryScores: CategoryScoresType;
}

const CATEGORY_CONFIG = {
  technical: {
    label: 'Technical Skills',
    icon: Code,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500',
  },
  behavioral: {
    label: 'Behavioral',
    icon: Users,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500',
  },
  communication: {
    label: 'Communication',
    icon: MessageSquare,
    color: 'text-green-500',
    bgColor: 'bg-green-500',
  },
  problemSolving: {
    label: 'Problem Solving',
    icon: Lightbulb,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500',
  },
  cultureFit: {
    label: 'Culture Fit',
    icon: Heart,
    color: 'text-pink-500',
    bgColor: 'bg-pink-500',
  },
};

export function CategoryScores({ categoryScores }: CategoryScoresProps) {
  const categories = Object.entries(categoryScores) as [
    keyof typeof CATEGORY_CONFIG,
    { score: number; maxScore: number; feedback: string }
  ][];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {categories.map(([key, data]) => {
          const config = CATEGORY_CONFIG[key];
          const Icon = config.icon;
          const percentage = (data.score / data.maxScore) * 100;

          return (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={cn('h-5 w-5', config.color)} />
                  <span className="font-medium">{config.label}</span>
                </div>
                <span className="font-semibold">
                  {data.score.toFixed(1)}/{data.maxScore}
                </span>
              </div>
              <Progress
                value={percentage}
                className="h-2"
                // Custom color based on category
                style={
                  {
                    '--progress-background': `hsl(var(--muted))`,
                  } as React.CSSProperties
                }
              />
              {data.feedback && (
                <p className="text-sm text-muted-foreground">{data.feedback}</p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}