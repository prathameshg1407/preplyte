"use strict";
// src/module/dashboard/dashboard.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = exports.dashboardController = void 0;
const dashboard_service_1 = require("./dashboard.service");
const errors_1 = require("../../utils/errors");
const dashboard_constants_1 = require("./dashboard.constants");
// =====================================================
// CONTROLLER CLASS
// =====================================================
class DashboardController {
    constructor() {
        // Bind all methods to preserve 'this' context
        this.getStudentDashboard = this.getStudentDashboard.bind(this);
        this.getInstituteAdminDashboard = this.getInstituteAdminDashboard.bind(this);
        this.getPlatformAdminDashboard = this.getPlatformAdminDashboard.bind(this);
    }
    // =================================================
    // STUDENT DASHBOARD
    // =================================================
    /**
     * GET /dashboard/student
     * Get student dashboard data
     */
    async getStudentDashboard(req, res, next) {
        try {
            const userId = this.getUserId(req);
            // Verify user role
            if (req.user?.role !== 'USER') {
                throw new errors_1.ForbiddenError('Access denied. Students only.');
            }
            const dashboard = await dashboard_service_1.dashboardService.getStudentDashboard(userId);
            res.status(dashboard_constants_1.HTTP_STATUS.OK).json({
                success: true,
                data: dashboard,
            });
        }
        catch (error) {
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
    async getInstituteAdminDashboard(req, res, next) {
        try {
            const userId = this.getUserId(req);
            // Verify user role
            if (req.user?.role !== 'INSTITUTE_ADMIN') {
                throw new errors_1.ForbiddenError('Access denied. Institute admins only.');
            }
            const instituteId = req.user?.instituteId;
            if (!instituteId) {
                throw new errors_1.BadRequestError('User is not associated with an institute');
            }
            const dashboard = await dashboard_service_1.dashboardService.getInstituteAdminDashboard(userId, instituteId);
            res.status(dashboard_constants_1.HTTP_STATUS.OK).json({
                success: true,
                data: dashboard,
            });
        }
        catch (error) {
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
    async getPlatformAdminDashboard(req, res, next) {
        try {
            // Verify user role
            if (req.user?.role !== 'PLATFORM_ADMIN') {
                throw new errors_1.ForbiddenError('Access denied. Platform admins only.');
            }
            const dashboard = await dashboard_service_1.dashboardService.getPlatformAdminDashboard();
            res.status(dashboard_constants_1.HTTP_STATUS.OK).json({
                success: true,
                data: dashboard,
            });
        }
        catch (error) {
            next(error);
        }
    }
    // =================================================
    // PRIVATE HELPERS
    // =================================================
    getUserId(req) {
        if (!req.user?.id) {
            throw new errors_1.BadRequestError('User ID not found in request');
        }
        return req.user.id;
    }
}
exports.DashboardController = DashboardController;
// =====================================================
// SINGLETON EXPORT
// =====================================================
exports.dashboardController = new DashboardController();
//# sourceMappingURL=dashboard.controller.js.map