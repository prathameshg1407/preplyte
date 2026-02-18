'use client';

import { useParams } from 'next/navigation';
import { useModule, useTopicsByModule } from '@/lib/hooks/admin/use-lms-admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import {
    Plus,
    ArrowLeft,
    FileText,
    Video,
    HelpCircle,
    Edit,
    ArrowRight,
    GripVertical
} from 'lucide-react';

export default function ModuleDetailsPage() {
    const params = useParams();
    const courseId = params.courseId as string;
    const moduleId = params.moduleId as string;

    const { data: module, isLoading: moduleLoading } = useModule(moduleId);
    const { data: topics, isLoading: topicsLoading } = useTopicsByModule(moduleId);

    if (moduleLoading) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <Skeleton className="h-10 w-64" />
                <div className="space-y-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        );
    }

    if (!module) {
        return (
            <div className="container mx-auto p-6 text-center">
                <Card>
                    <CardHeader>
                        <CardTitle>Module Not Found</CardTitle>
                        <CardDescription>We couldn't find the module you're looking for.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href={`/admin/lms/courses/${courseId}`}>Back to Course</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={`/admin/lms/courses/${courseId}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">{module.title}</h1>
                        <p className="text-muted-foreground">Module {module.order} • {module.estimatedMinutes || 0} mins • {module.points || 0} points</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href={`/admin/lms/courses/${courseId}/modules/${moduleId}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Module
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href={`/admin/lms/courses/${courseId}/modules/${moduleId}/topics/new`}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Topic
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Module Topics</CardTitle>
                                <CardDescription>Learning content within this module.</CardDescription>
                            </div>
                            <Button size="sm" asChild>
                                <Link href={`/admin/lms/courses/${courseId}/modules/${moduleId}/topics/new`}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Topic
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {topicsLoading ? (
                                <div className="space-y-3">
                                    {[...Array(3)].map((_, i) => (
                                        <Skeleton key={i} className="h-16 w-full" />
                                    ))}
                                </div>
                            ) : !topics || topics.length === 0 ? (
                                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                                    <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                                    <p className="text-muted-foreground">No topics yet.</p>
                                    <Button variant="link" asChild>
                                        <Link href={`/admin/lms/courses/${courseId}/modules/${moduleId}/topics/new`}>
                                            Create first topic
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {topics.map((topic) => (
                                        <div
                                            key={topic.id}
                                            className="flex items-center justify-between p-3 border rounded-md hover:bg-accent/50 transition-colors group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                                                <div className="bg-secondary p-2 rounded">
                                                    {topic.videoUrl ? (
                                                        <Video className="h-4 w-4 text-primary" />
                                                    ) : (
                                                        <FileText className="h-4 w-4 text-primary" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{topic.title}</p>
                                                    <p className="text-xs text-muted-foreground">{topic.estimatedMinutes || 0} mins</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={topic.isActive ? 'outline' : 'secondary'} className="text-[10px]">
                                                    {topic.isActive ? 'Active' : 'Hidden'}
                                                </Badge>
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/admin/lms/courses/${courseId}/modules/${moduleId}/topics/${topic.id}`}>
                                                        <ArrowRight className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Module Test</CardTitle>
                            <CardDescription>Assessment for this module.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-muted rounded-lg text-center space-y-3">
                                <HelpCircle className="h-8 w-8 mx-auto text-muted-foreground" />
                                <p className="text-sm">Knowledge assessment for students after completing this module.</p>
                                <Button className="w-full" asChild>
                                    <Link href={`/admin/lms/courses/${courseId}/modules/${moduleId}/test`}>
                                        Manage Module Test
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Topics</span>
                                <span>{topics?.length || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Content Types</span>
                                <span>
                                    {topics?.filter(t => t.videoUrl).length || 0} Video, {topics?.filter(t => !t.videoUrl).length || 0} Text
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
