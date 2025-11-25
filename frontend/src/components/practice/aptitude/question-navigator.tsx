// src/components/practice/aptitude/question-navigator.tsx

'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { SessionQuestion, SelectedAnswers } from '@/types/aptitude.types';
import { CheckCircle2, Circle, Target } from 'lucide-react';

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
    <div className="space-y-4">
      {/* Progress Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium flex items-center gap-2">
            <Target className="h-4 w-4" />
            Progress
          </span>
          <span className="text-muted-foreground">
            {answeredCount} / {questions.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground text-right">
          {progressPercentage}% complete
        </p>
      </div>

      {/* Question Grid */}
      <ScrollArea className="h-[280px] pr-2">
        <div className="grid grid-cols-5 gap-2">
          {questions.map((question, index) => {
            const isAnswered = isQuestionAnswered(question);
            const isCurrent = index === currentIndex;

            return (
              <Button
                key={question.id}
                variant="outline"
                size="sm"
                disabled={disabled}
                className={cn(
                  'h-10 w-10 p-0 font-medium relative transition-all duration-200',
                  isCurrent && 'ring-2 ring-primary ring-offset-2',
                  isAnswered &&
                    !isCurrent &&
                    'bg-primary text-primary-foreground hover:bg-primary/90 border-primary',
                  !isAnswered && !isCurrent && 'bg-muted hover:bg-muted/80'
                )}
                onClick={() => onNavigate(index)}
                title={`Question ${index + 1}${isAnswered ? ' (Answered)' : ''}`}
              >
                {index + 1}
                {isAnswered && !isCurrent && (
                  <CheckCircle2 className="absolute -top-1 -right-1 h-3 w-3 text-primary-foreground" />
                )}
              </Button>
            );
          })}
        </div>
      </ScrollArea>

      {/* Legend */}
      <div className="pt-2 border-t space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Legend
        </p>
        <div className="grid grid-cols-1 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-primary flex items-center justify-center">
              <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
            </div>
            <span>Answered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-muted border flex items-center justify-center">
              <Circle className="h-2 w-2 text-muted-foreground" />
            </div>
            <span>Unanswered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border-2 border-primary" />
            <span>Current</span>
          </div>
        </div>
      </div>
    </div>
  );
}