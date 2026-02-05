'use client';

import { useParams, useRouter } from 'next/navigation';
import { ModuleForm, ModuleFormValues } from '@/components/admin/lms/module-form';
import { useModule, useUpdateModule } from '@/lib/hooks/admin/use-lms-admin';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function EditModulePage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.courseId as string;
    const moduleId = params.moduleId as string;

    const { data: module, isLoading, error } = useModule(moduleId);
    const updateModuleMutation = useUpdateModule();

    const handleSubmit = async (values: ModuleFormValues) => {
        try {
            await updateModuleMutation.mutateAsync({
                id: moduleId,
                data: values,
            });
            toast.success('Module updated successfully!');
            router.push(`/admin/lms/courses/${courseId}`);
        } catch (error) {
            console.error('Error updating module:', error);
            toast.error('Failed to update module');
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-[400px] w-full" />
            </div>
        );
    }

    if (error || !module) {
        return (
            <div className="container mx-auto p-6">
                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">Module Not Found</CardTitle>
                        <CardDescription>Could not find the requested module.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold">Edit Module</h1>
                <p className="text-muted-foreground">Modify module details and settings.</p>
            </div>

            <div className="max-w-3xl mx-auto">
                <ModuleForm
                    initialData={module}
                    onSubmit={handleSubmit}
                    isLoading={updateModuleMutation.isPending}
                />
            </div>
        </div>
    );
}
