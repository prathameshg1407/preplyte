import { MockDriveRegistrationStatus } from '@prisma/client';
export interface UpdateRegistrationDTO {
    status: MockDriveRegistrationStatus;
    adminNotes?: string | null;
}
export interface BulkUpdateRegistrationDTO {
    registrationIds: string[];
    status: MockDriveRegistrationStatus;
    adminNotes?: string | null;
}
export interface ListRegistrationsQuery {
    page?: number;
    limit?: number;
    status?: MockDriveRegistrationStatus;
    batchId?: string;
    hasBatch?: boolean;
    search?: string;
    sortBy?: 'registeredAt' | 'studentName' | 'status';
    sortOrder?: 'asc' | 'desc';
}
export interface RegistrationDetails {
    id: string;
    mockDriveId: string;
    userId: string;
    status: MockDriveRegistrationStatus;
    eligibilityCheckResult: EligibilityCheckResultData | null;
    adminNotes: string | null;
    batchId: string | null;
    batchName: string | null;
    registeredAt: Date;
    reviewedAt: Date | null;
    reviewedBy: string | null;
    student: StudentInfo;
}
export interface StudentInfo {
    id: string;
    name: string;
    email: string;
    studentId: string | null;
    department: string | null;
    courseYear: string | null;
    averageCgpa: number | null;
    marks10: number | null;
    marks12: number | null;
    skills: string[];
}
export interface EligibilityCheckResultData {
    isEligible: boolean;
    checks: Array<{
        criterion: string;
        passed: boolean;
        required: string;
        actual: string;
    }>;
}
export interface RegistrationListItem {
    id: string;
    userId: string;
    status: MockDriveRegistrationStatus;
    studentName: string;
    studentId: string | null;
    department: string | null;
    courseYear: string | null;
    averageCgpa: number | null;
    batchId: string | null;
    batchName: string | null;
    registeredAt: Date;
    isEligible: boolean | null;
}
export interface PaginatedRegistrations {
    data: RegistrationListItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrevious: boolean;
    };
    summary: RegistrationSummary;
}
export interface RegistrationSummary {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    withdrawn: number;
    withBatch: number;
    withoutBatch: number;
}
export interface BulkUpdateResult {
    success: number;
    failed: number;
    failedIds: string[];
}
export declare class RegistrationError extends Error {
    code: string;
    statusCode: number;
    constructor(code: string, message: string, statusCode?: number);
}
export declare class RegistrationNotFoundError extends RegistrationError {
    constructor(registrationId: string);
}
export declare class RegistrationStatusError extends RegistrationError {
    constructor(status: MockDriveRegistrationStatus, action: string);
}
export declare class RegistrationAlreadyExistsError extends RegistrationError {
    constructor();
}
//# sourceMappingURL=registration.types.d.ts.map