export const INTERVIEW_CONSTANTS = {
  MAX_QUESTIONS: 10,
  SILENCE_TIMEOUT_SECONDS: 7,
  MAX_NO_SPEECH_RETRIES: 3,
  SUBMIT_RETRY_LIMIT: 3,
  MIN_ANSWER_LENGTH: 1,
  MAX_ANSWER_LENGTH: 10000,
  TTS_RATE: 0.9,
  TTS_PITCH: 1,
  TTS_VOLUME: 1,
} as const;

export const INTERVIEW_CATEGORIES = {
  INTRODUCTORY: {
    label: "Introduction",
    color: "blue",
    bgClass: "bg-blue-500",
    textClass: "text-blue-600 dark:text-blue-400",
    bgLightClass: "bg-blue-100 dark:bg-blue-900/30",
  },
  TECHNICAL: {
    label: "Technical",
    color: "purple",
    bgClass: "bg-purple-500",
    textClass: "text-purple-600 dark:text-purple-400",
    bgLightClass: "bg-purple-100 dark:bg-purple-900/30",
  },
  CLOSING: {
    label: "Closing",
    color: "green",
    bgClass: "bg-green-500",
    textClass: "text-green-600 dark:text-green-400",
    bgLightClass: "bg-green-100 dark:bg-green-900/30",
  },
} as const;

export const SCORE_THRESHOLDS = {
  EXCELLENT: 90,
  VERY_GOOD: 80,
  GOOD: 70,
  FAIR: 60,
} as const;

export const getScoreLabel = (score: number): string => {
  if (score >= SCORE_THRESHOLDS.EXCELLENT) return "Excellent";
  if (score >= SCORE_THRESHOLDS.VERY_GOOD) return "Very Good";
  if (score >= SCORE_THRESHOLDS.GOOD) return "Good";
  if (score >= SCORE_THRESHOLDS.FAIR) return "Fair";
  return "Needs Improvement";
};

export const getScoreColorClass = (score: number): string => {
  if (score >= SCORE_THRESHOLDS.VERY_GOOD) return "text-green-600 dark:text-green-400";
  if (score >= SCORE_THRESHOLDS.FAIR) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
};