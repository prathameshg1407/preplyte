// src/components/mock-drive/attempt/modules/aptitude-module.tsx (fixed)

'use client';

import { FC, useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Flag, Check, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  AptitudeModuleConfig,
  AptitudeModuleData,
  ModuleConfig,
  ModuleData,
  AptitudeAnswerPayload,
  AptitudeClearPayload,
} from '@/types/mockdrive.types';
import {
  useAptitudeAnswer,
  useClearAptitudeAnswer,
} from '@/lib/hooks/mock-drive/use-attempt';
import { useAttemptStore } from '@/lib/store/mock-drive/attempt-store';

interface AptitudeModuleProps {
  driveId: string;
  moduleId: string;
  config: ModuleConfig;
  data: Partial<ModuleData> | null;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const AptitudeModule: FC<AptitudeModuleProps> = ({
  driveId,
  moduleId,
  config,
  data,
  onSubmit,
  isSubmitting,
}) => {
  const aptitudeConfig = config as AptitudeModuleConfig;
  const aptitudeData = data as AptitudeModuleData | null;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());

  const { localModuleData, updateLocalModuleData } = useAttemptStore();
  const localData = localModuleData as AptitudeModuleData | null;

  const answerMutation = useAptitudeAnswer();
  const clearMutation = useClearAptitudeAnswer();

  // Initialize local data from prop
  useEffect(() => {
    if (aptitudeData && !localData) {
      updateLocalModuleData(aptitudeData);
    }
  }, [aptitudeData, localData, updateLocalModuleData]);

  const questions = localData?.questions || aptitudeData?.questions || [];
  const currentQuestion = questions[currentIndex];

  // Question navigation
  const goToQuestion = (index: number) => {
    setCurrentIndex(index);
    setQuestionStartTime(Date.now());
  };

  const handleAnswer = (optionId: string) => {
    if (!currentQuestion) return;

    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);

    const payload: AptitudeAnswerPayload = {
      questionId: currentQuestion.questionId,
      selectedOptionId: optionId,
      timeSpent,
    };

    answerMutation.mutate(
      {
        driveId,
        moduleId,
        payload,
      },
      {
        onSuccess: (response) => {
          if (response.updatedData) {
            updateLocalModuleData(response.updatedData);
          }
        },
      }
    );
  };

  const handleClear = () => {
    if (!currentQuestion) return;

    const payload: AptitudeClearPayload = {
      questionId: currentQuestion.questionId,
    };

    clearMutation.mutate(
      {
        driveId,
        moduleId,
        payload,
      },
      {
        onSuccess: (response) => {
          if (response.updatedData) {
            updateLocalModuleData(response.updatedData);
          }
        },
      }
    );
  };

  const toggleFlag = () => {
    if (!currentQuestion) return;

    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestion.questionId)) {
        newSet.delete(currentQuestion.questionId);
      } else {
        newSet.add(currentQuestion.questionId);
      }
      return newSet;
    });
  };

  // Stats
  const stats = useMemo(() => {
    const answered = questions.filter((q) => q.selectedOptionId !== null).length;
    const flagged = flaggedQuestions.size;
    const unanswered = questions.length - answered;
    return { answered, flagged, unanswered, total: questions.length };
  }, [questions, flaggedQuestions]);

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Main Question Area */}
      <div className="lg:col-span-3 space-y-4">
        <Card>
          <CardContent className="p-6">
            {/* Question Header */}
            <div className="flex items-center justify-between mb-6">
              <Badge variant="outline">Question {currentIndex + 1}</Badge>
              <div className="flex items-center gap-2">
                <Button
                  variant={flaggedQuestions.has(currentQuestion.questionId) ? 'default' : 'outline'}
                  size="sm"
                  onClick={toggleFlag}
                >
                  <Flag className="h-4 w-4 mr-1" />
                  {flaggedQuestions.has(currentQuestion.questionId) ? 'Flagged' : 'Flag'}
                </Button>
              </div>
            </div>

            {/* Question Text */}
            <div className="mb-6">
              <p className="text-lg whitespace-pre-wrap">{currentQuestion.content}</p>
            </div>

            {/* Options */}
            <RadioGroup
              value={currentQuestion.selectedOptionId || ''}
              onValueChange={handleAnswer}
              className="space-y-3"
            >
              {currentQuestion.options.map((opt, idx) => (
                <div
                  key={opt.id}
                  className={cn(
                    'rounded-lg border transition-colors overflow-hidden',
                    currentQuestion.selectedOptionId === opt.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-primary/50'
                  )}
                >
                  <Label htmlFor={opt.id} className="cursor-pointer p-4 flex items-center space-x-3 w-full h-full m-0">
                    <RadioGroupItem value={opt.id} id={opt.id} />
                    <span className="flex-1 text-base">{opt.content}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {/* Actions */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleClear}
                disabled={!currentQuestion.selectedOptionId || clearMutation.isPending}
              >
                Clear Response
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => goToQuestion(currentIndex - 1)}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  onClick={() => goToQuestion(currentIndex + 1)}
                  disabled={currentIndex === questions.length - 1}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Question Palette */}
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-4">Question Palette</h3>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-500" />
                <span>Answered: {stats.answered}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gray-300" />
                <span>Unanswered: {stats.unanswered}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-500" />
                <span>Flagged: {stats.flagged}</span>
              </div>
            </div>

            {/* Question Grid */}
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, index) => {
                const isAnswered = q.selectedOptionId !== null;
                const isFlagged = flaggedQuestions.has(q.questionId);
                const isCurrent = index === currentIndex;

                return (
                  <button
                    key={q.questionId}
                    onClick={() => goToQuestion(index)}
                    className={cn(
                      'w-8 h-8 rounded text-sm font-medium transition-all',
                      isCurrent && 'ring-2 ring-primary ring-offset-2',
                      isAnswered && !isFlagged && 'bg-green-500 text-white',
                      isFlagged && 'bg-yellow-500 text-white',
                      !isAnswered && !isFlagged && 'bg-gray-200 hover:bg-gray-300'
                    )}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Submit Module
            </>
          )}
        </Button>
      </div>
    </div>
  );
};