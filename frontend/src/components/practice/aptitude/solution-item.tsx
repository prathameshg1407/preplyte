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

  const getStatusIcon = () => {
    if (solution.selectedOptionId === null) {
      return (
        <div className="flex h-6 w-6 items-center justify-center rounded bg-secondary">
          <Minus className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      );
    }
    if (solution.isCorrect) {
      return (
        <div className="flex h-6 w-6 items-center justify-center rounded bg-foreground">
          <Check className="h-3.5 w-3.5 text-background" />
        </div>
      );
    }
    return (
      <div className="flex h-6 w-6 items-center justify-center rounded bg-muted-foreground">
        <X className="h-3.5 w-3.5 text-background" />
      </div>
    );
  };

  const getStatusStyle = () => {
    if (solution.selectedOptionId === null) {
      return 'border-border';
    }
    if (solution.isCorrect) {
      return 'border-foreground/30 bg-secondary/30';
    }
    return 'border-muted-foreground/30 bg-secondary/20';
  };

  return (
    <AccordionItem
      value={solution.questionId}
      className={cn('rounded-lg border px-4', getStatusStyle())}
    >
      <AccordionTrigger className="py-4 hover:no-underline">
        <div className="flex flex-1 items-center gap-3 text-left">
          {getStatusIcon()}
          <span className="font-medium">Q{solution.order}.</span>
          <span className="line-clamp-1 flex-1 text-sm text-muted-foreground">
            {solution.questionText}
          </span>
          <div className="mr-4 flex gap-2">
            <Badge variant="outline" className="text-xs">
              {typeConfig?.label || solution.questionType}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {difficultyConfig?.label || solution.difficulty}
            </Badge>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-4">
        <div className="space-y-4 pt-2">
          {/* Question */}
          <div className="rounded-lg border border-border bg-secondary/30 p-4">
            <p className="whitespace-pre-wrap font-medium">
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
                    'flex items-center gap-3 rounded-lg border p-3',
                    isCorrectOption && 'border-foreground bg-secondary',
                    isSelected && !isCorrectOption && 'border-muted-foreground bg-secondary/50 border-dashed',
                    !isCorrectOption && !isSelected && 'border-border opacity-50'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded text-sm font-medium',
                      isCorrectOption && 'bg-foreground text-background',
                      isSelected && !isCorrectOption && 'bg-muted-foreground text-background',
                      !isCorrectOption && !isSelected && 'bg-secondary'
                    )}
                  >
                    {isCorrectOption ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : isSelected && !isCorrectOption ? (
                      <X className="h-3.5 w-3.5" />
                    ) : (
                      String.fromCharCode(65 + optIndex)
                    )}
                  </div>
                  <span className={cn(
                    'flex-1 text-sm',
                    isCorrectOption && 'font-medium',
                    isSelected && !isCorrectOption && 'text-muted-foreground'
                  )}>
                    {option.text}
                  </span>
                  <div className="flex items-center gap-2">
                    {isCorrectOption && (
                      <span className="text-xs font-medium">Correct</span>
                    )}
                    {isSelected && !isCorrectOption && (
                      <span className="text-xs text-muted-foreground">Your answer</span>
                    )}
                    {isSelected && isCorrectOption && (
                      <span className="text-xs font-medium">Your answer</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Explanation */}
          {solution.explanation && (
            <div className="rounded-lg border border-border bg-secondary/50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-foreground">
                  <Lightbulb className="h-3.5 w-3.5 text-background" />
                </div>
                <div className="flex-1">
                  <p className="mb-1 text-sm font-medium">Explanation</p>
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">
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