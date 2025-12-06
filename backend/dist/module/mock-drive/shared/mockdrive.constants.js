"use strict";
// src/module/mock-drive/shared/mockdrive.constants.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.MODULE_ATTEMPT_STATUS_FLOW = exports.ATTEMPT_STATUS_FLOW = exports.MODULE_TYPE_LABELS = exports.MOCKDRIVE_CONSTANTS = void 0;
exports.MOCKDRIVE_CONSTANTS = {
    // Time buffers
    AUTO_SUBMIT_WARNING_MINUTES: 5,
    GRACE_PERIOD_SECONDS: 30,
    // Pagination
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 50,
    // Scoring
    APTITUDE_DEFAULT_MARKS_PER_QUESTION: 1,
    APTITUDE_DEFAULT_NEGATIVE_MARKING: 0.25,
    MACHINE_MAX_SCORE_PER_QUESTION: 100,
    AI_INTERVIEW_MAX_SCORE: 100,
    // Module transitions
    MODULE_TRANSITION_DELAY_MS: 3000,
    // Proctoring
    MAX_TAB_SWITCHES_WARNING: 3,
    MAX_TAB_SWITCHES_TERMINATE: 5,
};
exports.MODULE_TYPE_LABELS = {
    APTITUDE: 'Aptitude Test',
    MACHINE_CODING: 'Machine Coding',
    AI_INTERVIEW: 'AI Interview',
};
exports.ATTEMPT_STATUS_FLOW = {
    NOT_STARTED: ['IN_PROGRESS'],
    IN_PROGRESS: ['COMPLETED', 'TIMED_OUT', 'ABANDONED'],
    COMPLETED: [],
    TIMED_OUT: [],
    ABANDONED: [],
};
exports.MODULE_ATTEMPT_STATUS_FLOW = {
    LOCKED: ['AVAILABLE'],
    AVAILABLE: ['IN_PROGRESS'],
    IN_PROGRESS: ['COMPLETED', 'TIMED_OUT', 'SKIPPED'],
    COMPLETED: [],
    TIMED_OUT: [],
    SKIPPED: [],
};
//# sourceMappingURL=mockdrive.constants.js.map