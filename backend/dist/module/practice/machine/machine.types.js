"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLanguageName = exports.LANGUAGE_MAP = exports.PERFORMANCE_THRESHOLDS = exports.SESSION_LIMITS = void 0;
exports.SESSION_LIMITS = {
    MIN_QUESTIONS: 1,
    MAX_QUESTIONS: 10,
    MIN_TIME: 30,
    MAX_TIME: 180,
    MAX_CODE_LENGTH: 50000,
    MAX_PAGE_SIZE: 50,
};
exports.PERFORMANCE_THRESHOLDS = {
    EASY: { excellent: 100, good: 80, average: 50 },
    MEDIUM: { excellent: 100, good: 66, average: 33 },
    HARD: { excellent: 100, good: 50, average: 25 },
};
exports.LANGUAGE_MAP = {
    50: 'C (GCC 9.2.0)',
    54: 'C++ (GCC 9.2.0)',
    62: 'Java (OpenJDK 13.0.1)',
    63: 'JavaScript (Node.js 12.14.0)',
    71: 'Python (3.8.1)',
    60: 'Go (1.13.5)',
    73: 'Rust (1.40.0)',
};
const getLanguageName = (id) => exports.LANGUAGE_MAP[id] || `Language ${id}`;
exports.getLanguageName = getLanguageName;
//# sourceMappingURL=machine.types.js.map