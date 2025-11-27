// src/app/admin/page.tsx

'use client';

import { useEffect } from 'react';
import { useAnalytics } from '@/lib/hooks/use-admin';
import { StatsCards } from '@/components/admin/analytics/stats-cards';
import { SessionsOverview } from '@/components/admin/analytics/sessions-overview';
import { PerformanceCards } from '@/components/admin/analytics/performance-cards';
import { TrendsChart } from '@/components/admin/analytics/trends-chart';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  const { analytics, loading, fetchAnalytics } = useAnalytics();

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading && !analytics) {
    return <DashboardSkeleton />;
  }

  if (!analytics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="h-12 w-12 rounded-full border border-border flex items-center justify-center">
          <AlertCircle className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="text-center space-y-1">
          <p className="font-medium">Failed to load analytics</p>
          <p className="text-sm text-muted-foreground">
            Unable to retrieve platform data
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => fetchAnalytics()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Platform Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor and manage the entire platform
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards overview={analytics.overview} />

      {/* Sessions & Performance */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SessionsOverview sessions={analytics.sessions} />
        <PerformanceCards performance={analytics.performance} />
      </div>

      {/* Trends */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium">User Registrations</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Last 30 days
                </p>
              </div>
              <div className="h-48">
                <TrendsChart
                  data={analytics.trends.userRegistrations}
                  compact={false} color={''}                />
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-xs text-muted-foreground">Total</span>
                <span className="text-sm font-medium tabular-nums">
                  {analytics.trends.userRegistrations.reduce(
                    (sum, item) => sum + item.count, 0
                  ).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium">Session Activity</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Last 30 days
                </p>
              </div>
              <div className="h-48">
                <TrendsChart
                  data={analytics.trends.sessionActivity}
                  compact={false} color={''}                />
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-xs text-muted-foreground">Total</span>
                <span className="text-sm font-medium tabular-nums">
                  {analytics.trends.sessionActivity.reduce(
                    (sum, item) => sum + item.count, 0
                  ).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-border">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sessions & Performance Skeleton */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border">
          <CardContent className="pt-6">
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trends Skeleton */}
      <div className="grid gap-4 lg:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="border-border">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20 mt-1" />
                </div>
                <Skeleton className="h-48 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}