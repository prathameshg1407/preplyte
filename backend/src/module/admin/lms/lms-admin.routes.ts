import { Router } from 'express';
import { categoryController } from './category/category.controller';
import { courseController } from './course/course.controller';
import { moduleController } from './module/module.controller';
import { topicController } from './topic/topic.controller';
import { testController } from './test/test.controller';
import { questionController } from './test/question.controller';
import { analyticsController } from './analytics/analytics.controller';
import { authenticate, authorize } from '../../../middleware/auth.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);
router.use(authorize(UserRole.PLATFORM_ADMIN, UserRole.INSTITUTE_ADMIN));

// Analytics
router.get('/analytics/overview', analyticsController.getOverview);
router.get('/analytics/top-courses', analyticsController.getTopCourses);

// Categories
router.post('/categories', categoryController.create);
router.get('/categories', categoryController.findAll);
router.get('/categories/:id', categoryController.findOne);
router.patch('/categories/:id', categoryController.update);
router.delete('/categories/:id', categoryController.delete);

// Courses
router.post('/courses', courseController.create);
router.get('/courses', courseController.findAll);
router.get('/courses/:id', courseController.findOne);
router.patch('/courses/:id', courseController.update);
router.delete('/courses/:id', courseController.delete);

// Modules
router.post('/modules', moduleController.create);
router.get('/modules/:id', moduleController.findOne);
router.patch('/modules/:id', moduleController.update);
router.delete('/modules/:id', moduleController.delete);
router.get('/courses/:courseId/modules', moduleController.findByCourse);

// Topics
router.post('/topics', topicController.create);
router.get('/topics/:id', topicController.findOne);
router.patch('/topics/:id', topicController.update);
router.delete('/topics/:id', topicController.delete);
router.get('/modules/:moduleId/topics', topicController.findByModule);

// Tests
router.post('/tests/module', testController.createModuleTest);
router.get('/tests/module/:id', testController.getModuleTestById);
router.get('/modules/:moduleId/tests', testController.getModuleTestsByModule);
router.patch('/tests/module/:id', testController.updateModuleTest);
router.delete('/tests/module/:id', testController.deleteModuleTest);

router.post('/tests/final', testController.createFinalTest);
router.get('/tests/final/:id', testController.getFinalTestById);
router.get('/courses/:courseId/tests/final', testController.getFinalTestsByCourse);
router.patch('/tests/final/:id', testController.updateFinalTest);
router.delete('/tests/final/:id', testController.deleteFinalTest);

// Questions
router.post('/questions', questionController.create);
router.get('/questions/:id', questionController.getById);
router.patch('/questions/:id', questionController.update);
router.delete('/questions/:id', questionController.delete);

export default router;
