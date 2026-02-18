import { Request, Response } from 'express';
import { asyncHandler } from '../../../../utils/async-handler';
import { sendSuccess, sendCreated, sendNoContent } from '../../../../utils/response';
import { questionService } from './question.service';

export class QuestionController {
    create = asyncHandler(async (req: Request, res: Response) => {
        const question = await questionService.create(req.body);
        return sendCreated(res, question, 'Question created successfully');
    });

    update = asyncHandler(async (req: Request, res: Response) => {
        const question = await questionService.update(req.params.id, req.body);
        return sendSuccess(res, question, 'Question updated successfully');
    });

    delete = asyncHandler(async (req: Request, res: Response) => {
        await questionService.delete(req.params.id);
        return sendNoContent(res);
    });

    getById = asyncHandler(async (req: Request, res: Response) => {
        const question = await questionService.getById(req.params.id);
        return sendSuccess(res, question);
    });
}

export const questionController = new QuestionController();
