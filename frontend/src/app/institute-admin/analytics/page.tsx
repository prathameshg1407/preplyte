'use client';

import { motion, AnimatePresence } from 'framer-motion';
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-12"
    >
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 flex items-center gap-3">
            <BarChart3 className="h-9 w-9 text-primary" />
            Institute Analytics
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl">
            Comprehensive view of your institute's performance across mock drives, aptitude practice, coding exercises, and AI interviews.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-2 self-start"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* KPI Overview Cards */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground/60 px-1">
          Overview
        </h2>
        <OverviewStatsCards summary={data.summary} practiceStats={data.practiceStats} />
      </section>

      {/* Practice Modules Analytics (tabbed) */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground/60 px-1">
          Practice Modules
        </h2>
        <PracticeActivityChart stats={data.practiceStats} />
      </section>

      {/* Charts Row 1 */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground/60 px-1">
          Trends
        </h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <DrivesOverTimeChart data={data.drivesOverTime} />
          <ScoreDistributionChart
            buckets={data.scoreDistribution.buckets}
            totalStudents={data.scoreDistribution.totalStudents}
          />
        </div>
      </section>

      {/* Charts Row 2 */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground/60 px-1">
          Mock Drives
        </h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <DriveComparisonChart data={data.driveComparison} />
          <DepartmentPerformanceChart data={data.departmentPerformance} />
        </div>
      </section>

      {/* Top Performers Table */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground/60 px-1">
          Students
        </h2>
        <TopPerformersTable performers={data.topPerformers} />
      </section>
    </motion.div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      {/* Practice Chart */}
      <Skeleton className="h-80 rounded-lg" />
      {/* Chart Rows */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-72 rounded-lg" />
        <Skeleton className="h-72 rounded-lg" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-72 rounded-lg" />
        <Skeleton className="h-72 rounded-lg" />
      </div>
      {/* Performers Table */}
      <Skeleton className="h-64 rounded-lg" />
    </div>
  );
}
