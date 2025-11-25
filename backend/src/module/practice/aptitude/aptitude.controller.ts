import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import { aptitudeService } from './aptitude.service';
import { sendSuccess } from '../../../utils/response';

export class AptitudeController {
  /**
   * POST /api/aptitude/sessions
   * Create a new practice session
   */
  async createSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      console.log('📥 createSession - req.body:', JSON.stringify(req.body, null, 2));
      console.log('📥 createSession - req.user:', req.user);
      const result = await aptitudeService.createSession(req.user!.id, req.body);
      sendSuccess(res, result, 'Practice session created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/aptitude/sessions
   * List user's sessions with pagination
   */
  async listSessions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const filters = {
        page: parseInt(req.query.page as string) || 1,
        limit: Math.min(parseInt(req.query.limit as string) || 10, 50),
        status: req.query.status as 'all' | 'completed' | 'in_progress' | 'expired' || 'all',
        difficulty: req.query.difficulty as any,
        sortBy: (req.query.sortBy as 'createdAt' | 'completedAt' | 'totalScore') || 'createdAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
      };

      const result = await aptitudeService.listSessions(req.user!.id, filters);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/aptitude/sessions/:id
   * Get session details
   */
  async getSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await aptitudeService.getSessionDetails(req.user!.id, req.params.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/aptitude/sessions/:id/questions
   * Get all questions for a session
   */
  async getSessionQuestions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await aptitudeService.getSessionQuestions(req.user!.id, req.params.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/aptitude/sessions/:id/questions/:questionId
   * Get a specific question
   */
  async getQuestion(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await aptitudeService.getQuestion(
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
   * POST /api/aptitude/sessions/:id/answer
   * Save answer for a question
   */
  async saveAnswer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await aptitudeService.saveAnswer(
        req.user!.id,
        req.params.id,
        req.body
      );
      sendSuccess(res, result, 'Answer saved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/aptitude/sessions/:id/submit
   * Submit test for scoring
   */
  async submitSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await aptitudeService.submitSession(req.user!.id, req.params.id);
      sendSuccess(res, result, 'Test submitted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/aptitude/sessions/:id/status
   * Get session status
   */
  async getSessionStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await aptitudeService.getSessionStatus(req.user!.id, req.params.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/aptitude/sessions/:id/results
   * Get session results
   */
  async getSessionResults(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await aptitudeService.getSessionResults(req.user!.id, req.params.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/aptitude/sessions/:id/solutions
   * Get solutions after completion
   */
  async getSolutions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const filter = (req.query.filter as string) || 'all';
      const result = await aptitudeService.getSolutions(req.user!.id, req.params.id, filter);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const aptitudeController = new AptitudeController();