// backend/src/module/event/event.constants.ts

/**
 * =====================================================
 * EVENT MODULE CONSTANTS
 * =====================================================
 */

// =====================================================
// GENERAL LIMITS
// =====================================================

export const EVENT_LIMITS = {
  MAX_TITLE_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 10000,
  MAX_REQUIREMENTS: 20,
  MAX_REQUIREMENT_LENGTH: 500,
  MAX_SKILLS: 30,
  MAX_THEMES: 10,
  MAX_PRIZES: 10,
  MIN_TEAM_SIZE: 1,
  MAX_TEAM_SIZE: 10,
  INVITE_CODE_LENGTH: 8,
} as const;

// =====================================================
// SALARY/STIPEND RANGES
// =====================================================

export const COMPENSATION_LIMITS = {
  MIN_SALARY: 0,
  MAX_SALARY: 2147483647, // Max 32-bit signed int
  MIN_STIPEND: 0,
  MAX_STIPEND: 2147483647, // Max 32-bit signed int
  SUPPORTED_CURRENCIES: ['INR', 'USD', 'EUR', 'GBP'],
  DEFAULT_CURRENCY: 'INR',
} as const;

// =====================================================
// ELIGIBILITY CRITERIA
// =====================================================

export const ELIGIBILITY_LIMITS = {
  MIN_CGPA: 0.0,
  MAX_CGPA: 10.0,
  MIN_PERCENTAGE: 0,
  MAX_PERCENTAGE: 100,
  MAX_BACKLOGS: 20,
  MAX_CUSTOM_RULES: 10,
} as const;

export const ELIGIBILITY_OPERATORS = {
  EQUALS: '=',
  NOT_EQUALS: '!=',
  GREATER_THAN: '>',
  GREATER_THAN_EQUAL: '>=',
  LESS_THAN: '<',
  LESS_THAN_EQUAL: '<=',
  IN: 'in',
  NOT_IN: 'not_in',
  CONTAINS: 'contains',
  NOT_CONTAINS: 'not_contains',
  CONTAINS_ALL: 'contains_all',
  CONTAINS_ANY: 'contains_any',
} as const;

// =====================================================
// JOB SPECIFIC
// =====================================================

export const JOB_CONSTANTS = {
  MIN_VACANCIES: 1,
  MAX_VACANCIES: 2147483647, // Max 32-bit signed int
  MIN_APPLICATION_DAYS: 1,
  MAX_APPLICATION_DAYS: 365,
  MAX_LOCATIONS: 10,
} as const;

// =====================================================
// INTERNSHIP SPECIFIC
// =====================================================

export const INTERNSHIP_CONSTANTS = {
  MIN_VACANCIES: 1,
  MAX_VACANCIES: 2147483647,
  MIN_DURATION: 1,
  MAX_DURATION_WEEKS: 52,
  MAX_DURATION_MONTHS: 12,
  MIN_APPLICATION_DAYS: 1,
  MAX_APPLICATION_DAYS: 180,
} as const;

// =====================================================
// HACKATHON SPECIFIC
// =====================================================

export const HACKATHON_CONSTANTS = {
  MIN_PARTICIPANTS: 1,
  MAX_PARTICIPANTS: 10000,
  MIN_EVENT_DURATION_HOURS: 1,
  MAX_EVENT_DURATION_DAYS: 30,
  MIN_REGISTRATION_DURATION_HOURS: 1,
  MAX_REGISTRATION_DURATION_DAYS: 90,
  DEFAULT_TEAM_SIZE_MIN: 1,
  DEFAULT_TEAM_SIZE_MAX: 4,
  INVITE_CODE_CHARSET: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', // Excluding ambiguous chars
} as const;

// =====================================================
// SUBMISSION LIMITS
// =====================================================

