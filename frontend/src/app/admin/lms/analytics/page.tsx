'use client';

import { useLmsAnalytics, useTopCourses } from '@/lib/hooks/admin/use-lms-admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts';
import {
    BookOpen,
    Users,
    TrendingUp,
    DollarSign,
    Award,
    Clock,
    ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function LmsAnalyticsPage() {
    const { data: analytics, isLoading: analyticsLoading } = useLmsAnalytics();
    const { data: topCourses, isLoading: coursesLoading } = useTopCourses();

    if (analyticsLoading || coursesLoading) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <Skeleton className="h-10 w-64" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
                </div>
                <Skeleton className="h-[400px] w-full" />
            </div>
        );
    }

    const enrollmentTrends = analytics?.enrollmentTrends || [];
    const categoryStats = analytics?.categoryStats || [];

    return (
        <div className="container mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/admin/lms">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">LMS Analytics</h1>
                    <p className="text-muted-foreground">Detailed performance insights for your courses.</p>
                </div>
            </div>

            {/* Top Level Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${analytics?.totalRevenue?.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">+12% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics?.totalEnrollments?.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">+5.4% new students</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Avg. Progress</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics?.averageCompletionRate?.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">Steady growth</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Tests Passed</CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics?.completedEnrollments || 0}</div>
                        <p className="text-xs text-muted-foreground">Certificates issued</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Enrollment Trends Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Enrollment Trends</CardTitle>
                        <CardDescription>New student enrollments over time</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={enrollmentTrends}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Category Performance */}
                <Card>
                    <CardHeader>
                        <CardTitle>Categories Wise Students</CardTitle>
                        <CardDescription>Enrollments per category</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryStats}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="categoryName" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="enrollmentCount" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Top Courses Detailed */}
            <Card>
                <CardHeader>
                    <CardTitle>Top Performing Courses</CardTitle>
                    <CardDescription>Based on revenue and student engagement</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="divide-y">
                        {topCourses?.map((course: any) => (
                            <div key={course.id} className="py-4 flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="font-medium">{course.title}</p>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {course.enrollments}</span>
                                        <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> ${course.revenue.toFixed(2)}</span>
                                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {course.averageProgress.toFixed(1)}% progress</span>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href={`/admin/lms/courses/${course.id}`}>Manage</Link>
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
