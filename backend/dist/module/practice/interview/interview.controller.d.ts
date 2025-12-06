import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
declare class InterviewController {
    constructor();
    /**
     * POST /interview/sessions
     * Create a new interview session
     */
    createSession(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * POST /interview/sessions/:sessionId/start
     * Start an interview session
     */
    startSession(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /interview/sessions/:sessionId
     * Get session details
     */
    getSession(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /interview/sessions/:sessionId/detail
     * Get session with responses and feedback
     */
    getSessionDetail(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /interview/sessions
     * List user's interview sessions
     */
    listSessions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * POST /interview/sessions/:sessionId/cancel
     * Cancel an active session
     */
    cancelSession(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * POST /interview/sessions/:sessionId/end
     * End session and generate feedback
     */
    endSession(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * POST /interview/sessions/:sessionId/respond
     * Submit response to current question
     */
    submitResponse(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /interview/sessions/:sessionId/feedback
     * Get feedback for a completed session
     */
    getFeedback(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * POST /interview/sessions/:sessionId/feedback/regenerate
     * Regenerate feedback for a session
     */
    regenerateFeedback(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    private getUserId;
}
export declare const interviewController: InterviewController;
export { InterviewController };
//# sourceMappingURL=interview.controller.d.ts.map