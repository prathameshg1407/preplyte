'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { DriveComparison } from '@/lib/hooks/institute-admin/use-institute-analytics';

interface DriveComparisonChartProps {
  data: DriveComparison[];
}

export function DriveComparisonChart({ data }: DriveComparisonChartProps) {
  const chartData = data.map(d => ({
    name: d.driveName.length > 14 ? d.driveName.slice(0, 14) + '…' : d.driveName,
    fullName: d.driveName,
    avgScore: d.avgScore != null ? Math.round(d.avgScore) : 0,
    completionRate: Math.round(d.completionRate),
    students: d.totalStudents,
    status: d.status,
  }));

  return (
    <Card className="border-none shadow-lg glass-effect">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Mock Drive Comparison</CardTitle>
        <CardDescription>Average score vs completion rate (last 10 drives)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(val: number, name: string) => [`${val}%`, name === 'avgScore' ? 'Avg Score' : 'Completion Rate'] as [string, string]}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
              formatter={(value) => value === 'avgScore' ? 'Avg Score' : 'Completion Rate'}
            />
            <ReferenceLine y={60} stroke="#3b82f6" strokeDasharray="4 4" strokeWidth={1} label={{ value: '60%', fill: '#3b82f6', fontSize: 10 }} />
            <Bar dataKey="avgScore" name="avgScore" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="completionRate" name="completionRate" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
