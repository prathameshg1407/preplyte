// src/app/institute-admin/mock-drives/[driveId]/analytics/page.tsx

'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { AnalyticsOverviewCards } from '@/components/institute-admin/mock-drive/analytics/analytics-overview-cards';
import { ScoreDistributionChart } from '@/components/institute-admin/mock-drive/analytics/score-distribution-chart';
import { ModulePerformanceChart } from '@/components/institute-admin/mock-drive/analytics/module-performance-chart';
import { BatchComparisonChart } from '@/components/institute-admin/mock-drive/analytics/batch-comparison-chart';
import { TimeAnalysisChart } from '@/components/institute-admin/mock-drive/analytics/time-analysis-chart';
import { DepartmentBreakdownTable } from '@/components/institute-admin/mock-drive/analytics/department-breakdown-table';
import { useMockDriveDetail } from '@/lib/hooks/institute-admin/use-mockdrive';
import { useAnalyticsDashboard } from '@/lib/hooks/institute-admin/use-mockdrive-analytics';
import { useBatches } from '@/lib/hooks/institute-admin/use-mockdrive-batches';
import { ArrowLeft, RefreshCcw, BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
  const params = useParams();
  const driveId = params.driveId as string;

  // Fetch mock drive details
  const { data: drive, isLoading: isDriveLoading } = useMockDriveDetail(driveId);

  // Fetch batches for filter
  const { data: batchesData } = useBatches(driveId);
  const batches = batchesData?.data ?? [];

  // Analytics hook
  const {
    overview,
    scoreDistribution,
    modulePerformance,
    batchComparison,
    timeAnalysis,
    departmentBreakdown,
    isLoading,
    selectedBatchId,
    selectBatch,
    clearBatchFilter,
    refetch,
  } = useAnalyticsDashboard(driveId);

  if (isDriveLoading || isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-card/30 p-8 shadow-sm backdrop-blur-md sm:p-10">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl opacity-50" />
        
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              asChild 
              className="h-12 w-12 rounded-2xl bg-background/50 border border-border/40 hover:bg-background/80"
            >
              <Link href={`/institute-admin/mock-drives/${driveId}`}>
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-gradient">Drive Analytics</h1>
              <div className="flex items-center gap-2 text-muted-foreground/80 font-medium">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/40" />
                {drive?.title}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Batch Filter */}
            <Select
              value={selectedBatchId || 'all'}
              onValueChange={(value) =>
                value === 'all' ? clearBatchFilter() : selectBatch(value)
              }
            >
              <SelectTrigger className="h-12 w-56 rounded-2xl border-border/40 bg-background/50 backdrop-blur-sm px-4 font-semibold hover:bg-background/80">
                <SelectValue placeholder="All Batches" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-border/40 shadow-xl">
                <SelectItem value="all">All Batches</SelectItem>
                {batches.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id}>
                    {batch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => refetch()}
              className="h-12 w-12 rounded-2xl border-border/40 bg-background/50 backdrop-blur-sm hover:bg-background/80"
            >
              <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <section className="space-y-6">
        <div className="flex items-center gap-4 px-1">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
            Key Performance Indicators
          </h2>
          <div className="h-px flex-1 bg-border/40" />
        </div>
        <AnalyticsOverviewCards overview={overview} />
      </section>

      {/* Charts Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Score Distribution */}
        <Card className="glass-card overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold">Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ScoreDistributionChart data={scoreDistribution} />
          </CardContent>
        </Card>

        {/* Module Performance */}
        <Card className="glass-card overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold">Module Intelligence</CardTitle>
          </CardHeader>
          <CardContent>
            <ModulePerformanceChart data={modulePerformance} />
          </CardContent>
        </Card>
      </div>

      {/* Batch Comparison (only show if no batch is selected) */}
      {!selectedBatchId && batchComparison && batchComparison.length > 0 && (
        <Card className="glass-card overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Batch Comparative Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <BatchComparisonChart data={batchComparison} />
          </CardContent>
        </Card>
      )}

      {/* Time Analysis */}
      {timeAnalysis && (
        <Card className="glass-card overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Time Depth Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <TimeAnalysisChart data={timeAnalysis} />
          </CardContent>
        </Card>
      )}

      {/* Department Breakdown */}
      {departmentBreakdown && departmentBreakdown.length > 0 && (
        <Card className="glass-card overflow-hidden border-none shadow-sm">
          <CardHeader className="px-0">
            <div className="flex items-center gap-4 px-1">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
                Departmental Insights
              </h2>
              <div className="h-px flex-1 bg-border/40" />
            </div>
          </CardHeader>
          <CardContent className="px-0 rounded-3xl border border-border/40 bg-card/20 overflow-hidden">
            <DepartmentBreakdownTable data={departmentBreakdown} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}


function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10" />
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-1 h-4 w-32" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
      <Skeleton className="h-80" />
    </div>
  );
}