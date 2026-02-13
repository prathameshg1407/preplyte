import { Router } from 'express';
import { categoryController } from './category/category.controller';
import { courseController } from './course/course.controller';
import { moduleController } from './module/module.controller';
import { topicController } from './topic/topic.controller';
import { testController } from './test/test.controller';
import { questionController } from './test/question.controller';
import { analyticsController } from './analytics/analytics.controller';
import { authenticate, authorize } from '../../../middleware/auth.middleware';
import { validateBody } from '../../../middleware/validate.middleware';
import { UserRole } from '@prisma/client';

// Schemas
import { createCategorySchema, updateCategorySchema } from './category/category.validation';
import { createCourseSchema, updateCourseSchema } from './course/course.validation';
import { createModuleSchema, updateModuleSchema } from './module/module.validation';
import { createTopicSchema, updateTopicSchema } from './topic/topic.validation';
import {
    CreateModuleTestDtoSchema,
    UpdateModuleTestDtoSchema,
    CreateFinalTestDtoSchema,
    UpdateFinalTestDtoSchema
} from './test/test.validation';
import { createQuestionSchema, updateQuestionSchema } from './test/question.validation';

const router = Router();

router.use(authenticate);
router.use(authorize(UserRole.PLATFORM_ADMIN, UserRole.INSTITUTE_ADMIN));

// Analytics
router.get('/analytics/overview', analyticsController.getOverview);
router.get('/analytics/top-courses', analyticsController.getTopCourses);

// Categories
router.post('/categories', validateBody(createCategorySchema), categoryController.create);
router.get('/categories', categoryController.findAll);
router.get('/categories/:id', categoryController.findOne);
router.patch('/categories/:id', validateBody(updateCategorySchema), categoryController.update);
router.delete('/categories/:id', categoryController.delete);

// Courses
router.post('/courses', validateBody(createCourseSchema), courseController.create);
router.get('/courses', courseController.findAll);
router.get('/courses/:id', courseController.findOne);
router.patch('/courses/:id', validateBody(updateCourseSchema), courseController.update);
router.delete('/courses/:id', courseController.delete);

// Modules
router.post('/modules', validateBody(createModuleSchema), moduleController.create);
router.get('/modules/:id', moduleController.findOne);
router.patch('/modules/:id', validateBody(updateModuleSchema), moduleController.update);
router.delete('/modules/:id', moduleController.delete);
router.get('/courses/:courseId/modules', moduleController.findByCourse);

// Topics
router.post('/topics', validateBody(createTopicSchema), topicController.create);
router.get('/topics/:id', topicController.findOne);
router.patch('/topics/:id', validateBody(updateTopicSchema), topicController.update);
router.delete('/topics/:id', topicController.delete);
router.get('/modules/:moduleId/topics', topicController.findByModule);

// Tests
router.post('/tests/module', validateBody(CreateModuleTestDtoSchema), testController.createModuleTest);
router.get('/tests/module/:id', testController.getModuleTestById);
router.get('/modules/:moduleId/tests', testController.getModuleTestsByModule);
router.patch('/tests/module/:id', validateBody(UpdateModuleTestDtoSchema), testController.updateModuleTest);
router.delete('/tests/module/:id', testController.deleteModuleTest);

router.post('/tests/final', validateBody(CreateFinalTestDtoSchema), testController.createFinalTest);
router.get('/tests/final/:id', testController.getFinalTestById);
router.get('/courses/:courseId/tests/final', testController.getFinalTestsByCourse);
router.patch('/tests/final/:id', validateBody(UpdateFinalTestDtoSchema), testController.updateFinalTest);
router.delete('/tests/final/:id', testController.deleteFinalTest);

// Questions
router.post('/questions', validateBody(createQuestionSchema), questionController.create);
router.get('/questions/:id', questionController.getById);
router.patch('/questions/:id', validateBody(updateQuestionSchema), questionController.update);
router.delete('/questions/:id', questionController.delete);

export default router;
