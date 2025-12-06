import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
declare class AptitudeController {
    createSession(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listSessions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getSession(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getSessionQuestions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getQuestion(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    saveAnswer(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    submitSession(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getSessionStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getSessionResults(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getSolutions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const aptitudeController: AptitudeController;
export {};
//# sourceMappingURL=aptitude.controller.d.ts.map