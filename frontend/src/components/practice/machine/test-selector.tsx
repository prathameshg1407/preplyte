// src/components/practice/machine/test-selector.tsx

"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { useMachine, useMachineConfigInit } from "@/lib/hooks/use-machine";
import { useMachineStore } from "@/lib/store/machine-store";
import type { DifficultyLevel } from "@/types/machine.types";
import { Code2, Clock, Loader2, Zap, Info } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Difficulty colors mapping
const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  EASY: "text-green-500 border-green-500/30 bg-green-500/10",
  MEDIUM: "text-yellow-500 border-yellow-500/30 bg-yellow-500/10",
  HARD: "text-red-500 border-red-500/30 bg-red-500/10",
};

const DIFFICULTY_DESCRIPTIONS: Record<DifficultyLevel, string> = {
  EASY: "Basic problems suitable for beginners. Focus on fundamental concepts.",
  MEDIUM: "Intermediate challenges requiring good problem-solving skills.",
  HARD: "Advanced problems for experienced developers. Complex algorithms.",
};

export function TestSelector() {
  // Use the config init hook - this handles all initialization
  const { isReady, isLoading: configLoading, error: configError, hasHydrated } = useMachineConfigInit();

  // Get state from store
  const {
    languages,
    selectedLanguageId,
    config,
    difficultyLevels,
    isLoading,
  } = useMachineStore();

  // Get actions from hook
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

  // Check for active session once config is ready
  useEffect(() => {
    if (!isReady) {
      return;
    }

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

  // Update time limit when config loads or difficulty changes
  useEffect(() => {
    if (config?.machine) {
      const recommended =
        config.machine.recommendedTimeLimits?.[selectedDifficulty]?.recommended ||
        config.machine.defaultTimeLimit ||
        90;
      setTimeLimit(recommended);
    }
  }, [config, selectedDifficulty]);

  // Get config limits with defaults
  const questionLimits = useMemo(() => {
    return config?.questionLimits?.machine || {
      min: 1,
      max: 10,
      default: 3,
    };
  }, [config]);

  const timeLimitConfig = useMemo(() => {
    return config?.machine || {
      minTimeLimit: 30,
      maxTimeLimit: 180,
      defaultTimeLimit: 90,
    };
  }, [config]);

  // Calculate estimated duration
  const estimatedDuration = useMemo(() => {
    const hours = Math.floor(timeLimit / 60);
    const minutes = timeLimit % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} min`;
  }, [timeLimit]);

  // Validate selection
  const canStart = useMemo(() => {
    return (
      isReady &&
      selectedLanguageId > 0 &&
      numberOfQuestions >= questionLimits.min &&
      numberOfQuestions <= questionLimits.max &&
      timeLimit >= timeLimitConfig.minTimeLimit &&
      timeLimit <= timeLimitConfig.maxTimeLimit
    );
  }, [
    isReady,
    selectedLanguageId,
    numberOfQuestions,
    timeLimit,
    questionLimits,
    timeLimitConfig,
  ]);

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
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsStarting(false);
    }
  };

  // Get selected language info
  const selectedLanguage = languages.find(
    (l) => l.judge0Id === selectedLanguageId
  );

  // Show loading state
  if (!hasHydrated || configLoading || (isReady && checkingSession)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">
            {!hasHydrated ? "Initializing..." : configLoading ? "Loading configuration..." : "Checking session..."}
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (configError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive mb-4">{configError}</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Step 1: Select Difficulty */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">
              1
            </span>
            Select Difficulty
          </CardTitle>
          <CardDescription>
            Choose the difficulty level for your practice session
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedDifficulty}
            onValueChange={(v) => setSelectedDifficulty(v as DifficultyLevel)}
            className="grid gap-3 md:grid-cols-3"
          >
            {(["EASY", "MEDIUM", "HARD"] as DifficultyLevel[]).map((level) => {
              const levelInfo = difficultyLevels.find((d) => d.value === level);

              return (
                <div key={level}>
                  <RadioGroupItem
                    value={level}
                    id={`difficulty-${level}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`difficulty-${level}`}
                    className={cn(
                      "flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all h-full",
                      "hover:bg-muted/50",
                      selectedDifficulty === level
                        ? "border-primary bg-primary/5"
                        : "border-muted"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className={DIFFICULTY_COLORS[level]}>
                        {levelInfo?.label || level}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {levelInfo?.description || DIFFICULTY_DESCRIPTIONS[level]}
                    </p>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Step 2: Number of Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">
              2
            </span>
            Number of Questions
          </CardTitle>
          <CardDescription>
            Choose how many questions you want to attempt (
            {questionLimits.min}-{questionLimits.max})
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Questions</span>
              <span className="text-2xl font-bold">{numberOfQuestions}</span>
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
        </CardContent>
      </Card>

      {/* Step 3: Time Limit */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">
              3
            </span>
            Time Limit
          </CardTitle>
          <CardDescription>
            Set the time limit for your session (
            {timeLimitConfig.minTimeLimit}-{timeLimitConfig.maxTimeLimit} minutes)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Minutes</span>
              <span className="text-2xl font-bold">{timeLimit}</span>
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
          </div>

          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Session duration:{" "}
              <span className="font-medium">{estimatedDuration}</span>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Step 4: Select Language */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">
              4
            </span>
            Select Language
          </CardTitle>
          <CardDescription>
            Choose your preferred programming language
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedLanguageId.toString()}
            onValueChange={(v) => setSelectedLanguageId(parseInt(v))}
          >
            <SelectTrigger className="w-full md:w-[300px]">
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
        </CardContent>
      </Card>

      {/* Summary & Start */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Ready to Start
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">
                Difficulty
              </div>
              <Badge variant="outline" className={DIFFICULTY_COLORS[selectedDifficulty]}>
                {selectedDifficulty}
              </Badge>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">
                Questions
              </div>
              <div className="font-medium">{numberOfQuestions}</div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Duration</div>
              <div className="font-medium">{estimatedDuration}</div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Language</div>
              <div className="font-medium truncate">
                {selectedLanguage?.name || "Not selected"}
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>
              Once you start, the timer will begin. Make sure you have a stable
              internet connection and enough time to complete the session.
            </p>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handleStartTest}
            disabled={!canStart || isStarting || isLoading}
          >
            {isStarting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting Session...
              </>
            ) : (
              <>
                <Code2 className="mr-2 h-4 w-4" />
                Start Coding Session
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}