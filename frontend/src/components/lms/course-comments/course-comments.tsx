import { useCourseComments } from '@/lib/hooks/lms/use-lms';
import { CommentForm } from './comment-form';
import { CommentItem } from './comment-item';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface CourseCommentsProps {
    courseSlug: string;
}

export function CourseComments({ courseSlug }: CourseCommentsProps) {
    const { data, isLoading } = useCourseComments(courseSlug);
    const { isAuthenticated } = useAuth();

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const comments = data?.comments || [];
    const totalComments = data?.pagination?.total || 0;

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-xl font-semibold mb-6">
                    Comments ({totalComments})
                </h3>

                {isAuthenticated ? (
                    <CommentForm courseSlug={courseSlug} />
                ) : (
                    <div className="bg-muted/50 p-6 rounded-lg text-center">
                        <p className="text-muted-foreground mb-4">
                            Please log in to leave a comment.
                        </p>
                        <Button asChild variant="outline">
                            <Link href="/login">Log in</Link>
                        </Button>
                    </div>
                )}
            </div>

            <div className="space-y-6">
                {comments.map((comment: any) => (
                    <CommentItem key={comment.id} comment={comment} courseSlug={courseSlug} />
                ))}

                {comments.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                        No comments yet. Be the first to share your thoughts!
                    </div>
                )}
            </div>
        </div>
    );
}
