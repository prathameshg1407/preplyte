// src/module/instituteadmin/department/department.routes.ts

import { Router } from 'express';
import { departmentController } from './department.controller';
import { authenticate, authorize } from '../../../middleware/auth.middleware';

const router = Router();

// =====================================================
// ALL ROUTES REQUIRE AUTHENTICATION + INSTITUTE_ADMIN
// =====================================================

router.use(authenticate);
router.use(authorize('INSTITUTE_ADMIN'));

// =====================================================
// STATIC ROUTES (must come before parameterized routes)
// =====================================================

// GET /institute-admin/departments/stats - Get department statistics
router.get('/stats', departmentController.getStats);

// GET /institute-admin/departments/active - Get active departments (for dropdowns)
router.get('/active', departmentController.getActiveDepartments);

// POST /institute-admin/departments/bulk - Bulk create departments
router.post('/bulk', departmentController.bulkCreateDepartments);

// =====================================================
// BASE ROUTES
// =====================================================

// GET /institute-admin/departments - List all departments
router.get('/', departmentController.getDepartments);

// POST /institute-admin/departments - Create a new department
router.post('/', departmentController.createDepartment);

// =====================================================
// PARAMETERIZED ROUTES
// =====================================================

// GET /institute-admin/departments/:departmentId - Get single department
router.get('/:departmentId', departmentController.getDepartment);

// PATCH /institute-admin/departments/:departmentId - Update department
router.patch('/:departmentId', departmentController.updateDepartment);

// DELETE /institute-admin/departments/:departmentId - Delete department
router.delete('/:departmentId', departmentController.deleteDepartment);

// PATCH /institute-admin/departments/:departmentId/status - Toggle active status
router.patch('/:departmentId/status', departmentController.toggleStatus);

// =====================================================
// EXPORT
// =====================================================

export { router as departmentRoutes };
export default router;