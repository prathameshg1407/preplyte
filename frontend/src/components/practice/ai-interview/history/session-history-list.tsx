// src/components/practice/ai-interview/history/session-history-list.tsx

'use client';

import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Clock, Target, MessageSquare, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { InterviewSessionSummary, InterviewSessionStatus } from '@/types/interview.types';

interface SessionHistoryListProps {
  sessions: InterviewSessionSummary[];
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

const STATUS_CONFIG: Record<
  InterviewSessionStatus,
  { label: string; color: string }
> = {
  CREATED: { label: 'Created', color: 'bg-gray-500' },
  STARTED: { label: 'In Progress', color: 'bg-blue-500' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-500' },
  COMPLETED: { label: 'Completed', color: 'bg-green-500' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-500' },
  FAILED: { label: 'Failed', color: 'bg-red-500' },
};

export function SessionHistoryList({
  sessions,
  isLoading,
  onLoadMore,
  hasMore,
}: SessionHistoryListProps) {
  const router = useRouter();

  if (isLoading && sessions.length === 0) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Interview Sessions</h3>
          <p className="text-muted-foreground mb-4">
            Start your first AI interview practice session
          </p>
          <Button onClick={() => router.push('/practice/ai-interview')}>
            Start Interview
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <SessionHistoryCard key={session.id} session={session} />
      ))}

      {hasMore && (
        <div className="text-center">
          <Button variant="outline" onClick={onLoadMore} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
}

function SessionHistoryCard({ session }: { session: InterviewSessionSummary }) {
  const router = useRouter();
  const statusConfig = STATUS_CONFIG[session.status];

  const handleClick = () => {
    if (session.status === 'COMPLETED') {
      router.push(`/practice/ai-interview/results/${session.id}`);
    } else if (['CREATED', 'STARTED', 'IN_PROGRESS'].includes(session.status)) {
      router.push(`/practice/ai-interview/${session.id}`);
    }
  };

  return (
    <Card
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{session.jobTitle}</h3>
              <Badge variant="outline" className="text-xs">
                {session.difficulty}
              </Badge>
              <div className="flex items-center gap-1">
                <div className={cn('w-2 h-2 rounded-full', statusConfig.color)} />
                <span className="text-xs text-muted-foreground">
                  {statusConfig.label}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>
                  {session.questionsAnswered}/{session.totalQuestions} questions
                </span>
              </div>
              {session.overallScore !== null && (
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  <span>{session.overallScore.toFixed(1)}/10</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>
                  {formatDistanceToNow(new Date(session.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          </div>

          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}