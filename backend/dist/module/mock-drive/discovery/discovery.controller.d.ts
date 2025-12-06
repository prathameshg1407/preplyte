import { Response, NextFunction } from 'express';
import { DiscoveryService } from './discovery.service';
import { DiscoveryListInput, MockDriveIdInput } from './discovery.validation';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
export declare class DiscoveryController {
    private service;
    constructor(service: DiscoveryService);
    listAvailableDrives: (req: AuthenticatedRequest & {
        query: DiscoveryListInput["query"];
    }, res: Response, next: NextFunction) => Promise<void>;
    getDriveDetails: (req: AuthenticatedRequest & {
        params: MockDriveIdInput["params"];
    }, res: Response, next: NextFunction) => Promise<void>;
    checkEligibility: (req: AuthenticatedRequest & {
        params: MockDriveIdInput["params"];
    }, res: Response, next: NextFunction) => Promise<void>;
    register: (req: AuthenticatedRequest & {
        params: MockDriveIdInput["params"];
    }, res: Response, next: NextFunction) => Promise<void>;
    withdrawRegistration: (req: AuthenticatedRequest & {
        params: MockDriveIdInput["params"];
    }, res: Response, next: NextFunction) => Promise<void>;
    getMyRegistrations: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=discovery.controller.d.ts.map