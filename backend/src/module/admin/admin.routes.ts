import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import * as ctrl from './admin.controller';
import {
  createInstituteSchema,
  updateInstituteSchema,
  instituteIdSchema,
  instituteStudentsSchema,
  createUserSchema,
  updateUserSchema,
  userIdSchema,
  resetPasswordSchema,
  dateRangeSchema,
  reportFiltersSchema,
} from './admin.validation';

const router = Router();

// All routes require PLATFORM_ADMIN
router.use(authenticate, authorize('PLATFORM_ADMIN'));

// =====================================================
// ANALYTICS
// =====================================================

router.get('/analytics', validate(dateRangeSchema), ctrl.getPlatformAnalytics);

// =====================================================
// INSTITUTES
// =====================================================

router.get('/institutes', ctrl.listInstitutes);
router.post('/institutes', validate(createInstituteSchema), ctrl.createInstitute);
router.get('/institutes/:id', validate(instituteIdSchema), ctrl.getInstitute);
router.patch('/institutes/:id', validate(updateInstituteSchema), ctrl.updateInstitute);
router.delete('/institutes/:id', validate(instituteIdSchema), ctrl.deleteInstitute);
router.patch('/institutes/:id/toggle-status', validate(instituteIdSchema), ctrl.toggleInstituteStatus);
router.get('/institutes/:id/students', validate(instituteStudentsSchema), ctrl.getInstituteStudents);
router.get('/institutes/:id/admins', validate(instituteIdSchema), ctrl.getInstituteAdmins);
router.get('/institutes/:id/stats', validate(instituteIdSchema), ctrl.getInstituteStats);

// =====================================================
// USERS
// =====================================================

router.get('/users', ctrl.listUsers);
router.post('/users', validate(createUserSchema), ctrl.createUser);
router.get('/users/:id', validate(userIdSchema), ctrl.getUser);
router.patch('/users/:id', validate(updateUserSchema), ctrl.updateUser);
router.delete('/users/:id', validate(userIdSchema), ctrl.deleteUser);
router.patch('/users/:id/toggle-status', validate(userIdSchema), ctrl.toggleUserStatus);
router.get('/users/:id/stats', validate(userIdSchema), ctrl.getUserStats);
router.post('/users/:id/reset-password', validate(resetPasswordSchema), ctrl.resetUserPassword);

// =====================================================
// REPORTS
// =====================================================

router.get('/reports/institutes', validate(reportFiltersSchema), ctrl.getInstitutesReport);
router.get('/reports/users', validate(reportFiltersSchema), ctrl.getUsersReport);
router.get('/reports/activity', validate(reportFiltersSchema), ctrl.getActivityReport);

export default router;