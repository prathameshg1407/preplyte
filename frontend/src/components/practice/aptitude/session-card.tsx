// src/components/practice/aptitude/session-card.tsx

'use client';

import { motion } from 'framer-motion';
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
import { Clock, Play, Eye, Check, X, Minus, ChevronRight } from 'lucide-react';
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={cn(
        'group relative rounded-xl border-2 bg-card p-5 transition-all duration-200',
        canResume && 'border-primary/50 hover:border-primary',
        canViewResults && 'border-transparent hover:border-muted-foreground/20',
        !canResume && !canViewResults && 'border-transparent opacity-60'
      )}
    >
      {/* Status Indicator */}
      {canResume && (
        <div className="absolute -right-1 -top-1 flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        {/* Left Content */}
        <div className="flex-1 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant={canResume ? 'default' : 'secondary'}
              className={cn(
                canResume && 'bg-primary',
                session.status === 'completed' && 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              )}
            >
              {getStatusLabel(session.status)}
            </Badge>
            <Badge variant="outline">
              {difficultyConfig?.label || session.difficulty}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatTimeAgo(session.startedAt)}
            </span>
          </div>

          {/* Question Types */}
          <div className="flex flex-wrap gap-1.5">
            {session.questionTypes.map((type) => (
              <span
                key={type}
                className="rounded-md bg-muted px-2 py-1 text-xs font-medium"
              >
                {QUESTION_TYPE_CONFIG[type]?.label || type}
              </span>
            ))}
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{session.numberOfQuestions} questions</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDuration(session.timeLimit)}
            </span>
          </div>

          {/* Score (if completed) */}
          {session.status === 'completed' && session.totalScore !== null && (
            <div className="flex items-center gap-6 border-t border-border pt-4">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">{session.totalScore}</span>
                <span className="text-lg text-muted-foreground">%</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <Check className="h-4 w-4" />
                  {session.totalCorrect}
                </span>
                <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                  <X className="h-4 w-4" />
                  {session.totalWrong}
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Minus className="h-4 w-4" />
                  {session.totalUnanswered}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex flex-col items-end gap-2">
          {canResume && onResume && (
            <Button
              onClick={() => onResume(session.id)}
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              Resume
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          )}
          {canViewResults && onViewResults && (
            <Button
              variant="outline"
              onClick={() => onViewResults(session.id)}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              View Results
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}