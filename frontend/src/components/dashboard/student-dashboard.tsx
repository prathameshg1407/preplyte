// src/components/dashboard/student-dashboard.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Trophy,
  Target,
  Clock,
  Code,
  BookOpen,
  ArrowRight,
  AlertCircle,
  GraduationCap,
  Award,
  Play,
  CheckCircle,
  TrendingUp,
  Calendar,
  Star,
  Users,
  Download,
  Zap,
  FileText,
  Brain,
  MessageSquare,
  Laptop,
} from 'lucide-react';
import { useStudentDashboard } from '@/lib/hooks/use-student-dashboard';
import { useProfile } from '@/lib/hooks/use-profile';
import { ProfileCompletionDialog } from '@/components/profile';
import { LmsEnrollmentStatus, DifficultyLevel } from '@/types/lms.types';
import type { LmsEnrollmentSummary, LmsRecentActivity, RecommendedCourse, RecentTest } from '@/types/dashboard.types';
import { formatDistanceToNow } from 'date-fns';

// Difficulty color mapping
const difficultyColors: Record<DifficultyLevel, string> = {
  EASY: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  HARD: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
};

const difficultyLabels: Record<DifficultyLevel, string> = {
  EASY: 'Beginner',
  MEDIUM: 'Intermediate',
  HARD: 'Advanced',
};

// Activity icon mapping
const activityIcons: Record<string, React.ElementType> = {
  ENROLLMENT: BookOpen,
  MODULE_COMPLETED: CheckCircle,
  TOPIC_COMPLETED: FileText,
  TEST_PASSED: Trophy,
  COURSE_COMPLETED: GraduationCap,
  CERTIFICATE_EARNED: Award,
};

// Practice type configuration
const practiceTypeConfig = {
  APTITUDE: {
    label: 'Aptitude Tests',
    icon: Brain,
    // Muted neutral blue (low saturation, professional)
    color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    borderColor: 'border-slate-200 dark:border-slate-700',
    link: '/practice/aptitude',
  },

  MACHINE: {
    label: 'Coding Challenges',
    icon: Code,
    // Muted neutral green replaced with gray-green tone
    color: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
    borderColor: 'border-zinc-200 dark:border-zinc-700',
    link: '/practice/machine',
  },

  INTERVIEW: {
    label: 'AI Interviews',
    icon: MessageSquare,
    // Muted neutral purple replaced with slate tone
    color: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
    borderColor: 'border-neutral-200 dark:border-neutral-700',
    link: '/practice/ai-interview',
  },
};

