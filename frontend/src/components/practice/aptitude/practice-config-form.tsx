// src/components/practice/aptitude/practice-config-form.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../ui/card';
import { Button } from '../../ui/button';
import { Checkbox } from '../../ui/checkbox';
import { Label } from '../../ui/label';
import { Slider } from '../../ui/slider';
import { Badge } from '../../ui/badge';
import { Separator } from '../../ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../ui/alert-dialog';
import { useAptitude } from '../../../lib/hooks/use-aptitude';
import {
  QUESTION_TYPE_CONFIG,
  DIFFICULTY_CONFIG,
  QUESTION_LIMITS,
  TIME_LIMITS,
  RECOMMENDED_TIME_LIMITS,
  formatDuration,
  calculateRecommendedTime,
} from '../../../lib/constants/aptitude.constants';
import type {
  QuestionType,
  DifficultyLevel,
  SessionListItem,
  AptitudeQuestionTypeInfo,
  DifficultyLevelInfo,
} from '../../../types/aptitude.types';
import {
  Brain,
  Calculator,
  BookOpen,
  Puzzle,
  Clock,
  Loader2,
  Zap,
  Target,
  TrendingUp,
  Info,
  Play,
  AlertCircle,
  Check,
} from 'lucide-react';
import { cn } from '../../../lib/utils';

// Icon mapping
const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Calculator,
  BookOpen,
  Puzzle,
  Brain,
  calculator: Calculator,
  'book-open': BookOpen,
  puzzle: Puzzle,
};

// Helper type for normalized question type option
interface NormalizedQuestionType {
  value: QuestionType;
  label: string;
  description: string;
  icon: string;
}

// Helper type for normalized difficulty option
interface NormalizedDifficulty {
  value: DifficultyLevel;
  label: string;
  description: string;
}

