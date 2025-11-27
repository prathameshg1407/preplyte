// src/components/practice/aptitude/question-navigator.tsx

'use client';

import { Button } from '../../ui/button';
import { ScrollArea } from '../../ui/scroll-area';
import { cn } from '../../../lib/utils';
import type { SessionQuestion, SelectedAnswers } from '../../../types/aptitude.types';
import { Check } from 'lucide-react';

interface QuestionNavigatorProps {
  questions: SessionQuestion[];
  currentIndex: number;
  selectedAnswers: SelectedAnswers;
  onNavigate: (index: number) => void;
  disabled?: boolean;
}

export function QuestionNavigator({
  questions,
  currentIndex,
  selectedAnswers,
  onNavigate,
  disabled = false,
}: QuestionNavigatorProps) {
  const getAnsweredCount = () => {
    return questions.filter(
      (q) => selectedAnswers[q.id] || q.selectedOptionId
    ).length;
  };

  const answeredCount = getAnsweredCount();
  const progressPercentage =
    questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  const isQuestionAnswered = (question: SessionQuestion): boolean => {
    return !!(selectedAnswers[question.id] || question.selectedOptionId);
  };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Progress</span>
          <span className="text-muted-foreground">
            {answeredCount} / {questions.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full bg-foreground transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {progressPercentage}% complete
        </p>
      </div>

      {/* Question Grid */}
      <ScrollArea className="h-[260px]">
        <div className="grid grid-cols-5 gap-1.5 pr-3">
          {questions.map((question, index) => {
            const isAnswered = isQuestionAnswered(question);
            const isCurrent = index === currentIndex;

            return (
              <button
                key={question.id}
                disabled={disabled}
                className={cn(
                  'relative flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors',
                  isCurrent && 'ring-2 ring-foreground ring-offset-2 ring-offset-background',
                  isAnswered && !isCurrent && 'bg-foreground text-background',
                  !isAnswered && !isCurrent && 'bg-secondary hover:bg-secondary/80',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
                onClick={() => !disabled && onNavigate(index)}
                title={`Question ${index + 1}${isAnswered ? ' (Answered)' : ''}`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </ScrollArea>

      {/* Legend */}
      <div className="space-y-3 border-t border-border pt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Legend
        </p>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-foreground text-background">
              <Check className="h-3 w-3" />
            </div>
            <span className="text-muted-foreground">Answered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-secondary" />
            <span className="text-muted-foreground">Unanswered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded ring-2 ring-foreground ring-offset-1 ring-offset-background" />
            <span className="text-muted-foreground">Current</span>
          </div>
        </div>
      </div>
    </div>
  );
}