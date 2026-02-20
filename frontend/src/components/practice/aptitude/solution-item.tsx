// src/components/practice/aptitude/solution-item.tsx

'use client';

import { Badge } from '../../ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../ui/accordion';
import type { SolutionItem as SolutionItemType } from '../../../types/aptitude.types';
import {
  QUESTION_TYPE_CONFIG,
  DIFFICULTY_CONFIG,
} from '../../../lib/constants/aptitude.constants';
import { Check, X, Minus, Lightbulb } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface SolutionItemProps {
  solution: SolutionItemType;
  index: number;
}

export function SolutionItem({ solution, index }: SolutionItemProps) {
  const typeConfig = QUESTION_TYPE_CONFIG[solution.questionType];
  const difficultyConfig = DIFFICULTY_CONFIG[solution.difficulty];

  const getStatusConfig = () => {
    if (solution.selectedOptionId === null) {
      return {
        icon: Minus,
        label: 'Skipped',
        color: 'text-muted-foreground',
        bg: 'bg-muted',
        border: 'border-muted',
      };
    }
    if (solution.isCorrect) {
      return {
        icon: Check,
        label: 'Correct',
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-500',
        border: 'border-emerald-500/30',
      };
    }
    return {
      icon: X,
      label: 'Incorrect',
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-500',
      border: 'border-rose-500/30',
    };
  };

  const status = getStatusConfig();
  const StatusIcon = status.icon;

  return (
    <AccordionItem
      value={solution.questionId}
      className={cn(
        'rounded-xl border-2 px-4 transition-colors',
        status.border,
        'data-[state=open]:bg-muted/30'
      )}
    >
      <AccordionTrigger className="py-4 hover:no-underline">
        <div className="flex flex-1 items-center gap-4 text-left">
          {/* Status Icon */}
          <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', status.bg)}>
            <StatusIcon className="h-4 w-4 text-white" />
          </div>

          {/* Question Number & Preview */}
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Question {solution.order}</span>
              <Badge variant="outline" className="text-xs font-normal">
                {typeConfig?.label}
              </Badge>
            </div>
            <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground break-words">
              {solution.questionText}
            </p>
          </div>

          {/* Status Label */}
          <span className={cn('mr-4 text-sm font-medium', status.color)}>
            {status.label}
          </span>
        </div>
      </AccordionTrigger>

      <AccordionContent className="pb-6">
        <div className="space-y-5 pt-2">
          {/* Full Question */}
          <div className="rounded-xl bg-muted/50 p-5">
            <p className="whitespace-pre-wrap leading-relaxed">
              {solution.questionText}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-2">
            {solution.options.map((option, optIndex) => {
              const isSelected = option.id === solution.selectedOptionId;
              const isCorrectOption = option.isCorrect;

              return (
                <div
                  key={option.id}
                  className={cn(
                    'flex items-center gap-4 rounded-xl border-2 p-4 transition-colors',
                    // Correct option
                    isCorrectOption && 'border-emerald-500 bg-emerald-500/10',
                    // Wrong selected option
                    isSelected && !isCorrectOption && 'border-rose-500/50 bg-rose-500/5',
                    // Other options
                    !isCorrectOption && !isSelected && 'border-transparent bg-muted/30 opacity-60'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold',
                      isCorrectOption && 'bg-emerald-500 text-white',
                      isSelected && !isCorrectOption && 'bg-rose-500 text-white',
                      !isCorrectOption && !isSelected && 'bg-muted'
                    )}
                  >
                    {isCorrectOption ? (
                      <Check className="h-4 w-4" />
                    ) : isSelected ? (
                      <X className="h-4 w-4" />
                    ) : (
                      String.fromCharCode(65 + optIndex)
                    )}
                  </div>

                  <span
                    className={cn(
                      'flex-1',
                      isCorrectOption && 'font-medium text-emerald-700 dark:text-emerald-300'
                    )}
                  >
                    {option.text}
                  </span>

                  {/* Labels */}
                  <div className="flex items-center gap-2 text-xs">
                    {isSelected && (
                      <span className={cn(
                        'rounded-full px-2 py-0.5',
                        isCorrectOption 
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                      )}>
                        Your answer
                      </span>
                    )}
                    {isCorrectOption && !isSelected && (
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-emerald-600 dark:text-emerald-400">
                        Correct answer
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Explanation */}
          {solution.explanation && (
            <div className="rounded-xl border-2 border-amber-500/30 bg-amber-500/5 p-5">
              <div className="flex gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500">
                  <Lightbulb className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="mb-2 font-semibold text-amber-700 dark:text-amber-300">
                    Explanation
                  </p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    {solution.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}