export function PracticeConfigForm() {
  const {
    createSession,
    listSessions,
    resumeSession,
    fetchConfig,
    isLoading,
    difficultyLevels,
    questionTypeOptions,
    timeLimitConfig,
  } = useAptitude();

  // Form state
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>(['QUANTITATIVE']);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('MEDIUM');
  const [numberOfQuestions, setNumberOfQuestions] = useState(QUESTION_LIMITS.DEFAULT);
  const [timeLimit, setTimeLimit] = useState(TIME_LIMITS.DEFAULT);
  const [useRecommendedTime, setUseRecommendedTime] = useState(true);

  // Active session state
  const [activeSession, setActiveSession] = useState<SessionListItem | null>(null);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Ref to prevent double initialization
  const hasInitialized = useRef(false);

  // Initialize: fetch config and check for active sessions
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initialize = async () => {
      setIsInitializing(true);
      try {
        await fetchConfig();

        const sessionsData = await listSessions({
          status: 'in_progress',
          limit: 1,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        });

        if (sessionsData && sessionsData.sessions.length > 0) {
          setActiveSession(sessionsData.sessions[0]);
          setShowResumeDialog(true);
        }
      } catch (error) {
        console.error('Failed to initialize:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initialize();
  }, [fetchConfig, listSessions]);

  // Update time limit when difficulty or question count changes
  useEffect(() => {
    if (useRecommendedTime) {
      const recommended = calculateRecommendedTime(numberOfQuestions, difficulty);
      setTimeLimit(recommended);
    }
  }, [numberOfQuestions, difficulty, useRecommendedTime]);

  // Normalize question type options
  const normalizedQuestionTypes: NormalizedQuestionType[] =
    questionTypeOptions.length > 0
      ? questionTypeOptions.map((opt: AptitudeQuestionTypeInfo) => ({
          value: opt.value,
          label: opt.label,
          description: opt.description,
          icon: opt.icon,
        }))
      : Object.values(QUESTION_TYPE_CONFIG).map((config) => ({
          value: config.value,
          label: config.label,
          description: config.description,
          icon: config.icon,
        }));

  // Normalize difficulty options
  const normalizedDifficulties: NormalizedDifficulty[] =
    difficultyLevels.length > 0
      ? difficultyLevels.map((opt: DifficultyLevelInfo) => ({
          value: opt.value,
          label: opt.label,
          description: opt.description,
        }))
      : Object.values(DIFFICULTY_CONFIG).map((config) => ({
          value: config.value,
          label: config.label,
          description: `${config.timePerQuestion}s / question`,
        }));

  // Get time limit bounds
  const getTimeLimitBounds = () => {
    if (timeLimitConfig && timeLimitConfig[difficulty]) {
      return timeLimitConfig[difficulty];
    }
    return RECOMMENDED_TIME_LIMITS[difficulty];
  };

  const timeBounds = getTimeLimitBounds();

  // Handle question type toggle
  const handleTypeToggle = (type: QuestionType) => {
    setSelectedTypes((prev) => {
      if (prev.includes(type)) {
        if (prev.length === 1) return prev;
        return prev.filter((t) => t !== type);
      }
      if (prev.length >= 3) return prev;
      return [...prev, type];
    });
  };

  // Handle form submission
  const handleStart = async () => {
    try {
      await createSession({
        questionTypes: selectedTypes,
        difficulty,
        numberOfQuestions,
        timeLimit,
      });
    } catch {
      // Error handled in hook
    }
  };

  // Handle resume session
  const handleResumeSession = async () => {
    if (activeSession) {
      try {
        await resumeSession(activeSession.id);
      } catch {
        setShowResumeDialog(false);
      }
    }
  };

  // Handle start new
  const handleStartNew = () => {
    setActiveSession(null);
    setShowResumeDialog(false);
  };

  // Get icon component
  const getIconComponent = (iconName: string): React.ComponentType<{ className?: string }> => {
    return ICONS[iconName] || ICONS[iconName.toLowerCase()] || Brain;
  };

  if (isInitializing) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="space-y-4 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Resume Session Dialog */}
      <AlertDialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Active Session Found
            </AlertDialogTitle>
            <AlertDialogDescription>
              You have an active practice session in progress. Would you like to
              continue where you left off or start a new session?
            </AlertDialogDescription>
          </AlertDialogHeader>
          {activeSession && (
            <div className="space-y-3 py-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {DIFFICULTY_CONFIG[activeSession.difficulty]?.label || activeSession.difficulty}
                </Badge>
                <Badge variant="secondary">
                  {activeSession.numberOfQuestions} questions
                </Badge>
                <Badge variant="secondary">
                  {activeSession.timeLimit} min
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Question types:{' '}
                {activeSession.questionTypes
                  .map((t) => QUESTION_TYPE_CONFIG[t]?.label || t)
                  .join(', ')}
              </p>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleStartNew}>
              Start New
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleResumeSession}>
              <Play className="mr-2 h-4 w-4" />
              Resume Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="mx-auto max-w-2xl space-y-6">
        {/* Question Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-4 w-4" />
              Question Types
            </CardTitle>
            <CardDescription>
              Select 1-3 question types to practice
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {normalizedQuestionTypes.map((config) => {
              const IconComponent = getIconComponent(config.icon);
              const isSelected = selectedTypes.includes(config.value);

              return (
                <div
                  key={config.value}
                  className={cn(
                    'flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-colors',
                    isSelected
                      ? 'border-foreground bg-secondary'
                      : 'border-border hover:bg-secondary/50'
                  )}
                  onClick={() => handleTypeToggle(config.value)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleTypeToggle(config.value);
                    }
                  }}
                >
                  <Checkbox
                    id={config.value}
                    checked={isSelected}
                    onCheckedChange={() => handleTypeToggle(config.value)}
                  />
                  <div
                    className={cn(
                      'rounded-md p-2 transition-colors',
                      isSelected ? 'bg-foreground text-background' : 'bg-secondary'
                    )}
                  >
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <Label
                      htmlFor={config.value}
                      className="cursor-pointer font-medium"
                    >
                      {config.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {config.description}
                    </p>
                  </div>
                  {isSelected && (
                    <Check className="h-4 w-4 text-foreground" />
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Difficulty Level */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-4 w-4" />
              Difficulty Level
            </CardTitle>
            <CardDescription>
              Choose your challenge level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {normalizedDifficulties.map((config) => (
                <button
                  key={config.value}
                  type="button"
                  className={cn(
                    'relative rounded-lg border p-4 text-center transition-colors',
                    difficulty === config.value
                      ? 'border-foreground bg-secondary'
                      : 'border-border hover:bg-secondary/50'
                  )}
                  onClick={() => setDifficulty(config.value)}
                >
                  <div className="font-medium">{config.label}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {config.description}
                  </div>
                  {difficulty === config.value && (
                    <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-foreground">
                      <Check className="h-3 w-3 text-background" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Number of Questions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-4 w-4" />
              Number of Questions
            </CardTitle>
            <CardDescription>
              Select between {QUESTION_LIMITS.MIN} and {QUESTION_LIMITS.MAX} questions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-semibold">{numberOfQuestions}</span>
              <span className="text-muted-foreground">questions</span>
            </div>

            <Slider
              value={[numberOfQuestions]}
              onValueChange={([value]) => setNumberOfQuestions(value)}
              min={QUESTION_LIMITS.MIN}
              max={QUESTION_LIMITS.MAX}
              step={QUESTION_LIMITS.STEP}
              className="w-full"
            />

            <div className="flex justify-between px-1 text-xs text-muted-foreground">
              <span>{QUESTION_LIMITS.MIN}</span>
              <span>{Math.round(QUESTION_LIMITS.MAX / 2)}</span>
              <span>{QUESTION_LIMITS.MAX}</span>
            </div>

            {/* Quick Select */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Quick:</span>
              {QUESTION_LIMITS.RECOMMENDED.map((num) => (
                <Button
                  key={num}
                  variant={numberOfQuestions === num ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setNumberOfQuestions(num)}
                  className="h-8 min-w-[3rem]"
                >
                  {num}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Time Limit */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-4 w-4" />
              Time Limit
            </CardTitle>
            <CardDescription>
              Set a time limit for your session
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="useRecommended"
                  checked={useRecommendedTime}
                  onCheckedChange={(checked) => setUseRecommendedTime(!!checked)}
                />
                <Label htmlFor="useRecommended" className="cursor-pointer text-sm">
                  Use recommended time
                </Label>
              </div>
              <Badge variant="secondary" className="px-3 py-1.5 text-sm font-medium">
                {formatDuration(timeLimit)}
              </Badge>
            </div>

            {!useRecommendedTime && (
              <>
                <Slider
                  value={[timeLimit]}
                  onValueChange={([value]) => setTimeLimit(value)}
                  min={timeBounds.min}
                  max={timeBounds.max}
                  step={5}
                  className="w-full"
                />

                <div className="flex justify-between px-1 text-xs text-muted-foreground">
                  <span>{timeBounds.min} min</span>
                  <span>Recommended: {timeBounds.recommended} min</span>
                  <span>{timeBounds.max} min</span>
                </div>
              </>
            )}

            {useRecommendedTime && (
              <div className="flex items-center gap-2 rounded-lg bg-secondary p-3 text-sm text-muted-foreground">
                <Info className="h-4 w-4 shrink-0" />
                <span>
                  Based on {numberOfQuestions} questions at{' '}
                  {DIFFICULTY_CONFIG[difficulty]?.label || difficulty} difficulty
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary & Start */}
        <Card className="border-foreground/20">
          <CardContent className="pt-6">
            <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="h-4 w-4" />
              <span>Review your configuration</span>
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
              {selectedTypes.map((type) => (
                <Badge key={type} variant="outline">
                  {QUESTION_TYPE_CONFIG[type]?.label || type}
                </Badge>
              ))}
              <Badge variant="outline">
                {DIFFICULTY_CONFIG[difficulty]?.label || difficulty}
              </Badge>
              <Badge variant="outline">{numberOfQuestions} questions</Badge>
              <Badge variant="outline">{formatDuration(timeLimit)}</Badge>
            </div>

            <Separator className="my-4" />

            <Button
              className="h-12 w-full text-base font-medium"
              size="lg"
              onClick={handleStart}
              disabled={isLoading || selectedTypes.length === 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start Practice Session
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}