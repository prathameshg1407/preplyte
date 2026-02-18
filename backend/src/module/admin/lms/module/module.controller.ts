import { Request, Response } from 'express';
import { moduleService } from './module.service';
import { asyncHandler } from '../../../../utils/async-handler';
import { sendSuccess, sendCreated, sendNoContent } from '../../../../utils/response';
import { createModuleSchema, updateModuleSchema } from './module.validation';

export class ModuleController {
    create = asyncHandler(async (req: Request, res: Response) => {
        const module = await moduleService.create(req.body);
        return sendCreated(res, module, 'Module created successfully');
    });

    findOne = asyncHandler(async (req: Request, res: Response) => {
        const module = await moduleService.findOne(req.params.id);
        return sendSuccess(res, module);
    });

    update = asyncHandler(async (req: Request, res: Response) => {
        const module = await moduleService.update(req.params.id, req.body);
        return sendSuccess(res, module, 'Module updated successfully');
    });

    delete = asyncHandler(async (req: Request, res: Response) => {
        await moduleService.delete(req.params.id);
        return sendNoContent(res);
    });

    findByCourse = asyncHandler(async (req: Request, res: Response) => {
        const modules = await moduleService.findByCourse(req.params.courseId);
        return sendSuccess(res, modules);
    });
}


export const moduleController = new ModuleController();