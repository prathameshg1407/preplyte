// src/modules/instituteadmin/mock-drive/batch/batch.controller.ts

import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../../../../middleware/auth.middleware';
import { batchService } from './batch.service';
import { sendSuccess, sendError } from '../../../../utils/response';
import { logger } from '../../../../utils/logger';
import { BatchError } from './batch.types';
import {
  mockDriveIdParamSchema,
  batchIdParamSchema,
  createBatchSchema,
  updateBatchSchema,
  autoCreateBatchesSchema,
  assignStudentsSchema,
  listBatchesQuerySchema,
} from './batch.validation';

// ============================================
// Controller
// ============================================

export class BatchController {
  async createBatch(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const instituteId = this.getInstituteId(req, res);
      if (!instituteId) return;

      const { id } = mockDriveIdParamSchema.parse(req.params);
      const data = createBatchSchema.parse(req.body);

      const batch = await batchService.createBatch(id, instituteId, data);
      sendSuccess(res, batch, 'Batch created successfully', 201);
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  async getBatchById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const instituteId = this.getInstituteId(req, res);
      if (!instituteId) return;

      const { id, batchId } = batchIdParamSchema.parse(req.params);
      const batch = await batchService.getBatchById(id, batchId, instituteId);
      sendSuccess(res, batch, 'Batch retrieved successfully');
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  async listBatches(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const instituteId = this.getInstituteId(req, res);
      if (!instituteId) return;

      const { id } = mockDriveIdParamSchema.parse(req.params);
      const query = listBatchesQuerySchema.parse(req.query);

      const result = await batchService.listBatches(id, instituteId, query);
      sendSuccess(res, result, 'Batches retrieved successfully');
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  async updateBatch(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const instituteId = this.getInstituteId(req, res);
      if (!instituteId) return;

      const { id, batchId } = batchIdParamSchema.parse(req.params);
      const data = updateBatchSchema.parse(req.body);

      const batch = await batchService.updateBatch(id, batchId, instituteId, data);
      sendSuccess(res, batch, 'Batch updated successfully');
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  async deleteBatch(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const instituteId = this.getInstituteId(req, res);
      if (!instituteId) return;

      const { id, batchId } = batchIdParamSchema.parse(req.params);
      await batchService.deleteBatch(id, batchId, instituteId);
      sendSuccess(res, null, 'Batch deleted successfully');
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  async autoCreateBatches(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const instituteId = this.getInstituteId(req, res);
      if (!instituteId) return;

      const { id } = mockDriveIdParamSchema.parse(req.params);
      const data = autoCreateBatchesSchema.parse(req.body);

      const batches = await batchService.autoCreateBatches(id, instituteId, data);
      sendSuccess(res, batches, `${batches.length} batches created`, 201);
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  async assignStudents(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const instituteId = this.getInstituteId(req, res);
      if (!instituteId) return;

      const { id, batchId } = batchIdParamSchema.parse(req.params);
      const data = assignStudentsSchema.parse(req.body);

      const result = await batchService.assignStudents(id, batchId, instituteId, data);
      sendSuccess(res, result, `${result.assigned} students assigned`);
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  async unassignStudents(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const instituteId = this.getInstituteId(req, res);
      if (!instituteId) return;

      const { id, batchId } = batchIdParamSchema.parse(req.params);
      const { registrationIds } = assignStudentsSchema.parse(req.body);

      const result = await batchService.unassignStudents(id, batchId, instituteId, registrationIds);
      sendSuccess(res, result, `${result.unassigned} students unassigned`);
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  async getBatchStudents(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const instituteId = this.getInstituteId(req, res);
      if (!instituteId) return;

      const { id, batchId } = batchIdParamSchema.parse(req.params);
      const students = await batchService.getBatchStudents(id, batchId, instituteId);
      sendSuccess(res, students, 'Students retrieved successfully');
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  async startBatch(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const instituteId = this.getInstituteId(req, res);
      if (!instituteId) return;

      const { id, batchId } = batchIdParamSchema.parse(req.params);
      const batch = await batchService.startBatch(id, batchId, instituteId);
      sendSuccess(res, batch, 'Batch started successfully');
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  async completeBatch(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const instituteId = this.getInstituteId(req, res);
      if (!instituteId) return;

      const { id, batchId } = batchIdParamSchema.parse(req.params);
      const batch = await batchService.completeBatch(id, batchId, instituteId);
      sendSuccess(res, batch, 'Batch completed successfully');
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

    if (error instanceof BatchError) {
      sendError(res, error.code, error.message, error.statusCode);
      return;
    }

    // Handle inline MockDrive errors
    if (error instanceof Error && 'code' in error && 'statusCode' in error) {
      const e = error as Error & { code: string; statusCode: number };
      sendError(res, e.code, e.message, e.statusCode);
      return;
    }

    logger.error('Batch controller error', { error });
    next(error);
  }
}

export const batchController = new BatchController();