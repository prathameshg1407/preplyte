import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CommentResponse } from '@/types/lms.types';
import { ThumbsUp, MessageSquare, Trash2, ChevronDown } from 'lucide-react';
import { useToggleCommentLike, useDeleteComment } from '@/lib/hooks/lms/use-lms';
import { CommentForm } from './comment-form';
import { useAuth } from '@/lib/hooks/use-auth';
import { cn } from '@/lib/utils';

interface CommentItemProps {
    comment: CommentResponse;
    courseSlug: string;
}

export function CommentItem({ comment, courseSlug }: CommentItemProps) {
    const [isReplying, setIsReplying] = useState(false);
    const [showReplies, setShowReplies] = useState(false);
    const { user } = useAuth();

    const { mutate: toggleLike } = useToggleCommentLike(courseSlug);
    const { mutate: deleteComment } = useDeleteComment(courseSlug);

    const isOwner = user?.id === comment.userId;
    const hasReplies = comment.replies && comment.replies.length > 0;

    // Format avatar initials
    const initials = comment.user.name
        ? comment.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    return (
        <div className="flex gap-4 group">
            <Avatar className="w-10 h-10 border border-border">
                <AvatarImage src={comment.user.avatarUrl || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{comment.user.name}</span>
                        <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                    </div>
                </div>

                <p className="text-sm text-foreground/90 whitespace-pre-wrap">{comment.comment}</p>

                <div className="flex items-center gap-4 pt-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "h-8 px-2 text-muted-foreground hover:text-foreground gap-1.5",
                            comment.isLiked && "text-primary hover:text-primary/90"
                        )}
                        onClick={() => toggleLike(comment.id)}
                    >
                        <ThumbsUp className={cn("w-3.5 h-3.5", comment.isLiked && "fill-current")} />
                        <span className="text-xs">{comment.likesCount > 0 ? comment.likesCount : 'Like'}</span>
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-muted-foreground hover:text-foreground gap-1.5"
                        onClick={() => setIsReplying(!isReplying)}
                    >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="text-xs">Reply</span>
                    </Button>

                    {isOwner && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-muted-foreground hover:text-destructive gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                                if (window.confirm('Delete this comment?')) {
                                    deleteComment(comment.id);
                                }
                            }}
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                    )}
                </div>

                {isReplying && (
                    <div className="mt-4">
                        <CommentForm
                            courseSlug={courseSlug}
                            parentId={comment.id}
                            onSuccess={() => {
                                setIsReplying(false);
                                setShowReplies(true);
                            }}
                            onCancel={() => setIsReplying(false)}
                            autoFocus
                            placeholder={`Reply to ${comment.user.name}...`}
                        />
                    </div>
                )}

                {/* Replies */}
                {(hasReplies) && (
                    <div className="mt-2">
                        {!showReplies ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="font-medium text-primary hover:text-primary/90 h-auto p-0"
                                onClick={() => setShowReplies(true)}
                            >
                                <ChevronDown className="w-4 h-4 mr-1" />
                                Show {comment.repliesCount || comment.replies?.length} replies
                            </Button>
                        ) : (
                            <div className="space-y-6 pt-4">
                                {comment.replies!.map((reply) => (
                                    <CommentItem key={reply.id} comment={reply} courseSlug={courseSlug} />
                                ))}
                                {/* Hide replies button */}
                                <Button
                                    variant="link"
                                    size="sm"
                                    className="text-muted-foreground h-auto p-0"
                                    onClick={() => setShowReplies(false)}
                                >
                                    Hide replies
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
