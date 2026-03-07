'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, ClipboardList, Code2, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TopPerformer } from '@/lib/hooks/institute-admin/use-institute-analytics';

interface TopPerformersTableProps {
  performers: TopPerformer[];
}

const medalColors = ['text-yellow-400', 'text-gray-400', 'text-amber-600'];

export function TopPerformersTable({ performers }: TopPerformersTableProps) {
  if (performers.length === 0) {
    return (
      <Card className="border-none shadow-lg glass-effect">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-400" />
            Top Performers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-lg glass-effect">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Trophy className="h-4 w-4 text-yellow-400" />
          Top Performers
        </CardTitle>
        <CardDescription>Top 10 students by mock drive score</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">#</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Student</th>
                <th className="text-center py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Avg Score</th>
                <th className="text-center py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Drives</th>
                <th className="text-center py-3 px-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                  <ClipboardList className="h-3 w-3 inline" />
                </th>
                <th className="text-center py-3 px-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                  <Code2 className="h-3 w-3 inline" />
                </th>
                <th className="text-center py-3 px-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                  <Mic className="h-3 w-3 inline" />
                </th>
              </tr>
            </thead>
            <tbody>
              {performers.map((p, idx) => (
                <tr
                  key={p.userId}
                  className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                >
                  <td className="py-3 px-4">
                    <span className={cn('font-bold text-sm', medalColors[idx] ?? 'text-muted-foreground')}>
                      {idx + 1}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium">{p.name}</div>
                    {p.studentId && (
                      <div className="text-xs text-muted-foreground">{p.studentId}</div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {p.avgScore != null ? (
                      <Badge
                        variant="secondary"
                        className={cn(
                          'font-semibold tabular-nums',
                          p.avgScore >= 80 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          p.avgScore >= 60 ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        )}
                      >
                        {p.avgScore.toFixed(1)}%
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center tabular-nums font-medium">{p.completedDrives}</td>
                  <td className="py-3 px-2 text-center tabular-nums text-muted-foreground">{p.aptitudeSessions}</td>
                  <td className="py-3 px-2 text-center tabular-nums text-muted-foreground">{p.codingSessions}</td>
                  <td className="py-3 px-2 text-center tabular-nums text-muted-foreground">{p.aiInterviewSessions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
