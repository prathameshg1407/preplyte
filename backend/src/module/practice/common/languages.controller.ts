import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import { languagesService } from './languages.service';
import { sendSuccess } from '../../../utils/response';

export class LanguagesController {
  /**
   * GET /api/languages
   */
  async getAllLanguages(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const activeOnly = req.query.active !== 'false';
      const result = await languagesService.getAllLanguages(activeOnly);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/languages/:id
   */
  async getLanguageById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await languagesService.getLanguageById(req.params.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const languagesController = new LanguagesController();