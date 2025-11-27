// src/components/institute-admin/mock-drive/modules/interview-config.tsx

'use client';

import { useState, useCallback, type KeyboardEvent } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AiInterviewDifficulty } from '@/types/admin.mockdrive.types';
import {
  AI_INTERVIEW_DIFFICULTY_CONFIG,
  VALIDATION,
} from '@/lib/constants/admin.mockdrive.constants';
import { Plus, X, Briefcase, Building2, AlertCircle } from 'lucide-react';

interface InterviewConfigProps {
  config: Record<string, unknown>;
  onUpdate: (updates: Record<string, unknown>) => void;
}

// Common focus areas for suggestions
const SUGGESTED_FOCUS_AREAS = [
  'Data Structures',
  'Algorithms',
  'System Design',
  'Object-Oriented Programming',
  'Database Design',
  'Problem Solving',
  'Communication Skills',
  'Leadership',
  'Teamwork',
  'Project Management',
  'API Design',
  'Testing',
  'Code Quality',
  'Performance Optimization',
] as const;

export function InterviewConfig({ config, onUpdate }: InterviewConfigProps) {
  const [newFocusArea, setNewFocusArea] = useState('');

  // Extract config values with defaults
  const difficulty =
    (config.difficulty as AiInterviewDifficulty) || AiInterviewDifficulty.MID;
  const targetQuestions = (config.targetQuestions as number) || 10;
  const jobTitle = (config.jobTitle as string) || '';
  const companyName = (config.companyName as string) || '';
  const focusAreas = (config.focusAreas as string[]) || [];

  // Handlers
  const handleDifficultyChange = useCallback(
    (value: string) => {
      onUpdate({ difficulty: value });
    },
    [onUpdate]
  );

  const handleTargetQuestionsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value, 10);
      if (!isNaN(value) && value >= VALIDATION.AI_INTERVIEW.MIN_QUESTIONS) {
        onUpdate({
          targetQuestions: Math.min(value, VALIDATION.AI_INTERVIEW.MAX_QUESTIONS),
        });
      }
    },
    [onUpdate]
  );

  const handleJobTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({ jobTitle: e.target.value });
    },
    [onUpdate]
  );

  const handleCompanyNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({ companyName: e.target.value || null });
    },
    [onUpdate]
  );

  const addFocusArea = useCallback(() => {
    const trimmed = newFocusArea.trim();
    if (
      trimmed &&
      !focusAreas.includes(trimmed) &&
      focusAreas.length < VALIDATION.AI_INTERVIEW.MAX_FOCUS_AREAS
    ) {
      onUpdate({ focusAreas: [...focusAreas, trimmed] });
      setNewFocusArea('');
    }
  }, [newFocusArea, focusAreas, onUpdate]);

  const removeFocusArea = useCallback(
    (area: string) => {
      onUpdate({ focusAreas: focusAreas.filter((a) => a !== area) });
    },
    [focusAreas, onUpdate]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addFocusArea();
      }
    },
    [addFocusArea]
  );

  const addSuggestedArea = useCallback(
    (area: string) => {
      if (
        !focusAreas.includes(area) &&
        focusAreas.length < VALIDATION.AI_INTERVIEW.MAX_FOCUS_AREAS
      ) {
        onUpdate({ focusAreas: [...focusAreas, area] });
      }
    },
    [focusAreas, onUpdate]
  );

  const hasNoFocusAreas = focusAreas.length === 0;
  const hasNoJobTitle = !jobTitle.trim();

  return (
    <div className="space-y-6">
      {/* Row 1: Difficulty and Target Questions */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Difficulty Level */}
        <div className="space-y-2">
          <Label>Difficulty Level</Label>
          <Select value={difficulty} onValueChange={handleDifficultyChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(AI_INTERVIEW_DIFFICULTY_CONFIG).map(([level, conf]) => (
                <SelectItem key={level} value={level}>
                  <div className="flex flex-col">
                    <span className="font-medium">{conf.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {conf.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {AI_INTERVIEW_DIFFICULTY_CONFIG[difficulty]?.yearsOfExperience}
          </p>
        </div>

        {/* Target Questions */}
        <div className="space-y-2">
          <Label htmlFor="targetQuestions">Target Questions</Label>
          <Input
            id="targetQuestions"
            type="number"
            min={VALIDATION.AI_INTERVIEW.MIN_QUESTIONS}
            max={VALIDATION.AI_INTERVIEW.MAX_QUESTIONS}
            value={targetQuestions}
            onChange={handleTargetQuestionsChange}
          />
          <p className="text-xs text-muted-foreground">
            Approximate number of questions ({VALIDATION.AI_INTERVIEW.MIN_QUESTIONS}-
            {VALIDATION.AI_INTERVIEW.MAX_QUESTIONS})
          </p>
        </div>
      </div>

      {/* Row 2: Job Title and Company Name */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Job Title */}
        <div className="space-y-2">
          <Label htmlFor="jobTitle" className="flex items-center gap-2">
            <Briefcase className="h-3.5 w-3.5" />
            Job Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="jobTitle"
            placeholder="e.g., Software Engineer"
            value={jobTitle}
            onChange={handleJobTitleChange}
            className={hasNoJobTitle ? 'border-amber-300' : ''}
          />
          {hasNoJobTitle && (
            <p className="text-xs text-amber-600">Job title is required</p>
          )}
        </div>

        {/* Company Name */}
        <div className="space-y-2">
          <Label htmlFor="companyName" className="flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5" />
            Company Name (optional)
          </Label>
          <Input
            id="companyName"
            placeholder="e.g., Tech Corp"
            value={companyName}
            onChange={handleCompanyNameChange}
          />
          <p className="text-xs text-muted-foreground">
            Leave empty for generic interview
          </p>
        </div>
      </div>

      {/* Focus Areas */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Focus Areas</Label>
          <span className="text-xs text-muted-foreground">
            {focusAreas.length}/{VALIDATION.AI_INTERVIEW.MAX_FOCUS_AREAS}
          </span>
        </div>

        {/* Input for custom focus area */}
        <div className="flex gap-2">
          <Input
            placeholder="Add a focus area..."
            value={newFocusArea}
            onChange={(e) => setNewFocusArea(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={focusAreas.length >= VALIDATION.AI_INTERVIEW.MAX_FOCUS_AREAS}
          />
          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={addFocusArea}
            disabled={
              !newFocusArea.trim() ||
              focusAreas.length >= VALIDATION.AI_INTERVIEW.MAX_FOCUS_AREAS
            }
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Selected Focus Areas */}
        {focusAreas.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {focusAreas.map((area) => (
              <Badge key={area} variant="secondary" className="gap-1 pr-1">
                {area}
                <button
                  type="button"
                  onClick={() => removeFocusArea(area)}
                  className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                  aria-label={`Remove ${area}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Suggested Focus Areas */}
        {focusAreas.length < VALIDATION.AI_INTERVIEW.MAX_FOCUS_AREAS && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Suggestions:</p>
            <div className="flex flex-wrap gap-1">
              {SUGGESTED_FOCUS_AREAS.filter((area) => !focusAreas.includes(area))
                .slice(0, 8)
                .map((area) => (
                  <Button
                    key={area}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => addSuggestedArea(area)}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    {area}
                  </Button>
                ))}
            </div>
          </div>
        )}

        {/* Validation Warning */}
        {hasNoFocusAreas && (
          <Alert
            variant="destructive"
            className="border-amber-200 bg-amber-50 text-amber-800"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Adding focus areas helps the AI ask more relevant questions
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Summary Card */}
      <div className="rounded-lg border bg-muted/30 p-4">
        <h5 className="mb-3 text-sm font-medium">Configuration Summary</h5>
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Difficulty:</span>
            <span className="font-medium">
              {AI_INTERVIEW_DIFFICULTY_CONFIG[difficulty]?.label}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Target Questions:</span>
            <span className="font-medium">{targetQuestions}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Job Title:</span>
            <span className="font-medium">{jobTitle || 'Not set'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Company:</span>
            <span className="font-medium">{companyName || 'Generic'}</span>
          </div>
          <div className="flex justify-between sm:col-span-2">
            <span className="text-muted-foreground">Focus Areas:</span>
            <span className="font-medium">
              {focusAreas.length === 0
                ? 'None selected'
                : `${focusAreas.length} area${focusAreas.length !== 1 ? 's' : ''}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}