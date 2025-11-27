// src/components/admin/analytics/sessions-overview.tsx

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Progress } from '../../ui/progress';
import { Brain, Code, MessageSquare } from 'lucide-react';

interface SessionsOverviewProps {
  sessions: {
    totalAptitudeSessions: number;
    completedAptitudeSessions: number;
    totalMachineSessions: number;
    completedMachineSessions: number;
    totalInterviewSessions: number;
    completedInterviewSessions: number;
  };
}

export function SessionsOverview({ sessions }: SessionsOverviewProps) {
  const sessionTypes = [
    {
      name: 'Aptitude',
      total: sessions.totalAptitudeSessions,
      completed: sessions.completedAptitudeSessions,
      icon: Brain,
    },
    {
      name: 'Coding',
      total: sessions.totalMachineSessions,
      completed: sessions.completedMachineSessions,
      icon: Code,
    },
    {
      name: 'Interviews',
      total: sessions.totalInterviewSessions,
      completed: sessions.completedInterviewSessions,
      icon: MessageSquare,
    },
  ];

  const totalSessions = sessionTypes.reduce((sum, s) => sum + s.total, 0);
  const totalCompleted = sessionTypes.reduce((sum, s) => sum + s.completed, 0);
  const overallPercentage = totalSessions > 0 
    ? Math.round((totalCompleted / totalSessions) * 100) 
    : 0;

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Sessions Overview</CardTitle>
          <span className="text-xs text-muted-foreground">
            {overallPercentage}% complete
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {sessionTypes.map((session) => {
          const Icon = session.icon;
          const percentage = session.total > 0
            ? Math.round((session.completed / session.total) * 100)
            : 0;

          return (
            <div key={session.name} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded border border-border flex items-center justify-center">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-sm">{session.name}</span>
                </div>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {session.completed.toLocaleString()} / {session.total.toLocaleString()}
                </span>
              </div>
              <Progress value={percentage} className="h-1" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}