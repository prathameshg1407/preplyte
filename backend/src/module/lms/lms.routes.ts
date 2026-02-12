// src/module/lms/lms.routes.ts

import { Router } from 'express';
import { lmsController } from './lms.controller';
import { authenticate, optionalAuth } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  getCoursesQuerySchema,
  courseSlugParamSchema,
  moduleOrderParamSchema,
  topicOrderParamSchema,
  updateTopicProgressSchema,
  submitTestSchema,
} from './lms.validation';

const router = Router();

// Simple validation middleware for query parameters only
const validateQuery = (schema: any) => {
  return (req: any, res: any, next: any) => {
    try {
      console.log('Validating query:', req.query);
      // Apply defaults for empty query
      const query = req.query || {};
      const result = schema.parse(query);
      console.log('Validation result:', result);
      req.query = result; // Apply parsed result with defaults
      next();
    } catch (error: any) {
      console.error('Query validation error:', error);
      console.error('Error details:', error.errors);
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid query parameters',
          details: error.errors?.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message,
          })) || [],
        },
      });
    }
  };
};

const validateParams = (schema: any) => {
  return (req: any, res: any, next: any) => {
    try {
      schema.parse(req.params);
      next();
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid parameters',
          details: error.errors?.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message,
          })) || [],
        },
      });
    }
  };
};

const validateBody = (schema: any) => {
  return (req: any, res: any, next: any) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request body',
          details: error.errors?.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message,
          })) || [],
        },
      });
    }
  };
};

// =====================================================
// PUBLIC ROUTES
// =====================================================

// Categories
router.get('/categories', lmsController.getCategories);

// Stats
router.get('/stats', lmsController.getStats);

// Courses (optional auth for enrollment status)
router.get(
  '/courses',
  optionalAuth,
  lmsController.getCourses
);

router.get(
  '/courses/:courseSlug',
  optionalAuth,
  validateParams(courseSlugParamSchema),
  lmsController.getCourseBySlug
);

// =====================================================
// PROTECTED ROUTES
// =====================================================

// Enrollment
router.post(
  '/courses/:courseSlug/enroll',
  authenticate,
  validateParams(courseSlugParamSchema),
  lmsController.enrollCourse
);

// Module Details
router.get(
  '/courses/:courseSlug/modules/:moduleOrder',
  authenticate,
  validateParams(moduleOrderParamSchema),
  lmsController.getModuleDetails
);

// Topic Details
router.get(
  '/courses/:courseSlug/modules/:moduleOrder/topics/:topicOrder',
  authenticate,
  validateParams(topicOrderParamSchema),
  lmsController.getTopicDetails
);

// Topic Progress
router.patch(
  '/courses/:courseSlug/modules/:moduleOrder/topics/:topicOrder/progress',
  authenticate,
  validateParams(topicOrderParamSchema),
  validateBody(updateTopicProgressSchema),
  lmsController.updateTopicProgress
);

// Module Test
router.post(
  '/courses/:courseSlug/modules/:moduleOrder/test/start',
  authenticate,
  validateParams(moduleOrderParamSchema),
  lmsController.startModuleTest
);

router.post(
  '/courses/:courseSlug/modules/:moduleOrder/test/submit',
  authenticate,
  validateParams(moduleOrderParamSchema),
  validateBody(submitTestSchema),
  lmsController.submitModuleTest
);

// Final Test
router.post(
  '/courses/:courseSlug/final-test/start',
  authenticate,
  validateParams(courseSlugParamSchema),
  lmsController.startFinalTest
);

router.post(
  '/courses/:courseSlug/final-test/submit',
  authenticate,
  validateParams(courseSlugParamSchema),
  validateBody(submitTestSchema),
  lmsController.submitFinalTest
);

// User Dashboard
router.get('/my-courses', authenticate, lmsController.getMyCourses);
router.get('/dashboard', authenticate, lmsController.getMyDashboard);

export default router;