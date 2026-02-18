'use client';

import { useParams, useRouter } from 'next/navigation';
import { ModuleForm, ModuleFormValues } from '@/components/admin/lms/module-form';
import { useAddModule } from '@/lib/hooks/admin/use-lms-admin';
import { toast } from 'sonner';

export default function NewModulePage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.courseId as string;
    const addModuleMutation = useAddModule();

    const handleSubmit = async (values: ModuleFormValues) => {
        try {
            await addModuleMutation.mutateAsync({
                courseId,
                ...values,
            });
            toast.success('Module created successfully!');
            router.push(`/admin/lms/courses/${courseId}`);
        } catch (error) {
            console.error('Error creating module:', error);
            toast.error('Failed to create module');
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold">Add New Module</h1>
                <p className="text-muted-foreground">Create a new module for your course curriculum.</p>
            </div>

            <div className="max-w-3xl mx-auto">
                <ModuleForm onSubmit={handleSubmit} isLoading={addModuleMutation.isPending} />
            </div>
        </div>
    );
}
