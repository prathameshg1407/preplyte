// src/components/practice/aptitude/solution-item.tsx

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { SolutionItem as SolutionItemType } from '@/types/aptitude.types';
import {
  QUESTION_TYPE_CONFIG,
  DIFFICULTY_CONFIG,
} from '@/lib/constants/aptitude.constants';
import { CheckCircle2, XCircle, MinusCircle, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SolutionItemProps {
  solution: SolutionItemType;
  index: number;
}

export function SolutionItem({ solution, index }: SolutionItemProps) {
  const typeConfig = QUESTION_TYPE_CONFIG[solution.questionType];
  const difficultyConfig = DIFFICULTY_CONFIG[solution.difficulty];

  const getStatusIcon = () => {
    if (solution.selectedOptionId === null) {
      return <MinusCircle className="h-5 w-5 text-muted-foreground" />;
    }
    if (solution.isCorrect) {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  const getStatusColor = () => {
    if (solution.selectedOptionId === null) {
      return 'border-muted-foreground/30 bg-muted/5';
    }
    if (solution.isCorrect) {
      return 'border-green-500/30 bg-green-500/5';
    }
    return 'border-red-500/30 bg-red-500/5';
  };

  return (
    <AccordionItem
      value={solution.questionId}
      className={cn('border rounded-lg px-4', getStatusColor())}
    >
      <AccordionTrigger className="hover:no-underline py-4">
        <div className="flex items-center gap-3 text-left flex-1">
          {getStatusIcon()}
          <span className="font-medium">Q{solution.order}.</span>
          <span className="text-sm text-muted-foreground line-clamp-1 flex-1">
            {solution.questionText}
          </span>
          <div className="flex gap-2 mr-4">
            <Badge variant="outline" className={cn('text-xs', typeConfig?.color)}>
              {typeConfig?.label || solution.questionType}
            </Badge>
            <Badge
              variant="outline"
              className={cn('text-xs', difficultyConfig?.color)}
            >
              {difficultyConfig?.label || solution.difficulty}
            </Badge>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-4">
        <div className="space-y-4 pt-2">
          {/* Question */}
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="font-medium whitespace-pre-wrap">
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
                    'p-3 rounded-lg border-2 flex items-center gap-3',
                    isCorrectOption && 'border-green-500 bg-green-500/10',
                    isSelected && !isCorrectOption && 'border-red-500 bg-red-500/10',
                    !isCorrectOption && !isSelected && 'border-border bg-muted/30'
                  )}
                >
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-sm',
                      isCorrectOption && 'bg-green-500 text-white',
                      isSelected && !isCorrectOption && 'bg-red-500 text-white',
                      !isCorrectOption && !isSelected && 'bg-muted'
                    )}
                  >
                    {String.fromCharCode(65 + optIndex)}
                  </div>
                  <span className="flex-1">{option.text}</span>
                  <div className="flex items-center gap-2">
                    {isCorrectOption && (
                      <Badge variant="outline" className="text-green-500 border-green-500">
                        Correct
                      </Badge>
                    )}
                    {isSelected && !isCorrectOption && (
                      <Badge variant="outline" className="text-red-500 border-red-500">
                        Your Answer
                      </Badge>
                    )}
                    {isSelected && isCorrectOption && (
                      <Badge variant="outline" className="text-green-500 border-green-500">
                        Your Answer ✓
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Explanation */}
          {solution.explanation && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm text-primary mb-1">
                    Explanation
                  </p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
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