import { Request, Response, NextFunction } from 'express';
export declare class EnumsController {
    /**
     * GET /api/enums/difficulty-levels
     */
    getDifficultyLevels(_req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/enums/question-types
     */
    getQuestionTypes(_req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const enumsController: EnumsController;
//# sourceMappingURL=enums.controller.d.ts.map