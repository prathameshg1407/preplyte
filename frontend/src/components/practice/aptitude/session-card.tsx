// src/components/practice/aptitude/session-card.tsx

'use client';

import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import type { SessionListItem } from '../../../types/aptitude.types';
import {
  QUESTION_TYPE_CONFIG,
  DIFFICULTY_CONFIG,
  getStatusLabel,
  formatTimeAgo,
  formatDuration,
} from '../../../lib/constants/aptitude.constants';
import { Clock, Play, Eye, Check, X, Minus } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface SessionCardProps {
  session: SessionListItem;
  onResume?: (sessionId: string) => void;
  onViewResults?: (sessionId: string) => void;
}

export function SessionCard({ session, onResume, onViewResults }: SessionCardProps) {
  const difficultyConfig = DIFFICULTY_CONFIG[session.difficulty];

  const canResume = session.status === 'in_progress';
  const canViewResults = session.status === 'completed';

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-foreground text-background';
      case 'in_progress':
        return 'bg-secondary border-foreground';
      default:
        return 'bg-secondary';
    }
  };

  return (
    <Card className="transition-colors hover:bg-secondary/30">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Session Info */}
          <div className="flex-1 space-y-3">
            {/* Status and Time */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className={cn(getStatusStyle(session.status))}
              >
                {getStatusLabel(session.status)}
              </Badge>
              <Badge variant="secondary">
                {difficultyConfig?.label || session.difficulty}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatTimeAgo(session.startedAt)}
              </span>
            </div>

            {/* Question Types */}
            <div className="flex flex-wrap gap-1">
              {session.questionTypes.map((type) => (
                <Badge key={type} variant="outline" className="text-xs">
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
              <div className="flex items-center gap-4 pt-2 border-t border-border">
                <span className="text-2xl font-semibold">
                  {session.totalScore}%
                </span>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <div className="flex h-4 w-4 items-center justify-center rounded bg-foreground">
                      <Check className="h-2.5 w-2.5 text-background" />
                    </div>
                    {session.totalCorrect}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <div className="flex h-4 w-4 items-center justify-center rounded bg-muted-foreground">
                      <X className="h-2.5 w-2.5 text-background" />
                    </div>
                    {session.totalWrong}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <div className="flex h-4 w-4 items-center justify-center rounded bg-secondary">
                      <Minus className="h-2.5 w-2.5" />
                    </div>
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
                <Play className="mr-1.5 h-3.5 w-3.5" />
                Resume
              </Button>
            )}
            {canViewResults && onViewResults && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewResults(session.id)}
              >
                <Eye className="mr-1.5 h-3.5 w-3.5" />
                Results
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}