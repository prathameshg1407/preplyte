import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import { aptitudeService } from './aptitude.service';
import { sendSuccess } from '../../../utils/response';
import { SolutionFilter } from './aptitude.types';

class AptitudeController {
  async createSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await aptitudeService.createSession(req.user!.id, req.body);
      sendSuccess(res, result, 'Practice session created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async listSessions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, status, difficulty, sortBy, sortOrder } = req.query as any;
      const result = await aptitudeService.listSessions(req.user!.id, {
        page: Number(page) || 1,
        limit: Math.min(Number(limit) || 10, 50),
        status: status || 'all',
        difficulty,
        sortBy: sortBy || 'createdAt',
        sortOrder: sortOrder || 'desc',
      });
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await aptitudeService.getSessionDetails(req.user!.id, req.params.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getSessionQuestions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await aptitudeService.getSessionQuestions(req.user!.id, req.params.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getQuestion(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await aptitudeService.getQuestion(req.user!.id, req.params.id, req.params.questionId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async saveAnswer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await aptitudeService.saveAnswer(req.user!.id, req.params.id, req.body);
      sendSuccess(res, result, 'Answer saved successfully');
    } catch (error) {
      next(error);
    }
  }

  async submitSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await aptitudeService.submitSession(req.user!.id, req.params.id);
      sendSuccess(res, result, 'Test submitted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getSessionStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await aptitudeService.getSessionStatus(req.user!.id, req.params.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getSessionResults(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await aptitudeService.getSessionResults(req.user!.id, req.params.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getSolutions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const filter = (req.query.filter as SolutionFilter) || 'all';
      const result = await aptitudeService.getSolutions(req.user!.id, req.params.id, filter);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const aptitudeController = new AptitudeController();