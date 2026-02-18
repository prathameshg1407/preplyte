'use client';

import { useParams, useRouter } from 'next/navigation';
import { CourseForm } from '@/components/admin/lms/course-form';
import { useCourse, useUpdateCourse } from '@/lib/hooks/admin/use-lms-admin';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function EditCoursePage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.courseId as string;

    const { data: course, isLoading, error } = useCourse(courseId);
    const updateCourseMutation = useUpdateCourse();

    const handleSubmit = async (values: any) => {
        try {
            await updateCourseMutation.mutateAsync({ id: courseId, data: values });
            toast.success('Course updated successfully!');
            router.push('/admin/lms/courses');
        } catch (error) {
            console.error('Error updating course:', error);
            toast.error('Failed to update course');
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-6 w-96" />
                <div className="space-y-4 mt-8">
                    <Skeleton className="h-[400px] w-full" />
                </div>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="container mx-auto p-6">
                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">Error Loading Course</CardTitle>
                        <CardDescription>
                            We couldn't find the course you're looking for or there was an error loading it.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold">Edit Course: {course.title}</h1>
                <p className="text-muted-foreground">Modify course information and settings.</p>
            </div>

            <div className="max-w-5xl mx-auto">
                <CourseForm
                    initialData={course}
                    onSubmit={handleSubmit}
                    isLoading={updateCourseMutation.isPending}
                />
            </div>
        </div>
    );
}
