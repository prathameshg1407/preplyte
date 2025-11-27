// src/components/institute-admin/mock-drive/modules/machine-config.tsx

'use client';

import { useCallback, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DifficultyLevel } from '@/types/admin.mockdrive.types';
import { DIFFICULTY_CONFIG, VALIDATION } from '@/lib/constants/admin.mockdrive.constants';
import { Plus, X, AlertCircle } from 'lucide-react';

// ============================================
// Constants
// ============================================

const SUPPORTED_LANGUAGES = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'C++',
  'C',
  'C#',
  'Go',
  'Rust',
  'Ruby',
  'PHP',
  'Swift',
  'Kotlin',
  'Scala',
  'R',
] as const;

// ============================================
// Types
// ============================================

interface MachineConfigProps {
  config: Record<string, unknown>;
  onUpdate: (updates: Record<string, unknown>) => void;
}

// ============================================
// Component
// ============================================

export function MachineConfig({ config, onUpdate }: MachineConfigProps) {
  const [newLanguage, setNewLanguage] = useState('');

  // Extract config values with defaults
  const difficulty = (config.difficulty as DifficultyLevel) || DifficultyLevel.MEDIUM;
  const numberOfQuestions = (config.numberOfQuestions as number) || 2;
  const maxScorePerQuestion = (config.maxScorePerQuestion as number) || 100;
  const partialScoring = (config.partialScoring as boolean) ?? true;
  const allowedLanguages = (config.allowedLanguages as string[]) || [];

  // Handlers
  const handleDifficultyChange = useCallback(
    (value: string) => {
      onUpdate({ difficulty: value });
    },
    [onUpdate]
  );

  const handleNumberOfQuestionsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value, 10);
      if (!isNaN(value) && value >= VALIDATION.MACHINE_CODING.MIN_QUESTIONS) {
        onUpdate({
          numberOfQuestions: Math.min(value, VALIDATION.MACHINE_CODING.MAX_QUESTIONS),
        });
      }
    },
    [onUpdate]
  );

  const handleMaxScoreChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value, 10);
      if (!isNaN(value) && value >= VALIDATION.MACHINE_CODING.MIN_SCORE) {
        onUpdate({
          maxScorePerQuestion: Math.min(value, VALIDATION.MACHINE_CODING.MAX_SCORE),
        });
      }
    },
    [onUpdate]
  );

  const handlePartialScoringChange = useCallback(
    (checked: boolean) => {
      onUpdate({ partialScoring: checked });
    },
    [onUpdate]
  );

  const addLanguage = useCallback(() => {
    const trimmed = newLanguage.trim();
    if (trimmed && !allowedLanguages.includes(trimmed)) {
      onUpdate({ allowedLanguages: [...allowedLanguages, trimmed] });
      setNewLanguage('');
    }
  }, [newLanguage, allowedLanguages, onUpdate]);

  const removeLanguage = useCallback(
    (lang: string) => {
      onUpdate({ allowedLanguages: allowedLanguages.filter((l) => l !== lang) });
    },
    [allowedLanguages, onUpdate]
  );

  const handleLanguageSelect = useCallback(
    (value: string) => {
      if (value && !allowedLanguages.includes(value)) {
        onUpdate({ allowedLanguages: [...allowedLanguages, value] });
      }
    },
    [allowedLanguages, onUpdate]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addLanguage();
      }
    },
    [addLanguage]
  );

  const hasNoLanguages = allowedLanguages.length === 0;
  const availableLanguages = SUPPORTED_LANGUAGES.filter(
    (lang) => !allowedLanguages.includes(lang)
  );

  return (
    <div className="space-y-6">
      {/* Row 1: Difficulty and Number of Questions */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Difficulty */}
        <div className="space-y-2">
          <Label>Difficulty</Label>
          <Select value={difficulty} onValueChange={handleDifficultyChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DIFFICULTY_CONFIG).map(([level, conf]) => (
                <SelectItem key={level} value={level}>
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${conf.color}`} aria-hidden="true" />
                    {conf.label}
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
          <Label htmlFor="mc-numberOfQuestions">Number of Questions</Label>
          <Input
            id="mc-numberOfQuestions"
            type="number"
            min={VALIDATION.MACHINE_CODING.MIN_QUESTIONS}
            max={VALIDATION.MACHINE_CODING.MAX_QUESTIONS}
            value={numberOfQuestions}
            onChange={handleNumberOfQuestionsChange}
          />
          <p className="text-xs text-muted-foreground">
            Between {VALIDATION.MACHINE_CODING.MIN_QUESTIONS} and{' '}
            {VALIDATION.MACHINE_CODING.MAX_QUESTIONS} questions
          </p>
        </div>
      </div>

      {/* Row 2: Max Score and Partial Scoring */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Max Score per Question */}
        <div className="space-y-2">
          <Label htmlFor="maxScorePerQuestion">Max Score per Question</Label>
          <Input
            id="maxScorePerQuestion"
            type="number"
            min={VALIDATION.MACHINE_CODING.MIN_SCORE}
            max={VALIDATION.MACHINE_CODING.MAX_SCORE}
            step={10}
            value={maxScorePerQuestion}
            onChange={handleMaxScoreChange}
          />
          <p className="text-xs text-muted-foreground">
            Total max score: {numberOfQuestions * maxScorePerQuestion}
          </p>
        </div>

        {/* Partial Scoring */}
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="space-y-0.5">
            <Label htmlFor="partialScoring" className="text-sm font-medium">
              Partial Scoring
            </Label>
            <p className="text-xs text-muted-foreground">
              Award partial marks for passing some test cases
            </p>
          </div>
          <Switch
            id="partialScoring"
            checked={partialScoring}
            onCheckedChange={handlePartialScoringChange}
          />
        </div>
      </div>

      {/* Allowed Languages */}
      <div className="space-y-3">
        <Label>Allowed Programming Languages</Label>

        {/* Quick Add from Predefined */}
        <div className="flex flex-wrap gap-2">
          <Select value="" onValueChange={handleLanguageSelect}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Add language..." />
            </SelectTrigger>
            <SelectContent>
              {availableLanguages.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Custom Language Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Custom language"
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-40"
            />
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={addLanguage}
              disabled={!newLanguage.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Selected Languages */}
        {allowedLanguages.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {allowedLanguages.map((lang) => (
              <Badge key={lang} variant="secondary" className="gap-1 pr-1">
                {lang}
                <button
                  type="button"
                  onClick={() => removeLanguage(lang)}
                  className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                  aria-label={`Remove ${lang}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Validation Warning */}
        {hasNoLanguages && (
          <Alert variant="destructive" className="border-amber-200 bg-amber-50 text-amber-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Please select at least one programming language</AlertDescription>
          </Alert>
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
            <span className="text-muted-foreground">Max Score:</span>
            <span className="font-medium">{numberOfQuestions * maxScorePerQuestion}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Partial Scoring:</span>
            <span className="font-medium">{partialScoring ? 'Enabled' : 'Disabled'}</span>
          </div>
          <div className="flex justify-between sm:col-span-2">
            <span className="text-muted-foreground">Languages:</span>
            <span className="font-medium">
              {allowedLanguages.length === 0
                ? 'None selected'
                : allowedLanguages.length <= 3
                  ? allowedLanguages.join(', ')
                  : `${allowedLanguages.length} languages`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}