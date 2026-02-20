// src/components/practice/ai-interview/interview/progress-bar.tsx

'use client';

import { Progress } from '@/components/ui/progress';
import { Clock, MessageSquare } from 'lucide-react';
import type { SessionProgress } from '@/types/interview.types';

interface ProgressBarProps {
  progress: SessionProgress;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MessageSquare className="h-4 w-4" />
          <span>
            Question {progress.currentQuestionIndex + 1} of {progress.totalQuestions}
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>~{formatTime(progress.estimatedTimeRemaining)} remaining</span>
        </div>
      </div>
      <Progress value={progress.percentComplete} className="h-2" />
    </div>
  );
}