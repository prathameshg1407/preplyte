import { Request, Response } from 'express';
import { asyncHandler } from '../../../../utils/async-handler';
import { sendSuccess } from '../../../../utils/response';
import { analyticsService } from './analytics.service';
import { logError } from '../../../../utils/logger';

export class AnalyticsController {
    getOverview = asyncHandler(async (req: Request, res: Response) => {
        try {
            const stats = await analyticsService.getOverview();
            return sendSuccess(res, stats);
        } catch (error) {
            logError(error as Error, { path: req.path, method: req.method });
            throw error; // Let asyncHandler handle it after logging
        }
    });

    getEnrollmentTrends = asyncHandler(async (req: Request, res: Response) => {
        try {
            const { period } = req.query as { period?: 'week' | 'month' | 'year' };
            const trends = await analyticsService.getEnrollmentTrends(period);
            return sendSuccess(res, trends);
        } catch (error) {
            logError(error as Error, { path: req.path, method: req.method });
            throw error;
        }
    });

    getTopCourses = asyncHandler(async (req: Request, res: Response) => {
        try {
            const courses = await analyticsService.getTopCourses();
            return sendSuccess(res, courses);
        } catch (error) {
            logError(error as Error, { path: req.path, method: req.method });
            throw error;
        }
    });

    getCategoryDistribution = asyncHandler(async (req: Request, res: Response) => {
        try {
            const distribution = await analyticsService.getCategoryDistribution();
            return sendSuccess(res, distribution);
        } catch (error) {
            logError(error as Error, { path: req.path, method: req.method });
            throw error;
        }
    });
}

export const analyticsController = new AnalyticsController();