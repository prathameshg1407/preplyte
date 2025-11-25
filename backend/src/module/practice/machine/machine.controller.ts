import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import { machineService } from './machine.service';
import { sendSuccess } from '../../../utils/response';

export class MachineController {
  /**
   * POST /api/machine/sessions
   */
  async createSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await machineService.createSession(req.user!.id, req.body);
      sendSuccess(res, result, 'Machine coding session created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/machine/sessions
   */
  async listSessions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const filters = {
        page: parseInt(req.query.page as string) || 1,
        limit: Math.min(parseInt(req.query.limit as string) || 10, 50),
        status: req.query.status as any || 'all',
        difficulty: req.query.difficulty as any,
      };

      const result = await machineService.listSessions(req.user!.id, filters);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/machine/sessions/:id
   */
  async getSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await machineService.getSessionDetails(req.user!.id, req.params.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/machine/sessions/:id/questions
   */
  async getSessionQuestions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await machineService.getSessionQuestions(req.user!.id, req.params.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/machine/sessions/:id/questions/:questionId
   */
  async getQuestion(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await machineService.getQuestion(
        req.user!.id,
        req.params.id,
        req.params.questionId
      );
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/machine/sessions/:sessionId/questions/:questionId/run
   */
  async runCode(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await machineService.runCode(
        req.user!.id,
        req.params.sessionId,
        req.params.questionId,
        req.body
      );
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/machine/sessions/:sessionId/questions/:questionId/submit
   */
  async submitCode(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await machineService.submitCode(
        req.user!.id,
        req.params.sessionId,
        req.params.questionId,
        req.body
      );
      sendSuccess(res, result, result.isSolved ? 'Solution accepted!' : 'Submission evaluated');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/machine/sessions/:id/status
   */
  async getSessionStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await machineService.getSessionStatus(req.user!.id, req.params.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/machine/sessions/:id/complete
   */
  async completeSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await machineService.completeSession(req.user!.id, req.params.id);
      sendSuccess(res, result, 'Session completed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/machine/sessions/:id/results
   */
  async getSessionResults(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await machineService.getSessionResults(req.user!.id, req.params.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/machine/sessions/:sessionId/questions/:questionId/submissions
   */
  async getSubmissionHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

      const result = await machineService.getSubmissionHistory(
        req.user!.id,
        req.params.sessionId,
        req.params.questionId,
        page,
        limit
      );
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/machine/submissions/:id
   */
  async getSubmissionDetails(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await machineService.getSubmissionDetails(req.user!.id, req.params.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const machineController = new MachineController();