// src/components/practice/aptitude/practice-config-form.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAptitude } from '@/lib/hooks/use-aptitude';
import {
  QUESTION_TYPE_CONFIG,
  DIFFICULTY_CONFIG,
  QUESTION_LIMITS,
  TIME_LIMITS,
  RECOMMENDED_TIME_LIMITS,
  formatDuration,
  calculateRecommendedTime,
} from '@/lib/constants/aptitude.constants';
import type {
  QuestionType,
  DifficultyLevel,
  SessionListItem,
  AptitudeQuestionTypeInfo,
  DifficultyLevelInfo,
} from '@/types/aptitude.types';
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
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
    // Prevent double initialization in React Strict Mode
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initialize = async () => {
      setIsInitializing(true);
      try {
        // Fetch configuration
        await fetchConfig();

        // Check for active (in_progress) sessions
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

  // Normalize question type options for consistent rendering
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

  // Normalize difficulty options for consistent rendering
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

  // Get time limit bounds for current difficulty
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
  const requestData = {
    difficulty,
    questionTypes: selectedTypes,
    numberOfQuestions,
    timeLimit,
  };

  console.log('📤 Sending to backend:', JSON.stringify(requestData, null, 2));
  console.log('📤 Data types:', {
    difficulty: typeof difficulty,
    questionTypes: Array.isArray(selectedTypes),
    numberOfQuestions: typeof numberOfQuestions,
    timeLimit: typeof timeLimit,
  });
    try {
      await createSession({
        questionTypes: selectedTypes,
        difficulty,
        numberOfQuestions,
        timeLimit,
      });
    } catch {
      // Error is handled in the hook
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

  // Handle start new (dismiss active session dialog)
  const handleStartNew = () => {
    setActiveSession(null);
    setShowResumeDialog(false);
  };

  // Get icon component for question type
  const getIconComponent = (iconName: string): React.ComponentType<{ className?: string }> => {
    return ICONS[iconName] || ICONS[iconName.toLowerCase()] || Brain;
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading configuration...</p>
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
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Active Session Found
            </AlertDialogTitle>
            <AlertDialogDescription>
              You have an active practice session in progress. Would you like to
              continue where you left off or start a new session?
            </AlertDialogDescription>
          </AlertDialogHeader>
          {activeSession && (
            <div className="py-4 space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  {DIFFICULTY_CONFIG[activeSession.difficulty]?.label || activeSession.difficulty}
                </Badge>
                <Badge variant="outline">
                  {activeSession.numberOfQuestions} questions
                </Badge>
                <Badge variant="outline">
                  {activeSession.timeLimit} min
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Question types:{' '}
                {activeSession.questionTypes
                  .map((t) => QUESTION_TYPE_CONFIG[t]?.label || t)
                  .join(', ')}
              </div>
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

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Question Types Card */}
        <Card className="border-2">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Target className="h-5 w-5 text-primary" />
              Question Types
            </CardTitle>
            <CardDescription>
              Select 1-3 question types to practice. Mix them up for a
              comprehensive test!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {normalizedQuestionTypes.map((config) => {
              const IconComponent = getIconComponent(config.icon);
              const isSelected = selectedTypes.includes(config.value);

              return (
                <div
                  key={config.value}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200',
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
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
                    className="data-[state=checked]:bg-primary"
                  />
                  <div
                    className={cn(
                      'p-2.5 rounded-lg transition-colors',
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <Label
                      htmlFor={config.value}
                      className="text-base font-semibold cursor-pointer"
                    >
                      {config.label}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {config.description}
                    </p>
                  </div>
                  {isSelected && (
                    <Badge variant="secondary" className="ml-auto">
                      Selected
                    </Badge>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Difficulty Level Card */}
        <Card className="border-2">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <TrendingUp className="h-5 w-5 text-primary" />
              Difficulty Level
            </CardTitle>
            <CardDescription>
              Choose your challenge level. Higher difficulty means more complex
              questions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {normalizedDifficulties.map((config) => {
                const diffConfig = DIFFICULTY_CONFIG[config.value];

                return (
                  <button
                    key={config.value}
                    type="button"
                    className={cn(
                      'relative p-4 rounded-xl border-2 transition-all duration-200',
                      difficulty === config.value
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    )}
                    onClick={() => setDifficulty(config.value)}
                  >
                    <div
                      className={cn(
                        'w-3 h-3 rounded-full mx-auto mb-3',
                        diffConfig?.bgColor || 'bg-gray-500'
                      )}
                    />
                    <div className="font-semibold">{config.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {config.description}
                    </div>
                    {difficulty === config.value && (
                      <div className="absolute -top-1 -right-1">
                        <div className="w-3 h-3 bg-primary rounded-full" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Number of Questions Card */}
        <Card className="border-2">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Zap className="h-5 w-5 text-primary" />
              Number of Questions
            </CardTitle>
            <CardDescription>
              Select between {QUESTION_LIMITS.MIN} and {QUESTION_LIMITS.MAX}{' '}
              questions for your practice session.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-4xl font-bold text-primary">
                  {numberOfQuestions}
                </span>
                <span className="text-lg text-muted-foreground ml-2">
                  questions
                </span>
              </div>
            </div>

            <Slider
              value={[numberOfQuestions]}
              onValueChange={([value]) => setNumberOfQuestions(value)}
              min={QUESTION_LIMITS.MIN}
              max={QUESTION_LIMITS.MAX}
              step={QUESTION_LIMITS.STEP}
              className="w-full"
            />

            <div className="flex justify-between text-sm text-muted-foreground px-1">
              <span>{QUESTION_LIMITS.MIN}</span>
              <span>{Math.round(QUESTION_LIMITS.MAX / 2)}</span>
              <span>{QUESTION_LIMITS.MAX}</span>
            </div>

            {/* Quick Select Buttons */}
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-sm text-muted-foreground mr-2">
                Quick select:
              </span>
              {QUESTION_LIMITS.RECOMMENDED.map((num) => (
                <Button
                  key={num}
                  variant={numberOfQuestions === num ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setNumberOfQuestions(num)}
                  className="min-w-[3rem]"
                >
                  {num}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Time Limit Card */}
        <Card className="border-2">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Clock className="h-5 w-5 text-primary" />
              Time Limit
            </CardTitle>
            <CardDescription>
              Set a time limit for your practice session ({TIME_LIMITS.MIN}-{TIME_LIMITS.MAX} minutes).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Checkbox
                  id="useRecommended"
                  checked={useRecommendedTime}
                  onCheckedChange={(checked) => setUseRecommendedTime(!!checked)}
                />
                <Label htmlFor="useRecommended" className="cursor-pointer">
                  Use recommended time
                </Label>
              </div>
              <Badge variant="secondary" className="text-base px-4 py-2">
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

                <div className="flex justify-between text-sm text-muted-foreground px-1">
                  <span>{timeBounds.min} min</span>
                  <span className="text-primary font-medium">
                    Recommended: {timeBounds.recommended} min
                  </span>
                  <span>{timeBounds.max} min</span>
                </div>
              </>
            )}

            {useRecommendedTime && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <Info className="h-4 w-4" />
                <span>
                  Time is calculated based on {numberOfQuestions} questions at{' '}
                  {DIFFICULTY_CONFIG[difficulty]?.label || difficulty} difficulty
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary & Start Card */}
        <Card className="border-2 border-primary/50 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Info className="h-4 w-4" />
              <span>Review your practice configuration</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {selectedTypes.map((type) => (
                <Badge key={type} variant="outline" className="px-3 py-1">
                  {QUESTION_TYPE_CONFIG[type]?.label || type}
                </Badge>
              ))}
              <Badge variant="outline" className="px-3 py-1">
                {DIFFICULTY_CONFIG[difficulty]?.label || difficulty}
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                {numberOfQuestions} questions
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                {formatDuration(timeLimit)}
              </Badge>
            </div>

            <Separator className="my-4" />

            <Button
              className="w-full h-12 text-lg font-semibold"
              size="lg"
              onClick={handleStart}
              disabled={isLoading || selectedTypes.length === 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Starting Practice...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" />
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