// src/components/institute-admin/mock-drive/results/results-statistics-cards.tsx

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ResultStatistics } from '@/types/admin.mockdrive.types';
import {
  Users,
  CheckCircle,
  XCircle,
  TrendingUp,
  Award,
  Target,
} from 'lucide-react';

interface ResultsStatisticsCardsProps {
  statistics: ResultStatistics | undefined;
  isLoading?: boolean;
}

export function ResultsStatisticsCards({
  statistics,
  isLoading,
}: ResultsStatisticsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!statistics) return null;

  const cards = [
    {
      title: 'Total Attempts',
      value: statistics.total,
      subValue: `${statistics.completed} completed`,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Pass Rate',
      value: statistics.passRate ? `${statistics.passRate.toFixed(1)}%` : '-',
      subValue: `${statistics.passed} passed, ${statistics.failed} failed`,
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Average Score',
      value: statistics.avgScore ? `${statistics.avgScore.toFixed(1)}%` : '-',
      subValue: 'Across all attempts',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Highest Score',
      value: statistics.highScore ? `${statistics.highScore.toFixed(1)}%` : '-',
      subValue: statistics.lowScore ? `Lowest: ${statistics.lowScore.toFixed(1)}%` : '',
      icon: Award,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`rounded-md p-2 ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.subValue}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}