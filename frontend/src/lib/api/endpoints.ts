// src/lib/api/endpoints.ts

// ============================================
// API Base Configuration
// ============================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// ============================================
// API Endpoints
// ============================================

export const API_ENDPOINTS = {
  // ============================================
  // Authentication
  // ============================================
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
    REFRESH: '/api/auth/refresh',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    VERIFY_EMAIL: '/api/auth/verify-email',
  },

  // ============================================
  // User
  // ============================================
  USER: {
    PROFILE: '/api/user/profile',
    UPDATE: '/api/user/update',
    CHANGE_PASSWORD: '/api/user/change-password',
    DELETE_ACCOUNT: '/api/user/delete',
  },

  // ============================================
  // Profile Management
  // ============================================
  PROFILE: {
    COMPLETE: '/api/profile',
    USER: '/api/profile/user',
    STUDENT: '/api/profile/student',
    PICTURE: '/api/profile/picture',
    STUDENT_SKILLS: '/api/profile/student/skills',
    STUDENT_ACADEMICS: '/api/profile/student/academics',
    DEPARTMENTS: '/api/profile/departments',
    RESUMES: '/api/profile/resumes',
    RESUMES_DEFAULT: '/api/profile/resumes/default',
    RESUME: (id: string) => `/api/profile/resumes/${id}` as const,
    RESUME_DEFAULT: (id: string) => `/api/profile/resumes/${id}/default` as const,
    RESUME_TEXT: (id: string) => `/api/profile/resumes/${id}/text` as const,
    RESUME_LINK: (id: string) => `/api/profile/resumes/${id}/link` as const,
  },


  // ============================================
  // Aptitude Practice
  // ============================================
  APTITUDE: {
    SESSIONS: '/api/practice/aptitude/sessions',
    SESSION: (id: string) => `/api/practice/aptitude/sessions/${id}` as const,
    QUESTIONS: (id: string) => `/api/practice/aptitude/sessions/${id}/questions` as const,
    QUESTION: (sessionId: string, questionId: string) =>
      `/api/practice/aptitude/sessions/${sessionId}/questions/${questionId}` as const,
    ANSWER: (id: string) => `/api/practice/aptitude/sessions/${id}/answer` as const,
    SUBMIT: (id: string) => `/api/practice/aptitude/sessions/${id}/submit` as const,
    STATUS: (id: string) => `/api/practice/aptitude/sessions/${id}/status` as const,
    RESULTS: (id: string) => `/api/practice/aptitude/sessions/${id}/results` as const,
    SOLUTIONS: (id: string) => `/api/practice/aptitude/sessions/${id}/solutions` as const,
  },

  // ============================================
  // Machine Coding Practice
  // ============================================
  MACHINE: {
    SESSIONS: '/api/practice/machine/sessions',
    SESSION: (id: string) => `/api/practice/machine/sessions/${id}` as const,
    QUESTIONS: (id: string) => `/api/practice/machine/sessions/${id}/questions` as const,
    QUESTION: (sessionId: string, questionId: string) =>
      `/api/practice/machine/sessions/${sessionId}/questions/${questionId}` as const,
    RUN: (sessionId: string, questionId: string) =>
      `/api/practice/machine/sessions/${sessionId}/questions/${questionId}/run` as const,
    SUBMIT: (sessionId: string, questionId: string) =>
      `/api/practice/machine/sessions/${sessionId}/questions/${questionId}/submit` as const,
    COMPLETE: (id: string) => `/api/practice/machine/sessions/${id}/complete` as const,
    RESULTS: (id: string) => `/api/practice/machine/sessions/${id}/results` as const,
  },

  // ============================================
  // AI Interview Practice
  // ============================================
  INTERVIEW: {
    SESSIONS: '/api/practice/interview/sessions',
    SESSION: (id: string) => `/api/practice/interview/sessions/${id}` as const,
    SESSION_DETAIL: (id: string) => `/api/practice/interview/sessions/${id}/detail` as const,
    START: (id: string) => `/api/practice/interview/sessions/${id}/start` as const,
    CANCEL: (id: string) => `/api/practice/interview/sessions/${id}/cancel` as const,
    END: (id: string) => `/api/practice/interview/sessions/${id}/end` as const,
    RESPOND: (id: string) => `/api/practice/interview/sessions/${id}/respond` as const,
    FEEDBACK: (id: string) => `/api/practice/interview/sessions/${id}/feedback` as const,
    REGENERATE_FEEDBACK: (id: string) => `/api/practice/interview/sessions/${id}/feedback/regenerate` as const,
  },

  // ============================================
  // Platform Admin
  // ============================================
  ADMIN: {
    ANALYTICS: '/api/admin/analytics',

    // Institutes
    INSTITUTES: '/api/admin/institutes',
    INSTITUTE: (id: string) => `/api/admin/institutes/${id}` as const,
    INSTITUTE_TOGGLE: (id: string) => `/api/admin/institutes/${id}/toggle-status` as const,
    INSTITUTE_STATS: (id: string) => `/api/admin/institutes/${id}/stats` as const,
    INSTITUTE_STUDENTS: (id: string) => `/api/admin/institutes/${id}/students` as const,
    INSTITUTE_ADMINS: (id: string) => `/api/admin/institutes/${id}/admins` as const,

    // Users
    USERS: '/api/admin/users',
    USER: (id: string) => `/api/admin/users/${id}` as const,
    USER_TOGGLE: (id: string) => `/api/admin/users/${id}/toggle-status` as const,
    USER_STATS: (id: string) => `/api/admin/users/${id}/stats` as const,

    // Reports
    REPORTS: {
      INSTITUTES: '/api/admin/reports/institutes',
      USERS: '/api/admin/reports/users',
      ACTIVITY: '/api/admin/reports/activity',
    },
  },

  // ============================================
  // Roadmap
  // ============================================
  ROADMAP: {
    NEXT_QUESTION: '/api/practice/roadmap/question',
    GENERATE: '/api/practice/roadmap/generate',
  },

  // ============================================
  // Institute Admin - Mock Drive Management
  // ============================================
  INSTITUTE: {
    // Base Mock Drive CRUD
    MOCK_DRIVES: '/api/institute/mock-drive',
    MOCK_DRIVE: (id: string) => `/api/institute/mock-drive/${id}` as const,
    MOCK_DRIVE_PUBLISH: (id: string) => `/api/institute/mock-drive/${id}/publish` as const,
    MOCK_DRIVE_CANCEL: (id: string) => `/api/institute/mock-drive/${id}/cancel` as const,
    MOCK_DRIVE_DUPLICATE: (id: string) => `/api/institute/mock-drive/${id}/duplicate` as const,
    MOCK_DRIVE_STATS: (id: string) => `/api/institute/mock-drive/${id}/stats` as const,
    DEPARTMENTS: '/api/institute/departments',
    DEPARTMENTS_STATS: '/api/institute/departments/stats',
    DEPARTMENTS_ACTIVE: '/api/institute/departments/active',
    DEPARTMENTS_BULK: '/api/institute/departments/bulk',
    DEPARTMENT: (id: string) => `/api/institute/departments/${id}` as const,
    DEPARTMENT_STATUS: (id: string) => `/api/institute/departments/${id}/status` as const,

    // Eligibility
    MOCK_DRIVE_ELIGIBILITY: (id: string) =>
      `/api/institute/mock-drive/${id}/eligibility` as const,

    // Modules
    MOCK_DRIVE_MODULES: (id: string) => `/api/institute/mock-drive/${id}/modules` as const,
    MOCK_DRIVE_MODULE: (driveId: string, moduleId: string) =>
      `/api/institute/mock-drive/${driveId}/modules/${moduleId}` as const,
    MOCK_DRIVE_MODULES_REORDER: (id: string) =>
      `/api/institute/mock-drive/${id}/modules/reorder` as const,

    // Registrations
    MOCK_DRIVE_REGISTRATIONS: (id: string) =>
      `/api/institute/mock-drive/${id}/registrations` as const,
    MOCK_DRIVE_REGISTRATION: (driveId: string, regId: string) =>
      `/api/institute/mock-drive/${driveId}/registrations/${regId}` as const,
    MOCK_DRIVE_REGISTRATIONS_BULK: (id: string) =>
      `/api/institute/mock-drive/${id}/registrations/bulk` as const,

    // Batches
    MOCK_DRIVE_BATCHES: (id: string) => `/api/institute/mock-drive/${id}/batches` as const,
    MOCK_DRIVE_BATCH: (driveId: string, batchId: string) =>
      `/api/institute/mock-drive/${driveId}/batches/${batchId}` as const,
    MOCK_DRIVE_BATCHES_AUTO_CREATE: (id: string) =>
      `/api/institute/mock-drive/${id}/batches/auto-create` as const,
    MOCK_DRIVE_BATCH_ASSIGN: (driveId: string, batchId: string) =>
      `/api/institute/mock-drive/${driveId}/batches/${batchId}/assign-students` as const,

    // Analytics
    MOCK_DRIVE_ANALYTICS: (id: string) =>
      `/api/institute/mock-drive/${id}/analytics` as const,
    MOCK_DRIVE_ANALYTICS_BATCHES: (id: string) =>
      `/api/institute/mock-drive/${id}/analytics/batches` as const,

    // Results
    MOCK_DRIVE_RESULTS: (id: string) => `/api/institute/mock-drive/${id}/results` as const,
    MOCK_DRIVE_RESULTS_EXPORT: (id: string) =>
      `/api/institute/mock-drive/${id}/results/export` as const,
    MOCK_DRIVE_RESULT_DETAIL: (driveId: string, attemptId: string) =>
      `/api/institute/mock-drive/${driveId}/results/${attemptId}` as const,
    MOCK_DRIVE_LEADERBOARD: (id: string) =>
      `/api/institute/mock-drive/${id}/leaderboard` as const,
  },

  // ============================================
  // Student - Mock Drive Discovery & Attempt
  // ============================================
  MOCK_DRIVES: {
    // Discovery & Registration
    LIST: '/api/mock-drives',
    MY_REGISTRATIONS: '/api/mock-drives/my-registrations',
    DETAIL: (id: string) => `/api/mock-drives/${id}` as const,
    ELIGIBILITY: (id: string) => `/api/mock-drives/${id}/eligibility` as const,
    REGISTER: (id: string) => `/api/mock-drives/${id}/register` as const,

    // Attempt Management
    ATTEMPT: (id: string) => `/api/mock-drives/${id}/attempt` as const,
    START: (id: string) => `/api/mock-drives/${id}/start` as const,
    SUBMIT_ATTEMPT: (id: string) => `/api/mock-drives/${id}/submit` as const,

    // Module Operations
    MODULE: (driveId: string, moduleId: string) =>
      `/api/mock-drives/${driveId}/modules/${moduleId}` as const,
    MODULE_START: (driveId: string, moduleId: string) =>
      `/api/mock-drives/${driveId}/modules/${moduleId}/start` as const,
    MODULE_SUBMIT: (driveId: string, moduleId: string) =>
      `/api/mock-drives/${driveId}/modules/${moduleId}/submit` as const,

    // Aptitude Module Actions
    APTITUDE_ANSWER: (driveId: string, moduleId: string) =>
      `/api/mock-drives/${driveId}/modules/${moduleId}/aptitude/answer` as const,
    APTITUDE_CLEAR: (driveId: string, moduleId: string) =>
      `/api/mock-drives/${driveId}/modules/${moduleId}/aptitude/clear` as const,
    APTITUDE_MARK_REVIEW: (driveId: string, moduleId: string) =>
      `/api/mock-drives/${driveId}/modules/${moduleId}/aptitude/mark-review` as const,

    // Machine Coding Module Actions
    MACHINE_RUN: (driveId: string, moduleId: string) =>
      `/api/mock-drives/${driveId}/modules/${moduleId}/machine/run` as const,
    MACHINE_SUBMIT: (driveId: string, moduleId: string) =>
      `/api/mock-drives/${driveId}/modules/${moduleId}/machine/submit` as const,

    // AI Interview Module Actions
    INTERVIEW_RESPOND: (driveId: string, moduleId: string) =>
      `/api/mock-drives/${driveId}/modules/${moduleId}/interview/respond` as const,
    INTERVIEW_SKIP: (driveId: string, moduleId: string) =>
      `/api/mock-drives/${driveId}/modules/${moduleId}/interview/skip` as const,
    INTERVIEW_NEXT: (driveId: string, moduleId: string) =>
      `/api/mock-drives/${driveId}/modules/${moduleId}/interview/next` as const,
    INTERVIEW_VOICE_START: (driveId: string, moduleId: string) =>
      `/api/mock-drives/${driveId}/modules/${moduleId}/interview/voice/start` as const,
    INTERVIEW_AUDIO_QUESTION: (driveId: string, moduleId: string) =>
      `/api/mock-drives/${driveId}/modules/${moduleId}/interview/audio-question` as const,

    // Results
    RESULT: (id: string) => `/api/mock-drives/${id}/result` as const,
    REPORT: (id: string) => `/api/mock-drives/${id}/report` as const,

    // Leaderboard
    LEADERBOARD: (id: string) => `/api/mock-drives/${id}/leaderboard` as const,
    MY_RANK: (id: string) => `/api/mock-drives/${id}/leaderboard/my-rank` as const,
  },

  //Leaderboard
  LEADERBOARD: {
    CONFIG: '/api/leaderboard/config',
    LIST: '/api/leaderboard',
    MY_SCORES: '/api/leaderboard/my-scores',
    MY_STATS: '/api/leaderboard/my-stats',
  },

  // ============================================
  // Common / Config
  // ============================================
  COMMON: {
    LANGUAGES: '/api/practice/languages',
    TIME_LIMITS: '/api/practice/config/time-limits',
    DIFFICULTY_LEVELS: '/api/practice/enums/difficulty-levels',
    QUESTION_TYPES: '/api/practice/enums/question-types',
    AI_INTERVIEW_DIFFICULTIES: '/api/practice/enums/ai-interview-difficulties',
    MODULE_TYPES: '/api/practice/enums/module-types',
    MOCK_DRIVE_STATUSES: '/api/practice/enums/mock-drive-statuses',
  },
} as const;


