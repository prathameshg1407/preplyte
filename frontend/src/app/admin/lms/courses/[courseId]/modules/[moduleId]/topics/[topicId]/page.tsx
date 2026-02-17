'use client';

import { useParams, useRouter } from 'next/navigation';
import { TopicForm, TopicFormValues } from '@/components/admin/lms/topic-form';
import { useTopic, useUpdateTopic, useDeleteTopic } from '@/lib/hooks/admin/use-lms-admin';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';

export default function TopicManagementPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.courseId as string;
    const moduleId = params.moduleId as string;
    const topicId = params.topicId as string;

    const { data: topic, isLoading, error } = useTopic(topicId);
    const updateTopicMutation = useUpdateTopic();
    const deleteTopicMutation = useDeleteTopic();

    const handleUpdate = async (values: TopicFormValues) => {
        try {
            await updateTopicMutation.mutateAsync({
                id: topicId,
                data: values,
            });
            toast.success('Topic updated successfully!');
        } catch (error) {
            console.error('Error updating topic:', error);
            toast.error('Failed to update topic');
        }
    };

    const handleDelete = async () => {
        try {
            await deleteTopicMutation.mutateAsync(topicId);
            toast.success('Topic deleted successfully');
            router.push(`/admin/lms/courses/${courseId}/modules/${moduleId}`);
        } catch (error) {
            toast.error('Failed to delete topic');
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-[500px] w-full" />
            </div>
        );
    }

    if (error || !topic) {
        return (
            <div className="container mx-auto p-6">
                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">Topic Not Found</CardTitle>
                        <CardDescription>Could not find the requested topic.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Manage Topic</h1>
                    <p className="text-muted-foreground">Editing: {topic.title}</p>
                </div>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Topic
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete this topic and all its associated content and resources.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            <div className="max-w-6xl mx-auto">
                <TopicForm
                    initialData={topic}
                    onSubmit={handleUpdate}
                    isLoading={updateTopicMutation.isPending}
                />
            </div>
        </div>
    );
}
