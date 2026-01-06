// src/types/profile.types.ts

// =====================================================
// RESUME TYPES
// =====================================================

export interface Resume {
  id: number;
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
  department: string;
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
  department: string;
  courseYear: string;
  numberOfBacklogs?: number;
  skills?: string[];
  marks10?: number;
  marks12?: number;
  cgpaSemesters?: number[];
}

export interface UpdateStudentProfileInput {
  fullName?: string;
  department?: string;
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

export const COURSE_YEARS = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  '5th Year',
] as const;

export type Department = (typeof DEPARTMENTS)[number];
export type CourseYear = (typeof COURSE_YEARS)[number];

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface ProfileApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}