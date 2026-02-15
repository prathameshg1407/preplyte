import { Request, Response } from 'express';
import { courseService } from './course.service';
import { asyncHandler } from '../../../../utils/async-handler';
import { sendSuccess, sendCreated, sendNoContent } from '../../../../utils/response';
import { createCourseSchema, updateCourseSchema } from './course.validation';

export class CourseController {
    create = asyncHandler(async (req: Request, res: Response) => {
        const validated = createCourseSchema.parse(req.body);
        const course = await courseService.create(validated);
        return sendCreated(res, course, 'Course created successfully');
    });

    findAll = asyncHandler(async (req: Request, res: Response) => {
        const courses = await courseService.findAll();
        return sendSuccess(res, courses);
    });

    findOne = asyncHandler(async (req: Request, res: Response) => {
        const course = await courseService.findOne(req.params.id);
        return sendSuccess(res, course);
    });

    update = asyncHandler(async (req: Request, res: Response) => {
        const validated = updateCourseSchema.parse(req.body);
        const course = await courseService.update(req.params.id, validated);
        return sendSuccess(res, course, 'Course updated successfully');
    });

    delete = asyncHandler(async (req: Request, res: Response) => {
        await courseService.delete(req.params.id);
        return sendNoContent(res);
    });

    getEnrollments = asyncHandler(async (req: Request, res: Response) => {
        const result = await courseService.getEnrollments(req.params.id);
        return sendSuccess(res, result);
    });
}

export const courseController = new CourseController();