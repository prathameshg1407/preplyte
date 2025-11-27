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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/institute-admin/mock-drives/${driveId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
            <p className="text-sm text-muted-foreground">{drive?.title}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {/* Batch Filter */}
          <Select
            value={selectedBatchId || 'all'}
            onValueChange={(value) =>
              value === 'all' ? clearBatchFilter() : selectBatch(value)
            }
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Batches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Batches</SelectItem>
              {batches.map((batch) => (
                <SelectItem key={batch.id} value={batch.id}>
                  {batch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <AnalyticsOverviewCards overview={overview} />

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ScoreDistributionChart data={scoreDistribution} />
          </CardContent>
        </Card>

        {/* Module Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Module Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ModulePerformanceChart data={modulePerformance} />
          </CardContent>
        </Card>
      </div>

      {/* Batch Comparison (only show if no batch is selected) */}
      {!selectedBatchId && batchComparison && batchComparison.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Batch Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <BatchComparisonChart data={batchComparison} />
          </CardContent>
        </Card>
      )}

      {/* Time Analysis */}
      {timeAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle>Time Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <TimeAnalysisChart data={timeAnalysis} />
          </CardContent>
        </Card>
      )}

      {/* Department Breakdown */}
      {departmentBreakdown && departmentBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Department Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
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