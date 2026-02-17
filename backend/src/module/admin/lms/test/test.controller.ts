import { Request, Response } from 'express';
import { asyncHandler } from '../../../../utils/async-handler';
import { sendSuccess, sendCreated, sendNoContent } from '../../../../utils/response';
import { testService } from './test.service';

export class TestController {
    // ==================== Module Tests ====================

    createModuleTest = asyncHandler(async (req: Request, res: Response) => {
        const test = await testService.createModuleTest(req.body);
        return sendCreated(res, test, 'Module test created successfully');
    });

    getModuleTestById = asyncHandler(async (req: Request, res: Response) => {
        const test = await testService.getModuleTestById(req.params.id);
        return sendSuccess(res, test);
    });

    getModuleTestsByModule = asyncHandler(async (req: Request, res: Response) => {
        const tests = await testService.getModuleTestsByModule(req.params.moduleId);
        return sendSuccess(res, tests);
    });

    updateModuleTest = asyncHandler(async (req: Request, res: Response) => {
        const test = await testService.updateModuleTest(req.params.id, req.body);
        return sendSuccess(res, test, 'Module test updated successfully');
    });

    deleteModuleTest = asyncHandler(async (req: Request, res: Response) => {
        await testService.deleteModuleTest(req.params.id);
        return sendNoContent(res);
    });

    // ==================== Final Tests ====================

    createFinalTest = asyncHandler(async (req: Request, res: Response) => {
        const test = await testService.createFinalTest(req.body);
        return sendCreated(res, test, 'Final test created successfully');
    });

    getFinalTestById = asyncHandler(async (req: Request, res: Response) => {
        const test = await testService.getFinalTestById(req.params.id);
        return sendSuccess(res, test);
    });

    getFinalTestsByCourse = asyncHandler(async (req: Request, res: Response) => {
        const tests = await testService.getFinalTestsByCourse(req.params.courseId);
        return sendSuccess(res, tests);
    });

    updateFinalTest = asyncHandler(async (req: Request, res: Response) => {
        const test = await testService.updateFinalTest(req.params.id, req.body);
        return sendSuccess(res, test, 'Final test updated successfully');
    });

    deleteFinalTest = asyncHandler(async (req: Request, res: Response) => {
        await testService.deleteFinalTest(req.params.id);
        return sendNoContent(res);
    });
}

export const testController = new TestController();