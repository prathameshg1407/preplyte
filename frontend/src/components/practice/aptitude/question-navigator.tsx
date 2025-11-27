// src/components/practice/aptitude/question-navigator.tsx

'use client';

import { motion } from 'framer-motion';
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
  const answeredCount = questions.filter(
    (q) => selectedAnswers[q.id] || q.selectedOptionId
  ).length;

  const progressPercentage =
    questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  const isQuestionAnswered = (question: SessionQuestion): boolean => {
    return !!(selectedAnswers[question.id] || question.selectedOptionId);
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-2xl font-bold">{progressPercentage}%</span>
        </div>

        {/* Custom Progress Bar */}
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="absolute inset-y-0 left-0 bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        <p className="text-sm text-muted-foreground">
          {answeredCount} of {questions.length} answered
        </p>
      </div>

      {/* Question Grid */}
      <div className="space-y-3">
        <span className="text-sm font-medium">Questions</span>
        <ScrollArea className="h-[280px]">
          <div className="grid grid-cols-5 gap-2 pr-4">
            {questions.map((question, index) => {
              const isAnswered = isQuestionAnswered(question);
              const isCurrent = index === currentIndex;

              return (
                <motion.button
                  key={question.id}
                  disabled={disabled}
                  onClick={() => !disabled && onNavigate(index)}
                  whileHover={!disabled ? { scale: 1.1 } : {}}
                  whileTap={!disabled ? { scale: 0.95 } : {}}
                  className={cn(
                    'relative flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-all duration-200',
                    // Current question
                    isCurrent && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
                    // Answered
                    isAnswered && !isCurrent && 'bg-primary text-primary-foreground',
                    // Unanswered
                    !isAnswered && !isCurrent && 'bg-muted hover:bg-muted/80',
                    // Current + Answered
                    isCurrent && isAnswered && 'bg-primary text-primary-foreground',
                    // Current + Unanswered
                    isCurrent && !isAnswered && 'bg-muted',
                    // Disabled
                    disabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {isAnswered ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </motion.button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Legend */}
      <div className="space-y-3 border-t border-border pt-4">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Legend
        </span>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground">
              <Check className="h-3 w-3" />
            </div>
            <span className="text-muted-foreground">Answered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-muted text-xs font-medium">
              1
            </div>
            <span className="text-muted-foreground">Unanswered</span>
          </div>
        </div>
      </div>
    </div>
  );
}