export type CustomRuleOperator = 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'greater_than_or_equals' | 'less_than_or_equals' | 'contains' | 'not_contains' | 'in' | 'not_in';
export interface CustomRule {
    field: string;
    operator: CustomRuleOperator;
    value: string | number | boolean | string[] | number[];
}
export interface CustomRulesConfig {
    rules: CustomRule[];
    matchType: 'all' | 'any';
}
export interface SetEligibilityDTO {
    minCgpa?: number | null;
    maxCgpa?: number | null;
    minMarks10?: number | null;
    minMarks12?: number | null;
    allowedDepartments?: string[];
    allowedCourseYears?: string[];
    requiredSkills?: string[];
    maxBacklogs?: number | null;
    customRules?: CustomRulesConfig | null;
}
export interface UpdateEligibilityDTO extends Partial<SetEligibilityDTO> {
}
export interface EligibilityDetails {
    id: string;
    mockDriveId: string;
    minCgpa: number | null;
    maxCgpa: number | null;
    minMarks10: number | null;
    minMarks12: number | null;
    allowedDepartments: string[];
    allowedCourseYears: string[];
    requiredSkills: string[];
    maxBacklogs: number | null;
    customRules: CustomRulesConfig | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface EligibilityCheckResult {
    isEligible: boolean;
    checks: EligibilityCheck[];
    summary: {
        passed: number;
        failed: number;
        total: number;
    };
}
export interface EligibilityCheck {
    criterion: string;
    passed: boolean;
    required: string;
    actual: string;
    details?: string;
}
export interface EligibleStudentsQuery {
    page?: number;
    limit?: number;
    department?: string;
    courseYear?: string;
    search?: string;
}
export interface EligibleStudent {
    id: string;
    userId: string;
    fullName: string;
    studentId: string;
    department: string;
    courseYear: string;
    averageCgpa: number | null;
    marks10: number | null;
    marks12: number | null;
    skills: string[];
    isRegistered: boolean;
    registrationStatus?: string;
}
export interface PaginatedEligibleStudents {
    data: EligibleStudent[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrevious: boolean;
    };
}
export declare class EligibilityError extends Error {
    code: string;
    statusCode: number;
    constructor(code: string, message: string, statusCode?: number);
}
export declare class EligibilityNotFoundError extends EligibilityError {
    constructor(mockDriveId: string);
}
export declare class EligibilityValidationError extends EligibilityError {
    constructor(message: string);
}
//# sourceMappingURL=eligibility.types.d.ts.map