// ============================================
// Type Helpers
// ============================================

export type ApiEndpoints = typeof API_ENDPOINTS;

// ============================================
// URL Builder Utilities
// ============================================

/**
 * Build full URL with base
 */
export function buildUrl(endpoint: string): string {
  return `${API_BASE_URL}${endpoint}`;
}

/**
 * Build URL with query parameters
 */
export function buildUrlWithParams(
  endpoint: string,
  params: Record<string, string | number | boolean | string[] | undefined | null>
): string {
  const url = new URL(endpoint, API_BASE_URL || 'http://localhost');

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach((v) => url.searchParams.append(key, String(v)));
      } else {
        url.searchParams.set(key, String(value));
      }
    }
  });

  return API_BASE_URL ? url.toString() : `${url.pathname}${url.search}`;
}

/**
 * Replace path parameters in endpoint
 */
export function replacePathParams(
  endpoint: string,
  params: Record<string, string | number>
): string {
  let result = endpoint;
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(`:${key}`, String(value));
    result = result.replace(`{${key}}`, String(value));
  });
  return result;
}

// ============================================
// Endpoint Builders (Organized by Domain)
// ============================================

export const EndpointBuilders = {
  /**
   * Institute Admin Mock Drive Endpoints
   */
  instituteMockDrive: {
    list: () => buildUrl(API_ENDPOINTS.INSTITUTE.MOCK_DRIVES),
    create: () => buildUrl(API_ENDPOINTS.INSTITUTE.MOCK_DRIVES),
    get: (id: string) => buildUrl(API_ENDPOINTS.INSTITUTE.MOCK_DRIVE(id)),
    update: (id: string) => buildUrl(API_ENDPOINTS.INSTITUTE.MOCK_DRIVE(id)),
    delete: (id: string) => buildUrl(API_ENDPOINTS.INSTITUTE.MOCK_DRIVE(id)),
    publish: (id: string) => buildUrl(API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_PUBLISH(id)),
    cancel: (id: string) => buildUrl(API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_CANCEL(id)),
    duplicate: (id: string) => buildUrl(API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_DUPLICATE(id)),
    stats: (id: string) => buildUrl(API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_STATS(id)),
    eligibility: (id: string) => buildUrl(API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_ELIGIBILITY(id)),
    modules: (id: string) => buildUrl(API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_MODULES(id)),
    module: (driveId: string, moduleId: string) =>
      buildUrl(API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_MODULE(driveId, moduleId)),
    registrations: (id: string) => buildUrl(API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_REGISTRATIONS(id)),
    batches: (id: string) => buildUrl(API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_BATCHES(id)),
    analytics: (id: string) => buildUrl(API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_ANALYTICS(id)),
    results: (id: string) => buildUrl(API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_RESULTS(id)),
    leaderboard: (id: string) => buildUrl(API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_LEADERBOARD(id)),
  },


  /**
   * Student Mock Drive Endpoints
   */
  mockDrives: {
    // Discovery
    list: () => buildUrl(API_ENDPOINTS.MOCK_DRIVES.LIST),
    listWithParams: (params: {
      page?: number;
      limit?: number;
      status?: string[];
      search?: string;
      registrationOpen?: boolean;
    }) => buildUrlWithParams(API_ENDPOINTS.MOCK_DRIVES.LIST, params),
    detail: (id: string) => buildUrl(API_ENDPOINTS.MOCK_DRIVES.DETAIL(id)),
    myRegistrations: () => buildUrl(API_ENDPOINTS.MOCK_DRIVES.MY_REGISTRATIONS),

    // Eligibility & Registration
    eligibility: (id: string) => buildUrl(API_ENDPOINTS.MOCK_DRIVES.ELIGIBILITY(id)),
    register: (id: string) => buildUrl(API_ENDPOINTS.MOCK_DRIVES.REGISTER(id)),
    withdraw: (id: string) => buildUrl(API_ENDPOINTS.MOCK_DRIVES.REGISTER(id)),

    // Attempt
    attempt: (id: string) => buildUrl(API_ENDPOINTS.MOCK_DRIVES.ATTEMPT(id)),
    start: (id: string) => buildUrl(API_ENDPOINTS.MOCK_DRIVES.START(id)),

    // Module Operations
    module: (driveId: string, moduleId: string) =>
      buildUrl(API_ENDPOINTS.MOCK_DRIVES.MODULE(driveId, moduleId)),
    moduleStart: (driveId: string, moduleId: string) =>
      buildUrl(API_ENDPOINTS.MOCK_DRIVES.MODULE_START(driveId, moduleId)),
    moduleSubmit: (driveId: string, moduleId: string) =>
      buildUrl(API_ENDPOINTS.MOCK_DRIVES.MODULE_SUBMIT(driveId, moduleId)),

    // Aptitude
    aptitudeAnswer: (driveId: string, moduleId: string) =>
      buildUrl(API_ENDPOINTS.MOCK_DRIVES.APTITUDE_ANSWER(driveId, moduleId)),
    aptitudeClear: (driveId: string, moduleId: string) =>
      buildUrl(API_ENDPOINTS.MOCK_DRIVES.APTITUDE_CLEAR(driveId, moduleId)),
    aptitudeMarkReview: (driveId: string, moduleId: string) =>
      buildUrl(API_ENDPOINTS.MOCK_DRIVES.APTITUDE_MARK_REVIEW(driveId, moduleId)),

    // Machine Coding
    machineRun: (driveId: string, moduleId: string) =>
      buildUrl(API_ENDPOINTS.MOCK_DRIVES.MACHINE_RUN(driveId, moduleId)),
    machineSubmit: (driveId: string, moduleId: string) =>
      buildUrl(API_ENDPOINTS.MOCK_DRIVES.MACHINE_SUBMIT(driveId, moduleId)),

    // Interview
    interviewRespond: (driveId: string, moduleId: string) =>
      buildUrl(API_ENDPOINTS.MOCK_DRIVES.INTERVIEW_RESPOND(driveId, moduleId)),
    interviewSkip: (driveId: string, moduleId: string) =>
      buildUrl(API_ENDPOINTS.MOCK_DRIVES.INTERVIEW_SKIP(driveId, moduleId)),
    interviewNext: (driveId: string, moduleId: string) =>
      buildUrl(API_ENDPOINTS.MOCK_DRIVES.INTERVIEW_NEXT(driveId, moduleId)),
    interviewVoiceStart: (driveId: string, moduleId: string) =>
      buildUrl(API_ENDPOINTS.MOCK_DRIVES.INTERVIEW_VOICE_START(driveId, moduleId)),
    interviewAudioQuestion: (driveId: string, moduleId: string) =>
      buildUrl(API_ENDPOINTS.MOCK_DRIVES.INTERVIEW_AUDIO_QUESTION(driveId, moduleId)),

    // Results
    result: (id: string) => buildUrl(API_ENDPOINTS.MOCK_DRIVES.RESULT(id)),
    report: (id: string) => buildUrl(API_ENDPOINTS.MOCK_DRIVES.REPORT(id)),

    // Leaderboard
    leaderboard: (id: string) => buildUrl(API_ENDPOINTS.MOCK_DRIVES.LEADERBOARD(id)),
    leaderboardWithParams: (
      id: string,
      params: { page?: number; limit?: number; batchId?: string; department?: string }
    ) => buildUrlWithParams(API_ENDPOINTS.MOCK_DRIVES.LEADERBOARD(id), params),
    myRank: (id: string) => buildUrl(API_ENDPOINTS.MOCK_DRIVES.MY_RANK(id)),
    myRankWithParams: (id: string, params: { batchId?: string }) =>
      buildUrlWithParams(API_ENDPOINTS.MOCK_DRIVES.MY_RANK(id), params),
  },
  instituteDepartments: {
    list: () => buildUrl(API_ENDPOINTS.INSTITUTE.DEPARTMENTS),
    listWithParams: (params: {
      page?: number;
      limit?: number;
      search?: string;
      isActive?: boolean;
      sortBy?: string;
      sortOrder?: string;
    }) => buildUrlWithParams(API_ENDPOINTS.INSTITUTE.DEPARTMENTS, params),
    stats: () => buildUrl(API_ENDPOINTS.INSTITUTE.DEPARTMENTS_STATS),
    active: () => buildUrl(API_ENDPOINTS.INSTITUTE.DEPARTMENTS_ACTIVE),
    bulk: () => buildUrl(API_ENDPOINTS.INSTITUTE.DEPARTMENTS_BULK),
    get: (id: string) => buildUrl(API_ENDPOINTS.INSTITUTE.DEPARTMENT(id)),
    create: () => buildUrl(API_ENDPOINTS.INSTITUTE.DEPARTMENTS),
    update: (id: string) => buildUrl(API_ENDPOINTS.INSTITUTE.DEPARTMENT(id)),
    delete: (id: string) => buildUrl(API_ENDPOINTS.INSTITUTE.DEPARTMENT(id)),
    toggleStatus: (id: string) => buildUrl(API_ENDPOINTS.INSTITUTE.DEPARTMENT_STATUS(id)),
  },
  // ... rest of the endpoint builders remain the same
  auth: {
    login: () => buildUrl(API_ENDPOINTS.AUTH.LOGIN),
    register: () => buildUrl(API_ENDPOINTS.AUTH.REGISTER),
    logout: () => buildUrl(API_ENDPOINTS.AUTH.LOGOUT),
    me: () => buildUrl(API_ENDPOINTS.AUTH.ME),
    refresh: () => buildUrl(API_ENDPOINTS.AUTH.REFRESH),
  },

  profile: {
    complete: () => buildUrl(API_ENDPOINTS.PROFILE.COMPLETE),
    user: () => buildUrl(API_ENDPOINTS.PROFILE.USER),
    student: () => buildUrl(API_ENDPOINTS.PROFILE.STUDENT),
    departments: () => buildUrl(API_ENDPOINTS.PROFILE.DEPARTMENTS),
    resumes: () => buildUrl(API_ENDPOINTS.PROFILE.RESUMES),
    resume: (id: string) => buildUrl(API_ENDPOINTS.PROFILE.RESUME(id)),
  },

  aptitude: {
    sessions: () => buildUrl(API_ENDPOINTS.APTITUDE.SESSIONS),
    session: (id: string) => buildUrl(API_ENDPOINTS.APTITUDE.SESSION(id)),
    questions: (id: string) => buildUrl(API_ENDPOINTS.APTITUDE.QUESTIONS(id)),
    answer: (id: string) => buildUrl(API_ENDPOINTS.APTITUDE.ANSWER(id)),
    submit: (id: string) => buildUrl(API_ENDPOINTS.APTITUDE.SUBMIT(id)),
    results: (id: string) => buildUrl(API_ENDPOINTS.APTITUDE.RESULTS(id)),
  },

  machine: {
    sessions: () => buildUrl(API_ENDPOINTS.MACHINE.SESSIONS),
    session: (id: string) => buildUrl(API_ENDPOINTS.MACHINE.SESSION(id)),
    questions: (id: string) => buildUrl(API_ENDPOINTS.MACHINE.QUESTIONS(id)),
    run: (sessionId: string, questionId: string) =>
      buildUrl(API_ENDPOINTS.MACHINE.RUN(sessionId, questionId)),
    submit: (sessionId: string, questionId: string) =>
      buildUrl(API_ENDPOINTS.MACHINE.SUBMIT(sessionId, questionId)),
    complete: (id: string) => buildUrl(API_ENDPOINTS.MACHINE.COMPLETE(id)),
    results: (id: string) => buildUrl(API_ENDPOINTS.MACHINE.RESULTS(id)),
  },

  interview: {
    sessions: () => buildUrl(API_ENDPOINTS.INTERVIEW.SESSIONS),
    session: (id: string) => buildUrl(API_ENDPOINTS.INTERVIEW.SESSION(id)),
    sessionDetail: (id: string) => buildUrl(API_ENDPOINTS.INTERVIEW.SESSION_DETAIL(id)),
    start: (id: string) => buildUrl(API_ENDPOINTS.INTERVIEW.START(id)),
    cancel: (id: string) => buildUrl(API_ENDPOINTS.INTERVIEW.CANCEL(id)),
    end: (id: string) => buildUrl(API_ENDPOINTS.INTERVIEW.END(id)),
    respond: (id: string) => buildUrl(API_ENDPOINTS.INTERVIEW.RESPOND(id)),
    feedback: (id: string) => buildUrl(API_ENDPOINTS.INTERVIEW.FEEDBACK(id)),
    regenerateFeedback: (id: string) => buildUrl(API_ENDPOINTS.INTERVIEW.REGENERATE_FEEDBACK(id)),
  },
} as const;

