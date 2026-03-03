'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { ScoreBucket } from '@/lib/hooks/institute-admin/use-institute-analytics';

interface ScoreDistributionChartProps {
  buckets: ScoreBucket[];
  totalStudents: number;
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];

export function ScoreDistributionChart({ buckets, totalStudents }: ScoreDistributionChartProps) {
  return (
    <Card className="border-none shadow-lg glass-effect">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Score Distribution</CardTitle>
        <CardDescription>
          How {totalStudents} students scored across all mock drives
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={buckets} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
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
              formatter={(val: number, _: string, entry) => [
                `${entry.payload.count} students (${val.toFixed(1)}%)`, 'Students'
              ]}
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
            />
            <Bar dataKey="percentage" name="Students %" radius={[6, 6, 0, 0]}>
              {buckets.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
