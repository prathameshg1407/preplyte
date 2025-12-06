import { MockDriveModuleType } from '@prisma/client';
import { AptitudeModuleData, MachineModuleData, AiInterviewModuleData, AptitudeModuleConfig, MachineModuleConfig, ModuleData, ModuleConfig } from '../shared';
export declare function calculateAptitudeScore(data: AptitudeModuleData, config: AptitudeModuleConfig): {
    score: number;
    maxScore: number;
    percentage: number;
};
export declare function calculateMachineScore(data: MachineModuleData, config: MachineModuleConfig): {
    score: number;
    maxScore: number;
    percentage: number;
};
export declare function calculateInterviewScore(data: AiInterviewModuleData): {
    score: number;
    maxScore: number;
    percentage: number;
};
export declare function calculateModuleScore(moduleType: MockDriveModuleType, data: ModuleData, config: ModuleConfig): {
    score: number;
    maxScore: number;
    percentage: number;
};
export declare function calculateOverallScore(moduleScores: Array<{
    score: number;
    maxScore: number;
    weightage: number;
}>): {
    totalScore: number;
    percentageScore: number;
};
//# sourceMappingURL=scoring.utils.d.ts.map