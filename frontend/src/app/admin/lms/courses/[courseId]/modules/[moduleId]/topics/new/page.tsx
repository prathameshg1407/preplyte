'use client';

import { useParams, useRouter } from 'next/navigation';
import { TopicForm, TopicFormValues } from '@/components/admin/lms/topic-form';
import { useAddTopic } from '@/lib/hooks/admin/use-lms-admin';
import { toast } from 'sonner';

export default function NewTopicPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.courseId as string;
    const moduleId = params.moduleId as string;

    const addTopicMutation = useAddTopic();

    const handleSubmit = async (values: TopicFormValues) => {
        try {
            await addTopicMutation.mutateAsync({
                moduleId,
                ...values,
            });
            toast.success('Topic created successfully!');
            router.push(`/admin/lms/courses/${courseId}/modules/${moduleId}`);
        } catch (error) {
            console.error('Error creating topic:', error);
            toast.error('Failed to create topic');
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold">Add New Topic</h1>
                <p className="text-muted-foreground">Create a new learning unit for this module.</p>
            </div>

            <div className="max-w-6xl mx-auto">
                <TopicForm onSubmit={handleSubmit} isLoading={addTopicMutation.isPending} />
            </div>
        </div>
    );
}
