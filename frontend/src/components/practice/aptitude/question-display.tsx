// src/components/practice/aptitude/question-display.tsx

'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import type { SessionQuestion } from '@/types/aptitude.types';
import {
  QUESTION_TYPE_CONFIG,
  DIFFICULTY_CONFIG,
} from '@/lib/constants/aptitude.constants';
import { cn } from '@/lib/utils';

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
      'flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200';

    if (!showResult) {
      if (selectedAnswer === optionId) {
        return cn(baseClasses, 'border-primary bg-primary/5 shadow-sm');
      }
      return cn(
        baseClasses,
        disabled || isSaving
          ? 'border-border opacity-50 cursor-not-allowed'
          : 'border-border hover:border-primary/50 hover:bg-muted/50 cursor-pointer'
      );
    }

    // Show results mode
    const option = question.options.find((o) => o.id === optionId);
    const isCorrect = option?.isCorrect;

    if (isCorrect) {
      return cn(baseClasses, 'border-green-500 bg-green-500/10');
    }
    if (selectedAnswer === optionId && !isCorrect) {
      return cn(baseClasses, 'border-red-500 bg-red-500/10');
    }
    return cn(baseClasses, 'border-border opacity-50');
  };

  const getOptionLetter = (index: number) => String.fromCharCode(65 + index);

  const handleSelectAnswer = (optionId: string) => {
    if (!showResult && !isSaving && !disabled) {
      onSelectAnswer(optionId);
    }
  };

  return (
    <Card className="border-2">
      <CardHeader className="pb-4">
        {/* Question Meta */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-sm font-medium px-3">
              {questionNumber} / {totalQuestions}
            </Badge>
            {isSaving && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving...
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {typeConfig && (
              <Badge
                variant="outline"
                className={cn('px-3', typeConfig.color, 'border-current bg-current/10')}
              >
                {typeConfig.label}
              </Badge>
            )}
            {difficultyConfig && (
              <Badge
                variant="outline"
                className={cn('px-3', difficultyConfig.color, 'border-current bg-current/10')}
              >
                {difficultyConfig.label}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question Text */}
        <div className="bg-muted/50 rounded-xl p-6">
          <h2 className="text-lg font-medium leading-relaxed whitespace-pre-wrap">
            {question.questionText}
          </h2>
        </div>

        {/* Options */}
        <RadioGroup
          value={selectedAnswer}
          onValueChange={handleSelectAnswer}
          disabled={showResult || isSaving || disabled}
          className="space-y-3"
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
                    'flex items-center justify-center w-10 h-10 rounded-lg font-semibold text-sm',
                    isSelected && !showResult
                      ? 'bg-primary text-primary-foreground'
                      : showResult && isCorrect
                      ? 'bg-green-500 text-white'
                      : showResult && isSelected && !isCorrect
                      ? 'bg-red-500 text-white'
                      : 'bg-muted'
                  )}
                >
                  {getOptionLetter(index)}
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
                    'flex-1 text-base',
                    showResult || isSaving || disabled ? 'cursor-default' : 'cursor-pointer'
                  )}
                >
                  {option.text}
                </Label>

                {/* Result Indicators */}
                {showResult && isCorrect && (
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                )}
                {showResult && isSelected && !isCorrect && (
                  <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}