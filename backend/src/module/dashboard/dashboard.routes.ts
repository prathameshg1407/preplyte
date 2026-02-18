// src/module/dashboard/dashboard.routes.ts

import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// =====================================================
// ALL ROUTES REQUIRE AUTHENTICATION
// =====================================================

router.use(authenticate);

// =====================================================
// STUDENT DASHBOARD
// =====================================================

// GET /dashboard/student - Get student dashboard
router.get('/student', dashboardController.getStudentDashboard);

// =====================================================
// INSTITUTE ADMIN DASHBOARD
// =====================================================

// GET /dashboard/institute-admin - Get institute admin dashboard
router.get('/institute-admin', dashboardController.getInstituteAdminDashboard);

// GET /dashboard/student/:id - Get specific student dashboard for admin
router.get('/student/:id', dashboardController.getStudentDashboardForAdmin);

// =====================================================
// PLATFORM ADMIN DASHBOARD
// =====================================================

// GET /dashboard/platform-admin - Get platform admin dashboard
router.get('/platform-admin', dashboardController.getPlatformAdminDashboard);

// =====================================================
// EXPORT
// =====================================================

export { router as dashboardRoutes };
export default router;