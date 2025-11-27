// src/components/institute-admin/mock-drive/analytics/analytics-overview-cards.tsx

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalyticsOverview } from '@/types/admin.mockdrive.types';
import { Users, UserCheck, TrendingUp, Target, Layers, Activity } from 'lucide-react';

interface AnalyticsOverviewCardsProps {
  overview: AnalyticsOverview | undefined;
}

export function AnalyticsOverviewCards({ overview }: AnalyticsOverviewCardsProps) {
  if (!overview) return null;

  const cards = [
    {
      title: 'Total Registered',
      value: overview.registrations.total,
      subValue: `${overview.registrations.approved} approved`,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Participation Rate',
      value: `${overview.participation.completionRate.toFixed(1)}%`,
      subValue: `${overview.participation.totalCompleted} of ${overview.participation.totalRegistered}`,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Average Score',
      value: overview.scores.average ? `${overview.scores.average.toFixed(1)}%` : '-',
      subValue: overview.scores.median ? `Median: ${overview.scores.median.toFixed(1)}%` : '',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Score Range',
      value: overview.scores.highest ? `${overview.scores.highest.toFixed(1)}%` : '-',
      subValue: overview.scores.lowest ? `Low: ${overview.scores.lowest.toFixed(1)}%` : '',
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Batches',
      value: overview.batches.total,
      subValue: `${overview.batches.completed} completed`,
      icon: Layers,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
    {
      title: 'In Progress',
      value: overview.participation.totalStarted - overview.participation.totalCompleted,
      subValue: `${overview.batches.inProgress} batches active`,
      icon: Activity,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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
            {card.subValue && (
              <p className="text-xs text-muted-foreground">{card.subValue}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}