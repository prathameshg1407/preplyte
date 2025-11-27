// src/components/practice/aptitude/question-display.tsx

'use client';

import { Card, CardContent, CardHeader } from '../../ui/card';
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import { Loader2, Check, X } from 'lucide-react';
import type { SessionQuestion } from '../../../types/aptitude.types';
import {
  QUESTION_TYPE_CONFIG,
  DIFFICULTY_CONFIG,
} from '../../../lib/constants/aptitude.constants';
import { cn } from '../../../lib/utils';

interface QuestionDisplayProps {
  question: SessionQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: string | undefined;
  onSelectAnswer: (optionId: string) => void;
  showResult?: boolean;
  isSaving?: boolean;
  disabled?: boolean;
}

export function QuestionDisplay({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onSelectAnswer,
  showResult = false,
  isSaving = false,
  disabled = false,
}: QuestionDisplayProps) {
  const typeConfig = QUESTION_TYPE_CONFIG[question.questionType];
  const difficultyConfig = DIFFICULTY_CONFIG[question.difficulty];

  const getOptionClassName = (optionId: string) => {
    const baseClasses =
      'flex items-center gap-4 p-4 rounded-lg border transition-colors';

    if (!showResult) {
      if (selectedAnswer === optionId) {
        return cn(baseClasses, 'border-foreground bg-secondary');
      }
      return cn(
        baseClasses,
        disabled || isSaving
          ? 'border-border opacity-50 cursor-not-allowed'
          : 'border-border hover:border-foreground/50 hover:bg-secondary/50 cursor-pointer'
      );
    }

    // Show results mode
    const option = question.options.find((o) => o.id === optionId);
    const isCorrect = option?.isCorrect;

    if (isCorrect) {
      return cn(baseClasses, 'border-foreground bg-secondary');
    }
    if (selectedAnswer === optionId && !isCorrect) {
      return cn(baseClasses, 'border-foreground/50 bg-secondary/50 border-dashed');
    }
    return cn(baseClasses, 'border-border opacity-40');
  };

  const getOptionLetter = (index: number) => String.fromCharCode(65 + index);

  const handleSelectAnswer = (optionId: string) => {
    if (!showResult && !isSaving && !disabled) {
      onSelectAnswer(optionId);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        {/* Question Meta */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">
              Question {questionNumber} of {totalQuestions}
            </span>
            {isSaving && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving...
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {typeConfig && (
              <Badge variant="outline">
                {typeConfig.label}
              </Badge>
            )}
            {difficultyConfig && (
              <Badge variant="secondary">
                {difficultyConfig.label}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question Text */}
        <div className="rounded-lg border border-border bg-secondary/30 p-6">
          <p className="text-base leading-relaxed whitespace-pre-wrap">
            {question.questionText}
          </p>
        </div>

        {/* Options */}
        <RadioGroup
          value={selectedAnswer}
          onValueChange={handleSelectAnswer}
          disabled={showResult || isSaving || disabled}
          className="space-y-2"
        >
          {question.options.map((option, index) => {
            const isCorrect = option.isCorrect;
            const isSelected = selectedAnswer === option.id;

            return (
              <div
                key={option.id}
                className={getOptionClassName(option.id)}
                onClick={() => handleSelectAnswer(option.id)}
                role="button"
                tabIndex={showResult || isSaving || disabled ? -1 : 0}
                onKeyDown={(e) => {
                  if (
                    !showResult &&
                    !isSaving &&
                    !disabled &&
                    (e.key === 'Enter' || e.key === ' ')
                  ) {
                    e.preventDefault();
                    handleSelectAnswer(option.id);
                  }
                }}
              >
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-sm font-medium transition-colors',
                    isSelected && !showResult
                      ? 'bg-foreground text-background'
                      : showResult && isCorrect
                      ? 'bg-foreground text-background'
                      : showResult && isSelected && !isCorrect
                      ? 'bg-muted-foreground text-background'
                      : 'bg-secondary'
                  )}
                >
                  {showResult && isCorrect ? (
                    <Check className="h-4 w-4" />
                  ) : showResult && isSelected && !isCorrect ? (
                    <X className="h-4 w-4" />
                  ) : (
                    getOptionLetter(index)
                  )}
                </div>

                <RadioGroupItem
                  value={option.id}
                  id={option.id}
                  disabled={showResult || isSaving || disabled}
                  className="sr-only"
                />

                <Label
                  htmlFor={option.id}
                  className={cn(
                    'flex-1 text-sm',
                    showResult || isSaving || disabled ? 'cursor-default' : 'cursor-pointer',
                    showResult && isCorrect && 'font-medium',
                    showResult && isSelected && !isCorrect && 'text-muted-foreground'
                  )}
                >
                  {option.text}
                </Label>

                {/* Result Indicators */}
                {showResult && isCorrect && (
                  <span className="shrink-0 text-xs font-medium">Correct</span>
                )}
                {showResult && isSelected && !isCorrect && (
                  <span className="shrink-0 text-xs text-muted-foreground">Incorrect</span>
                )}
              </div>
            );
          })}
        </RadioGroup>

        {/* Result Summary */}
        {showResult && (
          <div className="rounded-lg border border-border bg-secondary/30 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Your answer</span>
              <span className={cn(
                "font-medium",
                question.options.find(o => o.id === selectedAnswer)?.isCorrect
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}>
                {question.options.find(o => o.id === selectedAnswer)?.isCorrect
                  ? "Correct"
                  : "Incorrect"}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}