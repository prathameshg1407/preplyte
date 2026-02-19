// src/module/dashboard/dashboard.controller.ts

import { Response, NextFunction } from 'express';
import { dashboardService } from './dashboard.service';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { BadRequestError, ForbiddenError } from '../../utils/errors';
import { HTTP_STATUS } from './dashboard.constants';

// =====================================================
// CONTROLLER CLASS
// =====================================================

class DashboardController {
  constructor() {
    // Bind all methods to preserve 'this' context
    this.getStudentDashboard = this.getStudentDashboard.bind(this);
    this.getInstituteAdminDashboard = this.getInstituteAdminDashboard.bind(this);
    this.getPlatformAdminDashboard = this.getPlatformAdminDashboard.bind(this);
    this.getStudentDashboardForAdmin = this.getStudentDashboardForAdmin.bind(this);
    this.getStudentDashboardForPlatformAdmin = this.getStudentDashboardForPlatformAdmin.bind(this);
  }

  /**
   * GET /dashboard/student/:id
   * Get student dashboard data for institute admin
   */
  async getStudentDashboardForAdmin(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const adminUserId = this.getUserId(req);
      const studentUserId = req.params.id;

      // Verify user role
      if (req.user?.role !== 'INSTITUTE_ADMIN') {
        throw new ForbiddenError('Access denied. Institute admins only.');
      }

      const instituteId = req.user?.instituteId;
      if (!instituteId) {
        throw new BadRequestError('User is not associated with an institute');
      }

      const data = await dashboardService.getStudentDashboardForAdmin(
        adminUserId,
        studentUserId,
        instituteId
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  // =================================================
  // STUDENT DASHBOARD
  // =================================================

  /**
   * GET /dashboard/student
   * Get student dashboard data
   */
  async getStudentDashboard(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = this.getUserId(req);

      // Verify user role
      if (req.user?.role !== 'USER') {
        throw new ForbiddenError('Access denied. Students only.');
      }

      const dashboard = await dashboardService.getStudentDashboard(userId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: dashboard,
      });
    } catch (error) {
      next(error);
    }
  }

  // =================================================
  // INSTITUTE ADMIN DASHBOARD
  // =================================================

  /**
   * GET /dashboard/institute-admin
   * Get institute admin dashboard data
   */
  async getInstituteAdminDashboard(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = this.getUserId(req);

      // Verify user role
      if (req.user?.role !== 'INSTITUTE_ADMIN') {
        throw new ForbiddenError('Access denied. Institute admins only.');
      }

      const instituteId = req.user?.instituteId;
      if (!instituteId) {
        throw new BadRequestError('User is not associated with an institute');
      }

      const dashboard = await dashboardService.getInstituteAdminDashboard(
        userId,
        instituteId
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: dashboard,
      });
    } catch (error) {
      next(error);
    }
  }

  // =================================================
  // PLATFORM ADMIN DASHBOARD
  // =================================================

  /**
   * GET /dashboard/platform-admin
   * Get platform admin dashboard data
   */
  async getPlatformAdminDashboard(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Verify user role
      if (req.user?.role !== 'PLATFORM_ADMIN') {
        throw new ForbiddenError('Access denied. Platform admins only.');
      }

      const dashboard = await dashboardService.getPlatformAdminDashboard();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: dashboard,
      });
    } catch (error) {
      next(error);
    }
  }



  /**
   * GET /dashboard/platform-admin/student/:id
   * Get student dashboard data for platform admin
   */
  async getStudentDashboardForPlatformAdmin(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const adminUserId = this.getUserId(req);
      const studentUserId = req.params.id;

      // Verify user role
      if (req.user?.role !== 'PLATFORM_ADMIN') {
        throw new ForbiddenError('Access denied. Platform admins only.');
      }

      const data = await dashboardService.getStudentDashboardForPlatformAdmin(
        adminUserId,
        studentUserId
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  // =================================================
  // PRIVATE HELPERS
  // =================================================

  private getUserId(req: AuthenticatedRequest): string {
    if (!req.user?.id) {
      throw new BadRequestError('User ID not found in request');
    }
    return req.user.id;
  }
}

// =====================================================
// SINGLETON EXPORT
// =====================================================

export const dashboardController = new DashboardController();
export { DashboardController };