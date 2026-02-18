import { Request, Response } from 'express';
import { courseService } from './course.service';
import { asyncHandler } from '../../../../utils/async-handler';
import { sendSuccess, sendCreated, sendNoContent } from '../../../../utils/response';
import { createCourseSchema, updateCourseSchema } from './course.validation';
import { uploadBuffer } from '../../../../utils/cloudinary';
import { BadRequestError } from '../../../../utils/errors';
import { v4 as uuidv4 } from 'uuid'; // I don't have uuid installed maybe? I should check package.json or use another way.
// Actually I don't need uuid, I can just let cloudinary generate public_id or use Date.now()


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

    uploadResource = asyncHandler(async (req: Request, res: Response) => {
        if (!req.file) {
            throw new BadRequestError('No file provided');
        }

        const timestamp = Date.now();
        const safeName = req.file.originalname.replace(/[^a-zA-Z0-9]/g, '_');
        const publicId = `lms-resources/${timestamp}_${safeName}`;

        const result = await uploadBuffer(req.file.buffer, {
            folder: 'lms-resources',
            resourceType: 'auto', // Allow it to detect (raw for pdfs sometimes better but auto is generally ok for cloudinary)
            publicId: publicId
        });

        return sendCreated(res, { url: result.secureUrl, name: req.file.originalname, type: result.format || 'file' }, 'Resource uploaded successfully');
    });
}

export const courseController = new CourseController();