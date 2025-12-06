import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
export declare class MockDriveController {
    create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    publish(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    cancel(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    duplicate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    private handleError;
}
export declare const mockDriveController: MockDriveController;
//# sourceMappingURL=mockdrive.controller.d.ts.map