import { MockDriveModuleType } from '@prisma/client';
import { CreateMockDriveDTO, UpdateMockDriveDTO, ListMockDrivesQuery, MockDriveListItem, MockDriveDetails, MockDriveStats, PaginatedResponse, MockDrivePublishError, MockDriveValidationError, PublishValidationResult } from './mockdrive.types';
export declare class InsufficientQuestionsError extends MockDrivePublishError {
    readonly moduleType: MockDriveModuleType;
    readonly required: number;
    readonly available: number;
    readonly deficit: number;
    constructor(moduleType: MockDriveModuleType, required: number, available: number, additionalContext?: string);
}
export declare class MockDriveRaceConditionError extends MockDriveValidationError {
    constructor(mockDriveId: string, expectedStatus: string, actualStatus: string);
}
interface QuestionAvailability {
    required: number;
    available: number;
    hasEnough: boolean;
    criteria: {
        difficulty: string;
        questionTypes?: string[];
    };
}
interface ModuleValidationResult {
    moduleId: string;
    moduleType: MockDriveModuleType;
    order: number;
    availability: QuestionAvailability;
}
export declare class MockDriveService {
    create(instituteId: string, data: CreateMockDriveDTO): Promise<MockDriveDetails>;
    getById(mockDriveId: string, instituteId: string): Promise<MockDriveDetails>;
    list(instituteId: string, query: ListMockDrivesQuery): Promise<PaginatedResponse<MockDriveListItem>>;
    update(mockDriveId: string, instituteId: string, data: UpdateMockDriveDTO): Promise<MockDriveDetails>;
    delete(mockDriveId: string, instituteId: string): Promise<void>;
    validateForPublish(mockDriveId: string, instituteId: string): Promise<PublishValidationResult>;
    publish(mockDriveId: string, instituteId: string): Promise<MockDriveDetails>;
    cancel(mockDriveId: string, instituteId: string): Promise<MockDriveDetails>;
    openRegistration(mockDriveId: string, instituteId: string): Promise<MockDriveDetails>;
    closeRegistration(mockDriveId: string, instituteId: string): Promise<MockDriveDetails>;
    startDrive(mockDriveId: string, instituteId: string): Promise<MockDriveDetails>;
    completeDrive(mockDriveId: string, instituteId: string): Promise<MockDriveDetails>;
    getStats(mockDriveId: string, instituteId: string): Promise<MockDriveStats>;
    duplicate(mockDriveId: string, instituteId: string, newTitle?: string): Promise<MockDriveDetails>;
    getQuestionAvailability(mockDriveId: string, instituteId: string): Promise<ModuleValidationResult[]>;
    private verifyAccess;
    private validateStatusTransition;
    private validatePublishedDriveUpdate;
    private validateDates;
    private validateModules;
    private normalizeModuleOrders;
    private checkModuleQuestionsAvailability;
    private generateModuleQuestions;
    private generateAptitudeQuestions;
    private generateMachineQuestions;
    private getDetailedInclude;
    private mapToDetails;
}
export declare const mockDriveService: MockDriveService;
export {};
//# sourceMappingURL=mockdrive.service.d.ts.map