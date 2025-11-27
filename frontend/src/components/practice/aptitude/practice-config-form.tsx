// src/components/practice/aptitude/practice-config-form.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../ui/tooltip';
import { useAptitude } from '../../../lib/hooks/use-aptitude';
import {
  QUESTION_TYPE_CONFIG,
  DIFFICULTY_CONFIG,
  QUESTION_LIMITS,
  TIME_LIMITS,
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
  Play,
  AlertCircle,
  Sparkles,
  Timer,
  ChevronRight,
  Flame,
  Trophy,
  ArrowRight,
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

// Difficulty colors and icons
const DIFFICULTY_STYLES: Record<DifficultyLevel, { 
  color: string; 
  bgColor: string; 
  borderColor: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}> = {
  EASY: {
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    icon: Zap,
    gradient: 'from-emerald-500/20 to-emerald-500/5',
  },
  MEDIUM: {
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    icon: Flame,
    gradient: 'from-amber-500/20 to-amber-500/5',
  },
  HARD: {
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
    icon: Trophy,
    gradient: 'from-rose-500/20 to-rose-500/5',
  },
};

interface NormalizedQuestionType {
  value: QuestionType;
  label: string;
  description: string;
  icon: string;
}

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

  const hasInitialized = useRef(false);

  // Initialize
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

  // Update time limit
  useEffect(() => {
    if (useRecommendedTime) {
      const recommended = calculateRecommendedTime(numberOfQuestions, difficulty);
      setTimeLimit(recommended);
    }
  }, [numberOfQuestions, difficulty, useRecommendedTime]);

  // Normalize options
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

  // Handlers
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

  const handleResumeSession = async () => {
    if (activeSession) {
      try {
        await resumeSession(activeSession.id);
      } catch {
        setShowResumeDialog(false);
      }
    }
  };

  const handleStartNew = () => {
    setActiveSession(null);
    setShowResumeDialog(false);
  };

  const getIconComponent = (iconName: string): React.ComponentType<{ className?: string }> => {
    return ICONS[iconName] || ICONS[iconName.toLowerCase()] || Brain;
  };

  const currentDifficultyStyle = DIFFICULTY_STYLES[difficulty];
  const DifficultyIcon = currentDifficultyStyle.icon;

  if (isInitializing) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4 text-center"
        >
          <div className="relative mx-auto h-16 w-16">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Brain className="h-8 w-8 text-primary" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Preparing your practice session...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      {/* Resume Session Dialog */}
      <AlertDialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
              <AlertCircle className="h-6 w-6 text-amber-500" />
            </div>
            <AlertDialogTitle className="text-center">
              Continue where you left off?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              You have an active practice session in progress.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {activeSession && (
            <div className="my-4 rounded-lg bg-muted/50 p-4">
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="secondary">
                  {DIFFICULTY_CONFIG[activeSession.difficulty]?.label}
                </Badge>
                <Badge variant="secondary">
                  {activeSession.numberOfQuestions} questions
                </Badge>
                <Badge variant="secondary">
                  {activeSession.timeLimit} min
                </Badge>
              </div>
            </div>
          )}
          <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
            <AlertDialogAction
              onClick={handleResumeSession}
              className="w-full"
            >
              <Play className="mr-2 h-4 w-4" />
              Resume Session
            </AlertDialogAction>
            <AlertDialogCancel
              onClick={handleStartNew}
              className="w-full"
            >
              Start Fresh
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="mx-auto max-w-3xl px-4">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            Practice Mode
          </div>
          <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to challenge yourself?
          </h1>
          <p className="mx-auto max-w-md text-muted-foreground">
            Customize your practice session and sharpen your aptitude skills
          </p>
        </motion.div>

        {/* Main Configuration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-8"
        >
          {/* Question Types - Visual Cards */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-muted-foreground" />
              <h2 className="font-semibold">What do you want to practice?</h2>
              <Badge variant="outline" className="ml-auto">
                {selectedTypes.length}/3
              </Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {normalizedQuestionTypes.map((config, index) => {
                const IconComponent = getIconComponent(config.icon);
                const isSelected = selectedTypes.includes(config.value);

                return (
                  <motion.button
                    key={config.value}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    type="button"
                    onClick={() => handleTypeToggle(config.value)}
                    className={cn(
                      'group relative overflow-hidden rounded-xl border-2 p-5 text-left transition-all duration-200',
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                        : 'border-transparent bg-muted/50 hover:border-muted-foreground/20 hover:bg-muted'
                    )}
                  >
                    {/* Selection indicator */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div
                      className={cn(
                        'mb-3 inline-flex rounded-lg p-2.5 transition-colors',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted-foreground/10 text-muted-foreground group-hover:bg-muted-foreground/20'
                      )}
                    >
                      <IconComponent className="h-5 w-5" />
                    </div>

                    <h3 className="mb-1 font-semibold">{config.label}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {config.description}
                    </p>
                  </motion.button>
                );
              })}
            </div>
          </section>

          {/* Difficulty - Segmented Control */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <h2 className="font-semibold">Choose your challenge</h2>
            </div>

            <div className="relative flex rounded-xl bg-muted/50 p-1.5">
              {/* Animated background */}
              <motion.div
                className={cn(
                  'absolute inset-y-1.5 rounded-lg bg-gradient-to-r',
                  currentDifficultyStyle.gradient,
                  'border',
                  currentDifficultyStyle.borderColor
                )}
                layoutId="difficulty-bg"
                style={{
                  left: `calc(${normalizedDifficulties.findIndex((d) => d.value === difficulty) * 33.333}% + 6px)`,
                  width: 'calc(33.333% - 8px)',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />

              {normalizedDifficulties.map((config) => {
                const isSelected = difficulty === config.value;
                const style = DIFFICULTY_STYLES[config.value];
                const Icon = style.icon;

                return (
                  <button
                    key={config.value}
                    type="button"
                    onClick={() => setDifficulty(config.value)}
                    className={cn(
                      'relative z-10 flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium transition-colors',
                      isSelected ? style.color : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{config.label}</span>
                  </button>
                );
              })}
            </div>

            <p className="mt-2 text-center text-sm text-muted-foreground">
              {DIFFICULTY_CONFIG[difficulty]?.timePerQuestion}s per question • Perfect for{' '}
              {difficulty === 'EASY' ? 'warming up' : difficulty === 'MEDIUM' ? 'steady practice' : 'intense training'}
            </p>
          </section>

          {/* Questions & Time - Compact Row */}
          <section className="grid gap-4 sm:grid-cols-2">
            {/* Number of Questions */}
            <div className="rounded-xl bg-muted/50 p-5">
              <div className="mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">Questions</h3>
              </div>

              <div className="mb-4">
                <span className="text-4xl font-bold">{numberOfQuestions}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {QUESTION_LIMITS.RECOMMENDED.map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setNumberOfQuestions(num)}
                    className={cn(
                      'rounded-lg px-4 py-2 text-sm font-medium transition-all',
                      numberOfQuestions === num
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'bg-background hover:bg-muted'
                    )}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Limit */}
            <div className="rounded-xl bg-muted/50 p-5">
              <div className="mb-4 flex items-center gap-2">
                <Timer className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">Time Limit</h3>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className={cn(
                        'ml-auto cursor-pointer transition-colors',
                        useRecommendedTime && 'border-primary/50 bg-primary/10 text-primary'
                      )}
                      onClick={() => setUseRecommendedTime(!useRecommendedTime)}
                    >
                      {useRecommendedTime ? 'Auto' : 'Custom'}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    Click to {useRecommendedTime ? 'set custom time' : 'use recommended time'}
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className="mb-4 flex items-baseline gap-2">
                <span className="text-4xl font-bold">{formatDuration(timeLimit)}</span>
              </div>

              <AnimatePresence mode="wait">
                {useRecommendedTime ? (
                  <motion.p
                    key="auto"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-sm text-muted-foreground"
                  >
                    Optimized for {numberOfQuestions} questions at {DIFFICULTY_CONFIG[difficulty]?.label} level
                  </motion.p>
                ) : (
                  <motion.div
                    key="custom"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex flex-wrap gap-2"
                  >
                    {[15, 30, 45, 60, 90].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setTimeLimit(mins)}
                        className={cn(
                          'rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
                          timeLimit === mins
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background hover:bg-muted'
                        )}
                      >
                        {mins}m
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* Start Button - Prominent CTA */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="pt-4"
          >
            {/* Summary Pills */}
            <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
              {selectedTypes.map((type) => (
                <Badge key={type} variant="secondary" className="py-1.5">
                  {QUESTION_TYPE_CONFIG[type]?.label}
                </Badge>
              ))}
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <Badge
                variant="secondary"
                className={cn('py-1.5', currentDifficultyStyle.color, currentDifficultyStyle.bgColor)}
              >
                <DifficultyIcon className="mr-1 h-3 w-3" />
                {DIFFICULTY_CONFIG[difficulty]?.label}
              </Badge>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <Badge variant="secondary" className="py-1.5">
                {numberOfQuestions}Q • {formatDuration(timeLimit)}
              </Badge>
            </div>

            <Button
              size="lg"
              onClick={handleStart}
              disabled={isLoading || selectedTypes.length === 0}
              className="group relative h-14 w-full overflow-hidden text-lg font-semibold"
            >
              <span className="relative z-10 flex items-center gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    Start Practice
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </span>
              
              {/* Animated gradient background */}
              <div className="absolute inset-0 -z-0 bg-gradient-to-r from-primary via-primary/80 to-primary opacity-0 transition-opacity group-hover:opacity-100" />
            </Button>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              Press Enter or click to begin • Good luck! 🎯
            </p>
          </motion.section>
        </motion.div>
      </div>
    </TooltipProvider>
  );
}