// src/modules/instituteadmin/mock-drive/eligibility/eligibility.controller.ts

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../../middleware/auth.middleware';
import { eligibilityService } from './eligibility.service';
import {
  setEligibilitySchema,
  updateEligibilitySchema,
  eligibleStudentsQuerySchema,
} from './eligibility.validation';
import { sendSuccess, sendError } from '../../../../utils/response';
import { logger } from '../../../../utils/logger';
import { EligibilityError } from './eligibility.types';
import { MockDriveError } from '../mockdrive.types';
import { z } from 'zod';

// ============================================
// Param Schema
// ============================================

const mockDriveIdParamSchema = z.object({
  id: z.string().cuid('Invalid mock drive ID'),
});

const userIdParamSchema = z.object({
  id: z.string().cuid('Invalid mock drive ID'),
  userId: z.string().cuid('Invalid user ID'),
});

// ============================================
// Controller Class
// ============================================

export class EligibilityController {
  // ==========================================
  // Set Eligibility Criteria
  // ==========================================

  async setEligibility(
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
      const data = setEligibilitySchema.parse(req.body);

      const eligibility = await eligibilityService.setEligibility(
        id,
        instituteId,
        data
      );

      sendSuccess(res, eligibility, 'Eligibility criteria set successfully');
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  // ==========================================
  // Get Eligibility Criteria
  // ==========================================

  async getEligibility(
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

      const eligibility = await eligibilityService.getEligibility(
        id,
        instituteId
      );

      sendSuccess(res, eligibility, 'Eligibility criteria retrieved successfully');
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  // ==========================================
  // Update Eligibility Criteria
  // ==========================================

  async updateEligibility(
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
      const data = updateEligibilitySchema.parse(req.body);

      const eligibility = await eligibilityService.updateEligibility(
        id,
        instituteId,
        data
      );

      sendSuccess(res, eligibility, 'Eligibility criteria updated successfully');
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  // ==========================================
  // Delete Eligibility Criteria
  // ==========================================

  async deleteEligibility(
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

      await eligibilityService.deleteEligibility(id, instituteId);

      sendSuccess(res, null, 'Eligibility criteria deleted successfully');
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  // ==========================================
  // Check Student Eligibility
  // ==========================================

  async checkStudentEligibility(
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

      const { id, userId } = userIdParamSchema.parse(req.params);

      const result = await eligibilityService.checkStudentEligibility(
        id,
        instituteId,
        userId
      );

      sendSuccess(res, result, 'Eligibility check completed');
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  // ==========================================
  // Get Eligible Students
  // ==========================================

  async getEligibleStudents(
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
      const query = eligibleStudentsQuerySchema.parse(req.query);

      const result = await eligibilityService.getEligibleStudents(
        id,
        instituteId,
        query
      );

      sendSuccess(res, result, 'Eligible students retrieved successfully');
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  // ==========================================
  // Get Eligibility Summary
  // ==========================================

  async getEligibilitySummary(
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

      const summary = await eligibilityService.getEligibilitySummary(
        id,
        instituteId
      );

      sendSuccess(res, summary, 'Eligibility summary retrieved successfully');
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

    if (error instanceof EligibilityError) {
      sendError(res, error.code, error.message, error.statusCode);
      return;
    }

    if (error instanceof MockDriveError) {
      sendError(res, error.code, error.message, error.statusCode);
      return;
    }

    logger.error('Eligibility controller error', error);
    next(error);
  }
}

// Export singleton instance
export const eligibilityController = new EligibilityController();