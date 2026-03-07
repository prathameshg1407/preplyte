'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnalytics, useInstitutes } from '@/lib/hooks/use-admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Building2,
  Users,
  Activity,
  GraduationCap,
  ArrowRight,
  Brain,
  Code,
  MessageSquare,
  Plus,
  Settings,
  FileBarChart,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { TrendsChart } from '@/components/admin/analytics/trends-chart';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
  const router = useRouter();
  const { analytics, loading: analyticsLoading, fetchAnalytics } = useAnalytics();
  const { institutes, loading: institutesLoading, fetchInstitutes } = useInstitutes();

  useEffect(() => {
    fetchAnalytics();
    fetchInstitutes({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' });
  }, [fetchAnalytics, fetchInstitutes]);

  if (analyticsLoading && !analytics) {
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
          <p className="text-sm text-muted-foreground">Unable to retrieve platform data</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchAnalytics()}>
          Try Again
        </Button>
      </div>
    );
  }

  const totalSessions =
    (analytics.sessions.totalAptitudeSessions || 0) +
    (analytics.sessions.totalMachineSessions || 0) +
    (analytics.sessions.totalInterviewSessions || 0);

  const completedSessions =
    (analytics.sessions.completedAptitudeSessions || 0) +
    (analytics.sessions.completedMachineSessions || 0) +
    (analytics.sessions.completedInterviewSessions || 0);

  const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 pb-12"
    >
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Platform Hub
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl">
            Real-time analytics and ecosystem management across all integrated institutes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="glass-effect border-primary/20 hover:bg-primary/5" asChild>
            <Link href="/admin/institutes">
              <Building2 className="mr-2 h-4 w-4" />
              Institutes
            </Link>
          </Button>
          <Button className="shadow-xl shadow-primary/20 gap-2" asChild>
            <Link href="/admin/users">
              <Plus className="h-4 w-4" />
              New User
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid - Premium Glass Cards */}
      <motion.div 
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
          }
        }}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          label="Total Institutes"
          value={analytics.overview.totalInstitutes || 0}
          subValue={`${analytics.overview.activeInstitutes || 0} active platforms`}
          icon={Building2}
          color="primary"
        />
        <StatCard
          label="Global User Base"
          value={analytics.overview.totalUsers || 0}
          subValue={`+${analytics.overview.activeUsers || 0} online today`}
          icon={Users}
          color="blue"
        />
        <StatCard
          label="Knowledge Sessions"
          value={totalSessions}
          subValue={`${completionRate}% retention rate`}
          icon={Activity}
          color="emerald"
        />
        <StatCard
          label="Enrolled Students"
          value={analytics.overview.totalStudents || 0}
          subValue={`${analytics.overview.totalInstituteAdmins || 0} faculty admins`}
          icon={GraduationCap}
          color="violet"
        />
      </motion.div>

      {/* Session Performance Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold px-1">Session Analytics</h2>
        <div className="grid gap-6 lg:grid-cols-3">
          <SessionStatCard
            title="Aptitude Mastery"
            icon={Brain}
            total={analytics.sessions.totalAptitudeSessions || 0}
            completed={analytics.sessions.completedAptitudeSessions || 0}
            avgScore={analytics.performance.avgAptitudeScore || 0}
            gradient="from-violet-500/20 to-fuchsia-500/20"
          />
          <SessionStatCard
            title="Coding Proficiency"
            icon={Code}
            total={analytics.sessions.totalMachineSessions || 0}
            completed={analytics.sessions.completedMachineSessions || 0}
            avgScore={analytics.performance.avgMachineScore || 0}
            gradient="from-emerald-500/20 to-teal-500/20"
          />
          <SessionStatCard
            title="Interview Readiness"
            icon={MessageSquare}
            total={analytics.sessions.totalInterviewSessions || 0}
            completed={analytics.sessions.completedInterviewSessions || 0}
            avgScore={analytics.performance.avgInterviewScore || 0}
            gradient="from-blue-500/20 to-indigo-500/20"
          />
        </div>
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
                        <p className="text-sm font-medium tabular-nums">{institute._count?.users || 0}</p>
                        <p className="text-xs text-muted-foreground">users</p>
                      </div>
                      <span
                        className={`h-2 w-2 rounded-full ${
                          institute.isActive ? 'bg-foreground' : 'bg-muted-foreground/30'
                        }`}
                      />
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
          <Link href="/admin/events">
            <Calendar className="h-4 w-4 mr-2" />
            Manage Events
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
    </motion.div>
  );
}

// ============================================
// Sub Components
// ============================================

function StatCard({
  label,
  value,
  subValue,
  icon: Icon,
  color = 'primary'
}: {
  label: string;
  value: number;
  subValue: string;
  icon: React.ElementType;
  color?: 'primary' | 'blue' | 'emerald' | 'violet';
}) {
  const colorMap = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    violet: 'bg-violet-500/10 text-violet-500 border-violet-500/20'
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, scale: 0.95 },
        show: { opacity: 1, scale: 1 }
      }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Card className="relative overflow-hidden group border-none shadow-lg glass-effect">
        <div className={cn("absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-10 blur-3xl", 
          color === 'primary' ? 'bg-primary' : 
          color === 'blue' ? 'bg-blue-500' :
          color === 'emerald' ? 'bg-emerald-500' : 'bg-violet-500'
        )} />
        
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={cn("p-2.5 rounded-xl border transition-colors", colorMap[color])}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="text-right">
               <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">{label}</span>
            </div>
          </div>
          
          <div className="space-y-1">
            <h3 className="text-3xl font-bold tabular-nums tracking-tight">
              {value.toLocaleString()}
            </h3>
            <p className="text-sm font-medium text-muted-foreground/80 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {subValue}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function SessionStatCard({
  title,
  icon: Icon,
  total,
  completed,
  avgScore,
  gradient
}: {
  title: string;
  icon: React.ElementType;
  total: number;
  completed: number;
  avgScore: number;
  gradient: string;
}) {
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Card className={cn("relative overflow-hidden border-none shadow-md glass-effect bg-gradient-to-br", gradient)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <p className="text-sm font-bold text-foreground/70 uppercase tracking-tight">{title}</p>
            <div className="flex items-center gap-2">
               <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
               <span className="text-xs text-muted-foreground font-medium">Tracking Live Activity</span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-full bg-background/50 flex items-center justify-center backdrop-blur-sm border border-white/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-2xl font-black tabular-nums">{total}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Attempts</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-black tabular-nums text-primary">{completionRate}%</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Success</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-black tabular-nums">{avgScore.toFixed(0)}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Avg Pts</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

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
        <TrendsChart data={data} compact />
      </div>
    </div>
  );
}

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

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>

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

      <div className="grid gap-4 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="border-border">
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-24 mb-4" />
              <div className="grid grid-cols-3 gap-4">
                {[...Array(3)].map((_, j) => (
                  <div key={j}>
                    <Skeleton className="h-6 w-12 mb-1" />
                    <Skeleton className="h-3 w-10" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="border-border">
            <CardContent className="pt-6">
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}