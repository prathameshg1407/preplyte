// src/modules/instituteadmin/mock-drive/mockdrive.controller.ts

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import { mockDriveService } from './mockdrive.service';
import {
  createMockDriveSchema,
  updateMockDriveSchema,
  listMockDrivesQuerySchema,
  mockDriveIdParamSchema,
} from './mockdrive.validation';
import { sendSuccess, sendError } from '../../../utils/response';
import { logger } from '../../../utils/logger';
import { MockDriveError, CreateMockDriveDTO, UpdateMockDriveDTO } from './mockdrive.types';
import { z } from 'zod';

// ============================================
// Helper function to transform validated data
// ============================================

function transformToDTO<T extends Record<string, unknown>>(data: T): T {
  // Convert null to undefined for optional fields where needed
  // This is handled at the service layer, so we just pass through
  return data;
}

// ============================================
// Controller Class
// ============================================

export class MockDriveController {
  // ==========================================
  // Create Mock Drive
  // ==========================================

  async create(
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

      const validatedData = createMockDriveSchema.parse(req.body);

      // Transform to DTO - the service accepts null values
      const dto: CreateMockDriveDTO = {
        title: validatedData.title,
        description: validatedData.description,
        instructions: validatedData.instructions,
        registrationStartDate: validatedData.registrationStartDate,
        registrationEndDate: validatedData.registrationEndDate,
        maxRegistrations: validatedData.maxRegistrations,
        driveStartDate: validatedData.driveStartDate,
        driveEndDate: validatedData.driveEndDate,
        allowLateSubmission: validatedData.allowLateSubmission,
        showLeaderboard: validatedData.showLeaderboard,
        showResultsImmediately: validatedData.showResultsImmediately,
        resultsReleaseDate: validatedData.resultsReleaseDate,
        shuffleQuestions: validatedData.shuffleQuestions,
        enableProctoring: validatedData.enableProctoring,
        proctoringSettings: validatedData.proctoringSettings,
      };

      const mockDrive = await mockDriveService.create(instituteId, dto);

      sendSuccess(res, mockDrive, 'Mock drive created successfully', 201);
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  // ==========================================
  // Get Mock Drive by ID
  // ==========================================

  async getById(
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

      const mockDrive = await mockDriveService.getById(id, instituteId);

      sendSuccess(res, mockDrive, 'Mock drive retrieved successfully');
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  // ==========================================
  // List Mock Drives
  // ==========================================

  async list(
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

      const query = listMockDrivesQuerySchema.parse(req.query);

      const result = await mockDriveService.list(instituteId, query);

      sendSuccess(res, result, 'Mock drives retrieved successfully');
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  // ==========================================
  // Update Mock Drive
  // ==========================================

  async update(
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
      const validatedData = updateMockDriveSchema.parse(req.body);

      // Transform to DTO
      const dto: UpdateMockDriveDTO = {
        ...(validatedData.title !== undefined && { title: validatedData.title }),
        ...(validatedData.description !== undefined && { description: validatedData.description }),
        ...(validatedData.instructions !== undefined && { instructions: validatedData.instructions }),
        ...(validatedData.registrationStartDate !== undefined && { registrationStartDate: validatedData.registrationStartDate }),
        ...(validatedData.registrationEndDate !== undefined && { registrationEndDate: validatedData.registrationEndDate }),
        ...(validatedData.maxRegistrations !== undefined && { maxRegistrations: validatedData.maxRegistrations }),
        ...(validatedData.driveStartDate !== undefined && { driveStartDate: validatedData.driveStartDate }),
        ...(validatedData.driveEndDate !== undefined && { driveEndDate: validatedData.driveEndDate }),
        ...(validatedData.allowLateSubmission !== undefined && { allowLateSubmission: validatedData.allowLateSubmission }),
        ...(validatedData.showLeaderboard !== undefined && { showLeaderboard: validatedData.showLeaderboard }),
        ...(validatedData.showResultsImmediately !== undefined && { showResultsImmediately: validatedData.showResultsImmediately }),
        ...(validatedData.resultsReleaseDate !== undefined && { resultsReleaseDate: validatedData.resultsReleaseDate }),
        ...(validatedData.shuffleQuestions !== undefined && { shuffleQuestions: validatedData.shuffleQuestions }),
        ...(validatedData.enableProctoring !== undefined && { enableProctoring: validatedData.enableProctoring }),
        ...(validatedData.proctoringSettings !== undefined && { proctoringSettings: validatedData.proctoringSettings }),
        ...(validatedData.status !== undefined && { status: validatedData.status }),
      };

      const mockDrive = await mockDriveService.update(id, instituteId, dto);

      sendSuccess(res, mockDrive, 'Mock drive updated successfully');
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  // ==========================================
  // Delete Mock Drive
  // ==========================================

  async delete(
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

      await mockDriveService.delete(id, instituteId);

      sendSuccess(res, null, 'Mock drive deleted successfully');
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  // ==========================================
  // Publish Mock Drive
  // ==========================================

  async publish(
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

      const mockDrive = await mockDriveService.publish(id, instituteId);

      sendSuccess(res, mockDrive, 'Mock drive published successfully');
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  // ==========================================
  // Cancel Mock Drive
  // ==========================================

  async cancel(
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

      const mockDrive = await mockDriveService.cancel(id, instituteId);

      sendSuccess(res, mockDrive, 'Mock drive cancelled successfully');
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  // ==========================================
  // Get Mock Drive Stats
  // ==========================================

  async getStats(
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

      const stats = await mockDriveService.getStats(id, instituteId);

      sendSuccess(res, stats, 'Mock drive stats retrieved successfully');
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  // ==========================================
  // Duplicate Mock Drive
  // ==========================================

  async duplicate(
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
      const { title } = req.body;

      const mockDrive = await mockDriveService.duplicate(id, instituteId, title);

      sendSuccess(res, mockDrive, 'Mock drive duplicated successfully', 201);
    } catch (error) {
      this.handleError(error, res, next);
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

    logger.error('MockDrive controller error', error);
    next(error);
  }
}

// Export singleton instance
export const mockDriveController = new MockDriveController();