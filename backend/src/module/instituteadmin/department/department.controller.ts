// src/module/instituteadmin/department/department.controller.ts

import { Response, NextFunction } from 'express';
import { departmentService } from './department.service';
import {
  parseCreateDepartment,
  parseUpdateDepartment,
  parseDepartmentQuery,
  parseDepartmentId,
  parseBulkCreateDepartment,
  parseToggleStatus,
} from './department.validation';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import { BadRequestError, ForbiddenError } from '../../../utils/errors';

// =====================================================
// CONTROLLER CLASS
// =====================================================

class DepartmentController {
  constructor() {
    // Bind all methods
    this.createDepartment = this.createDepartment.bind(this);
    this.getDepartments = this.getDepartments.bind(this);
    this.getDepartment = this.getDepartment.bind(this);
    this.updateDepartment = this.updateDepartment.bind(this);
    this.deleteDepartment = this.deleteDepartment.bind(this);
    this.toggleStatus = this.toggleStatus.bind(this);
    this.bulkCreateDepartments = this.bulkCreateDepartments.bind(this);
    this.getStats = this.getStats.bind(this);
    this.getActiveDepartments = this.getActiveDepartments.bind(this);
  }

  // =================================================
  // CREATE DEPARTMENT
  // =================================================

  /**
   * POST /institute-admin/departments
   */
  async createDepartment(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const instituteId = this.getInstituteId(req);
      const input = parseCreateDepartment(req.body);

      const department = await departmentService.createDepartment(
        instituteId,
        input
      );

      res.status(201).json({
        success: true,
        message: 'Department created successfully',
        data: department,
      });
    } catch (error) {
      next(error);
    }
  }

  // =================================================
  // GET DEPARTMENTS (LIST)
  // =================================================

  /**
   * GET /institute-admin/departments
   */
  async getDepartments(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const instituteId = this.getInstituteId(req);
      const params = parseDepartmentQuery(req.query);

      const result = await departmentService.getDepartments(instituteId, params);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // =================================================
  // GET SINGLE DEPARTMENT
  // =================================================

  /**
   * GET /institute-admin/departments/:departmentId
   */
  async getDepartment(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const instituteId = this.getInstituteId(req);
      const departmentId = parseDepartmentId(req.params.departmentId);

      const department = await departmentService.getDepartment(
        instituteId,
        departmentId
      );

      res.status(200).json({
        success: true,
        data: department,
      });
    } catch (error) {
      next(error);
    }
  }

  // =================================================
  // UPDATE DEPARTMENT
  // =================================================

  /**
   * PATCH /institute-admin/departments/:departmentId
   */
  async updateDepartment(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const instituteId = this.getInstituteId(req);
      const departmentId = parseDepartmentId(req.params.departmentId);
      const input = parseUpdateDepartment(req.body);

      const department = await departmentService.updateDepartment(
        instituteId,
        departmentId,
        input
      );

      res.status(200).json({
        success: true,
        message: 'Department updated successfully',
        data: department,
      });
    } catch (error) {
      next(error);
    }
  }

  // =================================================
  // DELETE DEPARTMENT
  // =================================================

  /**
   * DELETE /institute-admin/departments/:departmentId
   */
  async deleteDepartment(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const instituteId = this.getInstituteId(req);
      const departmentId = parseDepartmentId(req.params.departmentId);

      await departmentService.deleteDepartment(instituteId, departmentId);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // =================================================
  // TOGGLE STATUS
  // =================================================

  /**
   * PATCH /institute-admin/departments/:departmentId/status
   */
  async toggleStatus(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const instituteId = this.getInstituteId(req);
      const departmentId = parseDepartmentId(req.params.departmentId);
      const { isActive } = parseToggleStatus(req.body);

      const department = await departmentService.toggleStatus(
        instituteId,
        departmentId,
        isActive
      );

      res.status(200).json({
        success: true,
        message: `Department ${isActive ? 'activated' : 'deactivated'} successfully`,
        data: department,
      });
    } catch (error) {
      next(error);
    }
  }

  // =================================================
  // BULK CREATE
  // =================================================

  /**
   * POST /institute-admin/departments/bulk
   */
  async bulkCreateDepartments(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const instituteId = this.getInstituteId(req);
      const { departments } = parseBulkCreateDepartment(req.body);

      const result = await departmentService.bulkCreateDepartments(
        instituteId,
        departments
      );

      res.status(201).json({
        success: true,
        message: `Created ${result.created} department(s)${result.failed > 0 ? `, ${result.failed} failed` : ''}`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // =================================================
  // GET STATISTICS
  // =================================================

  /**
   * GET /institute-admin/departments/stats
   */
  async getStats(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const instituteId = this.getInstituteId(req);

      const stats = await departmentService.getStats(instituteId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  // =================================================
  // GET ACTIVE DEPARTMENTS (for dropdowns)
  // =================================================

  /**
   * GET /institute-admin/departments/active
   */
  async getActiveDepartments(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const instituteId = this.getInstituteId(req);

      const departments = await departmentService.getActiveDepartments(instituteId);

      res.status(200).json({
        success: true,
        data: departments,
      });
    } catch (error) {
      next(error);
    }
  }

  // =================================================
  // PRIVATE HELPERS
  // =================================================

  private getInstituteId(req: AuthenticatedRequest): string {
    const instituteId = req.user?.instituteId;

    if (!instituteId) {
      throw new ForbiddenError('User is not associated with any institute');
    }

    return instituteId;
  }
}

// =====================================================
// SINGLETON EXPORT
// =====================================================

export const departmentController = new DepartmentController();
export { DepartmentController };