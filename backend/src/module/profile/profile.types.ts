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
  linkedResumeId: string | null;
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
  
  // FIX: Allow nulls for Individual Users
  departmentId: string | null;
  departmentName: string | null;
  departmentCode: string | null;
  courseYear: string | null;
  collegeName: string | null; // Added field for Individual Users

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
  
  // FIX: Optional for Individual Users
  departmentId?: string;
  courseYear?: string;
  collegeName?: string; 

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
  collegeName?: string;
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
  profilePictureUrl: string | null; // Added field
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

// FIX: Define department as nullable
type StudentProfileWithDepartment = StudentProfile & {
  department: Department | null;
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
  linkedResumeId: resume.linkedResumeId || null,
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
  // FIX: Safe access for nullable department
  departmentName: profile.department?.name || null,
  departmentCode: profile.department?.code || null,
  
  courseYear: profile.courseYear,
  collegeName: profile.collegeName,
  
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
  profilePictureUrl: user.profilePictureUrl, // Added
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