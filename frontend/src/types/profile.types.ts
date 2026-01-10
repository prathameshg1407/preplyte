// src/types/profile.types.ts

// =====================================================
// DEPARTMENT TYPES
// =====================================================

export interface Department {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
}

export interface DepartmentListResponse {
  departments: Department[];
  total: number;
}

// =====================================================
// RESUME TYPES
// =====================================================

export interface Resume {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number | null;
  mimeType: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeListResponse {
  resumes: Resume[];
  total: number;
  maxAllowed: number;
}

export interface ExtractedResumeData {
  text: string;
  wordCount: number;
  pageCount?: number;
}

// =====================================================
// STUDENT PROFILE TYPES
// =====================================================

export interface StudentProfile {
  id: string;
  userId: string;
  fullName: string;
  studentId: string;
  departmentId: string;
  departmentName: string;
  departmentCode: string | null;
  courseYear: string;
  numberOfBacklogs: number;
  skills: string[];
  marks10: number | null;
  marks12: number | null;
  cgpaSemesters: number[];
  averageCgpa: number | null;
  resumeUrl: string | null;
  resumeName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudentProfileInput {
  fullName: string;
  studentId: string;
  departmentId: string;
  courseYear: string;
  numberOfBacklogs?: number;
  skills?: string[];
  marks10?: number;
  marks12?: number;
  cgpaSemesters?: number[];
}

export interface UpdateStudentProfileInput {
  fullName?: string;
  departmentId?: string;
  courseYear?: string;
  numberOfBacklogs?: number;
  skills?: string[];
  marks10?: number;
  marks12?: number;
  cgpaSemesters?: number[];
}

// =====================================================
// USER PROFILE TYPES
// =====================================================

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
  instituteId: string | null;
  instituteName: string | null;
  createdAt: string;
  lastLoginAt: string | null;
  studentProfile: StudentProfile | null;
  resumeCount: number;
  defaultResume: Resume | null;
}

export interface UpdateUserProfileInput {
  name?: string;
}

// =====================================================
// COMPLETE PROFILE TYPES
// =====================================================

export interface ProfileCompletionStatus {
  percentage: number;
  missingFields: string[];
  isComplete: boolean;
}

export interface CompleteProfile {
  user: UserProfile;
  studentProfile: StudentProfile | null;
  resumes: Resume[];
  profileCompletion: ProfileCompletionStatus;
  availableDepartments: Department[];
}

// =====================================================
// ACADEMIC TYPES
// =====================================================

export interface AcademicMarksInput {
  marks10?: number;
  marks12?: number;
  cgpaSemesters?: number[];
}

// =====================================================
// CONSTANTS
// =====================================================

export const COURSE_YEARS = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
] as const;

export type CourseYear = (typeof COURSE_YEARS)[number];

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface ProfileApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}