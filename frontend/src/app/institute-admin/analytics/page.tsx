'use client';

import { AlertCircle, BarChart3, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useInstituteAnalytics } from '@/lib/hooks/institute-admin/use-institute-analytics';
import { OverviewStatsCards } from '@/components/institute-admin/analytics/overview-stats-cards';
import { DrivesOverTimeChart } from '@/components/institute-admin/analytics/drives-over-time-chart';
import { ScoreDistributionChart } from '@/components/institute-admin/analytics/score-distribution-chart';
import { DepartmentPerformanceChart } from '@/components/institute-admin/analytics/department-performance-chart';
import { TopPerformersTable } from '@/components/institute-admin/analytics/top-performers-table';
import { DriveComparisonChart } from '@/components/institute-admin/analytics/drive-comparison-chart';
import { PracticeActivityChart } from '@/components/institute-admin/analytics/practice-activity-chart';

export default function InstituteAnalyticsPage() {
  const { data, isLoading, isError, refetch, isFetching } = useInstituteAnalytics();

  if (isLoading) return <AnalyticsSkeleton />;

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="h-12 w-12 rounded-full border border-border flex items-center justify-center">
          <AlertCircle className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="text-center space-y-1">
          <p className="font-medium">Failed to load analytics</p>
          <p className="text-sm text-muted-foreground">Unable to retrieve institute analytics data</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header (Matched to Base Branch) */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Institute Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor performance across mock drives, aptitude training, and AI interviews.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* KPI Overview Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Performance Overview</h2>
        <OverviewStatsCards summary={data.summary} practiceStats={data.practiceStats} />
      </div>

      {/* Practice Modules Analytics */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Practice Intelligence</h2>
        <PracticeActivityChart stats={data.practiceStats} />
      </div>

      {/* Charts Row 1: Trends */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Trend Analysis</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <DrivesOverTimeChart data={data.drivesOverTime} />
          <ScoreDistributionChart
            buckets={data.scoreDistribution.buckets}
            totalStudents={data.scoreDistribution.totalStudents}
          />
        </div>
      </div>

      {/* Charts Row 2: Mock Drive Depth */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Mock Drive Context</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <DriveComparisonChart data={data.driveComparison} />
          <DepartmentPerformanceChart data={data.departmentPerformance} />
        </div>
      </div>

      {/* Top Performers Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Student Leaderboard</h2>
        <TopPerformersTable performers={data.topPerformers} />
      </div>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      
      {/* KPI Cards */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Practice Chart */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-80 rounded-xl" />
      </div>

      {/* Chart Rows */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>

      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>

      {/* Performers Table */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}