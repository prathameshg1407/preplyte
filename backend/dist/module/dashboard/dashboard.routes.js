"use strict";
// src/module/dashboard/dashboard.routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardRoutes = void 0;
const express_1 = require("express");
const dashboard_controller_1 = require("./dashboard.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
exports.dashboardRoutes = router;
// =====================================================
// ALL ROUTES REQUIRE AUTHENTICATION
// =====================================================
router.use(auth_middleware_1.authenticate);
// =====================================================
// STUDENT DASHBOARD
// =====================================================
// GET /dashboard/student - Get student dashboard
router.get('/student', dashboard_controller_1.dashboardController.getStudentDashboard);
// =====================================================
// INSTITUTE ADMIN DASHBOARD
// =====================================================
// GET /dashboard/institute-admin - Get institute admin dashboard
router.get('/institute-admin', dashboard_controller_1.dashboardController.getInstituteAdminDashboard);
// =====================================================
// PLATFORM ADMIN DASHBOARD
// =====================================================
// GET /dashboard/platform-admin - Get platform admin dashboard
router.get('/platform-admin', dashboard_controller_1.dashboardController.getPlatformAdminDashboard);
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map