'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { DepartmentPerformance } from '@/lib/hooks/institute-admin/use-institute-analytics';

interface DepartmentPerformanceChartProps {
  data: DepartmentPerformance[];
}

export function DepartmentPerformanceChart({ data }: DepartmentPerformanceChartProps) {
  const chartData = data
    .sort((a, b) => b.totalStudents - a.totalStudents)
    .slice(0, 8)
    .map(d => ({
      name: d.departmentName.length > 12 ? d.departmentName.slice(0, 12) + '…' : d.departmentName,
      fullName: d.departmentName,
      students: d.totalStudents,
      avgScore: d.avgMockDriveScore != null ? Math.round(d.avgMockDriveScore) : 0,
      aptitude: d.aptitudeSessions,
      coding: d.codingSessions,
      aiInterview: d.aiInterviewSessions,
    }));

  return (
    <Card className="border-none shadow-lg glass-effect">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Department Breakdown</CardTitle>
        <CardDescription>Practice activity by department (top 8)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              width={70}
            />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(val: number, name: string) => {
                const labels: Record<string, string> = {
                  aptitude: 'Aptitude Sessions',
                  coding: 'Coding Sessions',
                  aiInterview: 'AI Interviews',
                };
                return [val, labels[name] ?? name] as [number, string];
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
            <Bar dataKey="aptitude" name="Aptitude" fill="#f59e0b" stackId="a" radius={[0, 0, 0, 0]} />
            <Bar dataKey="coding" name="Coding" fill="#ef4444" stackId="a" />
            <Bar dataKey="aiInterview" name="AI Interview" fill="#8b5cf6" stackId="a" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
