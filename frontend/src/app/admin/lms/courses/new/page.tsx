'use client';

import { useRouter } from 'next/navigation';
import { CourseForm } from '@/components/admin/lms/course-form';
import { useAddCourse } from '@/lib/hooks/admin/use-lms-admin';
import { toast } from 'sonner';

export default function NewCoursePage() {
    const router = useRouter();
    const addCourseMutation = useAddCourse();

    const handleSubmit = async (values: any) => {
        try {
            await addCourseMutation.mutateAsync(values);
            toast.success('Course created successfully!');
            router.push('/admin/lms/courses');
        } catch (error) {
            console.error('Error creating course:', error);
            toast.error('Failed to create course');
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold">Create New Course</h1>
                <p className="text-muted-foreground">Add a new course to your learning platform.</p>
            </div>

            <div className="max-w-5xl mx-auto">
                <CourseForm onSubmit={handleSubmit} isLoading={addCourseMutation.isPending} />
            </div>
        </div>
    );
}
