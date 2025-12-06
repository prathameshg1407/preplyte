import { MockDriveModuleType, DifficultyLevel, QuestionType, AiInterviewDifficulty } from '@prisma/client';
export interface AptitudeModuleConfig {
    difficulty: DifficultyLevel;
    questionTypes: QuestionType[];
    numberOfQuestions: number;
    marksPerQuestion: number;
    negativeMarking: number;
}
export interface MachineCodingModuleConfig {
    difficulty: DifficultyLevel;
    numberOfQuestions: number;
    allowedLanguages: string[];
    partialScoring: boolean;
    maxScorePerQuestion: number;
}
export interface AiInterviewModuleConfig {
    difficulty: AiInterviewDifficulty;
    jobTitle: string;
    companyName?: string | null;
    focusAreas: string[];
    targetQuestions: number;
}
export type ModuleConfig = AptitudeModuleConfig | MachineCodingModuleConfig | AiInterviewModuleConfig;
export declare function isAptitudeConfig(config: ModuleConfig): config is AptitudeModuleConfig;
export declare function isMachineCodingConfig(config: ModuleConfig): config is MachineCodingModuleConfig;
export declare function isAiInterviewConfig(config: ModuleConfig): config is AiInterviewModuleConfig;
export interface CreateModuleDTO {
    moduleType: MockDriveModuleType;
    order: number;
    name?: string | null;
    timeLimit: number;
    weightage: number;
    config: ModuleConfig;
    passingScore?: number | null;
    instructions?: string | null;
}
export interface UpdateModuleDTO {
    order?: number;
    name?: string | null;
    timeLimit?: number;
    weightage?: number;
    config?: ModuleConfig;
    passingScore?: number | null;
    instructions?: string | null;
    isActive?: boolean;
}
export interface ReorderModulesDTO {
    modules: Array<{
        moduleId: string;
        order: number;
    }>;
}
export interface ListModulesOptions {
    includeInactive?: boolean;
    checkAvailability?: boolean;
}
export interface ModuleResponse {
    id: string;
    mockDriveId: string;
    moduleType: MockDriveModuleType;
    order: number;
    name: string | null;
    timeLimit: number;
    weightage: number;
    config: ModuleConfig;
    passingScore: number | null;
    instructions: string | null;
    isActive: boolean;
    questionsCount: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface ModuleAvailability {
    availableQuestions: number;
    requiredQuestions: number;
    hasEnoughQuestions: boolean;
}
export interface ModuleWithAvailability extends ModuleResponse, ModuleAvailability {
}
export interface ModuleValidation {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}
export interface ModulesSummary {
    totalModules: number;
    activeModules: number;
    totalWeightage: number;
    totalTimeLimit: number;
    modules: ModuleResponse[];
    validation: ModuleValidation;
}
export declare class ModuleError extends Error {
    code: string;
    statusCode: number;
    constructor(code: string, message: string, statusCode?: number);
}
export declare class ModuleNotFoundError extends ModuleError {
    constructor(moduleId: string);
}
export declare class ModuleValidationError extends ModuleError {
    constructor(message: string);
}
export declare class ModuleOrderConflictError extends ModuleError {
    constructor(order: number);
}
export declare class ModuleConfigError extends ModuleError {
    constructor(message: string);
}
//# sourceMappingURL=modules.types.d.ts.map