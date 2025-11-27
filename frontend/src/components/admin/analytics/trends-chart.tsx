// src/components/admin/analytics/trends-chart.tsx

'use client';

import { cn } from '@/lib/utils';
import type { TrendData } from '../../../types/admin.types';

interface TrendsChartProps {
  data: TrendData[];
  compact?: boolean;
  color?: string;
}

export function TrendsChart({ data, compact = false }: TrendsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.count), 1);

  // For compact mode (inline small chart)
  if (compact) {
    return (
      <div className="h-full flex items-end gap-[2px]">
        {data.map((item, index) => {
          const height = (item.count / maxValue) * 100;
          return (
            <div
              key={index}
              className="flex-1 relative group"
              title={`${new Date(item.date).toLocaleDateString()}: ${item.count}`}
            >
              <div
                className="w-full bg-foreground/80 rounded-t-[1px] transition-all hover:bg-foreground"
                style={{ height: `${Math.max(height, 1)}%` }}
              />
            </div>
          );
        })}
      </div>
    );
  }

  // Full chart mode
  return (
    <div className="space-y-3">
      {/* Chart */}
      <div className="h-48 flex items-end gap-1 px-1">
        {data.map((item, index) => {
          const height = (item.count / maxValue) * 100;
          const date = new Date(item.date);
          const isFirstOfMonth = date.getDate() === 1;
          
          return (
            <div
              key={index}
              className="flex-1 relative group"
            >
              <div
                className={cn(
                  "w-full rounded-t-sm transition-all",
                  "bg-foreground/70 hover:bg-foreground",
                  isFirstOfMonth && "bg-foreground"
                )}
                style={{ height: `${Math.max(height, 2)}%` }}
              />
              
              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 pointer-events-none">
                <div className="bg-foreground text-background text-xs rounded px-2 py-1 whitespace-nowrap">
                  <div className="font-medium tabular-nums">{item.count.toLocaleString()}</div>
                  <div className="text-[10px] opacity-80">
                    {date.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px]">
                  <div className="border-4 border-transparent border-t-foreground" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between text-[10px] text-muted-foreground px-1">
        <span>{new Date(data[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        <span>{new Date(data[data.length - 1].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
      </div>

      {/* Grid lines (optional, subtle) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="h-full flex flex-col justify-between">
          {[0, 25, 50, 75, 100].map((percent) => (
            <div 
              key={percent} 
              className="border-t border-border/20" 
              style={{ marginTop: percent === 0 ? 0 : -1 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}