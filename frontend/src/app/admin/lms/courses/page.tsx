'use client';

import { useState } from 'react';
import { useLmsCourses, useDeleteCourse } from '@/lib/hooks/admin/use-lms-admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Link from 'next/link';
import { Edit, Trash2, Plus, Search, Eye, FileText, Layout } from 'lucide-react';
import type { CourseFilters } from '@/types/lms-admin.types';
import { DifficultyLevel, LmsCourseStatus } from '@/types/lms.types';

export default function CoursesPage() {
    const [filters, setFilters] = useState<CourseFilters>({
        page: 1,
        limit: 10,
        search: '',
    });
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState<string | null>(null);

    const { data: coursesData, isLoading, error } = useLmsCourses(filters);
    const deleteMutation = useDeleteCourse();

    const handleSearch = (value: string) => {
        setFilters({ ...filters, search: value, page: 1 });
    };

    const handleStatusFilter = (value: string) => {
        setFilters({
            ...filters,
            status: value === 'all' ? undefined : (value as LmsCourseStatus),
            page: 1,
        });
    };

    const handleDifficultyFilter = (value: string) => {
        setFilters({
            ...filters,
            difficulty: value === 'all' ? undefined : (value as DifficultyLevel),
            page: 1,
        });
    };

    const handleDelete = async () => {
        if (courseToDelete) {
            await deleteMutation.mutateAsync(courseToDelete);
            setDeleteDialogOpen(false);
            setCourseToDelete(null);
        }
    };

    const confirmDelete = (courseId: string) => {
        setCourseToDelete(courseId);
        setDeleteDialogOpen(true);
    };

    if (isLoading) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <Skeleton className="h-12 w-64" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-64" />
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
                        <CardTitle className="text-destructive">Error Loading Courses</CardTitle>
                        <CardDescription>Failed to load courses data</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    const courses = coursesData?.data || [];
    const pagination = coursesData?.pagination;

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Courses</h1>
                    <p className="text-muted-foreground">Manage your LMS courses</p>
                </div>
                <Button asChild>
                    <Link href="/admin/lms/courses/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Course
                    </Link>
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search courses..."
                                className="pl-10"
                                value={filters.search}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                        <Select onValueChange={handleStatusFilter} defaultValue="all">
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value={LmsCourseStatus.DRAFT}>Draft</SelectItem>
                                <SelectItem value={LmsCourseStatus.PUBLISHED}>Published</SelectItem>
                                <SelectItem value={LmsCourseStatus.ARCHIVED}>Archived</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select onValueChange={handleDifficultyFilter} defaultValue="all">
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Levels</SelectItem>
                                <SelectItem value={DifficultyLevel.EASY}>Easy</SelectItem>
                                <SelectItem value={DifficultyLevel.MEDIUM}>Medium</SelectItem>
                                <SelectItem value={DifficultyLevel.HARD}>Hard</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Courses Grid */}
            {courses.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <p className="text-muted-foreground mb-4">No courses found</p>
                        <Button asChild>
                            <Link href="/admin/lms/courses/new">Create Your First Course</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <Card key={course.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge
                                            variant={
                                                course.status === LmsCourseStatus.PUBLISHED
                                                    ? 'default'
                                                    : course.status === LmsCourseStatus.DRAFT
                                                        ? 'secondary'
                                                        : 'outline'
                                            }
                                        >
                                            {course.status}
                                        </Badge>

                                        {course.difficulty && (
                                            <Badge variant="outline">{course.difficulty}</Badge>
                                        )}
                                    </div>
                                    <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                                    <CardDescription className="line-clamp-2">
                                        {course.shortDescription}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                                        <div className="flex flex-wrap gap-y-1 gap-x-4">
                                            <p className="flex items-center gap-1">
                                                <Layout className="h-3 w-3" />
                                                {course.totalModules} Modules
                                            </p>
                                            <p className="flex items-center gap-1">
                                                <FileText className="h-3 w-3" />
                                                {course.totalTopics} Topics
                                            </p>
                                            <p className="flex items-center gap-1">
                                                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                                                {course.totalPoints} Points
                                            </p>
                                            <p className="flex items-center gap-1">
                                                <div className="h-3 w-3 rounded-full bg-blue-500" />
                                                {course.totalHours} Hours
                                            </p>
                                        </div>
                                        {course.price > 0 ? (
                                            <p className="text-lg font-bold text-foreground">
                                                {course.discountPrice ? (
                                                    <span className="flex items-center gap-2">
                                                        <span className="line-through text-sm text-muted-foreground">${course.price}</span>
                                                        <span>${course.discountPrice}</span>
                                                    </span>
                                                ) : `$${course.price}`}
                                            </p>
                                        ) : (
                                            <p className="text-lg font-bold text-green-600">Free</p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" asChild className="flex-1">
                                            <Link href={`/admin/lms/courses/${course.id}`}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                View
                                            </Link>
                                        </Button>
                                        <Button variant="outline" size="sm" asChild className="flex-1">
                                            <Link href={`/admin/lms/courses/${course.id}/edit`}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => confirmDelete(course.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex justify-center gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                                disabled={filters.page === 1}
                            >
                                Previous
                            </Button>
                            <div className="flex items-center px-4">
                                Page {filters.page} of {pagination.totalPages}
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                                disabled={filters.page === pagination.totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the course and all its modules, topics, and tests.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}