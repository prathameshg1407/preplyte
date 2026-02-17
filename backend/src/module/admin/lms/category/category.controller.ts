import { Request, Response } from 'express';
import { categoryService } from './category.service';
import { asyncHandler } from '../../../../utils/async-handler';
import { sendSuccess, sendCreated, sendNoContent } from '../../../../utils/response';
import { createCategorySchema, updateCategorySchema } from './category.validation';

export class CategoryController {
    create = asyncHandler(async (req: Request, res: Response) => {
        const category = await categoryService.create(req.body);
        return sendCreated(res, category, 'Category created successfully');
    });

    findAll = asyncHandler(async (req: Request, res: Response) => {
        const categories = await categoryService.findAll();
        return sendSuccess(res, categories);
    });

    findOne = asyncHandler(async (req: Request, res: Response) => {
        const category = await categoryService.findOne(req.params.id);
        return sendSuccess(res, category);
    });

    update = asyncHandler(async (req: Request, res: Response) => {
        const category = await categoryService.update(req.params.id, req.body);
        return sendSuccess(res, category, 'Category updated successfully');
    });

    delete = asyncHandler(async (req: Request, res: Response) => {
        await categoryService.delete(req.params.id);
        return sendNoContent(res);
    });
}

export const categoryController = new CategoryController();