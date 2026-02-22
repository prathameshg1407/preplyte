'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Trophy,
  Target,
  Clock,
  Code,
  BookOpen,
  ArrowRight,
  AlertCircle,
  Building2,
  Briefcase,
  Users2,
} from 'lucide-react';
import { useStudentDashboard } from '@/lib/hooks/use-student-dashboard';

export function StudentDashboard() {
  const { data, isLoading, error, refetch } = useStudentDashboard();

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
          <p className="text-sm text-muted-foreground">
            Unable to retrieve your data
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  const { stats, recentTests, upcomingTests, appliedOpportunities, hackathonRegistrations } = data;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome Back! 👋</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track your progress and continue learning
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tests Completed"
          value={stats.testsCompleted}
          total={stats.totalTests}
          icon={Target}
        />
        <StatCard
          title="Mock Interviews"
          value={stats.interviewsCompleted}
          total={stats.totalInterviews}
          icon={Clock}
        />
        <StatCard
          title="Coding Problems"
          value={stats.problemsSolved}
          total={stats.totalProblems}
          icon={Code}
        />
        <StatCard
          title="Overall Score"
          value={stats.overallScore}
          total={100}
          icon={Trophy}
          isPercentage
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Tests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-medium">Recent Tests</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/practice/history">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentTests.length === 0 ? (
              <EmptyState message="No tests completed yet" />
            ) : (
              <div className="space-y-3">
                {recentTests.map((test) => (
                  <div
                    key={test.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{test.title}</p>
                      <p className="text-xs text-muted-foreground">{test.date}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm font-semibold tabular-nums">
                        {test.score}/{test.total}
                      </p>
                      <p className="text-xs text-muted-foreground">{test.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Tests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-medium">Upcoming Tests</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/mock-drive">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {upcomingTests.length === 0 ? (
              <EmptyState message="No upcoming tests" />
            ) : (
              <div className="space-y-3">
                {upcomingTests.map((test) => (
                  <div
                    key={test.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{test.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {test.date}
                        </span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-secondary">
                          {test.duration}
                        </span>
                        <DifficultyBadge difficulty={test.difficulty} />
                      </div>
                    </div>
                    <Button size="sm" asChild>
                      <Link href={`/mock-drive/${test.id}`}>View</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Applied Opportunities */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-medium">Applied Opportunities</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/opportunities">
                Browse More
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {appliedOpportunities.length === 0 ? (
              <EmptyState message="No applications yet" />
            ) : (
              <div className="space-y-3">
                {appliedOpportunities.map((opportunity) => (
                  <div
                    key={opportunity.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{opportunity.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {opportunity.companyName}
                        </span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-secondary flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          {opportunity.type}
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <OpportunityStatusBadge status={opportunity.status} />
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(opportunity.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Hackathons */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-medium">My Hackathons</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/hackathons">
                Find More
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {hackathonRegistrations.length === 0 ? (
              <EmptyState message="No hackathons registered" />
            ) : (
              <div className="space-y-3">
                {hackathonRegistrations.map((reg) => (
                  <div
                    key={reg.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{reg.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <HackathonRoleBadge role={reg.role} />
                        <span className="text-xs text-muted-foreground">
                          {new Date(reg.registrationDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                        {reg.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link href="/practice/machine">
                <Code className="h-6 w-6" />
                <span>Start Coding</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link href="/practice/aptitude">
                <BookOpen className="h-6 w-6" />
                <span>Aptitude Test</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link href="/practice/ai-interview">
                <Target className="h-6 w-6" />
                <span>Mock Interview</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Sub-components
function StatCard({
  title,
  value,
  total,
  icon: Icon,
  isPercentage = false,
}: {
  title: string;
  value: number;
  total: number;
  icon: React.ElementType;
  isPercentage?: boolean;
}) {
  const percentage = (value / total) * 100;
  const displayValue = isPercentage ? `${value}%` : value;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tabular-nums">{displayValue}</div>
        <Progress value={percentage} className="mt-2 h-1" />
        {!isPercentage && (
          <p className="text-xs text-muted-foreground mt-1">
            {value} of {total}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const colorMap: Record<string, string> = {
    Hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    Medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    Easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  };

  return (
    <span className={`text-xs px-1.5 py-0.5 rounded ${colorMap[difficulty] || 'bg-secondary'}`}>
      {difficulty}
    </span>
  );
}

function OpportunityStatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    APPLIED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    UNDER_REVIEW: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    SHORTLISTED: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    HIRED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  };

  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${colorMap[status.toUpperCase()] || 'bg-secondary'}`}>
      {status}
    </span>
  );
}

function HackathonRoleBadge({ role }: { role: string }) {
  const config: Record<string, { label: string; class: string; icon: any }> = {
    LEADER: { label: 'Leader', class: 'bg-amber-100 text-amber-700', icon: Trophy },
    MEMBER: { label: 'Member', class: 'bg-indigo-100 text-indigo-700', icon: Users2 },
    INDIVIDUAL: { label: 'Solo', class: 'bg-slate-100 text-slate-700', icon: Code },
  };

  const item = config[role.toUpperCase()] || config.INDIVIDUAL;
  const Icon = item.icon;

  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${item.class}`}>
      <Icon className="h-3 w-3" />
      {item.label}
    </span>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-1 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}