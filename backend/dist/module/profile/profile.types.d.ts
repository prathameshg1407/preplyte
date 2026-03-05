import { Resume, StudentProfile, User, Department } from '@prisma/client';
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
type StudentProfileWithDepartment = StudentProfile & {
    department: Department;
};
export declare const mapDepartmentToResponse: (department: Department) => DepartmentResponse;
export declare const mapResumeToResponse: (resume: Resume) => ResumeResponse;
export declare const mapStudentProfileToResponse: (profile: StudentProfileWithDepartment) => StudentProfileResponse;
export declare const mapUserToProfileResponse: (user: User & {
    institute?: {
        name: string;
    } | null;
    profile?: StudentProfileWithDepartment | null;
    resumes?: Resume[];
}) => UserProfileResponse;
export declare const isAllowedResumeMimeType: (mimeType: string) => boolean;
export declare const isAllowedImageMimeType: (mimeType: string) => boolean;
export {};
//# sourceMappingURL=profile.types.d.ts.map