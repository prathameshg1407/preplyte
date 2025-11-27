// src/components/institute-admin/mock-drive/modules/aptitude-config.tsx

'use client';

import { useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { DifficultyLevel, QuestionType } from '@/types/admin.mockdrive.types';
import {
  DIFFICULTY_CONFIG,
  QUESTION_TYPE_CONFIG,
  VALIDATION,
} from '@/lib/constants/admin.mockdrive.constants';

// ============================================
// Types
// ============================================

interface AptitudeConfigProps {
  config: Record<string, unknown>;
  onUpdate: (updates: Record<string, unknown>) => void;
}

// ============================================
// Component
// ============================================

export function AptitudeConfig({ config, onUpdate }: AptitudeConfigProps) {
  // Extract config values with defaults
  const difficulty = (config.difficulty as DifficultyLevel) || DifficultyLevel.MEDIUM;
  const questionTypes = (config.questionTypes as QuestionType[]) || [];
  const numberOfQuestions = (config.numberOfQuestions as number) || 30;
  const marksPerQuestion = (config.marksPerQuestion as number) || 1;
  const negativeMarking = (config.negativeMarking as number) || 0;

  // Calculated values
  const totalMarks = numberOfQuestions * marksPerQuestion;
  const hasNoQuestionTypes = questionTypes.length === 0;

  // Handlers
  const handleDifficultyChange = useCallback(
    (value: string) => {
      onUpdate({ difficulty: value as DifficultyLevel });
    },
    [onUpdate]
  );

  const handleNumberOfQuestionsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value, 10);
      if (!isNaN(value) && value >= VALIDATION.APTITUDE.MIN_QUESTIONS) {
        onUpdate({ numberOfQuestions: Math.min(value, VALIDATION.APTITUDE.MAX_QUESTIONS) });
      }
    },
    [onUpdate]
  );

  const handleMarksPerQuestionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value);
      if (!isNaN(value) && value >= VALIDATION.APTITUDE.MIN_MARKS) {
        onUpdate({ marksPerQuestion: Math.min(value, VALIDATION.APTITUDE.MAX_MARKS) });
      }
    },
    [onUpdate]
  );

  const handleNegativeMarkingChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value);
      if (!isNaN(value) && value >= 0) {
        onUpdate({ negativeMarking: Math.min(value, VALIDATION.APTITUDE.MAX_NEGATIVE) });
      }
    },
    [onUpdate]
  );

  const toggleQuestionType = useCallback(
    (type: QuestionType) => {
      const updatedTypes = questionTypes.includes(type)
        ? questionTypes.filter((t) => t !== type)
        : [...questionTypes, type];
      onUpdate({ questionTypes: updatedTypes });
    },
    [questionTypes, onUpdate]
  );

  const selectAllQuestionTypes = useCallback(() => {
    const allTypes = Object.keys(QUESTION_TYPE_CONFIG) as QuestionType[];
    onUpdate({ questionTypes: allTypes });
  }, [onUpdate]);

  const clearAllQuestionTypes = useCallback(() => {
    onUpdate({ questionTypes: [] });
  }, [onUpdate]);

  return (
    <div className="space-y-6">
      {/* Row 1: Difficulty and Number of Questions */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Difficulty */}
        <div className="space-y-2">
          <Label htmlFor="aptitude-difficulty">Difficulty Level</Label>
          <Select value={difficulty} onValueChange={handleDifficultyChange}>
            <SelectTrigger id="aptitude-difficulty">
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DIFFICULTY_CONFIG).map(([level, conf]) => (
                <SelectItem key={level} value={level}>
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${conf.color}`}
                      aria-hidden="true"
                    />
                    <span>{conf.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {DIFFICULTY_CONFIG[difficulty]?.description}
          </p>
        </div>

        {/* Number of Questions */}
        <div className="space-y-2">
          <Label htmlFor="aptitude-numberOfQuestions">Number of Questions</Label>
          <Input
            id="aptitude-numberOfQuestions"
            type="number"
            min={VALIDATION.APTITUDE.MIN_QUESTIONS}
            max={VALIDATION.APTITUDE.MAX_QUESTIONS}
            value={numberOfQuestions}
            onChange={handleNumberOfQuestionsChange}
          />
          <p className="text-xs text-muted-foreground">
            Between {VALIDATION.APTITUDE.MIN_QUESTIONS} and {VALIDATION.APTITUDE.MAX_QUESTIONS} questions
          </p>
        </div>
      </div>

      {/* Row 2: Marks per Question and Negative Marking */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Marks per Question */}
        <div className="space-y-2">
          <Label htmlFor="aptitude-marksPerQuestion">Marks per Question</Label>
          <Input
            id="aptitude-marksPerQuestion"
            type="number"
            min={VALIDATION.APTITUDE.MIN_MARKS}
            max={VALIDATION.APTITUDE.MAX_MARKS}
            step={0.5}
            value={marksPerQuestion}
            onChange={handleMarksPerQuestionChange}
          />
          <p className="text-xs text-muted-foreground">
            Total marks: <span className="font-medium">{totalMarks}</span>
          </p>
        </div>

        {/* Negative Marking */}
        <div className="space-y-2">
          <Label htmlFor="aptitude-negativeMarking">Negative Marking</Label>
          <Input
            id="aptitude-negativeMarking"
            type="number"
            min={0}
            max={VALIDATION.APTITUDE.MAX_NEGATIVE}
            step={0.25}
            value={negativeMarking}
            onChange={handleNegativeMarkingChange}
          />
          <p className="text-xs text-muted-foreground">
            {negativeMarking === 0
              ? 'No negative marking'
              : `Deduct ${negativeMarking} mark${negativeMarking !== 1 ? 's' : ''} for wrong answers`}
          </p>
        </div>
      </div>

      {/* Question Types */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Question Types</Label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={selectAllQuestionTypes}
              className="text-xs text-primary hover:underline"
              disabled={questionTypes.length === Object.keys(QUESTION_TYPE_CONFIG).length}
            >
              Select All
            </button>
            <span className="text-xs text-muted-foreground">|</span>
            <button
              type="button"
              onClick={clearAllQuestionTypes}
              className="text-xs text-primary hover:underline"
              disabled={questionTypes.length === 0}
            >
              Clear All
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {Object.entries(QUESTION_TYPE_CONFIG).map(([type, conf]) => {
            const isChecked = questionTypes.includes(type as QuestionType);
            return (
              <div
                key={type}
                className={`flex items-start space-x-3 rounded-lg border p-3 transition-colors ${
                  isChecked
                    ? 'border-primary/50 bg-primary/5'
                    : 'border-border hover:border-primary/30'
                }`}
              >
                <Checkbox
                  id={`qtype-${type}`}
                  checked={isChecked}
                  onCheckedChange={() => toggleQuestionType(type as QuestionType)}
                  className="mt-0.5"
                />
                <div className="space-y-1">
                  <label
                    htmlFor={`qtype-${type}`}
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {conf.label}
                  </label>
                  <p className="text-xs text-muted-foreground">
                    {conf.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Validation Warning */}
        {hasNoQuestionTypes && (
          <div className="flex items-center gap-2 rounded-md bg-amber-50 px-3 py-2 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4 shrink-0"
            >
              <path
                fillRule="evenodd"
                d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-xs">
              Please select at least one question type
            </p>
          </div>
        )}

        {/* Selected Types Summary */}
        {questionTypes.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Selected:</span>
            {questionTypes.map((type) => (
              <Badge key={type} variant="secondary" className="text-xs">
                {QUESTION_TYPE_CONFIG[type]?.label || type}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Summary Card */}
      <div className="rounded-lg border bg-muted/30 p-4">
        <h5 className="mb-3 text-sm font-medium">Configuration Summary</h5>
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Difficulty:</span>
            <span className="font-medium">{DIFFICULTY_CONFIG[difficulty]?.label}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Questions:</span>
            <span className="font-medium">{numberOfQuestions}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Marks:</span>
            <span className="font-medium">{totalMarks}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Negative Marking:</span>
            <span className="font-medium">
              {negativeMarking === 0 ? 'None' : `-${negativeMarking}`}
            </span>
          </div>
          <div className="flex justify-between sm:col-span-2">
            <span className="text-muted-foreground">Question Types:</span>
            <span className="font-medium">
              {questionTypes.length === 0
                ? 'None selected'
                : questionTypes.length === Object.keys(QUESTION_TYPE_CONFIG).length
                  ? 'All types'
                  : `${questionTypes.length} type${questionTypes.length !== 1 ? 's' : ''}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}