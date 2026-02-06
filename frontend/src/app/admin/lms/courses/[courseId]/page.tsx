'use client';

import { useParams } from 'next/navigation';
import { useCourse, useModulesByCourse } from '@/lib/hooks/admin/use-lms-admin';
import { LmsCourseStatus } from '@/types/lms.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import {
    Edit,
    Plus,
    ArrowLeft,
    Layout,
    FileText,
    Settings,
    Video,
    HelpCircle,
    Users
} from 'lucide-react';

export default function CourseDetailsPage() {
    const params = useParams();
    const courseId = params.courseId as string;

    const { data: course, isLoading: courseLoading } = useCourse(courseId);
    const { data: modules, isLoading: modulesLoading } = useModulesByCourse(courseId);

    if (courseLoading) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-10 w-64" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <Skeleton className="h-[400px] md:col-span-2" />
                    <Skeleton className="h-[400px]" />
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="container mx-auto p-6">
                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">Course Not Found</CardTitle>
                        <CardDescription>The requested course could not be loaded.</CardDescription>
                    </CardHeader>
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
                        <Link href="/admin/lms/courses">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">{course.title}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant={course.status === LmsCourseStatus.PUBLISHED ? 'default' : 'secondary'}>
                                {course.status}
                            </Badge>
                            <Badge variant="outline">{course.difficulty}</Badge>
                            <span className="text-sm text-muted-foreground">• Created on {new Date(course.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href={`/admin/lms/courses/${courseId}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Properties
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href={`/admin/lms/courses/${courseId}/modules/new`}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Module
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    <Tabs defaultValue="modules" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="modules">Curriculum / Modules</TabsTrigger>
                            <TabsTrigger value="details">Course Information</TabsTrigger>
                        </TabsList>

                        <TabsContent value="modules" className="mt-6">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Course Curriculum</CardTitle>
                                        <CardDescription>Manage modules and topics for this course.</CardDescription>
                                    </div>
                                    <Button size="sm" asChild>
                                        <Link href={`/admin/lms/courses/${courseId}/modules/new`}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Module
                                        </Link>
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    {modulesLoading ? (
                                        <div className="space-y-4">
                                            {[...Array(3)].map((_, i) => (
                                                <Skeleton key={i} className="h-20 w-full" />
                                            ))}
                                        </div>
                                    ) : !modules || modules.length === 0 ? (
                                        <div className="text-center py-12 border-2 border-dashed rounded-lg">
                                            <Layout className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                            <h3 className="text-lg font-medium">No modules yet</h3>
                                            <p className="text-muted-foreground mb-4">Start building your course curriculum.</p>
                                            <Button asChild>
                                                <Link href={`/admin/lms/courses/${courseId}/modules/new`}>Create First Module</Link>
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {modules.map((module) => (
                                                <div key={module.id} className="border rounded-lg p-4 flex items-center justify-between hover:bg-accent/50 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className="bg-primary/10 p-2 rounded text-primary font-bold w-10 h-10 flex items-center justify-center">
                                                            {module.order}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold">{module.title}</h4>
                                                            <p className="text-sm text-muted-foreground line-clamp-1">{module.shortDescription}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" size="sm" asChild>
                                                            <Link href={`/admin/lms/courses/${courseId}/modules/${module.id}`}>
                                                                Manage Content
                                                            </Link>
                                                        </Button>
                                                        <Button variant="ghost" size="icon" asChild>
                                                            <Link href={`/admin/lms/courses/${courseId}/modules/${module.id}/edit`}>
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="details" className="mt-6 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Description</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                        <p className="text-muted-foreground whitespace-pre-wrap">{course.description}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <FileText className="h-5 w-5 text-primary" />
                                            Summary
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col border rounded-md p-3 bg-accent/5">
                                                <span className="text-xs text-muted-foreground uppercase font-bold">Modules</span>
                                                <span className="text-xl font-bold">{course.totalModules}</span>
                                            </div>
                                            <div className="flex flex-col border rounded-md p-3 bg-accent/5">
                                                <span className="text-xs text-muted-foreground uppercase font-bold">Topics</span>
                                                <span className="text-xl font-bold">{course.totalTopics}</span>
                                            </div>
                                            <div className="flex flex-col border rounded-md p-3 bg-accent/5">
                                                <span className="text-xs text-muted-foreground uppercase font-bold">Points</span>
                                                <span className="text-xl font-bold text-yellow-600">{course.totalPoints}</span>
                                            </div>
                                            <div className="flex flex-col border rounded-md p-3 bg-accent/5">
                                                <span className="text-xs text-muted-foreground uppercase font-bold">Duration</span>
                                                <span className="text-xl font-bold text-blue-600">{course.totalHours}h</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2 pt-2">
                                            <div className="flex justify-between border-b pb-2">
                                                <span className="text-muted-foreground">Instructor</span>
                                                <span className="font-medium">{course.instructor || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between border-b pb-2">
                                                <span className="text-muted-foreground">Price</span>
                                                <span className="font-medium">
                                                    {course.price > 0 ? (
                                                        course.discountPrice ? (
                                                            <span className="flex items-center gap-2">
                                                                <span className="line-through text-xs text-muted-foreground">${course.price}</span>
                                                                <span>${course.discountPrice}</span>
                                                            </span>
                                                        ) : `$${course.price}`
                                                    ) : <span className="text-green-600 font-bold">Free</span>}
                                                </span>
                                            </div>
                                            <div className="flex justify-between border-b pb-2">
                                                <span className="text-muted-foreground">Difficulty</span>
                                                <span className="font-medium capitalize">{course.difficulty}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Certificate</span>
                                                <span className="font-medium">{course.certificateEnabled ? 'Yes' : 'No'}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Settings className="h-5 w-5 text-primary" />
                                            Requirements
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">Passing Score</span>
                                            <Badge variant="outline">{course.passingPercentage}%</Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">Auto-Activate</span>
                                            <Badge variant={course.isActive ? 'outline' : 'secondary'}>
                                                {course.isActive ? 'Enabled' : 'Disabled'}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Sidebar Sidebar Area */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Access</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button variant="outline" className="w-full justify-start" asChild>
                                <Link href={`/admin/lms/courses/${courseId}/final-test`}>
                                    <HelpCircle className="mr-2 h-4 w-4" />
                                    Course Final Test
                                </Link>
                            </Button>
                            <Button variant="outline" className="w-full justify-start" disabled>
                                <Users className="mr-2 h-4 w-4" />
                                Enrollments (Coming Soon)
                            </Button>
                            <Button variant="link" className="w-full text-center" asChild>
                                <Link href={`/preview/courses/${courseId}`}>
                                    View Public Preview
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {course.thumbnailUrl && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Course Display</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="aspect-video w-full rounded-md overflow-hidden relative border">
                                    <img
                                        src={course.thumbnailUrl}
                                        alt={course.title}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
