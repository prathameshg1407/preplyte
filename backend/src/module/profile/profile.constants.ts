// src/module/profile/profile.constants.ts

// =====================================================
// FILE UPLOAD LIMITS
// =====================================================

export const RESUME_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MIN_TEXT_LENGTH: 100,
  MAX_PER_USER: 5,
} as const;

export const PROFILE_PHOTO_LIMITS = {
  MAX_FILE_SIZE: 2 * 1024 * 1024, // 2MB
} as const;

// =====================================================
// ALLOWED FILE TYPES
// =====================================================

export const ALLOWED_RESUME_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

// =====================================================
// VALIDATION CONSTANTS
// =====================================================

export const STUDENT_ID_PATTERN = /^[A-Z0-9]{6,20}$/;

export const COURSE_YEARS = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  '5th Year',
] as const;

export const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electronics',
  'Electrical',
  'Mechanical',
  'Civil',
  'Chemical',
  'Biotechnology',
  'Other',
] as const;

// =====================================================
// HTTP STATUS CODES
// =====================================================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
} as const;

// =====================================================
// CACHE KEYS
// =====================================================

export const PROFILE_CACHE_KEYS = {
  studentProfile: (userId: string) => `profile:student:${userId}`,
  resumes: (userId: string) => `profile:resumes:${userId}`,
  defaultResume: (userId: string) => `profile:resume:default:${userId}`,
} as const;

export const PROFILE_CACHE_TTL = {
  STUDENT_PROFILE: 300, // 5 minutes
  RESUMES: 180, // 3 minutes
} as const;