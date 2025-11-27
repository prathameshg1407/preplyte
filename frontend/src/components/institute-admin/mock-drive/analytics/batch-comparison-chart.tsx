// src/components/institute-admin/mock-drive/analytics/batch-comparison-chart.tsx

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
  Legend,
} from 'recharts';
import { BatchComparison } from '@/types/admin.mockdrive.types';

interface BatchComparisonChartProps {
  data: BatchComparison[] | undefined;
}

export function BatchComparisonChart({ data }: BatchComparisonChartProps) {
  const chartData = useMemo(() => {
    if (!data) return [];
    return data.map((batch) => ({
      name: batch.batchName,
      students: batch.totalStudents,
      completed: batch.completedStudents,
      avgScore: batch.averagePercentage || 0,
      passRate: batch.passRate || 0,
    }));
  }, [data]);

  if (!data || chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        No batch data available
      </div>
    );
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-lg">
                    <p className="font-medium">{data.name}</p>
                    <div className="mt-2 space-y-1 text-sm">
                      <p>Total Students: {data.students}</p>
                      <p>Completed: {data.completed}</p>
                      <p>Avg Score: {data.avgScore.toFixed(1)}%</p>
                      <p>Pass Rate: {data.passRate.toFixed(1)}%</p>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
          <Bar
            dataKey="avgScore"
            name="Avg Score %"
            fill="#8b5cf6"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="passRate"
            name="Pass Rate %"
            fill="#06b6d4"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}