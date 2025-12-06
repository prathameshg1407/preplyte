import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../../middleware/auth.middleware';
export declare class BatchController {
    createBatch(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getBatchById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listBatches(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateBatch(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    deleteBatch(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    autoCreateBatches(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    assignStudents(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    unassignStudents(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getBatchStudents(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    startBatch(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    completeBatch(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    private getInstituteId;
    private handleError;
}
export declare const batchController: BatchController;
//# sourceMappingURL=batch.controller.d.ts.map