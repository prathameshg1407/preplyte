"use strict";
// src/module/practice/interview/utils/session.utils.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.canStartSession = canStartSession;
exports.canSubmitResponse = canSubmitResponse;
exports.canEndSession = canEndSession;
exports.isSessionActive = isSessionActive;
exports.isSessionCompleted = isSessionCompleted;
exports.calculateSessionTimeout = calculateSessionTimeout;
exports.calculateRemainingTime = calculateRemainingTime;
exports.validateSessionTiming = validateSessionTiming;
exports.formatDuration = formatDuration;
exports.getDifficultyDisplayName = getDifficultyDisplayName;
exports.calculateProgress = calculateProgress;
exports.generateSessionSummary = generateSessionSummary;
const interview_constants_1 = require("../interview.constants");
/**
 * Check if session status allows starting
 */
function canStartSession(status) {
    return status === 'CREATED';
}
/**
 * Check if session status allows responses
 */
function canSubmitResponse(status) {
    return ['STARTED', 'IN_PROGRESS'].includes(status);
}
/**
 * Check if session status allows ending
 */
function canEndSession(status) {
    return ['STARTED', 'IN_PROGRESS'].includes(status);
}
/**
 * Check if session is active
 */
function isSessionActive(status) {
    return ['CREATED', 'STARTED', 'IN_PROGRESS'].includes(status);
}
/**
 * Check if session is completed
 */
function isSessionCompleted(status) {
    return status === 'COMPLETED';
}
/**
 * Calculate session timeout based on difficulty
 */
function calculateSessionTimeout(difficulty, questionCount) {
    const config = interview_constants_1.DIFFICULTY_CONFIG[difficulty];
    const timePerQuestion = config.timePerQuestion;
    const totalMinutes = (timePerQuestion * questionCount) / 60;
    // Add 20% buffer
    return Math.ceil(totalMinutes * 1.2);
}
/**
 * Calculate estimated remaining time
 */
function calculateRemainingTime(totalQuestions, currentIndex, difficulty) {
    const remaining = totalQuestions - currentIndex;
    const config = interview_constants_1.DIFFICULTY_CONFIG[difficulty];
    return remaining * config.timePerQuestion;
}
/**
 * Validate session timing
 */
function validateSessionTiming(startedAt, difficulty, questionCount) {
    if (!startedAt) {
        return { valid: true, expired: false, remainingMinutes: -1 };
    }
    const timeoutMinutes = calculateSessionTimeout(difficulty, questionCount);
    const elapsedMinutes = (Date.now() - startedAt.getTime()) / 60000;
    const remainingMinutes = timeoutMinutes - elapsedMinutes;
    return {
        valid: remainingMinutes > 0,
        expired: remainingMinutes <= 0,
        remainingMinutes: Math.max(0, remainingMinutes),
    };
}
/**
 * Format duration for display
 */
function formatDuration(seconds) {
    if (seconds < 60) {
        return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) {
        return remainingSeconds > 0
            ? `${minutes}m ${remainingSeconds}s`
            : `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
}
/**
 * Get difficulty display name
 */
function getDifficultyDisplayName(difficulty) {
    const names = {
        ENTRY: 'Entry Level',
        MID: 'Mid Level',
        SENIOR: 'Senior Level',
        LEAD: 'Lead/Principal Level',
    };
    return names[difficulty];
}
/**
 * Calculate progress percentage
 */
function calculateProgress(currentIndex, totalQuestions) {
    if (totalQuestions === 0)
        return 0;
    return Math.round((currentIndex / totalQuestions) * 100);
}
/**
 * Generate session summary
 */
function generateSessionSummary(session) {
    const progress = calculateProgress(session.currentQuestionIndex, session.totalQuestions);
    let duration = null;
    if (session.startedAt && session.completedAt) {
        duration = Math.round((session.completedAt.getTime() - session.startedAt.getTime()) / 1000);
    }
    else if (session.startedAt) {
        duration = Math.round((Date.now() - session.startedAt.getTime()) / 1000);
    }
    return {
        status: session.status,
        progress,
        duration,
        questionsAnswered: session.currentQuestionIndex,
    };
}
//# sourceMappingURL=session.utils.js.map