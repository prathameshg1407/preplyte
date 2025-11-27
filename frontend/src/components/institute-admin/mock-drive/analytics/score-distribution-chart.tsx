// src/components/institute-admin/mock-drive/analytics/score-distribution-chart.tsx

'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { ScoreDistribution } from '@/types/admin.mockdrive.types';

interface ScoreDistributionChartProps {
  data: ScoreDistribution | undefined;
}

const COLORS = [
  '#ef4444', // 0-20 red
  '#f97316', // 20-40 orange
  '#eab308', // 40-60 yellow
  '#22c55e', // 60-80 green
  '#3b82f6', // 80-100 blue
];

export function ScoreDistributionChart({ data }: ScoreDistributionChartProps) {
  const chartData = useMemo(() => {
    if (!data?.ranges) return [];
    return data.ranges.map((range, index) => ({
      name: range.label,
      count: range.count,
      percentage: range.percentage,
      color: COLORS[index % COLORS.length],
    }));
  }, [data]);

  if (!data || chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            label={{
              value: 'Students',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: 12 },
            }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-lg">
                    <p className="font-medium">{data.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {data.count} students ({data.percentage.toFixed(1)}%)
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Total: {data.totalStudents} students
      </p>
    </div>
  );
}