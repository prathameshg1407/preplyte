'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { MonthlyDriveData } from '@/lib/hooks/institute-admin/use-institute-analytics';

interface DrivesOverTimeChartProps {
  data: MonthlyDriveData[];
}

export function DrivesOverTimeChart({ data }: DrivesOverTimeChartProps) {
  return (
    <Card className="border-none shadow-lg glass-effect">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Activity Over Time</CardTitle>
        <CardDescription>Mock drive creation, registrations & completions (last 12 months)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600, marginBottom: 4 }}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
            />
            <Bar dataKey="drives" name="Drives Created" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="registrations" name="Registrations" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="completions" name="Completions" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
