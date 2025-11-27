// src/components/admin/analytics/performance-cards.tsx

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';

interface PerformanceCardsProps {
  performance: {
    avgAptitudeScore: number;
    avgMachineScore: number;
    avgInterviewScore: number;
  };
}

export function PerformanceCards({ performance }: PerformanceCardsProps) {
  const metrics = [
    {
      name: 'Aptitude',
      value: performance.avgAptitudeScore,
      max: 100,
    },
    {
      name: 'Coding',
      value: performance.avgMachineScore,
      max: 100,
    },
    {
      name: 'Interview',
      value: performance.avgInterviewScore,
      max: 100,
    },
  ];

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Average Performance</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {metrics.map((metric) => (
            <div key={metric.name} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm">{metric.name}</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-semibold tabular-nums">
                    {metric.value.toFixed(0)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    / {metric.max}
                  </span>
                </div>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-foreground rounded-full transition-all duration-500"
                  style={{ width: `${(metric.value / metric.max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}