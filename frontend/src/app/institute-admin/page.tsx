'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, BarChart3, Users, Calendar, FileText, TrendingUp, AlertCircle } from 'lucide-react';
import { useInstituteAdminDashboard } from '@/lib/hooks/institute-admin/use-institute-admin-dashboard';

export default function InstituteAdminDashboard() {
  const { data, isLoading, error, refetch } = useInstituteAdminDashboard();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="h-12 w-12 rounded-full border border-border flex items-center justify-center">
          <AlertCircle className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="text-center space-y-1">
          <p className="font-medium">Failed to load dashboard</p>
          <p className="text-sm text-muted-foreground">Unable to retrieve data</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  const { stats } = data;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back! Here's an overview of your mock drives and events.
          </p>
        </div>
        <Button asChild>
          <Link href="/institute-admin/mock-drives/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Mock Drive
          </Link>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Mock Drives"
          value={stats.totalDrives}
          change={`+${stats.drivesThisMonth} this month`}
          icon={FileText}
        />
        <StatCard
          title="Active Drives"
          value={stats.activeDrives}
          change={`${stats.upcomingDrives} upcoming`}
          icon={Calendar}
        />
        <StatCard
          title="Total Registrations"
          value={stats.totalRegistrations}
          change={`+${stats.registrationsThisMonth} this month`}
          icon={Users}
        />
        <StatCard
          title="Avg. Score"
          value={`${stats.avgScore.toFixed(1)}%`}
          change={`${stats.scoreChange >= 0 ? '+' : ''}${stats.scoreChange.toFixed(1)}% from last drive`}
          icon={TrendingUp}
        />
      </div>

      {/* Quick Actions - Updated to 4 columns to fit Prathamesh's Event Hub */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <QuickActionCard
          title="Create Mock Drive"
          description="Set up a new mock placement drive for your students"
          icon={Plus}
          href="/institute-admin/mock-drives/new"
          buttonText="Get Started"
          buttonVariant="default"
        />
        <QuickActionCard
          title="Manage Drives"
          description="View and manage all your mock drives"
          icon={FileText}
          href="/institute-admin/mock-drives"
          buttonText="View All Drives"
          buttonVariant="outline"
        />
        <QuickActionCard
          title="Analytics"
          description="View detailed analytics and reports"
          icon={BarChart3}
          href="/institute/analytics"
          buttonText="View Analytics"
          buttonVariant="outline"
        />
        {/* Prathamesh's Job & Event Hub Feature mapped to Base UI */}
        <QuickActionCard
          title="Event Hub"
          description="Manage Jobs, Internships & Hackathons"
          icon={Calendar}
          href="/institute-admin/events"
          buttonText="View Events"
          buttonVariant="outline"
        />
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  change: string;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tabular-nums">{value}</div>
        <p className="text-xs text-muted-foreground">{change}</p>
      </CardContent>
    </Card>
  );
}

function QuickActionCard({
  title,
  description,
  icon: Icon,
  href,
  buttonText,
  buttonVariant,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  buttonText: string;
  buttonVariant: 'default' | 'outline';
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild variant={buttonVariant} className="w-full">
          <Link href={href}>{buttonText}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-48 mb-4" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}