// src/modules/instituteadmin/mock-drive/modules/modules.controller.ts

import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../../../../middleware/auth.middleware';
import { mockDriveModuleService } from './modules.service';
import { sendSuccess, sendError } from '../../../../utils/response';
import { logger } from '../../../../utils/logger';
import { ModuleError } from './modules.types';
import {
  mockDriveIdParamSchema,
  moduleIdParamSchema,
  listModulesQuerySchema,
  createModuleSchema,
  updateModuleSchema,
  reorderModulesSchema,
} from './modules.validation';

// ============================================
// Controller
// ============================================

export class MockDriveModuleController {
  async addModule(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const instituteId = this.getInstituteId(req, res);
      if (!instituteId) return;

      const { id } = mockDriveIdParamSchema.parse(req.params);
      const data = createModuleSchema.parse(req.body);

      const module = await mockDriveModuleService.addModule(id, instituteId, data);
      sendSuccess(res, module, 'Module added successfully', 201);
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  async getModules(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const instituteId = this.getInstituteId(req, res);
      if (!instituteId) return;

      const { id } = mockDriveIdParamSchema.parse(req.params);
      const query = listModulesQuerySchema.parse(req.query);

      const modules = await mockDriveModuleService.getModules(id, instituteId, query);
      sendSuccess(res, modules, 'Modules retrieved successfully');
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  async getModulesSummary(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const instituteId = this.getInstituteId(req, res);
      if (!instituteId) return;

      const { id } = mockDriveIdParamSchema.parse(req.params);

      const summary = await mockDriveModuleService.getModulesSummary(id, instituteId);
      sendSuccess(res, summary, 'Summary retrieved successfully');
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  async getModule(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const instituteId = this.getInstituteId(req, res);
      if (!instituteId) return;

      const { id, moduleId } = moduleIdParamSchema.parse(req.params);

      const module = await mockDriveModuleService.getModule(id, moduleId, instituteId);
      sendSuccess(res, module, 'Module retrieved successfully');
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  async updateModule(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const instituteId = this.getInstituteId(req, res);
      if (!instituteId) return;

      const { id, moduleId } = moduleIdParamSchema.parse(req.params);
      const data = updateModuleSchema.parse(req.body);

      const module = await mockDriveModuleService.updateModule(id, moduleId, instituteId, data);
      sendSuccess(res, module, 'Module updated successfully');
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  async deleteModule(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const instituteId = this.getInstituteId(req, res);
      if (!instituteId) return;

      const { id, moduleId } = moduleIdParamSchema.parse(req.params);

      await mockDriveModuleService.deleteModule(id, moduleId, instituteId);
      sendSuccess(res, null, 'Module deleted successfully');
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  async reorderModules(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const instituteId = this.getInstituteId(req, res);
      if (!instituteId) return;

      const { id } = mockDriveIdParamSchema.parse(req.params);
      const data = reorderModulesSchema.parse(req.body);

      const modules = await mockDriveModuleService.reorderModules(id, instituteId, data);
      sendSuccess(res, modules, 'Modules reordered successfully');
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  async duplicateModule(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const instituteId = this.getInstituteId(req, res);
      if (!instituteId) return;

      const { id, moduleId } = moduleIdParamSchema.parse(req.params);

      const module = await mockDriveModuleService.duplicateModule(id, moduleId, instituteId);
      sendSuccess(res, module, 'Module duplicated successfully', 201);
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  async getSupportedLanguages(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const languages = mockDriveModuleService.getSupportedLanguages();
      sendSuccess(res, languages, 'Supported languages retrieved successfully');
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

      logger.warn('Validation failed', {
        errors,
        path: res.req?.path,
      });

      sendError(res, 'VALIDATION_ERROR', 'Validation failed', 400, errors);
      return;
    }

    if (error instanceof ModuleError) {
      sendError(res, error.code, error.message, error.statusCode);
      return;
    }

    // Handle inline MockDrive errors
    if (error instanceof Error && 'code' in error && 'statusCode' in error) {
      const e = error as Error & { code: string; statusCode: number };
      sendError(res, e.code, e.message, e.statusCode);
      return;
    }

    logger.error('Module controller error', { error });
    next(error);
  }
}

export const mockDriveModuleController = new MockDriveModuleController();