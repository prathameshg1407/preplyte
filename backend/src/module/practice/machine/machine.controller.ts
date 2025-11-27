import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import { machineService } from './machine.service';
import { sendSuccess } from '../../../utils/response';

class MachineController {
  async createSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await machineService.createSession(req.user!.id, req.body);
      sendSuccess(res, result, 'Machine coding session created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async listSessions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, status, difficulty } = req.query as any;
      const result = await machineService.listSessions(req.user!.id, {
        page: Number(page) || 1,
        limit: Math.min(Number(limit) || 10, 50),
        status: status || 'all',
        difficulty,
      });
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await machineService.getSessionDetails(req.user!.id, req.params.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getSessionQuestions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await machineService.getSessionQuestions(req.user!.id, req.params.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getQuestion(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await machineService.getQuestion(req.user!.id, req.params.id, req.params.questionId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async runCode(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await machineService.runCode(req.user!.id, req.params.sessionId, req.params.questionId, req.body);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async submitCode(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await machineService.submitCode(req.user!.id, req.params.sessionId, req.params.questionId, req.body);
      sendSuccess(res, result, result.isSolved ? 'Solution accepted!' : 'Submission evaluated');
    } catch (error) {
      next(error);
    }
  }

  async getSessionStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await machineService.getSessionStatus(req.user!.id, req.params.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async completeSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await machineService.completeSession(req.user!.id, req.params.id);
      sendSuccess(res, result, 'Session completed successfully');
    } catch (error) {
      next(error);
    }
  }

  async getSessionResults(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await machineService.getSessionResults(req.user!.id, req.params.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getSubmissionHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query as any;
      const result = await machineService.getSubmissionHistory(
        req.user!.id,
        req.params.sessionId,
        req.params.questionId,
        Number(page) || 1,
        Math.min(Number(limit) || 10, 50)
      );
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

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