// src/modules/instituteadmin/mock-drive/registration/registration.controller.ts

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../../middleware/auth.middleware';
import { registrationService } from './registration.service';
import {
  updateRegistrationSchema,
  bulkUpdateRegistrationSchema,
  listRegistrationsQuerySchema,
  registrationIdParamSchema,
} from './registration.validation';
import { sendSuccess, sendError } from '../../../../utils/response';
import { logger } from '../../../../utils/logger';
import { RegistrationError } from './registration.types';
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

export class RegistrationController {
  // ==========================================
  // Get Registration by ID
  // ==========================================

  async getRegistrationById(
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

      const { id, regId } = registrationIdParamSchema.parse(req.params);

      const registration = await registrationService.getRegistrationById(
        id,
        regId,
        instituteId
      );

      sendSuccess(res, registration, 'Registration retrieved successfully');
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  // ==========================================
  // List Registrations
  // ==========================================

  async listRegistrations(
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
      const query = listRegistrationsQuerySchema.parse(req.query);

      const result = await registrationService.listRegistrations(
        id,
        instituteId,
        query
      );

      sendSuccess(res, result, 'Registrations retrieved successfully');
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  // ==========================================
  // Update Registration
  // ==========================================

  async updateRegistration(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const instituteId = req.user?.instituteId;
      const reviewerId = req.user?.id;

      if (!instituteId || !reviewerId) {
        sendError(res, 'FORBIDDEN', 'Institute membership required', 403);
        return;
      }

      const { id, regId } = registrationIdParamSchema.parse(req.params);
      const data = updateRegistrationSchema.parse(req.body);

      const registration = await registrationService.updateRegistration(
        id,
        regId,
        instituteId,
        reviewerId,
        data
      );

      sendSuccess(res, registration, 'Registration updated successfully');
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  // ==========================================
  // Bulk Update Registrations
  // ==========================================

  async bulkUpdateRegistrations(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const instituteId = req.user?.instituteId;
      const reviewerId = req.user?.id;

      if (!instituteId || !reviewerId) {
        sendError(res, 'FORBIDDEN', 'Institute membership required', 403);
        return;
      }

      const { id } = mockDriveIdParamSchema.parse(req.params);
      const data = bulkUpdateRegistrationSchema.parse(req.body);

      const result = await registrationService.bulkUpdateRegistrations(
        id,
        instituteId,
        reviewerId,
        data
      );

      sendSuccess(
        res,
        result,
        `${result.success} registrations updated successfully`
      );
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  // ==========================================
  // Approve All Pending
  // ==========================================

  async approveAllPending(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const instituteId = req.user?.instituteId;
      const reviewerId = req.user?.id;

      if (!instituteId || !reviewerId) {
        sendError(res, 'FORBIDDEN', 'Institute membership required', 403);
        return;
      }

      const { id } = mockDriveIdParamSchema.parse(req.params);

      const result = await registrationService.approveAllPending(
        id,
        instituteId,
        reviewerId
      );

      sendSuccess(
        res,
        result,
        `${result.approved} registrations approved successfully`
      );
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  // ==========================================
  // Get Registration Summary
  // ==========================================

  async getRegistrationSummary(
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

      // Verify access first
      const mockDrive = await prisma.mockDrive.findUnique({
        where: { id },
        select: { instituteId: true },
      });

      if (!mockDrive || mockDrive.instituteId !== instituteId) {
        sendError(res, 'NOT_FOUND', 'Mock drive not found', 404);
        return;
      }

      const summary = await registrationService.getRegistrationSummary(id);

      sendSuccess(res, summary, 'Registration summary retrieved successfully');
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  // ==========================================
  // Export Registrations
  // ==========================================

  async exportRegistrations(
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
      const { status } = req.query;

      const registrations = await registrationService.exportRegistrations(
        id,
        instituteId,
        status as any
      );

      sendSuccess(res, registrations, 'Registrations exported successfully');
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

    if (error instanceof RegistrationError) {
      sendError(res, error.code, error.message, error.statusCode);
      return;
    }

    if (error instanceof MockDriveError) {
      sendError(res, error.code, error.message, error.statusCode);
      return;
    }

    logger.error('Registration controller error', error);
    next(error);
  }
}

// Need to import prisma for the summary endpoint
import { prisma } from '../../../../lib/db';

// Export singleton instance
export const registrationController = new RegistrationController();