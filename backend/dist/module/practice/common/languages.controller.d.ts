import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
export declare class LanguagesController {
    /**
     * GET /api/languages
     */
    getAllLanguages(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/languages/:id
     */
    getLanguageById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const languagesController: LanguagesController;
//# sourceMappingURL=languages.controller.d.ts.map