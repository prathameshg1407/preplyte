"use strict";
// src/module/profile/profile.constants.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROFILE_CACHE_TTL = exports.PROFILE_CACHE_KEYS = exports.HTTP_STATUS = exports.COURSE_YEARS = exports.STUDENT_ID_PATTERN = exports.ALLOWED_IMAGE_MIME_TYPES = exports.ALLOWED_RESUME_MIME_TYPES = exports.PROFILE_PHOTO_LIMITS = exports.RESUME_LIMITS = void 0;
// =====================================================
// FILE UPLOAD LIMITS
// =====================================================
exports.RESUME_LIMITS = {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    MIN_TEXT_LENGTH: 100,
    MAX_PER_USER: 5,
};
exports.PROFILE_PHOTO_LIMITS = {
    MAX_FILE_SIZE: 2 * 1024 * 1024, // 2MB
};
// =====================================================
// ALLOWED FILE TYPES
// =====================================================
exports.ALLOWED_RESUME_MIME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
exports.ALLOWED_IMAGE_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
];
// =====================================================
// VALIDATION CONSTANTS
// =====================================================
exports.STUDENT_ID_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_\-\/]{1,28}[a-zA-Z0-9]$/;
exports.COURSE_YEARS = [
    '1st Year',
    '2nd Year',
    '3rd Year',
    '4th Year',
];
// Note: DEPARTMENTS removed - now managed per institute in database
// =====================================================
// HTTP STATUS CODES
// =====================================================
exports.HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
};
// =====================================================
// CACHE KEYS
// =====================================================
exports.PROFILE_CACHE_KEYS = {
    studentProfile: (userId) => `profile:student:${userId}`,
    resumes: (userId) => `profile:resumes:${userId}`,
    defaultResume: (userId) => `profile:resume:default:${userId}`,
    departments: (instituteId) => `profile:departments:${instituteId}`,
};
exports.PROFILE_CACHE_TTL = {
    STUDENT_PROFILE: 300, // 5 minutes
    RESUMES: 180, // 3 minutes
    DEPARTMENTS: 600, // 10 minutes
};
//# sourceMappingURL=profile.constants.js.map