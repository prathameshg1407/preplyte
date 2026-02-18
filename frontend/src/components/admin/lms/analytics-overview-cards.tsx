'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    BookOpen,
    Users,
    DollarSign,
    TrendingUp,
    FolderOpen,
    PlayCircle,
    FileText,
    Award,
    LucideIcon
} from 'lucide-react';
import { LmsAnalytics } from '@/types/lms-admin.types';

interface AnalyticsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description: string;
    colorClass: string;
    bgClass: string;
}

function AnalyticsCard({ title, value, icon: Icon, description, colorClass, bgClass }: AnalyticsCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {title}
                </CardTitle>
                <div className={`p-2 rounded-full ${bgClass}`}>
                    <Icon className={`h-4 w-4 ${colorClass}`} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                    {description}
                </p>
            </CardContent>
        </Card>
    );
}

export function AnalyticsOverviewCards({ analytics }: { analytics: LmsAnalytics | undefined }) {
    const stats = [
        {
            title: 'Total Courses',
            value: analytics?.totalCourses || 0,
            icon: BookOpen,
            description: 'Courses in the system',
            colorClass: 'text-blue-600',
            bgClass: 'bg-blue-100',
        },
        {
            title: 'Total Enrollments',
            value: analytics?.totalEnrollments || 0,
            icon: Users,
            description: 'Cumulative students',
            colorClass: 'text-green-600',
            bgClass: 'bg-green-100',
        },
        {
            title: 'Total Revenue',
            value: `$${analytics?.totalRevenue?.toLocaleString() || 0}`,
            icon: DollarSign,
            description: 'Total platform revenue',
            colorClass: 'text-yellow-600',
            bgClass: 'bg-yellow-100',
        },
        {
            title: 'Avg Completion',
            value: `${analytics?.averageCompletionRate || 0}%`,
            icon: TrendingUp,
            description: 'Completion rate',
            colorClass: 'text-purple-600',
            bgClass: 'bg-purple-100',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
                <AnalyticsCard key={stat.title} {...stat} />
            ))}
        </div>
    );
}