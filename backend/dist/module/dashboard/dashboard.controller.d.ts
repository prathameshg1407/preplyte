import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
declare class DashboardController {
    constructor();
    /**
     * GET /dashboard/student
     * Get student dashboard data
     */
    getStudentDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /dashboard/institute-admin
     * Get institute admin dashboard data
     */
    getInstituteAdminDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /dashboard/platform-admin
     * Get platform admin dashboard data
     */
    getPlatformAdminDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    private getUserId;
}
export declare const dashboardController: DashboardController;
export { DashboardController };
//# sourceMappingURL=dashboard.controller.d.ts.map