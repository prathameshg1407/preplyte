// src/module/dashboard/dashboard.routes.ts

import express, { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// =====================================================
// ALL ROUTES REQUIRE AUTHENTICATION
// =====================================================

router.use(authenticate as express.RequestHandler);

// =====================================================
// STUDENT DASHBOARD
// =====================================================

// GET /dashboard/student - Get student dashboard
router.get('/student', dashboardController.getStudentDashboard as express.RequestHandler);

// =====================================================
// INSTITUTE ADMIN DASHBOARD
// =====================================================

// GET /dashboard/institute-admin - Get institute admin dashboard
router.get('/institute-admin', dashboardController.getInstituteAdminDashboard as express.RequestHandler);

// GET /dashboard/student/:id - Get specific student dashboard for admin
router.get('/student/:id', dashboardController.getStudentDashboardForAdmin as express.RequestHandler);

// =====================================================
// PLATFORM ADMIN DASHBOARD
// =====================================================

// GET /dashboard/platform-admin - Get platform admin dashboard
router.get('/platform-admin', dashboardController.getPlatformAdminDashboard as express.RequestHandler);

// GET /dashboard/platform-admin/student/:id - Get specific student dashboard for platform admin
router.get('/platform-admin/student/:id', dashboardController.getStudentDashboardForPlatformAdmin);

// =====================================================
// EXPORT
// =====================================================

export { router as dashboardRoutes };
export default router;