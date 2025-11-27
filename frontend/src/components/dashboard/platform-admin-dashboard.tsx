// src/components/dashboard/platform-admin-dashboard.tsx

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import {
  Building2,
  Users,
  Activity,
  GraduationCap,
  ArrowRight,
  Brain,
  Code,
  MessageSquare,
  TrendingUp,
  Plus,
  Settings,
  FileBarChart,
} from 'lucide-react';
import { useAnalytics, useInstitutes } from '../../lib/hooks/use-admin';
import { TrendsChart } from '../admin/analytics/trends-chart';

export function PlatformAdminDashboard() {
  const router = useRouter();
  const { analytics, loading: analyticsLoading, fetchAnalytics } = useAnalytics();
  const { 
    institutes, 
    loading: institutesLoading, 
    fetchInstitutes 
  } = useInstitutes();

  useEffect(() => {
    fetchAnalytics();
    fetchInstitutes({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' });
  }, []);

  const totalSessions = 
    (analytics?.sessions.totalAptitudeSessions || 0) +
    (analytics?.sessions.totalMachineSessions || 0) +
    (analytics?.sessions.totalInterviewSessions || 0);

  const completedSessions = 
    (analytics?.sessions.completedAptitudeSessions || 0) +
    (analytics?.sessions.completedMachineSessions || 0) +
    (analytics?.sessions.completedInterviewSessions || 0);

  const completionRate = totalSessions > 0 
    ? Math.round((completedSessions / totalSessions) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Platform Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor and manage the entire platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/institutes">Institutes</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/admin/users">Users</Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      {analyticsLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-border">
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-20 mb-3" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Institutes"
            value={analytics?.overview.totalInstitutes || 0}
            subValue={`${analytics?.overview.activeInstitutes || 0} active`}
            icon={Building2}
          />
          <StatCard
            label="Users"
            value={analytics?.overview.totalUsers || 0}
            subValue={`${analytics?.overview.activeUsers || 0} active`}
            icon={Users}
          />
          <StatCard
            label="Sessions"
            value={totalSessions}
            subValue={`${completionRate}% completed`}
            icon={Activity}
          />
          <StatCard
            label="Students"
            value={analytics?.overview.totalStudents || 0}
            subValue={`${analytics?.overview.totalInstituteAdmins || 0} admins`}
            icon={GraduationCap}
          />
        </div>
      )}

      {/* Session Stats */}
      <div className="grid gap-4 lg:grid-cols-3">
        <SessionStatCard
          title="Aptitude Tests"
          icon={Brain}
          total={analytics?.sessions.totalAptitudeSessions || 0}
          completed={analytics?.sessions.completedAptitudeSessions || 0}
          avgScore={analytics?.performance.avgAptitudeScore || 0}
        />
        <SessionStatCard
          title="Coding Tests"
          icon={Code}
          total={analytics?.sessions.totalMachineSessions || 0}
          completed={analytics?.sessions.completedMachineSessions || 0}
          avgScore={analytics?.performance.avgMachineScore || 0}
        />
        <SessionStatCard
          title="AI Interviews"
          icon={MessageSquare}
          total={analytics?.sessions.totalInterviewSessions || 0}
          completed={analytics?.sessions.completedInterviewSessions || 0}
          avgScore={analytics?.performance.avgInterviewScore || 0}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Institutes */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base font-medium">Recent Institutes</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/institutes">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {institutesLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-md" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-28 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : institutes.length === 0 ? (
              <EmptyState
                icon={Building2}
                message="No institutes yet"
                action={
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/admin/institutes/new">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Institute
                    </Link>
                  </Button>
                }
              />
            ) : (
              <div className="space-y-1">
                {institutes.slice(0, 5).map((institute) => (
                  <div
                    key={institute.id}
                    className="flex items-center justify-between p-3 -mx-3 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/admin/institutes/${institute.id}`)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-md border border-border flex items-center justify-center shrink-0">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{institute.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{institute.domain}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-medium tabular-nums">{institute._count.users}</p>
                        <p className="text-xs text-muted-foreground">users</p>
                      </div>
                      <span className={`h-2 w-2 rounded-full ${institute.isActive ? 'bg-foreground' : 'bg-muted-foreground/30'}`} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Trends */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base font-medium">Activity Trends</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Last 30 days</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/reports">
                Reports
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {analyticsLoading || !analytics ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : (
              <div className="space-y-6">
                <TrendSection
                  label="User Registrations"
                  total={analytics.trends.userRegistrations.reduce((sum, item) => sum + item.count, 0)}
                  data={analytics.trends.userRegistrations}
                />
                <TrendSection
                  label="Session Activity"
                  total={analytics.trends.sessionActivity.reduce((sum, item) => sum + item.count, 0)}
                  data={analytics.trends.sessionActivity}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/institutes/new">
            <Building2 className="h-4 w-4 mr-2" />
            Add Institute
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/users/new">
            <Users className="h-4 w-4 mr-2" />
            Add User
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/reports">
            <FileBarChart className="h-4 w-4 mr-2" />
            View Reports
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Link>
        </Button>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  label,
  value,
  subValue,
  icon: Icon,
}: {
  label: string;
  value: number;
  subValue: string;
  icon: React.ElementType;
}) {
  return (
    <Card className="border-border">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-semibold tabular-nums mt-1">
              {value.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{subValue}</p>
          </div>
          <div className="h-9 w-9 rounded-md border border-border flex items-center justify-center">
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Session Stat Card Component
function SessionStatCard({
  title,
  icon: Icon,
  total,
  completed,
  avgScore,
}: {
  title: string;
  icon: React.ElementType;
  total: number;
  completed: number;
  avgScore: number;
}) {
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Card className="border-border">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium">{title}</span>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xl font-semibold tabular-nums">{total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div>
            <p className="text-xl font-semibold tabular-nums">{completionRate}%</p>
            <p className="text-xs text-muted-foreground">Complete</p>
          </div>
          <div>
            <p className="text-xl font-semibold tabular-nums">{avgScore.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">Avg Score</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Trend Section Component
function TrendSection({
  label,
  total,
  data,
}: {
  label: string;
  total: number;
  data: Array<{ date: string; count: number }>;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">{total.toLocaleString()}</span>
      </div>
      <div className="h-20">
        <TrendsChart data={data} compact color={''} />
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({
  icon: Icon,
  message,
  action,
}: {
  icon: React.ElementType;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="h-10 w-10 rounded-full border border-border flex items-center justify-center mb-3">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground mb-3">{message}</p>
      {action}
    </div>
  );
}