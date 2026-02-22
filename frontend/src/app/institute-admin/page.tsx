'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, BarChart3, Users, Calendar, FileText, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 pb-12"
    >
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Institute Hub
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl">
            Empower your students with comprehensive mock drives and professional opportunities.
          </p>
        </div>
        <Button className="shadow-xl shadow-primary/20 gap-2" asChild>
          <Link href="/institute-admin/mock-drives/new">
            <Plus className="h-4 w-4" />
            Create Mock Drive
          </Link>
        </Button>
      </div>

      {/* Quick Stats - Glass Theme */}
      <motion.div 
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          title="Mock Drives"
          value={stats.totalDrives}
          change={`+${stats.drivesThisMonth} new this month`}
          icon={FileText}
          color="primary"
        />
        <StatCard
          title="Active Programs"
          value={stats.activeDrives}
          change={`${stats.upcomingDrives} upcoming events`}
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Registrations"
          value={stats.totalRegistrations}
          change={`+${stats.registrationsThisMonth} today`}
          icon={Users}
          color="emerald"
        />
        <StatCard
          title="Knowledge Score"
          value={`${stats.avgScore.toFixed(1)}%`}
          change={`${stats.scoreChange >= 0 ? '+' : ''}${stats.scoreChange.toFixed(1)}% performance lift`}
          icon={TrendingUp}
          color="violet"
        />
      </motion.div>

      {/* Action Center */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold px-1">Action Center</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <QuickActionCard
            title="Drive Setup"
            description="Configure new placements"
            icon={Plus}
            href="/institute-admin/mock-drives/new"
            gradient="from-primary/10 to-primary/5"
            color="primary"
          />
          <QuickActionCard
            title="Drives"
            description="Manage existing mock drives"
            icon={FileText}
            href="/institute-admin/mock-drives"
            gradient="from-blue-500/10 to-blue-500/5"
            color="blue"
          />
          <QuickActionCard
            title="Analytics"
            description="Insightful performance data"
            icon={BarChart3}
            href="/institute/analytics"
            gradient="from-emerald-500/10 to-emerald-500/5"
            color="emerald"
          />
          <QuickActionCard
            title="Event Hub"
            description="Jobs & Internships"
            icon={Calendar}
            href="/institute-admin/events"
            gradient="from-violet-500/10 to-violet-500/5"
            color="violet"
          />
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  color = 'primary'
}: {
  title: string;
  value: string | number;
  change: string;
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
          </div>
          
          <div className="space-y-1">
            <h3 className="text-3xl font-bold tabular-nums tracking-tight">
              {value}
            </h3>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">{title}</span>
              <p className="text-xs font-medium text-muted-foreground/80 mt-1">
                {change}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function QuickActionCard({
  title,
  description,
  icon: Icon,
  href,
  gradient,
  color
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  gradient: string;
  color: 'primary' | 'blue' | 'emerald' | 'violet';
}) {
  const colorMap = {
    primary: 'text-primary bg-primary/10',
    blue: 'text-blue-500 bg-blue-500/10',
    emerald: 'text-emerald-500 bg-emerald-500/10',
    violet: 'text-violet-500 bg-violet-500/10'
  };

  return (
    <Link href={href}>
      <Card className={cn(
        "group relative overflow-hidden border-none shadow-md glass-effect h-full transition-all hover:shadow-xl hover:translate-y-[-2px]",
        "bg-gradient-to-br", gradient
      )}>
        <CardContent className="p-6">
          <div className="flex flex-col h-full gap-4">
            <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", colorMap[color])}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg flex items-center gap-2">
                {title}
                <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed italic opacity-80">
                {description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
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