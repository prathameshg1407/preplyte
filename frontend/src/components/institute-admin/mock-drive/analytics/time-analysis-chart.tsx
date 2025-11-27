// src/components/institute-admin/mock-drive/analytics/time-analysis-chart.tsx

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
  ReferenceLine,
} from 'recharts';
import { TimeAnalysis } from '@/types/admin.mockdrive.types';
import { MODULE_TYPE_CONFIG } from '@/lib/constants/admin.mockdrive.constants';

interface TimeAnalysisChartProps {
  data: TimeAnalysis | undefined;
}

export function TimeAnalysisChart({ data }: TimeAnalysisChartProps) {
  const chartData = useMemo(() => {
    if (!data?.byModule) return [];
    return data.byModule.map((module) => ({
      name: module.moduleName,
      type: MODULE_TYPE_CONFIG[module.moduleType]?.label || module.moduleType,
      timeLimit: module.timeLimit,
      avgTimeUsed: module.averageTimeUsed || 0,
      usagePercentage: module.averageTimeUsedPercentage || 0,
    }));
  }, [data]);

  if (!data || chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        No time data available
      </div>
    );
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-4">
      {/* Overall Stats */}
      {data.overall && (
        <div className="grid grid-cols-3 gap-4 rounded-lg border p-4">
          <div className="text-center">
            <div className="text-2xl font-bold">
              {data.overall.averageDuration
                ? formatTime(data.overall.averageDuration)
                : '-'}
            </div>
            <div className="text-xs text-muted-foreground">Average Duration</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {data.overall.minDuration
                ? formatTime(data.overall.minDuration)
                : '-'}
            </div>
            <div className="text-xs text-muted-foreground">Fastest</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {data.overall.maxDuration
                ? formatTime(data.overall.maxDuration)
                : '-'}
            </div>
            <div className="text-xs text-muted-foreground">Slowest</div>
          </div>
        </div>
      )}

      {/* Module Time Chart */}
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
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              label={{
                value: 'Minutes',
                position: 'bottom',
                style: { fontSize: 12 },
              }}
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
                      <div className="mt-2 space-y-1 text-sm">
                        <p>Time Limit: {data.timeLimit} min</p>
                        <p>Avg Used: {data.avgTimeUsed.toFixed(1)} min</p>
                        <p>Usage: {data.usagePercentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="timeLimit"
              name="Time Limit"
              fill="#e5e7eb"
              radius={[0, 4, 4, 0]}
            />
            <Bar
              dataKey="avgTimeUsed"
              name="Avg Time Used"
              fill="#3b82f6"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}