export const SUBMISSION_LIMITS = {
  MAX_PROJECT_NAME_LENGTH: 150,
  MAX_PROJECT_DESCRIPTION_LENGTH: 5000,
  MAX_TECH_STACK: 20,
  MAX_SCREENSHOTS: 10,
  MAX_LINKS: 5,
  URL_MAX_LENGTH: 500,
} as const;

// =====================================================
// APPLICATION LIMITS
// =====================================================

export const APPLICATION_LIMITS = {
  MAX_COVER_LETTER_LENGTH: 2000,
  MAX_ADMIN_NOTES_LENGTH: 1000,
} as const;

// =====================================================
// SORTING & FILTERING
// =====================================================

export const SORT_FIELDS = {
  JOB: ['createdAt', 'applicationDeadline', 'salaryMin', 'viewsCount', 'applicationsStarted'],
  INTERNSHIP: ['createdAt', 'applicationDeadline', 'stipendMin', 'viewsCount', 'applicationsStarted'],
  HACKATHON: ['createdAt', 'eventStartDate', 'registrationEndDate', 'viewsCount', 'participantCount'],
} as const;

export const SORT_ORDERS = ['asc', 'desc'] as const;

export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// =====================================================
// STATUS TRANSITIONS
// =====================================================

export const ALLOWED_STATUS_TRANSITIONS = {
  OpportunityStatus: {
    DRAFT: ['PUBLISHED', 'CANCELLED'],
    PUBLISHED: ['CLOSED', 'CANCELLED'],
    CLOSED: ['PUBLISHED'],
    FILLED: [],
    CANCELLED: [],
  },
  HackathonStatus: {
    DRAFT: ['PUBLISHED'],
    PUBLISHED: ['REGISTRATION_OPEN', 'CANCELLED'],
    REGISTRATION_OPEN: ['REGISTRATION_CLOSED', 'CANCELLED'],
    REGISTRATION_CLOSED: ['ONGOING', 'CANCELLED'],
    ONGOING: ['SUBMISSION_OPEN'],
    SUBMISSION_OPEN: ['SUBMISSION_CLOSED'],
    SUBMISSION_CLOSED: ['JUDGING'],
    JUDGING: ['COMPLETED'],
    COMPLETED: [],
    CANCELLED: [],
  },
  ApplicationStatus: {
    APPLIED: ['UNDER_REVIEW', 'REJECTED', 'WITHDRAWN'],
    UNDER_REVIEW: ['SHORTLISTED', 'REJECTED'],
    SHORTLISTED: ['HIRED', 'REJECTED'],
    REJECTED: [],
    WITHDRAWN: [],
    HIRED: [],
  },
  HackathonRegistrationStatus: {
    REGISTERED: ['CONFIRMED', 'WITHDRAWN', 'DISQUALIFIED'],
    CONFIRMED: ['WITHDRAWN', 'DISQUALIFIED'],
    WITHDRAWN: [],
    DISQUALIFIED: [],
  },
  TeamStatus: {
    FORMING: ['COMPLETE', 'DISQUALIFIED'],
    COMPLETE: ['LOCKED', 'DISQUALIFIED'],
    LOCKED: ['DISQUALIFIED'],
    DISQUALIFIED: [],
  },
  HackathonSubmissionStatus: {
    DRAFT: ['SUBMITTED', 'DISQUALIFIED'],
    SUBMITTED: ['UNDER_REVIEW', 'DISQUALIFIED'],
    UNDER_REVIEW: ['SHORTLISTED', 'DISQUALIFIED'],
    DISQUALIFIED: [],
    SHORTLISTED: ['WINNER'],
    WINNER: [],
  },
} as const;

// =====================================================
// NOTIFICATION TEMPLATES
// =====================================================

