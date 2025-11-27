// src/components/practice/machine/test-selector.tsx

"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { useMachine, useMachineConfigInit } from "../../../lib/hooks/use-machine";
import { useMachineStore } from "../../../lib/store/machine-store";
import type { DifficultyLevel } from "../../../types/machine.types";
import {
  Code2,
  Clock,
  Loader2,
  ArrowRight,
  Gauge,
  Hash,
  Timer,
  Terminal,
  Zap,
  Flame,
  Trophy,
  Brain,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../../lib/utils";

const DIFFICULTY_CONFIG: Record<
  DifficultyLevel,
  {
    label: string;
    description: string;
    icon: React.ElementType;
    color: string;
    bg: string;
    gradient: string;
  }
> = {
  EASY: {
    label: "Easy",
    description: "Fundamental concepts",
    icon: Zap,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    gradient: "from-emerald-500/20 to-emerald-500/5",
  },
  MEDIUM: {
    label: "Medium",
    description: "Problem-solving skills",
    icon: Flame,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
    gradient: "from-amber-500/20 to-amber-500/5",
  },
  HARD: {
    label: "Hard",
    description: "Complex algorithms",
    icon: Trophy,
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-500/10",
    gradient: "from-rose-500/20 to-rose-500/5",
  },
};

export function TestSelector() {
  const { isReady, isLoading: configLoading, error: configError, hasHydrated } = useMachineConfigInit();

  const {
    languages,
    selectedLanguageId,
    config,
    isLoading,
  } = useMachineStore();

  const {
    setSelectedLanguageId,
    createSession,
    checkActiveSession,
  } = useMachine();

  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>("MEDIUM");
  const [numberOfQuestions, setNumberOfQuestions] = useState(3);
  const [timeLimit, setTimeLimit] = useState(90);
  const [isStarting, setIsStarting] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Check for active session
  useEffect(() => {
    if (!isReady) return;

    const checkSession = async () => {
      try {
        const activeSession = await checkActiveSession();
        if (activeSession) {
          toast.info("You have an active session", {
            action: {
              label: "Resume",
              onClick: () => {
                window.location.href = `/practice/machine/test/${activeSession.id}`;
              },
            },
            duration: 10000,
          });
        }
      } catch (error) {
        console.error("Error checking active session:", error);
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, [isReady, checkActiveSession]);

  useEffect(() => {
    if (config?.machine) {
      const recommended =
        config.machine.recommendedTimeLimits?.[selectedDifficulty]?.recommended ||
        config.machine.defaultTimeLimit ||
        90;
      setTimeLimit(recommended);
    }
  }, [config, selectedDifficulty]);

  const questionLimits = useMemo(() => {
    return config?.questionLimits?.machine || { min: 1, max: 10, default: 3 };
  }, [config]);

  const timeLimitConfig = useMemo(() => {
    return config?.machine || { minTimeLimit: 30, maxTimeLimit: 180, defaultTimeLimit: 90 };
  }, [config]);

  const estimatedDuration = useMemo(() => {
    const hours = Math.floor(timeLimit / 60);
    const minutes = timeLimit % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes} min`;
  }, [timeLimit]);

  const canStart = useMemo(() => {
    return (
      isReady &&
      selectedLanguageId > 0 &&
      numberOfQuestions >= questionLimits.min &&
      numberOfQuestions <= questionLimits.max &&
      timeLimit >= timeLimitConfig.minTimeLimit &&
      timeLimit <= timeLimitConfig.maxTimeLimit
    );
  }, [isReady, selectedLanguageId, numberOfQuestions, timeLimit, questionLimits, timeLimitConfig]);

  const handleStartTest = async () => {
    if (!canStart) {
      toast.error("Please complete your selection");
      return;
    }

    try {
      setIsStarting(true);
      await createSession({
        difficulty: selectedDifficulty,
        numberOfQuestions,
        timeLimit,
      });
    } catch {
      // Error handled in hook
    } finally {
      setIsStarting(false);
    }
  };

  const selectedLanguage = languages.find((l) => l.judge0Id === selectedLanguageId);
  const difficultyConfig = DIFFICULTY_CONFIG[selectedDifficulty];
  const DifficultyIcon = difficultyConfig.icon;

  // Loading state
  if (!hasHydrated || configLoading || (isReady && checkingSession)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative mx-auto h-16 w-16">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Brain className="h-8 w-8 text-primary" />
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {!hasHydrated ? "Initializing..." : configLoading ? "Loading..." : "Checking session..."}
          </p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (configError) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-sm text-muted-foreground">{configError}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          <Sparkles className="h-4 w-4" />
          Coding Challenge
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to code?
        </h1>
        <p className="mx-auto max-w-md text-muted-foreground">
          Configure your coding session and sharpen your programming skills
        </p>
      </motion.div>

      {/* Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-10"
      >
        {/* Difficulty */}
        <section>
          <h2 className="mb-4 font-semibold">Choose your challenge</h2>

          <div className="relative flex rounded-xl bg-muted/50 p-1.5">
            <motion.div
              className={cn(
                "absolute inset-y-1.5 rounded-lg bg-gradient-to-r border",
                difficultyConfig.gradient,
                `border-${selectedDifficulty === 'EASY' ? 'emerald' : selectedDifficulty === 'MEDIUM' ? 'amber' : 'rose'}-500/30`
              )}
              layoutId="difficulty-bg"
              style={{
                left: `calc(${['EASY', 'MEDIUM', 'HARD'].indexOf(selectedDifficulty) * 33.333}% + 6px)`,
                width: 'calc(33.333% - 8px)',
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />

            {(['EASY', 'MEDIUM', 'HARD'] as DifficultyLevel[]).map((level) => {
              const config = DIFFICULTY_CONFIG[level];
              const Icon = config.icon;
              const isSelected = selectedDifficulty === level;

              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSelectedDifficulty(level)}
                  className={cn(
                    'relative z-10 flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium transition-colors',
                    isSelected ? config.color : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{config.label}</span>
                </button>
              );
            })}
          </div>

          <p className="mt-3 text-center text-sm text-muted-foreground">
            {difficultyConfig.description}
          </p>
        </section>

        {/* Questions & Time */}
        <section className="grid gap-4 sm:grid-cols-2">
          {/* Number of Questions */}
          <div className="rounded-xl bg-muted/50 p-6">
            <div className="mb-4 flex items-center gap-2">
              <Hash className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">Questions</h3>
            </div>

            <div className="mb-5">
              <span className="text-4xl font-bold">{numberOfQuestions}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {Array.from(
                { length: questionLimits.max - questionLimits.min + 1 },
                (_, i) => questionLimits.min + i
              )
                .filter((n) => n <= 5)
                .map((num) => (
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
          <div className="rounded-xl bg-muted/50 p-6">
            <div className="mb-4 flex items-center gap-2">
              <Timer className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">Time Limit</h3>
            </div>

            <div className="mb-5">
              <span className="text-4xl font-bold">{estimatedDuration}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {[30, 60, 90, 120].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setTimeLimit(mins)}
                  className={cn(
                    'rounded-lg px-4 py-2 text-sm font-medium transition-all',
                    timeLimit === mins
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-background hover:bg-muted'
                  )}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Language */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Terminal className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold">Programming Language</h2>
          </div>

          <Select
            value={selectedLanguageId.toString()}
            onValueChange={(v) => setSelectedLanguageId(parseInt(v))}
          >
            <SelectTrigger className="w-full sm:w-[280px]">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {languages
                .filter((l) => l.isActive)
                .map((lang) => (
                  <SelectItem key={lang.id} value={lang.judge0Id.toString()}>
                    {lang.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </section>

        {/* Start Button */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="pt-2"
        >
          {/* Summary */}
          <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
            <Badge
              variant="secondary"
              className={cn('py-1.5', difficultyConfig.color, difficultyConfig.bg)}
            >
              <DifficultyIcon className="mr-1.5 h-3 w-3" />
              {difficultyConfig.label}
            </Badge>
            <Badge variant="secondary" className="py-1.5">
              {numberOfQuestions} questions
            </Badge>
            <Badge variant="secondary" className="py-1.5">
              <Clock className="mr-1.5 h-3 w-3" />
              {estimatedDuration}
            </Badge>
            {selectedLanguage && (
              <Badge variant="secondary" className="py-1.5">
                {selectedLanguage.name}
              </Badge>
            )}
          </div>

          <Button
            size="lg"
            onClick={handleStartTest}
            disabled={!canStart || isStarting || isLoading}
            className="group relative h-14 w-full overflow-hidden text-lg font-semibold"
          >
            <span className="relative z-10 flex items-center gap-2">
              {isStarting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  Start Coding
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </span>
          </Button>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Good luck! 🚀
          </p>
        </motion.section>
      </motion.div>
    </div>
  );
}