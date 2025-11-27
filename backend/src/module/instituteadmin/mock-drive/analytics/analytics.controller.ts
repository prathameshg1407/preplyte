// src/modules/instituteadmin/mock-drive/analytics/analytics.controller.ts

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../../middleware/auth.middleware';
import { analyticsService } from './analytics.service';
import { sendSuccess, sendError } from '../../../../utils/response';
import { logger } from '../../../../utils/logger';
import { MockDriveError } from '../mockdrive.types';
import { z } from 'zod';

// ============================================
// Param Schema
// ============================================

const mockDriveIdParamSchema = z.object({
  id: z.string().cuid('Invalid mock drive ID'),
});

// ============================================
// Controller Class
// ============================================

export class AnalyticsController {
  // ==========================================
  // Get Full Analytics
  // ==========================================

  async getFullAnalytics(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const instituteId = req.user?.instituteId;

      if (!instituteId) {
        sendError(res, 'FORBIDDEN', 'Institute membership required', 403);
        return;
      }

      const { id } = mockDriveIdParamSchema.parse(req.params);

      const analytics = await analyticsService.getFullAnalytics(id, instituteId);

      sendSuccess(res, analytics, 'Analytics retrieved successfully');
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  // ==========================================
  // Get Overview
  // ==========================================

  async getOverview(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const instituteId = req.user?.instituteId;

      if (!instituteId) {
        sendError(res, 'FORBIDDEN', 'Institute membership required', 403);
        return;
      }

      const { id } = mockDriveIdParamSchema.parse(req.params);

      // Verify access
      await this.verifyAccess(id, instituteId);

      const overview = await analyticsService.getOverview(id);

      sendSuccess(res, overview, 'Overview retrieved successfully');
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  // ==========================================
  // Get Score Distribution
  // ==========================================

  async getScoreDistribution(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const instituteId = req.user?.instituteId;

      if (!instituteId) {
        sendError(res, 'FORBIDDEN', 'Institute membership required', 403);
        return;
      }

      const { id } = mockDriveIdParamSchema.parse(req.params);

      await this.verifyAccess(id, instituteId);

      const distribution = await analyticsService.getScoreDistribution(id);

      sendSuccess(res, distribution, 'Score distribution retrieved successfully');
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  // ==========================================
  // Get Module Performance
  // ==========================================

  async getModulePerformance(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const instituteId = req.user?.instituteId;

      if (!instituteId) {
        sendError(res, 'FORBIDDEN', 'Institute membership required', 403);
        return;
      }

      const { id } = mockDriveIdParamSchema.parse(req.params);

      await this.verifyAccess(id, instituteId);

      const performance = await analyticsService.getModulePerformance(id);

      sendSuccess(res, performance, 'Module performance retrieved successfully');
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  // ==========================================
  // Get Batch Comparison
  // ==========================================

  async getBatchComparison(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const instituteId = req.user?.instituteId;

      if (!instituteId) {
        sendError(res, 'FORBIDDEN', 'Institute membership required', 403);
        return;
      }

      const { id } = mockDriveIdParamSchema.parse(req.params);

      await this.verifyAccess(id, instituteId);

      const comparison = await analyticsService.getBatchComparison(id);

      sendSuccess(res, comparison, 'Batch comparison retrieved successfully');
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  // ==========================================
  // Get Time Analysis
  // ==========================================

  async getTimeAnalysis(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const instituteId = req.user?.instituteId;

      if (!instituteId) {
        sendError(res, 'FORBIDDEN', 'Institute membership required', 403);
        return;
      }

      const { id } = mockDriveIdParamSchema.parse(req.params);

      await this.verifyAccess(id, instituteId);

      const analysis = await analyticsService.getTimeAnalysis(id);

      sendSuccess(res, analysis, 'Time analysis retrieved successfully');
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  // ==========================================
  // Helper Methods
  // ==========================================

  private async verifyAccess(
    mockDriveId: string,
    instituteId: string
  ): Promise<void> {
    const mockDrive = await prisma.mockDrive.findUnique({
      where: { id: mockDriveId },
      select: { instituteId: true },
    });

    if (!mockDrive) {
      throw new MockDriveNotFoundError(mockDriveId);
    }

    if (mockDrive.instituteId !== instituteId) {
      throw new MockDriveAccessDeniedError();
    }
  }

  // ==========================================
  // Error Handler
  // ==========================================

  private handleError(error: unknown, res: Response, next: NextFunction): void {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      sendError(res, 'VALIDATION_ERROR', 'Validation failed', 400, formattedErrors);
      return;
    }

    if (error instanceof MockDriveError) {
      sendError(res, error.code, error.message, error.statusCode);
      return;
    }

    logger.error('Analytics controller error', error);
    next(error);
  }
}

// Need imports
import { prisma } from '../../../../lib/db';
import { MockDriveNotFoundError, MockDriveAccessDeniedError } from '../mockdrive.types';

// Export singleton instance
export const analyticsController = new AnalyticsController();