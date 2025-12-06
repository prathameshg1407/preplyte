import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
declare class MachineController {
    createSession(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listSessions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getSession(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getSessionQuestions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getQuestion(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    runCode(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    submitCode(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getSessionStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    completeSession(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getSessionResults(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getSubmissionHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getSubmissionDetails(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const machineController: MachineController;
export {};
//# sourceMappingURL=machine.controller.d.ts.map