// src/lib/api/endpoints.ts

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
    REFRESH: '/api/auth/refresh',
  },
  USER: {
    PROFILE: '/api/user/profile',
    UPDATE: '/api/user/update',
  },
  APTITUDE: {
    SESSIONS: '/api/aptitude/sessions',
    SESSION: (id: string) => `/api/aptitude/sessions/${id}`,
    QUESTIONS: (id: string) => `/api/aptitude/sessions/${id}/questions`,
    QUESTION: (sessionId: string, questionId: string) =>
      `/api/aptitude/sessions/${sessionId}/questions/${questionId}`,
    ANSWER: (id: string) => `/api/aptitude/sessions/${id}/answer`,
    SUBMIT: (id: string) => `/api/aptitude/sessions/${id}/submit`,
    STATUS: (id: string) => `/api/aptitude/sessions/${id}/status`,
    RESULTS: (id: string) => `/api/aptitude/sessions/${id}/results`,
    SOLUTIONS: (id: string) => `/api/aptitude/sessions/${id}/solutions`,
  },
  MACHINE: {
    SESSIONS: '/api/machine/sessions',
    SESSION: (id: string) => `/api/machine/sessions/${id}`,
    QUESTIONS: (id: string) => `/api/machine/sessions/${id}/questions`,
    QUESTION: (sessionId: string, questionId: string) =>
      `/api/machine/sessions/${sessionId}/questions/${questionId}`,
    RUN: (sid: string, qid: string) =>
      `/api/machine/sessions/${sid}/questions/${qid}/run`,
    SUBMIT: (sid: string, qid: string) =>
      `/api/machine/sessions/${sid}/questions/${qid}/submit`,
    COMPLETE: (id: string) => `/api/machine/sessions/${id}/complete`,
    RESULTS: (id: string) => `/api/machine/sessions/${id}/results`,
  },
  INTERVIEW: {
    // Session management
    START: '/api/ai-interview/start',
    SESSIONS: '/api/ai-interview/sessions',
    STATS: '/api/ai-interview/stats',
    
    // Session operations
    SESSION: (id: string) => `/api/ai-interview/${id}`,
    RESPOND: (id: string) => `/api/ai-interview/${id}/respond`,
    END: (id: string) => `/api/ai-interview/${id}/end`,
    FEEDBACK: (id: string) => `/api/ai-interview/${id}/feedback`,
    DELETE: (id: string) => `/api/ai-interview/${id}`,
    
    // Deprecated - kept for backwards compatibility
    /** @deprecated Use RESPOND instead */
    ANSWER: (id: string) => `/api/ai-interview/${id}/respond`,
    /** @deprecated No longer used */
    NEXT: (id: string) => `/api/ai-interview/${id}`,
    /** @deprecated Use END instead */
    CANCEL: (id: string) => `/api/ai-interview/${id}/end`,
  },
 ADMIN: {
    ANALYTICS: '/api/admin/analytics',
    INSTITUTES: '/api/admin/institutes',
    INSTITUTE: (id: string) => `/api/admin/institutes/${id}`,
    INSTITUTE_TOGGLE: (id: string) => `/api/admin/institutes/${id}/toggle-status`,
    
    // Add these missing specific endpoints:
    INSTITUTE_STATS: (id: string) => `/api/admin/institutes/${id}/stats`,
    INSTITUTE_STUDENTS: (id: string) => `/api/admin/institutes/${id}/students`,
    INSTITUTE_ADMINS: (id: string) => `/api/admin/institutes/${id}/admins`,

    USERS: '/api/admin/users',
    USER: (id: string) => `/api/admin/users/${id}`,
    USER_TOGGLE: (id: string) => `/api/admin/users/${id}/toggle-status`,
    
    // Add this one too for getUserStats:
    USER_STATS: (id: string) => `/api/admin/users/${id}/stats`,
    // Add this missing section
    REPORTS: {
      INSTITUTES: '/api/admin/reports/institutes',
      USERS: '/api/admin/reports/users',
      ACTIVITY: '/api/admin/reports/activity',
    },
  },
  COMMON: {
    LANGUAGES: '/api/languages',
    TIME_LIMITS: '/api/config/time-limits',
    DIFFICULTY_LEVELS: '/api/enums/difficulty-levels',
    QUESTION_TYPES: '/api/enums/question-types',
  },
  PROFILE: {
    // Complete profile
    COMPLETE: '/api/profile',
    
    // User profile
    USER: '/api/profile/user',
    
    // Student profile
    STUDENT: '/api/profile/student',
    STUDENT_SKILLS: '/api/profile/student/skills',
    STUDENT_ACADEMICS: '/api/profile/student/academics',
    
    // Resumes
    RESUMES: '/api/profile/resumes',
    RESUMES_DEFAULT: '/api/profile/resumes/default',
    RESUME: (id: number) => `/api/profile/resumes/${id}`,
    RESUME_DEFAULT: (id: number) => `/api/profile/resumes/${id}/default`,
    RESUME_TEXT: (id: number) => `/api/profile/resumes/${id}/text`,
    RESUME_LINK: (id: number) => `/api/profile/resumes/${id}/link`,
  },
} as const;

// Type helper for endpoint functions
export type EndpointFunction = (id: string) => string;
export type EndpointFunctionTwo = (id1: string, id2: string) => string;