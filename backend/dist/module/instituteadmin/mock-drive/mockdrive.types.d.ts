import { MockDriveStatus } from '@prisma/client';
import { BaseError } from './common/common.types';
import { ModuleConfig, ModuleResponse, AptitudeModuleConfig, MachineCodingModuleConfig, AiInterviewModuleConfig } from './modules/modules.types';
export type { ModuleConfig, AptitudeModuleConfig, MachineCodingModuleConfig, AiInterviewModuleConfig };
export interface ProctoringSettings {
    detectTabSwitch: boolean;
    maxTabSwitches: number;
    requireFullscreen: boolean;
    detectCopyPaste: boolean;
    webcamRequired: boolean;
    screenshareRequired: boolean;
}
export interface CreateMockDriveDTO {
    title: string;
    description?: string | null;
    instructions?: string | null;
    registrationStartDate?: Date | null;
    registrationEndDate?: Date | null;
    maxRegistrations?: number | null;
    driveStartDate?: Date | null;
    driveEndDate?: Date | null;
    allowLateSubmission?: boolean;
    showLeaderboard?: boolean;
    showResultsImmediately?: boolean;
    resultsReleaseDate?: Date | null;
    shuffleQuestions?: boolean;
    enableProctoring?: boolean;
    proctoringSettings?: ProctoringSettings | null;
}
export interface UpdateMockDriveDTO extends Partial<CreateMockDriveDTO> {
    status?: MockDriveStatus;
}
export type MockDriveSortField = 'createdAt' | 'title' | 'driveStartDate' | 'registrationEndDate';
export interface ListMockDrivesQuery {
    page?: number;
    limit?: number;
    status?: MockDriveStatus;
    search?: string;
    sortBy?: MockDriveSortField;
    sortOrder?: 'asc' | 'desc';
}
export interface MockDriveListItem {
    id: string;
    title: string;
    status: MockDriveStatus;
    registrationStartDate: Date | null;
    registrationEndDate: Date | null;
    driveStartDate: Date | null;
    driveEndDate: Date | null;
    totalRegistrations: number;
    totalBatches: number;
    totalModules: number;
    createdAt: Date;
}
export interface EligibilityCriteriaResponse {
    id: string;
    minCgpa: number | null;
    maxCgpa: number | null;
    minMarks10: number | null;
    minMarks12: number | null;
    allowedDepartmentIds: string[];
    allowedCourseYears: string[];
    requiredSkills: string[];
    maxBacklogs: number | null;
    customRules: Record<string, unknown> | null;
}
export interface MockDriveStats {
    totalRegistrations: number;
    pendingRegistrations: number;
    approvedRegistrations: number;
    rejectedRegistrations: number;
    totalBatches: number;
    completedAttempts: number;
    inProgressAttempts: number;
    averageScore: number | null;
}
export interface MockDriveDetails {
    id: string;
    instituteId: string;
    title: string;
    description: string | null;
    instructions: string | null;
    status: MockDriveStatus;
    registrationStartDate: Date | null;
    registrationEndDate: Date | null;
    maxRegistrations: number | null;
    driveStartDate: Date | null;
    driveEndDate: Date | null;
    allowLateSubmission: boolean;
    showLeaderboard: boolean;
    showResultsImmediately: boolean;
    resultsReleaseDate: Date | null;
    shuffleQuestions: boolean;
    enableProctoring: boolean;
    proctoringSettings: ProctoringSettings | null;
    questionsGenerated: boolean;
    questionsGeneratedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    eligibilityCriteria: EligibilityCriteriaResponse | null;
    modules: ModuleResponse[];
    stats: MockDriveStats;
}
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
}
export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationMeta;
}
export type PaginatedMockDrives = PaginatedResponse<MockDriveListItem>;
export interface PublishValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}
export declare class MockDriveError extends BaseError {
    constructor(message: string, code?: string, statusCode?: number);
}
export declare class MockDriveNotFoundError extends MockDriveError {
    constructor(mockDriveId: string);
}
export declare class MockDriveAccessDeniedError extends MockDriveError {
    constructor();
}
export declare class MockDriveInvalidStatusError extends MockDriveError {
    constructor(currentStatus: string, action: string);
}
export declare class MockDrivePublishError extends MockDriveError {
    constructor(reason: string);
}
export declare class MockDriveValidationError extends MockDriveError {
    constructor(message: string);
}
//# sourceMappingURL=mockdrive.types.d.ts.map