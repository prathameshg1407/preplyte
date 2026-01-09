// src/module/profile/profile.types.ts

import { Resume, StudentProfile, User, Department } from '@prisma/client';

// =====================================================
// DEPARTMENT TYPES
// =====================================================

export interface DepartmentResponse {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
}

export interface DepartmentListResponse {
  departments: DepartmentResponse[];
  total: number;
}

// =====================================================
// RESUME TYPES
// =====================================================

export interface ResumeResponse {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number | null;
  mimeType: string | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResumeListResponse {
  resumes: ResumeResponse[];
  total: number;
  maxAllowed: number;
}

export interface ResumeUploadResult {
  secureUrl: string;
  publicId: string;
}

export interface ExtractedResumeData {
  text: string;
  wordCount: number;
  pageCount?: number;
}

// =====================================================
// STUDENT PROFILE TYPES
// =====================================================

export interface StudentProfileResponse {
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
  createdAt: Date;
  updatedAt: Date;
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

export interface UserProfileResponse {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
  instituteId: string | null;
  instituteName: string | null;
  createdAt: Date;
  lastLoginAt: Date | null;
  studentProfile: StudentProfileResponse | null;
  resumeCount: number;
  defaultResume: ResumeResponse | null;
}

export interface UpdateUserProfileInput {
  name?: string;
}

// =====================================================
// COMBINED PROFILE TYPES
// =====================================================

export interface CompleteProfileResponse {
  user: UserProfileResponse;
  studentProfile: StudentProfileResponse | null;
  resumes: ResumeResponse[];
  profileCompletion: ProfileCompletionStatus;
  availableDepartments: DepartmentResponse[];
}

export interface ProfileCompletionStatus {
  percentage: number;
  missingFields: string[];
  isComplete: boolean;
}

// =====================================================
// EXTENDED PRISMA TYPES
// =====================================================

type StudentProfileWithDepartment = StudentProfile & {
  department: Department;
};

// =====================================================
// MAPPER FUNCTIONS
// =====================================================

export const mapDepartmentToResponse = (department: Department): DepartmentResponse => ({
  id: department.id,
  name: department.name,
  code: department.code,
  description: department.description,
});

export const mapResumeToResponse = (resume: Resume): ResumeResponse => ({
  id: resume.id,
  fileName: resume.fileName,
  fileUrl: resume.fileUrl,
  fileSize: resume.fileSize,
  mimeType: resume.mimeType,
  isDefault: resume.isDefault,
  createdAt: resume.createdAt,
  updatedAt: resume.updatedAt,
});

export const mapStudentProfileToResponse = (
  profile: StudentProfileWithDepartment
): StudentProfileResponse => ({
  id: profile.id,
  userId: profile.userId,
  fullName: profile.fullName,
  studentId: profile.studentId,
  departmentId: profile.departmentId,
  departmentName: profile.department.name,
  departmentCode: profile.department.code,
  courseYear: profile.courseYear,
  numberOfBacklogs: profile.numberOfBacklogs,
  skills: profile.skills,
  marks10: profile.marks10,
  marks12: profile.marks12,
  cgpaSemesters: profile.cgpaSemesters,
  averageCgpa: profile.averageCgpa,
  resumeUrl: profile.resumeUrl,
  resumeName: profile.resumeName,
  createdAt: profile.createdAt,
  updatedAt: profile.updatedAt,
});

export const mapUserToProfileResponse = (
  user: User & {
    institute?: { name: string } | null;
    profile?: StudentProfileWithDepartment | null;
    resumes?: Resume[];
  }
): UserProfileResponse => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
  isActive: user.isActive,
  instituteId: user.instituteId,
  instituteName: user.institute?.name ?? null,
  createdAt: user.createdAt,
  lastLoginAt: user.lastLoginAt,
  studentProfile: user.profile ? mapStudentProfileToResponse(user.profile) : null,
  resumeCount: user.resumes?.length ?? 0,
  defaultResume: user.resumes?.find((r) => r.isDefault)
    ? mapResumeToResponse(user.resumes.find((r) => r.isDefault)!)
    : null,
});

// =====================================================
// TYPE GUARDS
// =====================================================

export const isAllowedResumeMimeType = (mimeType: string): boolean => {
  const allowed = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  return allowed.includes(mimeType);
};

export const isAllowedImageMimeType = (mimeType: string): boolean => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  return allowed.includes(mimeType);
};