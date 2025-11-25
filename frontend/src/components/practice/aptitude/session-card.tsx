// src/components/practice/aptitude/session-card.tsx

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { SessionListItem } from '@/types/aptitude.types';
import {
  QUESTION_TYPE_CONFIG,
  DIFFICULTY_CONFIG,
  getStatusColor,
  getStatusLabel,
  formatTimeAgo,
  formatDuration,
} from '@/lib/constants/aptitude.constants';
import {
  Clock,
  Play,
  Eye,
  CheckCircle2,
  XCircle,
  MinusCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SessionCardProps {
  session: SessionListItem;
  onResume?: (sessionId: string) => void;
  onViewResults?: (sessionId: string) => void;
}

export function SessionCard({ session, onResume, onViewResults }: SessionCardProps) {
  const difficultyConfig = DIFFICULTY_CONFIG[session.difficulty];
  const statusColors = getStatusColor(session.status);

  const canResume = session.status === 'in_progress';
  const canViewResults = session.status === 'completed';

  return (
    <Card className="border-2 hover:border-primary/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Session Info */}
          <div className="flex-1 space-y-3">
            {/* Status and Time */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className={cn(statusColors.text, statusColors.bg, statusColors.border)}
              >
                {getStatusLabel(session.status)}
              </Badge>
              <Badge
                variant="outline"
                className={cn(difficultyConfig?.color, 'border-current bg-current/10')}
              >
                {difficultyConfig?.label || session.difficulty}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatTimeAgo(session.startedAt)}
              </span>
            </div>

            {/* Question Types */}
            <div className="flex flex-wrap gap-1">
              {session.questionTypes.map((type) => (
                <Badge key={type} variant="secondary" className="text-xs">
                  {QUESTION_TYPE_CONFIG[type]?.label || type}
                </Badge>
              ))}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{session.numberOfQuestions} questions</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(session.timeLimit)}
              </span>
            </div>

            {/* Score (if completed) */}
            {session.status === 'completed' && session.totalScore !== null && (
              <div className="flex items-center gap-4 text-sm">
                <span className="font-semibold text-lg">
                  {session.totalScore}%
                </span>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    {session.totalCorrect}
                  </span>
                  <span className="flex items-center gap-1">
                    <XCircle className="h-3 w-3 text-red-500" />
                    {session.totalWrong}
                  </span>
                  <span className="flex items-center gap-1">
                    <MinusCircle className="h-3 w-3" />
                    {session.totalUnanswered}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex flex-col gap-2">
            {canResume && onResume && (
              <Button size="sm" onClick={() => onResume(session.id)}>
                <Play className="h-4 w-4 mr-1" />
                Resume
              </Button>
            )}
            {canViewResults && onViewResults && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewResults(session.id)}
              >
                <Eye className="h-4 w-4 mr-1" />
                Results
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}