export const NOTIFICATION_EVENTS = {
  JOB_PUBLISHED: 'job.published',
  JOB_APPLICATION_RECEIVED: 'job.application.received',
  JOB_APPLICATION_REVIEWED: 'job.application.reviewed',
  JOB_APPLICATION_SHORTLISTED: 'job.application.shortlisted',
  JOB_APPLICATION_REJECTED: 'job.application.rejected',
  JOB_APPLICATION_HIRED: 'job.application.hired',
  
  INTERNSHIP_PUBLISHED: 'internship.published',
  INTERNSHIP_APPLICATION_RECEIVED: 'internship.application.received',
  INTERNSHIP_APPLICATION_REVIEWED: 'internship.application.reviewed',
  INTERNSHIP_APPLICATION_SHORTLISTED: 'internship.application.shortlisted',
  INTERNSHIP_APPLICATION_REJECTED: 'internship.application.rejected',
  INTERNSHIP_APPLICATION_HIRED: 'internship.application.hired',
  
  HACKATHON_PUBLISHED: 'hackathon.published',
  HACKATHON_REGISTRATION_RECEIVED: 'hackathon.registration.received',
  HACKATHON_REGISTRATION_CONFIRMED: 'hackathon.registration.confirmed',
  HACKATHON_TEAM_INVITE: 'hackathon.team.invite',
  HACKATHON_TEAM_JOINED: 'hackathon.team.joined',
  HACKATHON_SUBMISSION_RECEIVED: 'hackathon.submission.received',
  HACKATHON_RESULTS_DECLARED: 'hackathon.results.declared',
} as const;

// =====================================================
// ERROR MESSAGES
// =====================================================

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'You are not authorized to perform this action',
  NOT_FOUND: 'Resource not found',
  ALREADY_EXISTS: 'Resource already exists',
  INVALID_STATUS_TRANSITION: 'Invalid status transition',
  DEADLINE_PASSED: 'Application/Registration deadline has passed',
  ALREADY_APPLIED: 'You have already applied for this opportunity',
  ALREADY_REGISTERED: 'You have already registered for this event',
  TEAM_FULL: 'Team is already full',
  TEAM_SIZE_INVALID: 'Team size does not meet requirements',
  INVITE_CODE_INVALID: 'Invalid invite code',
  ELIGIBILITY_NOT_MET: 'You do not meet the eligibility criteria',
  MAX_CAPACITY_REACHED: 'Maximum capacity reached',
  EVENT_NOT_ACTIVE: 'Event is not currently active',
  PROFILE_INCOMPLETE: 'Please complete your profile before applying',
  RESUME_REQUIRED: 'Resume is required for this application',
} as const;

// =====================================================
// CACHE KEYS & TTL
// =====================================================

export const CACHE_CONFIG = {
  KEYS: {
    JOB_DETAIL: (id: string) => `job:${id}`,
    JOB_LIST: (filters: string) => `jobs:list:${filters}`,
    INTERNSHIP_DETAIL: (id: string) => `internship:${id}`,
    INTERNSHIP_LIST: (filters: string) => `internships:list:${filters}`,
    HACKATHON_DETAIL: (id: string) => `hackathon:${id}`,
    HACKATHON_LIST: (filters: string) => `hackathons:list:${filters}`,
    TEAM_DETAIL: (id: string) => `team:${id}`,
    SUBMISSION_DETAIL: (id: string) => `submission:${id}`,
  },
  TTL: {
    SHORT: 300, // 5 minutes
    MEDIUM: 900, // 15 minutes
    LONG: 3600, // 1 hour
    VERY_LONG: 86400, // 24 hours
  },
} as const;

// =====================================================
// ANALYTICS EVENTS
// =====================================================

export const ANALYTICS_EVENTS = {
  JOB_VIEWED: 'job_viewed',
  JOB_APPLIED: 'job_applied',
  INTERNSHIP_VIEWED: 'internship_viewed',
  INTERNSHIP_APPLIED: 'internship_applied',
  HACKATHON_VIEWED: 'hackathon_viewed',
  HACKATHON_REGISTERED: 'hackathon_registered',
  TEAM_CREATED: 'team_created',
  TEAM_JOINED: 'team_joined',
  SUBMISSION_CREATED: 'submission_created',
} as const;
