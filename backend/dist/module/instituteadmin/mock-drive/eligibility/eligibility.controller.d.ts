import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../../middleware/auth.middleware';
export declare class EligibilityController {
    setEligibility(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getEligibility(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateEligibility(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    deleteEligibility(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    checkStudentEligibility(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getEligibleStudents(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getEligibilitySummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    private handleError;
}
export declare const eligibilityController: EligibilityController;
//# sourceMappingURL=eligibility.controller.d.ts.map