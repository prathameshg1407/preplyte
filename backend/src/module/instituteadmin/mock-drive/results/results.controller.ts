// src/modules/instituteadmin/mock-drive/results/results.controller.ts

import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../../../../middleware/auth.middleware';
import { resultsService } from './results.service';
import { sendSuccess, sendError } from '../../../../utils/response';
import { logger } from '../../../../utils/logger';
import { ResultsError } from './results.types';
import {
  mockDriveIdParamSchema,
  attemptIdParamSchema,
  listResultsQuerySchema,
  exportResultsQuerySchema,
  statisticsQuerySchema,
} from './results.validation';

// ============================================
// Controller
// ============================================

export class ResultsController {
  async listResults(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const instituteId = this.getInstituteId(req, res);
      if (!instituteId) return;

      const { id } = mockDriveIdParamSchema.parse(req.params);
      const query = listResultsQuerySchema.parse(req.query);

      const results = await resultsService.listResults(id, instituteId, query);
      sendSuccess(res, results, 'Results retrieved successfully');
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  async getDetailedResult(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const instituteId = this.getInstituteId(req, res);
      if (!instituteId) return;

      const { id, attemptId } = attemptIdParamSchema.parse(req.params);

      const result = await resultsService.getDetailedResult(id, attemptId, instituteId);
      sendSuccess(res, result, 'Result retrieved successfully');
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  async getStatistics(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const instituteId = this.getInstituteId(req, res);
      if (!instituteId) return;

      const { id } = mockDriveIdParamSchema.parse(req.params);
      const { batchId } = statisticsQuerySchema.parse(req.query);

      const stats = await resultsService.getStatistics(id, instituteId, batchId);
      sendSuccess(res, stats, 'Statistics retrieved successfully');
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  async calculateRankings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const instituteId = this.getInstituteId(req, res);
      if (!instituteId) return;

      const { id } = mockDriveIdParamSchema.parse(req.params);
      const { batchId } = statisticsQuerySchema.parse(req.query);

      const rankings = await resultsService.calculateRankings(id, instituteId, batchId);
      sendSuccess(res, rankings, `Rankings calculated for ${rankings.length} students`);
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  async exportResults(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const instituteId = this.getInstituteId(req, res);
      if (!instituteId) return;

      const { id } = mockDriveIdParamSchema.parse(req.params);
      const options = exportResultsQuerySchema.parse(req.query);

      const result = await resultsService.exportResults(id, instituteId, options);

      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.setHeader('Content-Type', result.contentType);
      res.send(result.data);
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  async generateReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const instituteId = this.getInstituteId(req, res);
      if (!instituteId) return;

      const { id, attemptId } = attemptIdParamSchema.parse(req.params);

      await resultsService.generateReport(id, attemptId, instituteId);
      sendSuccess(res, null, 'Report generated successfully');
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  async generateAllReports(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const instituteId = this.getInstituteId(req, res);
      if (!instituteId) return;

      const { id } = mockDriveIdParamSchema.parse(req.params);

      const result = await resultsService.generateAllReports(id, instituteId);
      sendSuccess(res, result, `Generated ${result.generated} reports`);
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  // ==========================================
  // Helpers
  // ==========================================

  private getInstituteId(req: AuthenticatedRequest, res: Response): string | null {
    const instituteId = req.user?.instituteId;
    if (!instituteId) {
      sendError(res, 'FORBIDDEN', 'Institute membership required', 403);
      return null;
    }
    return instituteId;
  }

  private handleError(error: unknown, res: Response, next: NextFunction): void {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      sendError(res, 'VALIDATION_ERROR', 'Validation failed', 400, errors);
      return;
    }

    if (error instanceof ResultsError) {
      sendError(res, error.code, error.message, error.statusCode);
      return;
    }

    logger.error('Results controller error', { error });
    next(error);
  }
}

export const resultsController = new ResultsController();