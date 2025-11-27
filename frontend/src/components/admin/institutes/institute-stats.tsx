// src/components/admin/institutes/institute-stats.tsx

'use client';

import { Card, CardContent } from '../../ui/card';
import { Users, Brain, Code, MessageSquare, TrendingUp, UserCheck } from 'lucide-react';
import type { InstituteStats as InstituteStatsType } from '../../../types/admin.types';

interface InstituteStatsProps {
  stats: InstituteStatsType;
}

export function InstituteStats({ stats }: InstituteStatsProps) {
  const statCards = [
    {
      label: 'Users',
      value: stats.totalUsers,
      subValue: `${stats.activeUsers} active`,
      icon: Users,
    },
    {
      label: 'Aptitude',
      value: stats.totalAptitudeSessions,
      subValue: `${stats.completedAptitudeSessions} done`,
      icon: Brain,
    },
    {
      label: 'Coding',
      value: stats.totalMachineSessions,
      subValue: `${stats.completedMachineSessions} done`,
      icon: Code,
    },
    {
      label: 'Interviews',
      value: stats.totalInterviewSessions,
      subValue: `${stats.completedInterviewSessions} done`,
      icon: MessageSquare,
    },
    {
      label: 'Aptitude Avg',
      value: stats.avgAptitudeScore.toFixed(0),
      subValue: 'score',
      icon: TrendingUp,
    },
    {
      label: 'Interview Avg',
      value: stats.avgInterviewScore.toFixed(0),
      subValue: 'score',
      icon: UserCheck,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="border-border">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-md border border-border flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-semibold tabular-nums">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-xs text-muted-foreground/70">{stat.subValue}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}