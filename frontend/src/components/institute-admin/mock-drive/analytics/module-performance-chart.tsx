// src/components/institute-admin/mock-drive/analytics/module-performance-chart.tsx

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
import { ModulePerformance } from '@/types/admin.mockdrive.types';
import { MODULE_TYPE_CONFIG } from '@/lib/constants/admin.mockdrive.constants';

interface ModulePerformanceChartProps {
  data: ModulePerformance[] | undefined;
}

export function ModulePerformanceChart({ data }: ModulePerformanceChartProps) {
  const chartData = useMemo(() => {
    if (!data) return [];
    return data.map((module) => ({
      name: module.moduleName,
      type: MODULE_TYPE_CONFIG[module.moduleType]?.label || module.moduleType,
      avgScore: module.stats.averagePercentage || 0,
      passRate: module.stats.passRate || 0,
      completionRate: module.stats.completionRate || 0,
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
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          layout="vertical"
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            dataKey="name"
            type="category"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={100}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-lg">
                    <p className="font-medium">{data.name}</p>
                    <p className="text-xs text-muted-foreground">{data.type}</p>
                    <div className="mt-2 space-y-1 text-sm">
                      <p>Avg Score: {data.avgScore.toFixed(1)}%</p>
                      <p>Pass Rate: {data.passRate.toFixed(1)}%</p>
                      <p>Completion: {data.completionRate.toFixed(1)}%</p>
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
            fill="#3b82f6"
            radius={[0, 4, 4, 0]}
          />
          <Bar
            dataKey="passRate"
            name="Pass Rate %"
            fill="#22c55e"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}