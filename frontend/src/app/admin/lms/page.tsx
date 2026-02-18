'use client';

import { useLmsAnalytics } from '@/lib/hooks/admin/use-lms-admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import {
    BookOpen,
    Users,
    DollarSign,
    TrendingUp,
    FolderOpen,
    PlayCircle,
    FileText,
    Award
} from 'lucide-react';

export default function LmsAdminPage() {
    const { data: analytics, isLoading, error } = useLmsAnalytics();

    if (isLoading) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <Skeleton className="h-12 w-64" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">Error Loading Analytics</CardTitle>
                        <CardDescription>Failed to load LMS analytics data</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    const stats = [
        {
            title: 'Total Courses',
            value: analytics?.totalCourses || 0,
            icon: BookOpen,
            description: 'Active courses',
            href: '/admin/lms/courses',
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
        },
        {
            title: 'Total Enrollments',
            value: analytics?.totalEnrollments || 0,
            icon: Users,
            description: 'Student enrollments',
            color: 'text-green-600',
            bgColor: 'bg-green-100',
        },
        {
            title: 'Total Revenue',
            value: `$${analytics?.totalRevenue?.toFixed(2) || 0}`,
            icon: DollarSign,
            description: 'Total earnings',
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-100',
        },
        {
            title: 'Avg Completion Rate',
            value: `${analytics?.averageCompletionRate?.toFixed(1) || 0}%`,
            icon: TrendingUp,
            description: 'Course completion',
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
        },
        {
            title: 'Categories',
            value: analytics?.totalCategories || 0,
            icon: FolderOpen,
            description: 'Course categories',
            href: '/admin/lms/categories',
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-100',
        },
        {
            title: 'Modules',
            value: analytics?.totalModules || 0,
            icon: PlayCircle,
            description: 'Total modules',
            color: 'text-pink-600',
            bgColor: 'bg-pink-100',
        },
        {
            title: 'Topics',
            value: analytics?.totalTopics || 0,
            icon: FileText,
            description: 'Learning topics',
            color: 'text-orange-600',
            bgColor: 'bg-orange-100',
        },
        {
            title: 'Active Enrollments',
            value: analytics?.activeEnrollments || 0,
            icon: Award,
            description: 'In progress',
            color: 'text-teal-600',
            bgColor: 'bg-teal-100',
        },
    ];

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">LMS Dashboard</h1>
                    <p className="text-muted-foreground">Manage your learning management system</p>
                </div>
                <Button asChild>
                    <Link href="/admin/lms/courses/new">Create New Course</Link>
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    const CardComponent = stat.href ? (
                        <Link href={stat.href} className="block">
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {stat.title}
                                    </CardTitle>
                                    <div className={`p-2 rounded-full ${stat.bgColor}`}>
                                        <Icon className={`h-4 w-4 ${stat.color}`} />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {stat.description}
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    ) : (
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {stat.title}
                                </CardTitle>
                                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                                    <Icon className={`h-4 w-4 ${stat.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {stat.description}
                                </p>
                            </CardContent>
                        </Card>
                    );

                    return <div key={stat.title}>{CardComponent}</div>;
                })}
            </div>
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle>Manage Courses</CardTitle>
                        <CardDescription>Create, edit, and organize your courses</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full">
                            <Link href="/admin/lms/courses">View All Courses</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle>Manage Categories</CardTitle>
                        <CardDescription>Organize courses into categories</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full" variant="outline">
                            <Link href="/admin/lms/categories">View Categories</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle>View Analytics</CardTitle>
                        <CardDescription>Detailed insights and reports</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full" variant="outline">
                            <Link href="/admin/lms/analytics">View Reports</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Top Courses */}
            {analytics?.topCourses && analytics.topCourses.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Top Performing Courses</CardTitle>
                        <CardDescription>Your most popular courses by enrollment</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {analytics.topCourses.map((course) => (
                                <div
                                    key={course.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                >
                                    <div className="flex-1">
                                        <h3 className="font-semibold">{course.title}</h3>
                                        <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                                            <span>{course.enrollments} enrollments</span>
                                            <span>${course.revenue.toFixed(2)} revenue</span>
                                            <span>{course.averageProgress.toFixed(1)}% avg progress</span>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/admin/lms/courses/${course.id}`}>View</Link>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            
        </div>
    );
}