export function StudentDashboard() {
  const { data, isLoading, error, refetch } = useStudentDashboard();
  const { profileCompletion, fetchCompleteProfile } = useProfile();
  const [activeTab, setActiveTab] = useState('overview');
  const [showProfileDialog, setShowProfileDialog] = useState(false);

  // Check profile completion on mount
  useEffect(() => {
    const checkProfile = async () => {
      // Check if user just logged in (flag set by login)
      const justLoggedIn = localStorage.getItem('justLoggedIn');
      
      if (justLoggedIn === 'true') {
        await fetchCompleteProfile();
        // Clear the flag
        localStorage.removeItem('justLoggedIn');
      }
    };

    checkProfile();
  }, [fetchCompleteProfile]);

  // Show dialog when profile completion is loaded and incomplete
  useEffect(() => {
    const justLoggedIn = sessionStorage.getItem('checkProfileCompletion');
    
    if (justLoggedIn === 'true' && profileCompletion && !profileCompletion.isComplete) {
      setShowProfileDialog(true);
      sessionStorage.removeItem('checkProfileCompletion');
    }
  }, [profileCompletion]);

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

  const { stats, recentTests, upcomingTests, lms } = data;

  // Separate recent tests by type
  const aptitudeTests = recentTests.filter((t) => t.type === 'APTITUDE');
  const machineTests = recentTests.filter((t) => t.type === 'MACHINE');
  const interviewTests = recentTests.filter((t) => t.type === 'INTERVIEW');

  return (
    <>
      {/* Profile Completion Dialog */}
      <ProfileCompletionDialog
        completion={profileCompletion}
        isOpen={showProfileDialog}
        onClose={() => setShowProfileDialog(false)}
      />

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Welcome Back! 👋</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track your progress and continue learning
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
            <Link href="/lms">
              <BookOpen className="h-4 w-4 mr-2" />
              Browse Courses
            </Link>
          </Button>
          <Button asChild>
            <Link href="/practice">
              <Zap className="h-4 w-4 mr-2" />
              Practice Now
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
        </TabsList>

        {/* ============================================= */}
        {/* OVERVIEW TAB - All Stats Combined */}
        {/* ============================================= */}
        <TabsContent value="overview" className="space-y-6">
          {/* Combined Stats Section */}
          <div className="space-y-4">
            {/* LMS Stats */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Learning Progress</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                  title="Courses Enrolled"
                  value={lms.stats.totalEnrollments}
                  icon={BookOpen}
                  description={`${lms.stats.inProgressCourses} in progress, ${lms.stats.completedCourses} completed`}
                  color="text-blue-600"
                />
                <StatsCard
                  title="LMS Points Earned"
                  value={lms.stats.totalPointsEarned}
                  icon={Trophy}
                  description={`${lms.stats.moduleTestsPassed} module tests passed`}
                  color="text-yellow-600"
                />
                <StatsCard
                  title="Learning Hours"
                  value={`${lms.stats.totalLearningHours}h`}
                  icon={Clock}
                  description={`${lms.stats.averageProgress}% avg progress`}
                  color="text-green-600"
                />
                <StatsCard
                  title="Certificates Earned"
                  value={lms.stats.certificatesEarned}
                  icon={Award}
                  description={`${lms.stats.finalTestsPassed} final tests passed`}
                  color="text-purple-600"
                />
              </div>
            </div>

            {/* Practice Stats */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Practice Performance</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <ProgressStatsCard
                  title="Aptitude Tests"
                  value={stats.testsCompleted}
                  total={stats.totalTests}
                  icon={Brain}
                  color="text-blue-600"
                  bgColor="bg-blue-100 dark:bg-blue-900/30"
                />
                <ProgressStatsCard
                  title="Coding Problems"
                  value={stats.problemsSolved}
                  total={stats.totalProblems}
                  icon={Code}
                  color="text-green-600"
                  bgColor="bg-green-100 dark:bg-green-900/30"
                />
                <ProgressStatsCard
                  title="AI Interviews"
                  value={stats.interviewsCompleted}
                  total={stats.totalInterviews}
                  icon={MessageSquare}
                  color="text-purple-600"
                  bgColor="bg-purple-100 dark:bg-purple-900/30"
                />
                <ProgressStatsCard
                  title="Overall Score"
                  value={stats.overallScore}
                  total={100}
                  icon={TrendingUp}
                  color="text-orange-600"
                  bgColor="bg-orange-100 dark:bg-orange-900/30"
                  isPercentage
                />
              </div>
            </div>
          </div>

          {/* Continue Learning Section */}
          {lms.enrollments.inProgress.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Continue Learning</CardTitle>
                  <CardDescription>Pick up where you left off</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/lms">
                    View All
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {lms.enrollments.inProgress.slice(0, 3).map((enrollment) => (
                    <CourseProgressCard key={enrollment.id} enrollment={enrollment} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Practice Sessions - Separated by Type */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Practice Sessions</CardTitle>
              <CardDescription>Your latest practice activity by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Aptitude Tests */}
                <PracticeSessionSection
                  type="APTITUDE"
                  tests={aptitudeTests}
                  config={practiceTypeConfig.APTITUDE}
                />

                {/* Coding Challenges */}
                <PracticeSessionSection
                  type="MACHINE"
                  tests={machineTests}
                  config={practiceTypeConfig.MACHINE}
                />

                {/* AI Interviews */}
                <PracticeSessionSection
                  type="INTERVIEW"
                  tests={interviewTests}
                  config={practiceTypeConfig.INTERVIEW}
                />
              </div>
            </CardContent>
          </Card>

          {/* Two Column Layout: Recent Activity & Upcoming */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent LMS Activity */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base font-medium">Recent Learning Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {lms.recentActivity.length === 0 ? (
                  <EmptyState message="No recent activity" icon={Clock} />
                ) : (
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-4">
                      {lms.recentActivity.map((activity) => (
                        <ActivityItem key={activity.id} activity={activity} />
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Tests */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base font-medium">Upcoming Mock Drives</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/mock-drive">
                    View All
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {upcomingTests.length === 0 ? (
                  <EmptyState message="No upcoming tests" icon={Calendar} />
                ) : (
                  <ScrollArea className="h-[300px] pr-4">
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
                                {new Date(test.date).toLocaleDateString()}
                              </span>
                              <span className="text-xs px-1.5 py-0.5 rounded bg-secondary">
                                {test.duration}
                              </span>
                            </div>
                          </div>
                          <Button size="sm" asChild>
                            <Link href={`/mock-drive/${test.id}`}>View</Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
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
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                  <Link href="/practice/aptitude">
                    <Brain className="h-6 w-6 text-blue-600" />
                    <span>Aptitude Test</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                  <Link href="/practice/machine">
                    <Code className="h-6 w-6 text-green-600" />
                    <span>Start Coding</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                  <Link href="/practice/ai-interview">
                    <MessageSquare className="h-6 w-6 text-purple-600" />
                    <span>Mock Interview</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                  <Link href="/lms">
                    <GraduationCap className="h-6 w-6 text-orange-600" />
                    <span>Browse Courses</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                  <Link href="/mock-drive">
                    <Laptop className="h-6 w-6 text-cyan-600" />
                    <span>Mock Drives</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                  <Link href="/resume-builder">
                    <FileText className="h-6 w-6 text-pink-600" />
                    <span>Resume Builder</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recommended Courses */}
          {lms.recommendedCourses.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Recommended for You</CardTitle>
                  <CardDescription>Based on popular courses</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/lms">
                    Browse All
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                  {lms.recommendedCourses.map((course) => (
                    <RecommendedCourseCard key={course.id} course={course} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ============================================= */}
        {/* MY COURSES TAB */}
        {/* ============================================= */}
        <TabsContent value="courses" className="space-y-6">
          {/* Course Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <StatsCard
              title="Total Enrolled"
              value={lms.stats.totalEnrollments}
              icon={BookOpen}
              color="text-blue-600"
            />
            <StatsCard
              title="In Progress"
              value={lms.stats.inProgressCourses}
              icon={Play}
              color="text-orange-600"
            />
            <StatsCard
              title="Completed"
              value={lms.stats.completedCourses}
              icon={CheckCircle}
              color="text-green-600"
            />
            <StatsCard
              title="Average Progress"
              value={`${lms.stats.averageProgress}%`}
              icon={TrendingUp}
              color="text-purple-600"
            />
          </div>

          {/* In Progress Courses */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">In Progress</CardTitle>
              <CardDescription>
                Continue your learning journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              {lms.enrollments.inProgress.length === 0 ? (
                <EmptyState 
                  message="No courses in progress" 
                  icon={BookOpen}
                  action={
                    <Button asChild className="mt-4">
                      <Link href="/lms">Browse Courses</Link>
                    </Button>
                  }
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {lms.enrollments.inProgress.map((enrollment) => (
                    <CourseProgressCard key={enrollment.id} enrollment={enrollment} showDetails />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Completed Courses */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Completed</CardTitle>
              <CardDescription>
                Your achievements and certifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {lms.enrollments.completed.length === 0 ? (
                <EmptyState 
                  message="No completed courses yet" 
                  icon={GraduationCap}
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {lms.enrollments.completed.map((enrollment) => (
                    <CompletedCourseCard key={enrollment.id} enrollment={enrollment} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================= */}
        {/* PRACTICE TAB */}
        {/* ============================================= */}
        <TabsContent value="practice" className="space-y-6">
          {/* Practice Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <ProgressStatsCard
              title="Aptitude Tests"
              value={stats.testsCompleted}
              total={stats.totalTests}
              icon={Brain}
              color="text-blue-600"
              bgColor="bg-blue-100 dark:bg-blue-900/30"
            />
            <ProgressStatsCard
              title="Coding Problems"
              value={stats.problemsSolved}
              total={stats.totalProblems}
              icon={Code}
              color="text-green-600"
              bgColor="bg-green-100 dark:bg-green-900/30"
            />
            <ProgressStatsCard
              title="AI Interviews"
              value={stats.interviewsCompleted}
              total={stats.totalInterviews}
              icon={MessageSquare}
              color="text-purple-600"
              bgColor="bg-purple-100 dark:bg-purple-900/30"
            />
            <ProgressStatsCard
              title="Overall Score"
              value={stats.overallScore}
              total={100}
              icon={TrendingUp}
              color="text-orange-600"
              bgColor="bg-orange-100 dark:bg-orange-900/30"
              isPercentage
            />
          </div>

          {/* Practice Sessions by Type */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Aptitude Tests Card */}
            <Card className={`border-2 ${practiceTypeConfig.APTITUDE.borderColor}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${practiceTypeConfig.APTITUDE.color}`}>
                      <Brain className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Aptitude Tests</CardTitle>
                      <CardDescription>{aptitudeTests.length} sessions</CardDescription>
                    </div>
                  </div>
                  <Button size="sm" asChild>
                    <Link href="/practice/aptitude">
                      <Play className="h-4 w-4 mr-1" />
                      Start
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {aptitudeTests.length === 0 ? (
                  <EmptyState message="No aptitude tests taken yet" icon={Brain} />
                ) : (
                  <ScrollArea className="h-[250px]">
                    <div className="space-y-3">
                      {aptitudeTests.map((test) => (
                        <PracticeSessionItem key={test.id} test={test} />
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            {/* Coding Challenges Card */}
            <Card className={`border-2 ${practiceTypeConfig.MACHINE.borderColor}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${practiceTypeConfig.MACHINE.color}`}>
                      <Code className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Coding Challenges</CardTitle>
                      <CardDescription>{machineTests.length} sessions</CardDescription>
                    </div>
                  </div>
                  <Button size="sm" asChild>
                    <Link href="/practice/machine">
                      <Play className="h-4 w-4 mr-1" />
                      Start
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {machineTests.length === 0 ? (
                  <EmptyState message="No coding challenges taken yet" icon={Code} />
                ) : (
                  <ScrollArea className="h-[250px]">
                    <div className="space-y-3">
                      {machineTests.map((test) => (
                        <PracticeSessionItem key={test.id} test={test} />
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            {/* AI Interviews Card */}
            <Card className={`border-2 ${practiceTypeConfig.INTERVIEW.borderColor}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${practiceTypeConfig.INTERVIEW.color}`}>
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">AI Interviews</CardTitle>
                      <CardDescription>{interviewTests.length} sessions</CardDescription>
                    </div>
                  </div>
                  <Button size="sm" asChild>
                    <Link href="/practice/ai-interview">
                      <Play className="h-4 w-4 mr-1" />
                      Start
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {interviewTests.length === 0 ? (
                  <EmptyState message="No AI interviews taken yet" icon={MessageSquare} />
                ) : (
                  <ScrollArea className="h-[250px]">
                    <div className="space-y-3">
                      {interviewTests.map((test) => (
                        <PracticeSessionItem key={test.id} test={test} isInterview />
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Start Practicing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Button variant="outline" className="h-24 flex-col gap-2" asChild>
                  <Link href="/practice/aptitude">
                    <Brain className="h-8 w-8 text-blue-600" />
                    <span className="font-medium">Aptitude Test</span>
                    <span className="text-xs text-muted-foreground">Quantitative, Verbal, Logical</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-24 flex-col gap-2" asChild>
                  <Link href="/practice/machine">
                    <Code className="h-8 w-8 text-green-600" />
                    <span className="font-medium">Coding Challenge</span>
                    <span className="text-xs text-muted-foreground">DSA Problems</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-24 flex-col gap-2" asChild>
                  <Link href="/practice/ai-interview">
                    <MessageSquare className="h-8 w-8 text-purple-600" />
                    <span className="font-medium">AI Mock Interview</span>
                    <span className="text-xs text-muted-foreground">Technical & Behavioral</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </>
  );
}

// =====================================================
// SUB-COMPONENTS
// =====================================================

function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  color = 'text-primary',
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  description?: string;
  color?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1 truncate">{description}</p>
            )}
          </div>
          <div className={`h-12 w-12 rounded-lg bg-muted flex items-center justify-center shrink-0 ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProgressStatsCard({
  title,
  value,
  total,
  icon: Icon,
  color,
  bgColor,
  isPercentage = false,
}: {
  title: string;
  value: number;
  total: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  isPercentage?: boolean;
}) {
  const percentage = (value / total) * 100;
  const displayValue = isPercentage ? `${value}%` : value;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${bgColor} ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{displayValue}</p>
          </div>
        </div>
        <Progress value={percentage} className="mt-3 h-2" />
        {!isPercentage && (
          <p className="text-xs text-muted-foreground mt-2">
            {value} of {total} completed
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function PracticeSessionSection({
  type,
  tests,
  config,
}: {
  type: 'APTITUDE' | 'MACHINE' | 'INTERVIEW';
  tests: RecentTest[];
  config: {
    label: string;
    icon: React.ElementType;
    color: string;
    borderColor: string;
    link: string;
  };
}) {
  const Icon = config.icon;

  return (
    <div className={`border rounded-lg p-4 ${config.borderColor}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${config.color}`}>
            <Icon className="h-4 w-4" />
          </div>
          <h3 className="font-semibold text-sm">{config.label}</h3>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href={config.link}>
            <Play className="h-3 w-3 mr-1" />
            Start
          </Link>
        </Button>
      </div>

      {tests.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">No sessions yet</p>
          <Button variant="outline" size="sm" className="mt-2" asChild>
            <Link href={config.link}>Take your first {type === 'INTERVIEW' ? 'interview' : 'test'}</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {tests.slice(0, 3).map((test) => (
            <div
              key={test.id}
              className="flex items-center justify-between p-2 bg-muted/50 rounded-md text-sm"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{test.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(test.date), { addSuffix: true })}
                </p>
              </div>
              <div className="text-right ml-2">
                <p className="font-semibold">
                  {type === 'INTERVIEW' ? `${test.score}%` : `${test.score}/${test.total}`}
                </p>
              </div>
            </div>
          ))}
          {tests.length > 3 && (
            <Button variant="ghost" size="sm" className="w-full" asChild>
              <Link href={`${config.link}/history`}>
                View all {tests.length} sessions
                <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function PracticeSessionItem({ 
  test, 
  isInterview = false 
}: { 
  test: RecentTest; 
  isInterview?: boolean;
}) {
  const scoreDisplay = isInterview 
    ? `${test.score}%` 
    : `${test.score}/${test.total}`;
  
  const scorePercent = isInterview 
    ? test.score 
    : (test.score / test.total) * 100;

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{test.title}</p>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(test.date), { addSuffix: true })}
        </p>
      </div>
      <div className="text-right ml-2">
        <p className={`font-semibold text-sm ${
          scorePercent >= 70 ? 'text-green-600' : 
          scorePercent >= 50 ? 'text-yellow-600' : 'text-red-600'
        }`}>
          {scoreDisplay}
        </p>
        <Badge variant="secondary" className="text-xs">
          {test.status}
        </Badge>
      </div>
    </div>
  );
}

function CourseProgressCard({
  enrollment,
  showDetails = false,
}: {
  enrollment: LmsEnrollmentSummary;
  showDetails?: boolean;
}) {
  const [imageError, setImageError] = useState(false);

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative aspect-video bg-muted">
        {enrollment.courseThumbnail && !imageError ? (
          <Image
            src={enrollment.courseThumbnail}
            alt={enrollment.courseTitle}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="h-10 w-10 text-muted-foreground/50" />
          </div>
        )}
        <div className="absolute top-2 left-2">
          <Badge className={difficultyColors[enrollment.courseDifficulty]}>
            {difficultyLabels[enrollment.courseDifficulty]}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4 space-y-3">
        <div>
          <p className="text-xs text-muted-foreground">{enrollment.courseCategory}</p>
          <h3 className="font-semibold line-clamp-2 mt-1">{enrollment.courseTitle}</h3>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{Math.round(enrollment.progressPercent)}%</span>
          </div>
          <Progress value={enrollment.progressPercent} className="h-2" />
        </div>

        {showDetails && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              <span>{enrollment.completedModules}/{enrollment.totalModules} modules</span>
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              <span>{enrollment.totalPointsEarned} pts</span>
            </div>
          </div>
        )}

        <Button className="w-full" size="sm" asChild>
          <Link href={`/lms/${enrollment.courseSlug}`}>
            <Play className="h-4 w-4 mr-2" />
            Continue
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function CompletedCourseCard({ enrollment }: { enrollment: LmsEnrollmentSummary }) {
  const [imageError, setImageError] = useState(false);

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video bg-muted">
        {enrollment.courseThumbnail && !imageError ? (
          <Image
            src={enrollment.courseThumbnail}
            alt={enrollment.courseTitle}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="h-10 w-10 text-muted-foreground/50" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant="default" className="bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        </div>
      </div>
      <CardContent className="p-4 space-y-3">
        <div>
          <p className="text-xs text-muted-foreground">{enrollment.courseCategory}</p>
          <h3 className="font-semibold line-clamp-2 mt-1">{enrollment.courseTitle}</h3>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Trophy className="h-4 w-4" />
            <span>{enrollment.totalPointsEarned} points earned</span>
          </div>
          {enrollment.finalTestScore && (
            <Badge variant="secondary">
              Score: {Math.round(enrollment.finalTestScore)}%
            </Badge>
          )}
        </div>

        {enrollment.certificateUrl ? (
          <Button className="w-full" size="sm" variant="outline" asChild>
            <a href={enrollment.certificateUrl} target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4 mr-2" />
              Download Certificate
            </a>
          </Button>
        ) : (
          <Button className="w-full" size="sm" variant="outline" asChild>
            <Link href={`/lms/${enrollment.courseSlug}`}>
              <BookOpen className="h-4 w-4 mr-2" />
              Review Course
            </Link>
          </Button>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Completed {enrollment.completedAt && formatDistanceToNow(new Date(enrollment.completedAt), { addSuffix: true })}
        </p>
      </CardContent>
    </Card>
  );
}

function RecommendedCourseCard({ course }: { course: RecommendedCourse }) {
  const [imageError, setImageError] = useState(false);

  return (
    <Link href={`/lms/${course.slug}`}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow h-full">
        <div className="relative aspect-video bg-muted">
          {course.thumbnailUrl && !imageError ? (
            <Image
              src={course.thumbnailUrl}
              alt={course.title}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-muted-foreground/50" />
            </div>
          )}
        </div>
        <CardContent className="p-3 space-y-2">
          <p className="text-xs text-muted-foreground">{course.category}</p>
          <h4 className="font-medium text-sm line-clamp-2">{course.title}</h4>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{course.enrollmentCount}</span>
            </div>
            {course.averageRating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>{course.averageRating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ActivityItem({ activity }: { activity: LmsRecentActivity }) {
  const Icon = activityIcons[activity.type] || BookOpen;
  
  const iconColors: Record<string, string> = {
    ENROLLMENT: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    MODULE_COMPLETED: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    TOPIC_COMPLETED: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    TEST_PASSED: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
    COURSE_COMPLETED: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    CERTIFICATE_EARNED: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  };

  return (
    <div className="flex items-start gap-3">
      <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${iconColors[activity.type]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{activity.title}</p>
        <p className="text-xs text-muted-foreground line-clamp-1">{activity.description}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
        </p>
      </div>
      {activity.metadata?.points && (
        <Badge variant="secondary" className="shrink-0">
          +{activity.metadata.points} pts
        </Badge>
      )}
    </div>
  );
}

function EmptyState({ 
  message, 
  icon: Icon = AlertCircle,
  action,
}: { 
  message: string; 
  icon?: React.ElementType;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
      {action}
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
      
      {/* Stats Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-40" />
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
      </div>

      <div className="space-y-4">
        <Skeleton className="h-5 w-40" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-2 w-full mt-3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Continue Learning Skeleton */}
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Practice Sessions Skeleton */}
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="grid gap-6 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Two Column Skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}