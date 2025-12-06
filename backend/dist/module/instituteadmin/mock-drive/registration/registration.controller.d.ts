import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../../middleware/auth.middleware';
export declare class RegistrationController {
    getRegistrationById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listRegistrations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateRegistration(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    bulkUpdateRegistrations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    approveAllPending(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getRegistrationSummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    exportRegistrations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    private handleError;
}
export declare const registrationController: RegistrationController;
//# sourceMappingURL=registration.controller.d.ts.map