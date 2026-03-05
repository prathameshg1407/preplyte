import { StudentProfile } from '@prisma/client';
import { EligibilityCheckResult } from '../shared/mockdrive.shared-types';
interface EligibilityCriteria {
    minCgpa: number | null;
    maxCgpa: number | null;
    minMarks10: number | null;
    minMarks12: number | null;
    allowedDepartmentIds: string[];
    allowedCourseYears: string[];
    requiredSkills: string[];
    maxBacklogs: number | null;
    customRules?: any;
}
export declare function checkEligibility(profile: StudentProfile | null, criteria: EligibilityCriteria | null): EligibilityCheckResult;
export declare function formatEligibilityResult(result: EligibilityCheckResult): string;
export {};
//# sourceMappingURL=eligibility.utils.d.ts.map