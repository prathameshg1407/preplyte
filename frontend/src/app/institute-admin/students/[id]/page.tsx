'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAdminViewStudentDashboard } from '@/lib/hooks/institute-admin/use-admin-view-student-dashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  GraduationCap,
  FileText,
  Code,
  Activity,
  Brain,
  TrendingUp,
  Users,
  ArrowLeft,
  Trophy,
  Clock,
  Target,
  BookOpen,
  CheckCircle,
  Award,
  Calendar,
  MessageSquare,
  Users2,
  Download,
  AlertCircle,
  Link as LinkIcon
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { DifficultyLevel, LmsEnrollmentStatus } from '@/types/lms.types';
import type { LmsEnrollmentSummary, LmsRecentActivity } from '@/types/dashboard.types';

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

export default function InstituteStudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const { data, isLoading, error, refetch } = useAdminViewStudentDashboard(studentId);

  if (isLoading) {
    return <StudentProfileSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 bg-muted rounded-full">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Error Loading Student Profile</h2>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : 'Could not fetch student data.'}
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  const { profile, dashboard } = data;
  const { stats, recentTests, upcomingTests, lms } = dashboard;

  const aptitudeTests = recentTests.filter((t) => t.type === 'APTITUDE');
  const machineTests = recentTests.filter((t) => t.type === 'MACHINE');
  const interviewTests = recentTests.filter((t) => t.type === 'INTERVIEW');

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Student Profile</h1>
            <p className="text-sm text-muted-foreground">Detailed performance and academic records</p>
          </div>
        </div>
        <div className="flex gap-2">
          {profile.resumeUrl && (
            <Button variant="outline" asChild>
              <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer">
                <FileText className="h-4 w-4 mr-2" />
                View Resume
              </a>
            </Button>
          )}
          <Button variant="destructive">
            <Activity className="h-4 w-4 mr-2" />
            Restrict Access
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Basic Info & Stats */}
        <div className="lg:col-span-1 space-y-6">
          {/* Identity Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                  <AvatarFallback className="text-3xl bg-primary text-primary-foreground font-bold">
                    {profile.fullName?.slice(0, 2).toUpperCase() || profile.name?.slice(0, 2).toUpperCase() || 'ST'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold">{profile.fullName || profile.name}</h2>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="outline">{profile.studentId}</Badge>
                  <Badge variant="secondary">{profile.department?.name || 'No Dept'}</Badge>
                  <Badge>{profile.courseYear} Year</Badge>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Account Status</span>
                  <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">Active</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Joined On</span>
                  <span className="text-sm font-medium">
                    {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-sm text-muted-foreground">CGPA ({profile.averageCgpa || 0}/10)</span>
                    <span className="text-sm font-bold text-primary">{(profile.averageCgpa || 0) * 10}%</span>
                  </div>
                  <Progress value={(profile.averageCgpa || 0) * 10} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Core Stats Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Overall Score</p>
                  <p className="text-xl font-bold text-primary">{stats.overallScore}%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">LMS Points</p>
                  <p className="text-xl font-bold text-yellow-600">{lms.stats.totalPointsEarned}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Learning Hours</p>
                  <p className="text-xl font-bold">{lms.stats.totalLearningHours}h</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Certificates</p>
                  <p className="text-xl font-bold">{lms.stats.certificatesEarned}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Academic Records</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">10th Marks</p>
                  <p className="text-sm font-medium">{profile.marks10 || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">12th Marks</p>
                  <p className="text-sm font-medium">{profile.marks12 || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Backlogs</p>
                  <Badge variant={profile.numberOfBacklogs && profile.numberOfBacklogs > 0 ? "destructive" : "outline"}>
                    {profile.numberOfBacklogs || 0}
                  </Badge>
                </div>
              </div>
              {profile.skills && profile.skills.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Technical Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {profile.skills.map((skill, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Detailed Tabs */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="lms">LMS</TabsTrigger>
              <TabsTrigger value="practice">Practice</TabsTrigger>
              <TabsTrigger value="drives">Mock Drives</TabsTrigger>
            </TabsList>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="mt-6 space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader><CardTitle className="text-sm font-medium">Recent Activity</CardTitle></CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px] pr-4">
                      <div className="space-y-4">
                        {lms.recentActivity.length > 0 ? (
                          lms.recentActivity.map((activity) => (
                            <ActivityItem key={activity.id} activity={activity} />
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-sm font-medium">Learning Summary</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Course Completion</span>
                      <span className="font-bold">{lms.stats.completedCourses}/{lms.stats.totalEnrollments}</span>
                    </div>
                    <Progress value={(lms.stats.completedCourses / (lms.stats.totalEnrollments || 1)) * 100} className="h-2" />

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Module Tests Passed</span>
                      <span className="font-bold">{lms.stats.moduleTestsPassed}</span>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Current Progress</p>
                      {lms.enrollments.inProgress.slice(0, 2).map((enrollment) => (
                        <div key={enrollment.id} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="truncate font-medium">{enrollment.courseTitle}</span>
                            <span>{Math.round(enrollment.progressPercent)}%</span>
                          </div>
                          <Progress value={enrollment.progressPercent} className="h-1" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader><CardTitle className="text-sm font-medium text-destructive">Admin Review Needed?</CardTitle></CardHeader>
                <CardContent>
                  <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-bold">Cautionary Metrics Found</p>
                      <p className="mt-1">This student has 0% progress in 3 courses and a high number of backlogs. Consider scheduling a counselor meeting.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* LMS TAB */}
            <TabsContent value="lms" className="mt-6 space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <StatsMiniCard title="Active Courses" value={lms.stats.inProgressCourses} icon={Play} />
                <StatsMiniCard title="LMS Points" value={lms.stats.totalPointsEarned} icon={Trophy} />
                <StatsMiniCard title="Average Progress" value={`${lms.stats.averageProgress}%`} icon={TrendingUp} />
              </div>

              <Card>
                <CardHeader><CardTitle className="text-base font-semibold">Course Enrollments</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {lms.enrollments.all.map((reg) => (
                      <div key={reg.id} className="flex items-center gap-4 p-4 border rounded-xl hover:bg-muted/30 transition-colors">
                        <div className="h-16 w-24 relative rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          {reg.courseThumbnail ? (
                            <Image src={reg.courseThumbnail} alt={reg.courseTitle} fill className="object-cover" />
                          ) : <BookOpen className="h-6 w-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-sm truncate">{reg.courseTitle}</h4>
                            <Badge variant={reg.status === LmsEnrollmentStatus.COMPLETED ? "default" : "outline"} className={reg.status === LmsEnrollmentStatus.COMPLETED ? "bg-green-600" : ""}>
                              {reg.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                            <span>{reg.courseCategory}</span>
                            <span>•</span>
                            <span>{reg.completedModules}/{reg.totalModules} Modules</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={reg.progressPercent} className="h-1.5 flex-1" />
                            <span className="text-[10px] font-bold w-7">{Math.round(reg.progressPercent)}%</span>
                          </div>
                        </div>
                        {reg.certificateUrl && (
                          <Button variant="ghost" size="icon" asChild>
                            <a href={reg.certificateUrl} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    ))}
                    {lms.enrollments.all.length === 0 && (
                      <p className="text-center py-8 text-muted-foreground italic">No courses enrolled yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* PRACTICE TAB */}
            <TabsContent value="practice" className="mt-6 space-y-6">
              <div className="grid gap-4 md:grid-cols-4">
                <StatsMiniCard title="Aptitude" value={stats.testsCompleted} icon={Brain} />
                <StatsMiniCard title="Coding" value={stats.problemsSolved} icon={Code} />
                <StatsMiniCard title="AI Mock" value={stats.interviewsCompleted} icon={MessageSquare} />
                <StatsMiniCard title="Overall" value={`${stats.overallScore}%`} icon={TrendingUp} />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <PracticeSection title="Recent Aptitude Tests" tests={aptitudeTests} />
                <PracticeSection title="Coding Challenges" tests={machineTests} />
                <PracticeSection title="AI Mock Interviews" tests={interviewTests} isInterview />
              </div>
            </TabsContent>

            {/* DRIVES TAB */}
            <TabsContent value="drives" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Registered Upcoming Drives</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingTests.length > 0 ? (
                      upcomingTests.map((test) => (
                        <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="space-y-1">
                            <p className="font-bold text-sm">{test.title}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(test.date).toLocaleString()}</span>
                              <span>•</span>
                              <span>{test.duration}</span>
                            </div>
                          </div>
                          <Badge variant="outline">{test.status}</Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-center py-12 text-muted-foreground italic">No upcoming registered drives</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// HELPER COMPONENTS
// =====================================================

function StudentProfileSkeleton() {
  return (
    <div className="p-8 space-y-8 animate-pulse max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    </div>
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
        <p className="text-xs font-bold leading-tight">{activity.title}</p>
        <p className="text-[10px] text-muted-foreground line-clamp-1">{activity.description}</p>
        <p className="text-[10px] text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
        </p>
      </div>
      {activity.metadata?.points && (
        <span className="text-[10px] font-bold text-green-600">+{activity.metadata.points} pts</span>
      )}
    </div>
  );
}

function StatsMiniCard({ title, value, icon: Icon }: { title: string, value: string | number, icon: any }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground leading-none mb-1">{title}</p>
          <p className="text-lg font-bold leading-none">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function PracticeSection({ title, tests, isInterview }: { title: string, tests: any[], isInterview?: boolean }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-sm font-semibold">{title}</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tests.length > 0 ? tests.map((test) => (
            <div key={test.id} className="flex justify-between items-center text-sm p-2 bg-muted/20 rounded-lg">
              <div className="min-w-0">
                <p className="font-medium truncate text-xs">{test.title}</p>
                <p className="text-[10px] text-muted-foreground">{new Date(test.date).toLocaleDateString()}</p>
              </div>
              <p className={`font-bold text-xs ${test.score >= 70 ? 'text-green-600' : 'text-primary'}`}>
                {isInterview ? `${test.score}%` : `${test.score}/${test.total}`}
              </p>
            </div>
          )) : <p className="text-[10px] text-center text-muted-foreground italic py-4">No data available</p>}
        </div>
      </CardContent>
    </Card>
  );
}

const Play = ({ className }: { className?: string }) => <div className={className}>▶</div>;
