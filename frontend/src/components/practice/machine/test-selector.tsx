// src/components/practice/machine/test-selector.tsx

"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { RadioGroup, RadioGroupItem } from "../../ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Slider } from "../../ui/slider";
import { useMachine, useMachineConfigInit } from "../../../lib/hooks/use-machine";
import { useMachineStore } from "../../../lib/store/machine-store";
import type { DifficultyLevel } from "../../../types/machine.types";
import {
  Code2,
  Clock,
  Loader2,
  Info,
  ArrowRight,
  Gauge,
  Hash,
  Timer,
  Terminal,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../../lib/utils";

const DIFFICULTY_INFO: Record<DifficultyLevel, { label: string; description: string }> = {
  EASY: {
    label: "Easy",
    description: "Basic problems focusing on fundamental concepts",
  },
  MEDIUM: {
    label: "Medium",
    description: "Intermediate challenges requiring problem-solving skills",
  },
  HARD: {
    label: "Hard",
    description: "Advanced problems with complex algorithms",
  },
};

export function TestSelector() {
  const { isReady, isLoading: configLoading, error: configError, hasHydrated } = useMachineConfigInit();

  const {
    languages,
    selectedLanguageId,
    config,
    difficultyLevels,
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

  // Update time limit when config loads
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

  // Loading state
  if (!hasHydrated || configLoading || (isReady && checkingSession)) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-6 w-6 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {!hasHydrated ? "Initializing..." : configLoading ? "Loading configuration..." : "Checking session..."}
          </p>
        </div>
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
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Step 1: Difficulty */}
      <ConfigCard
        step={1}
        icon={Gauge}
        title="Select Difficulty"
        description="Choose the difficulty level for your practice session"
      >
        <RadioGroup
          value={selectedDifficulty}
          onValueChange={(v) => setSelectedDifficulty(v as DifficultyLevel)}
          className="grid gap-3 sm:grid-cols-3"
        >
          {(["EASY", "MEDIUM", "HARD"] as DifficultyLevel[]).map((level) => {
            const info = difficultyLevels.find((d) => d.value === level) || DIFFICULTY_INFO[level];
            const isSelected = selectedDifficulty === level;

            return (
              <div key={level}>
                <RadioGroupItem value={level} id={`difficulty-${level}`} className="peer sr-only" />
                <Label
                  htmlFor={`difficulty-${level}`}
                  className={cn(
                    "flex h-full cursor-pointer flex-col rounded-lg border p-4 transition-colors",
                    isSelected
                      ? "border-foreground bg-secondary"
                      : "border-border hover:bg-secondary/50"
                  )}
                >
                  <span className="mb-1 text-sm font-medium">
                    {info.label || level}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {info.description || DIFFICULTY_INFO[level].description}
                  </span>
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      </ConfigCard>

      {/* Step 2: Number of Questions */}
      <ConfigCard
        step={2}
        icon={Hash}
        title="Number of Questions"
        description={`Choose how many questions (${questionLimits.min}-${questionLimits.max})`}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Questions</span>
            <span className="text-2xl font-semibold">{numberOfQuestions}</span>
          </div>
          <Slider
            value={[numberOfQuestions]}
            onValueChange={([value]) => setNumberOfQuestions(value)}
            min={questionLimits.min}
            max={questionLimits.max}
            step={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{questionLimits.min}</span>
            <span>{questionLimits.max}</span>
          </div>
        </div>
      </ConfigCard>

      {/* Step 3: Time Limit */}
      <ConfigCard
        step={3}
        icon={Timer}
        title="Time Limit"
        description={`Set session duration (${timeLimitConfig.minTimeLimit}-${timeLimitConfig.maxTimeLimit} min)`}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Minutes</span>
            <span className="text-2xl font-semibold">{timeLimit}</span>
          </div>
          <Slider
            value={[timeLimit]}
            onValueChange={([value]) => setTimeLimit(value)}
            min={timeLimitConfig.minTimeLimit}
            max={timeLimitConfig.maxTimeLimit}
            step={5}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{timeLimitConfig.minTimeLimit} min</span>
            <span>{timeLimitConfig.maxTimeLimit} min</span>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 p-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Duration: <span className="font-medium">{estimatedDuration}</span>
            </span>
          </div>
        </div>
      </ConfigCard>

      {/* Step 4: Language */}
      <ConfigCard
        step={4}
        icon={Terminal}
        title="Select Language"
        description="Choose your preferred programming language"
      >
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
      </ConfigCard>

      {/* Summary & Start */}
      <Card className="border-border">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Code2 className="h-4 w-4 text-muted-foreground" />
            Session Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SummaryItem label="Difficulty" value={DIFFICULTY_INFO[selectedDifficulty].label} />
            <SummaryItem label="Questions" value={numberOfQuestions.toString()} />
            <SummaryItem label="Duration" value={estimatedDuration} />
            <SummaryItem label="Language" value={selectedLanguage?.name || "Not selected"} />
          </div>

          {/* Info */}
          <div className="flex items-start gap-2 rounded-lg border border-border bg-secondary/30 p-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              Once you start, the timer will begin. Make sure you have a stable
              internet connection and enough time to complete the session.
            </p>
          </div>

          {/* Start Button */}
          <Button
            className="w-full gap-2"
            size="lg"
            onClick={handleStartTest}
            disabled={!canStart || isStarting || isLoading}
          >
            {isStarting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Starting Session...
              </>
            ) : (
              <>
                Start Coding Session
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Config Card Component
function ConfigCard({
  step,
  icon: Icon,
  title,
  description,
  children,
}: {
  step: number;
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-border">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-base font-medium">
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-secondary text-xs font-semibold">
            {step}
          </span>
          <Icon className="h-4 w-4 text-muted-foreground" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

// Summary Item Component
function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/50 p-3">
      <div className="mb-1 text-xs text-muted-foreground">{label}</div>
      <div className="truncate text-sm font-medium">{value}</div>
    </div>
  );
}