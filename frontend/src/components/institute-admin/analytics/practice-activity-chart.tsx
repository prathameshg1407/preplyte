'use client';

import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import type { PracticeModuleStats } from '@/lib/hooks/institute-admin/use-institute-analytics';

interface PracticeActivityChartProps {
  stats: PracticeModuleStats;
}

const difficultyColors: Record<string, string> = {
  EASY: '#22c55e',
  MEDIUM: '#f59e0b',
  HARD: '#ef4444',
  ENTRY: '#3b82f6',
  MID: '#8b5cf6',
  SENIOR: '#f97316',
  LEAD: '#ef4444',
};

export function PracticeActivityChart({ stats }: PracticeActivityChartProps) {
  // Radar overview data
  const radarData = [
    {
      module: 'Aptitude',
      sessions: stats.aptitude.totalSessions,
      completed: stats.aptitude.completedSessions,
      metric: stats.aptitude.avgAccuracy ?? 0,
    },
    {
      module: 'Coding',
      sessions: stats.coding.totalSessions,
      completed: stats.coding.completedSessions,
      metric: stats.coding.avgSolveRate ?? 0,
    },
    {
      module: 'AI Interview',
      sessions: stats.aiInterview.totalSessions,
      completed: stats.aiInterview.completedSessions,
      metric: (stats.aiInterview.avgScore ?? 0) * 10,
    },
  ];

  // Difficulty breakdown for aptitude
  const aptitudeDiffData = stats.aptitude.byDifficulty.map(d => ({
    difficulty: d.difficulty,
    count: d.count,
    fill: difficultyColors[d.difficulty] ?? '#6b7280',
  }));

  const codingDiffData = stats.coding.byDifficulty.map(d => ({
    difficulty: d.difficulty,
    count: d.count,
    fill: difficultyColors[d.difficulty] ?? '#6b7280',
  }));

  const aiDiffData = stats.aiInterview.byDifficulty.map(d => ({
    difficulty: d.difficulty,
    count: d.count,
    fill: difficultyColors[d.difficulty] ?? '#6b7280',
  }));

  return (
    <Card className="border-none shadow-lg glass-effect col-span-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <CardTitle className="text-base font-semibold">Practice Modules Analytics</CardTitle>
            <CardDescription>Aptitude · Coding · AI Interview breakdown</CardDescription>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 gap-1">
              <span className="font-bold">{stats.aptitude.totalSessions}</span> Aptitude
            </Badge>
            <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/30 gap-1">
              <span className="font-bold">{stats.coding.totalSessions}</span> Coding
            </Badge>
            <Badge variant="outline" className="bg-violet-500/10 text-violet-400 border-violet-500/30 gap-1">
              <span className="font-bold">{stats.aiInterview.totalSessions}</span> AI Interview
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="aptitude">Aptitude</TabsTrigger>
            <TabsTrigger value="coding">Coding</TabsTrigger>
            <TabsTrigger value="interview">AI Interview</TabsTrigger>
          </TabsList>

          {/* Overview radar */}
          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis
                      dataKey="module"
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Radar name="Total Sessions" dataKey="sessions" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                    <Radar name="Completed" dataKey="completed" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4">
                {[
                  {
                    label: 'Aptitude',
                    color: 'amber',
                    total: stats.aptitude.totalSessions,
                    done: stats.aptitude.completedSessions,
                    metric: stats.aptitude.avgAccuracy,
                    metricLabel: 'Avg Accuracy',
                    metricSuffix: '%',
                    thisMonth: stats.aptitude.sessionsThisMonth,
                  },
                  {
                    label: 'Coding',
                    color: 'rose',
                    total: stats.coding.totalSessions,
                    done: stats.coding.completedSessions,
                    metric: stats.coding.avgSolveRate,
                    metricLabel: 'Avg Solve Rate',
                    metricSuffix: '%',
                    thisMonth: stats.coding.sessionsThisMonth,
                  },
                  {
                    label: 'AI Interview',
                    color: 'violet',
                    total: stats.aiInterview.totalSessions,
                    done: stats.aiInterview.completedSessions,
                    metric: stats.aiInterview.avgScore,
                    metricLabel: 'Avg Score',
                    metricSuffix: '/10',
                    thisMonth: stats.aiInterview.sessionsThisMonth,
                  },
                ].map(m => (
                  <div key={m.label} className="p-3 rounded-lg border border-border/50 bg-muted/20">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-semibold">{m.label}</span>
                      <span className="text-xs text-muted-foreground">+{m.thisMonth} this month</span>
                    </div>
                    <div className="flex items-baseline gap-3 text-sm">
                      <span className="font-bold text-lg">{m.total}</span>
                      <span className="text-muted-foreground text-xs">{m.done} completed</span>
                      {m.metric != null && (
                        <span className="ml-auto text-xs font-medium">
                          {m.metricLabel}: <strong>{m.metric.toFixed(1)}{m.metricSuffix}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Aptitude by difficulty */}
          <TabsContent value="aptitude">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-3">
                Sessions by difficulty — avg accuracy:{' '}
                <strong>{stats.aptitude.avgAccuracy != null ? `${stats.aptitude.avgAccuracy.toFixed(1)}%` : '—'}</strong>
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={aptitudeDiffData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="difficulty" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(v) => [v, 'Sessions']}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {aptitudeDiffData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          {/* Coding by difficulty */}
          <TabsContent value="coding">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-3">
                Sessions by difficulty — avg solve rate:{' '}
                <strong>{stats.coding.avgSolveRate != null ? `${stats.coding.avgSolveRate.toFixed(1)}%` : '—'}</strong>
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={codingDiffData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="difficulty" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(v) => [v, 'Sessions']}
                  />
                  <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          {/* AI Interview by difficulty */}
          <TabsContent value="interview">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-3">
                Sessions by difficulty — avg score:{' '}
                <strong>{stats.aiInterview.avgScore != null ? `${stats.aiInterview.avgScore.toFixed(1)}/10` : '—'}</strong>
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={aiDiffData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="difficulty" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(v) => [v, 'Sessions']}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
