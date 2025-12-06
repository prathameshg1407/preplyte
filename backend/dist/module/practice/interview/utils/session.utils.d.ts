import { AiInterviewSessionStatus, AiInterviewDifficulty } from '@prisma/client';
/**
 * Check if session status allows starting
 */
export declare function canStartSession(status: AiInterviewSessionStatus): boolean;
/**
 * Check if session status allows responses
 */
export declare function canSubmitResponse(status: AiInterviewSessionStatus): boolean;
/**
 * Check if session status allows ending
 */
export declare function canEndSession(status: AiInterviewSessionStatus): boolean;
/**
 * Check if session is active
 */
export declare function isSessionActive(status: AiInterviewSessionStatus): boolean;
/**
 * Check if session is completed
 */
export declare function isSessionCompleted(status: AiInterviewSessionStatus): boolean;
/**
 * Calculate session timeout based on difficulty
 */
export declare function calculateSessionTimeout(difficulty: AiInterviewDifficulty, questionCount: number): number;
/**
 * Calculate estimated remaining time
 */
export declare function calculateRemainingTime(totalQuestions: number, currentIndex: number, difficulty: AiInterviewDifficulty): number;
/**
 * Validate session timing
 */
export declare function validateSessionTiming(startedAt: Date | null, difficulty: AiInterviewDifficulty, questionCount: number): {
    valid: boolean;
    expired: boolean;
    remainingMinutes: number;
};
/**
 * Format duration for display
 */
export declare function formatDuration(seconds: number): string;
/**
 * Get difficulty display name
 */
export declare function getDifficultyDisplayName(difficulty: AiInterviewDifficulty): string;
/**
 * Calculate progress percentage
 */
export declare function calculateProgress(currentIndex: number, totalQuestions: number): number;
/**
 * Generate session summary
 */
export declare function generateSessionSummary(session: {
    status: AiInterviewSessionStatus;
    currentQuestionIndex: number;
    totalQuestions: number;
    startedAt: Date | null;
    completedAt: Date | null;
}): {
    status: string;
    progress: number;
    duration: number | null;
    questionsAnswered: number;
};
//# sourceMappingURL=session.utils.d.ts.map