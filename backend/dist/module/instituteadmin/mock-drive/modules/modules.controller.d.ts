import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../../middleware/auth.middleware';
export declare class MockDriveModuleController {
    addModule(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getModules(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getModulesSummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getModule(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateModule(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    deleteModule(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    reorderModules(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    duplicateModule(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getSupportedLanguages(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    private getInstituteId;
    private handleError;
}
export declare const mockDriveModuleController: MockDriveModuleController;
//# sourceMappingURL=modules.controller.d.ts.map