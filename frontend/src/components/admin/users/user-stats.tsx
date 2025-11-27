// src/components/admin/users/user-stats.tsx

'use client';

import { Card, CardContent } from '../../ui/card';
import { Brain, Code, MessageSquare } from 'lucide-react';
import type { UserStats } from '../../../types/admin.types';

interface UserStatsCardsProps {
  stats: UserStats;
}

export function UserStatsCards({ stats }: UserStatsCardsProps) {
  const statCards = [
    {
      label: 'Aptitude',
      value: stats.totalAptitudeSessions,
      completed: stats.completedAptitudeSessions,
      avgScore: stats.avgAptitudeScore,
      icon: Brain,
    },
    {
      label: 'Coding',
      value: stats.totalMachineSessions,
      completed: stats.completedMachineSessions,
      avgScore: stats.avgMachineScore,
      icon: Code,
    },
    {
      label: 'Interviews',
      value: stats.totalInterviewSessions,
      completed: stats.completedInterviewSessions,
      avgScore: stats.avgInterviewScore,
      icon: MessageSquare,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        const completionRate =
          stat.value > 0 ? Math.round((stat.completed / stat.value) * 100) : 0;

        return (
          <Card key={stat.label} className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="h-9 w-9 rounded-md border border-border flex items-center justify-center">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold tabular-nums">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-lg font-semibold tabular-nums">{completionRate}%</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
                <div>
                  <p className="text-lg font-semibold tabular-nums">{stat.avgScore.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">Avg Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}