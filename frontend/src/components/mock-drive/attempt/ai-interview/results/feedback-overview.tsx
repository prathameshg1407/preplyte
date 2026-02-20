// src/components/practice/ai-interview/results/feedback-overview.tsx

'use client';

import { Trophy, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { InterviewFeedback, HiringRecommendation } from '@/types/interview.types';

interface FeedbackOverviewProps {
  feedback: InterviewFeedback;
}

const RECOMMENDATION_CONFIG: Record<
  HiringRecommendation,
  { label: string; color: string; bgColor: string }
> = {
  strong_yes: {
    label: 'Strong Yes',
    color: 'text-green-700',
    bgColor: 'bg-green-500/10',
  },
  yes: {
    label: 'Yes',
    color: 'text-green-600',
    bgColor: 'bg-green-500/10',
  },
  maybe: {
    label: 'Maybe',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-500/10',
  },
  no: {
    label: 'No',
    color: 'text-orange-600',
    bgColor: 'bg-orange-500/10',
  },
  strong_no: {
    label: 'Strong No',
    color: 'text-red-600',
    bgColor: 'bg-red-500/10',
  },
};

export function FeedbackOverview({ feedback }: FeedbackOverviewProps) {
  const recommendationConfig = RECOMMENDATION_CONFIG[feedback.hiringRecommendation];
  const scorePercentage = (feedback.overallScore / 10) * 100;

  return (
    <div className="space-y-6">
      {/* Score Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Overall Score</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">{feedback.overallScore.toFixed(1)}</span>
                <span className="text-2xl text-muted-foreground">/10</span>
              </div>
            </div>

            <div className="text-right space-y-2">
              <Badge
                className={cn(
                  'text-sm px-3 py-1',
                  recommendationConfig.bgColor,
                  recommendationConfig.color
                )}
              >
                {recommendationConfig.label}
              </Badge>
              <p className="text-sm text-muted-foreground">Hiring Recommendation</p>
            </div>
          </div>

          <Progress value={scorePercentage} className="h-3 mt-6" />
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            {feedback.overallSummary}
          </p>
        </CardContent>
      </Card>

      {/* Strengths & Improvements */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <TrendingUp className="h-5 w-5" />
              Key Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {feedback.keyStrengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Improvements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <TrendingDown className="h-5 w-5" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {feedback.areasForImprovement.map((area, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">○</span>
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}