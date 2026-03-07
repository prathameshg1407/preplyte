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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 pb-20"
    >
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-card/30 p-8 shadow-sm backdrop-blur-md sm:p-10">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-primary/10 p-2.5 text-primary shadow-sm border border-primary/20">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-gradient sm:text-5xl">
                Institute Analytics
              </h1>
            </div>
            <p className="max-w-2xl text-lg text-muted-foreground/80 leading-relaxed font-medium">
              A comprehensive intelligence dashboard monitoring performance across mock drives, 
              aptitude training, and AI interviews.
            </p>
          </div>
          <Button
            variant="outline"
            size="lg"
            onClick={() => refetch()}
            disabled={isFetching}
            className="group h-12 gap-2 rounded-2xl border-border/40 bg-background/50 backdrop-blur-sm px-6 hover:bg-background/80"
          >
            <RefreshCw className={`h-4 w-4 transition-transform group-hover:rotate-180 ${isFetching ? 'animate-spin' : ''}`} />
            <span className="font-semibold">Refresh Intelligence</span>
          </Button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <section className="space-y-6">
        <div className="flex items-center gap-4 px-1">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
            Performance Overview
          </h2>
          <div className="h-px flex-1 bg-border/40" />
        </div>
        <OverviewStatsCards summary={data.summary} practiceStats={data.practiceStats} />
      </section>

      {/* Practice Modules Analytics */}
      <section className="space-y-6">
        <div className="flex items-center gap-4 px-1">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
            Practice Intelligence
          </h2>
          <div className="h-px flex-1 bg-border/40" />
        </div>
        <div className="rounded-3xl border border-border/40 bg-card/20 p-1 shadow-sm transition-all duration-300 hover:shadow-md">
          <PracticeActivityChart stats={data.practiceStats} />
        </div>
      </section>

      {/* Charts Row 1: Trends */}
      <section className="space-y-6">
        <div className="flex items-center gap-4 px-1">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
            Trend Analysis
          </h2>
          <div className="h-px flex-1 bg-border/40" />
        </div>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-border/40 bg-card/20 p-1">
            <DrivesOverTimeChart data={data.drivesOverTime} />
          </div>
          <div className="rounded-3xl border border-border/40 bg-card/20 p-1">
            <ScoreDistributionChart
              buckets={data.scoreDistribution.buckets}
              totalStudents={data.scoreDistribution.totalStudents}
            />
          </div>
        </div>
      </section>

      {/* Charts Row 2: Mock Drive Depth */}
      <section className="space-y-6">
        <div className="flex items-center gap-4 px-1">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
            Mock Drive Context
          </h2>
          <div className="h-px flex-1 bg-border/40" />
        </div>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-border/40 bg-card/20 p-1">
            <DriveComparisonChart data={data.driveComparison} />
          </div>
          <div className="rounded-3xl border border-border/40 bg-card/20 p-1">
            <DepartmentPerformanceChart data={data.departmentPerformance} />
          </div>
        </div>
      </section>

      {/* Top Performers Table */}
      <section className="space-y-6">
        <div className="flex items-center gap-4 px-1">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
            Student Leaderboard
          </h2>
          <div className="h-px flex-1 bg-border/40" />
        </div>
        <div className="rounded-3xl border border-border/40 bg-card/20 overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md">
          <TopPerformersTable performers={data.topPerformers} />
        </div>
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
