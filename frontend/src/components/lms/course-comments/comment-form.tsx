import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAddComment } from '@/lib/hooks/lms/use-lms';
import { Loader2 } from 'lucide-react';

interface CommentFormProps {
    courseSlug: string;
    parentId?: string;
    onSuccess?: () => void;
    onCancel?: () => void;
    placeholder?: string;
    autoFocus?: boolean;
}

export function CommentForm({
    courseSlug,
    parentId,
    onSuccess,
    onCancel,
    placeholder = 'Add a comment...',
    autoFocus = false,
}: CommentFormProps) {
    const [comment, setComment] = useState('');
    const { mutate: addComment, isPending } = useAddComment(courseSlug);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) return;

        addComment(
            { comment, parentId },
            {
                onSuccess: () => {
                    setComment('');
                    onSuccess?.();
                },
            }
        );
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={placeholder}
                className="min-h-[100px]"
                autoFocus={autoFocus}
            />
            <div className="flex items-center gap-2 justify-end">
                {onCancel && (
                    <Button type="button" variant="ghost" onClick={onCancel} disabled={isPending}>
                        Cancel
                    </Button>
                )}
                <Button type="submit" disabled={isPending || !comment.trim()}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {parentId ? 'Reply' : 'Comment'}
                </Button>
            </div>
        </form>
    );
}
