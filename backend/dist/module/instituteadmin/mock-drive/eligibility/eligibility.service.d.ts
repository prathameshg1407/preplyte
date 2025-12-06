import { SetEligibilityDTO, UpdateEligibilityDTO, EligibilityDetails, EligibilityCheckResult, EligibleStudentsQuery, PaginatedEligibleStudents } from './eligibility.types';
export declare class EligibilityService {
    setEligibility(mockDriveId: string, instituteId: string, data: SetEligibilityDTO): Promise<EligibilityDetails>;
    getEligibility(mockDriveId: string, instituteId: string): Promise<EligibilityDetails | null>;
    updateEligibility(mockDriveId: string, instituteId: string, data: UpdateEligibilityDTO): Promise<EligibilityDetails>;
    deleteEligibility(mockDriveId: string, instituteId: string): Promise<void>;
    checkStudentEligibility(mockDriveId: string, instituteId: string, userId: string): Promise<EligibilityCheckResult>;
    getEligibleStudents(mockDriveId: string, instituteId: string, query: EligibleStudentsQuery): Promise<PaginatedEligibleStudents>;
    getEligibilitySummary(mockDriveId: string, instituteId: string): Promise<{
        totalEligible: number;
        totalRegistered: number;
        byDepartment: Record<string, number>;
        byCourseYear: Record<string, number>;
    }>;
    private verifyMockDriveAccess;
    private validateCustomRules;
    private evaluateCustomRules;
    private getNestedValue;
    private evaluateRule;
    private formatValue;
    private mapToDetails;
}
export declare const eligibilityService: EligibilityService;
//# sourceMappingURL=eligibility.service.d.ts.map