// src/lib/api/endpoints.ts - Add these to existing file

// src/lib/api/endpoints.ts - Update LMS_ENDPOINTS section

export const LMS_ENDPOINTS = {
  // Categories
  CATEGORIES: '/api/lms/categories',

  // Courses
  COURSES: '/api/lms/courses',
  COURSE_BY_SLUG: (slug: string) => `/api/lms/courses/${slug}`,
  COURSE_ENROLL: (slug: string) => `/api/lms/courses/${slug}/enroll`,
  COURSE_FEEDBACK: (slug: string) => `/api/lms/courses/${slug}/feedback`,

  // Comments
  COURSE_COMMENTS: (slug: string) => `/api/lms/courses/${slug}/comments`,
  COURSE_COMMENT_LIKE: (slug: string, commentId: string) => `/api/lms/courses/${slug}/comments/${commentId}/like`,
  COURSE_COMMENT_DELETE: (slug: string, commentId: string) => `/api/lms/courses/${slug}/comments/${commentId}`,

  // Modules
  MODULE_DETAILS: (courseSlug: string, moduleOrder: number) =>
    `/api/lms/courses/${courseSlug}/modules/${moduleOrder}`,

  // Topics
  TOPIC_DETAILS: (courseSlug: string, moduleOrder: number, topicOrder: number) =>
    `/api/lms/courses/${courseSlug}/modules/${moduleOrder}/topics/${topicOrder}`,
  TOPIC_PROGRESS: (courseSlug: string, moduleOrder: number, topicOrder: number) =>
    `/api/lms/courses/${courseSlug}/modules/${moduleOrder}/topics/${topicOrder}/progress`,

  // Tests
  MODULE_TEST_START: (courseSlug: string, moduleOrder: number) =>
    `/api/lms/courses/${courseSlug}/modules/${moduleOrder}/test/start`,
  MODULE_TEST_SUBMIT: (courseSlug: string, moduleOrder: number) =>
    `/api/lms/courses/${courseSlug}/modules/${moduleOrder}/test/submit`,
  FINAL_TEST_START: (courseSlug: string) =>
    `/api/lms/courses/${courseSlug}/final-test/start`,
  FINAL_TEST_SUBMIT: (courseSlug: string) =>
    `/api/lms/courses/${courseSlug}/final-test/submit`,

  // User Dashboard
  MY_COURSES: '/api/lms/my-courses',
  MY_DASHBOARD: '/api/lms/dashboard',

  DASHBOARD: {
    STUDENT: '/api/dashboard/student',
    INSTITUTE_ADMIN: '/api/dashboard/institute-admin',
    PLATFORM_ADMIN: '/api/dashboard/platform-admin',
    STUDENT_FOR_ADMIN: (id: string) => `/api/dashboard/student/${id}`,
  },

  // Stats
  STATS: '/api/lms/stats',
};

// ============================================
// Resume Builder
// ============================================
export const RESUME_BUILDER_ENDPOINTS = {
  // Templates
  TEMPLATES: '/api/resume-builder/templates',
  TEMPLATE: (id: string) => `/api/resume-builder/templates/${id}` as const,

  // Resumes
  RESUMES: '/api/resume-builder',
  RESUME: (id: string) => `/api/resume-builder/${id}` as const,

  // ATS Checker
  ATS_CHECK: '/api/resume-builder/ats-check',
};