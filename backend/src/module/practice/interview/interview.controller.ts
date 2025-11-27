// src/module/practice/interview/interview.controller.ts

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import { interviewService } from './interview.service';
import { feedbackGeneratorService } from './services';
import {
  parseCreateSession,
  parseSessionId,
  parseSessionListQuery,
  parseSubmitResponse,
} from './interview.validation';
import { BadRequestError } from '../../../utils/errors';
import { HTTP_STATUS } from './interview.constants';
import { CreateSessionInput } from './interview.types'; // added for typing

// =====================================================
// CONTROLLER CLASS
// =====================================================

class InterviewController {
  constructor() {
    // Bind all methods
    this.createSession = this.createSession.bind(this);
    this.startSession = this.startSession.bind(this);
    this.getSession = this.getSession.bind(this);
    this.getSessionDetail = this.getSessionDetail.bind(this);
    this.listSessions = this.listSessions.bind(this);
    this.cancelSession = this.cancelSession.bind(this);
    this.endSession = this.endSession.bind(this);
    this.submitResponse = this.submitResponse.bind(this);
    this.getFeedback = this.getFeedback.bind(this);
    this.regenerateFeedback = this.regenerateFeedback.bind(this);
  }

  // ===================================================
  // SESSION ENDPOINTS
  // ===================================================

  /**
   * POST /interview/sessions
   * Create a new interview session
   */
  async createSession(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = this.getUserId(req);

      // parse raw input (may contain nulls)
      const rawInput = parseCreateSession(req.body);

      // sanitize: convert null -> undefined for optional fields
      const sanitizedInput: CreateSessionInput = {
        jobTitle: rawInput.jobTitle,
        companyName: rawInput.companyName ?? undefined,
        difficulty: rawInput.difficulty,
        focusAreas: rawInput.focusAreas,
        targetQuestions: rawInput.targetQuestions,
        // keep resumeId undefined instead of null
        resumeId: (rawInput as any).resumeId ?? undefined,
      };

      const session = await interviewService.createSession(userId, sanitizedInput);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Interview session created',
        data: session,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /interview/sessions/:sessionId/start
   * Start an interview session
   */
  async startSession(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const sessionId = parseSessionId(req.params.sessionId);
      const result = await interviewService.startSession(userId, sessionId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Interview session started',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /interview/sessions/:sessionId
   * Get session details
   */
  async getSession(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const sessionId = parseSessionId(req.params.sessionId);
      const session = await interviewService.getSession(userId, sessionId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: session,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /interview/sessions/:sessionId/detail
   * Get session with responses and feedback
   */
  async getSessionDetail(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const sessionId = parseSessionId(req.params.sessionId);
      const detail = await interviewService.getSessionDetail(userId, sessionId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: detail,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /interview/sessions
   * List user's interview sessions
   */
  async listSessions(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const query = parseSessionListQuery(req.query);
      const result = await interviewService.listSessions(userId, query);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /interview/sessions/:sessionId/cancel
   * Cancel an active session
   */
  async cancelSession(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const sessionId = parseSessionId(req.params.sessionId);
      await interviewService.cancelSession(userId, sessionId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Interview session cancelled',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /interview/sessions/:sessionId/end
   * End session and generate feedback
   */
  async endSession(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const sessionId = parseSessionId(req.params.sessionId);
      const feedback = await interviewService.endSession(userId, sessionId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Interview session completed',
        data: { feedback },
      });
    } catch (error) {
      next(error);
    }
  }

  // ===================================================
  // RESPONSE ENDPOINTS
  // ===================================================

  /**
   * POST /interview/sessions/:sessionId/respond
   * Submit response to current question
   */
  async submitResponse(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const sessionId = parseSessionId(req.params.sessionId);
      const input = parseSubmitResponse(req.body);

      const result = await interviewService.submitResponse(
        userId,
        sessionId,
        input.answer,
        input.timeTakenSeconds
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // ===================================================
  // FEEDBACK ENDPOINTS
  // ===================================================

  /**
   * GET /interview/sessions/:sessionId/feedback
   * Get feedback for a completed session
   */
  async getFeedback(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const sessionId = parseSessionId(req.params.sessionId);
      const feedback = await interviewService.getFeedback(userId, sessionId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: feedback,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /interview/sessions/:sessionId/feedback/regenerate
   * Regenerate feedback for a session
   */
  async regenerateFeedback(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const sessionId = parseSessionId(req.params.sessionId);

      // Verify ownership
      await interviewService.getSession(userId, sessionId);

      const feedback = await feedbackGeneratorService.regenerateFeedback(sessionId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Feedback regenerated',
        data: feedback,
      });
    } catch (error) {
      next(error);
    }
  }

  // ===================================================
  // PRIVATE HELPERS
  // ===================================================

  private getUserId(req: AuthenticatedRequest): string {
    if (!req.user?.id) {
      throw new BadRequestError('User ID not found in request');
    }
    return req.user.id;
  }
}

// =====================================================
// SINGLETON EXPORT
// =====================================================

export const interviewController = new InterviewController();
export { InterviewController };
