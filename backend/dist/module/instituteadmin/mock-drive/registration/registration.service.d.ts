import { MockDriveRegistrationStatus } from '@prisma/client';
import { UpdateRegistrationDTO, BulkUpdateRegistrationDTO, ListRegistrationsQuery, RegistrationDetails, PaginatedRegistrations, RegistrationSummary, BulkUpdateResult } from './registration.types';
export declare class RegistrationService {
    getRegistrationById(mockDriveId: string, registrationId: string, instituteId: string): Promise<RegistrationDetails>;
    listRegistrations(mockDriveId: string, instituteId: string, query: ListRegistrationsQuery): Promise<PaginatedRegistrations>;
    updateRegistration(mockDriveId: string, registrationId: string, instituteId: string, reviewerId: string, data: UpdateRegistrationDTO): Promise<RegistrationDetails>;
    bulkUpdateRegistrations(mockDriveId: string, instituteId: string, reviewerId: string, data: BulkUpdateRegistrationDTO): Promise<BulkUpdateResult>;
    approveAllPending(mockDriveId: string, instituteId: string, reviewerId: string, onlyEligible?: boolean): Promise<{
        approved: number;
        skipped: number;
    }>;
    rejectAllIneligible(mockDriveId: string, instituteId: string, reviewerId: string): Promise<{
        rejected: number;
    }>;
    getRegistrationSummary(mockDriveId: string): Promise<RegistrationSummary>;
    exportRegistrations(mockDriveId: string, instituteId: string, status?: MockDriveRegistrationStatus): Promise<RegistrationDetails[]>;
    private verifyMockDriveAccess;
    private buildOrderBy;
    private validateStatusTransition;
    private mapToDetails;
    private mapToListItem;
}
export declare const registrationService: RegistrationService;
//# sourceMappingURL=registration.service.d.ts.map