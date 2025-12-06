import { PrismaClient } from '@prisma/client';
import { DiscoveryListParams, DiscoveryListResponse, EligibilityCheckResponse, RegistrationResponse, MyRegistrationsResponse } from './discovery.types';
import { MockDriveDetail } from '../shared';
export declare class DiscoveryService {
    private prisma;
    constructor(prisma: PrismaClient);
    private getUserWithInstituteValidation;
    private canAccessDrive;
    private validateDriveAccess;
    listAvailableDrives(userId: string, params: DiscoveryListParams, userRole?: string): Promise<DiscoveryListResponse>;
    getDriveDetails(userId: string, driveId: string, userRole?: string): Promise<MockDriveDetail>;
    checkEligibility(userId: string, driveId: string, userRole?: string): Promise<EligibilityCheckResponse>;
    register(userId: string, driveId: string, userRole?: string): Promise<RegistrationResponse>;
    withdrawRegistration(userId: string, driveId: string, userRole?: string): Promise<void>;
    getMyRegistrations(userId: string): Promise<MyRegistrationsResponse>;
}
//# sourceMappingURL=discovery.service.d.ts.map