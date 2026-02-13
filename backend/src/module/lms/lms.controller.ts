// src/module/lms/lms.controller.ts

import { Request, Response, NextFunction } from 'express';
import { lmsService } from './lms.service';
import { sendSuccess } from '../../utils/response';
import type {
  GetCoursesQuery,
  UpdateTopicProgressBody,
  SubmitTestBody,
} from './lms.types';

class LmsController {
  // Categories
  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await lmsService.getCategories();
      sendSuccess(res, categories, 'Categories fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  // Stats
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await lmsService.getStats();
      sendSuccess(res, stats, 'Stats fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  // Courses
  async getCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as GetCoursesQuery;
      const userId = req.user?.id;
      const result = await lmsService.getCourses(query, userId);
      sendSuccess(res, result, 'Courses fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  async getCourseBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseSlug } = req.params;
      const userId = req.user?.id;
      const result = await lmsService.getCourseBySlug(courseSlug, userId);
      sendSuccess(res, result, 'Course details fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  // Enrollment
  async enrollCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseSlug } = req.params;
      const userId = req.user!.id;
      const result = await lmsService.enrollCourse(courseSlug, userId);
      sendSuccess(res, result, result.message, 201);
    } catch (error) {
      next(error);
    }
  }

  // Module
  async getModuleDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseSlug, moduleOrder } = req.params;
      const userId = req.user!.id;
      const result = await lmsService.getModuleDetails(
        courseSlug,
        parseInt(moduleOrder),
        userId
      );
      sendSuccess(res, result, 'Module details fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  // Topic
  async getTopicDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseSlug, moduleOrder, topicOrder } = req.params;
      const userId = req.user!.id;
      const result = await lmsService.getTopicDetails(
        courseSlug,
        parseInt(moduleOrder),
        parseInt(topicOrder),
        userId
      );
      sendSuccess(res, result, 'Topic details fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateTopicProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseSlug, moduleOrder, topicOrder } = req.params;
      const userId = req.user!.id;
      const data = req.body as UpdateTopicProgressBody;
      const result = await lmsService.updateTopicProgress(
        courseSlug,
        parseInt(moduleOrder),
        parseInt(topicOrder),
        userId,
        data
      );
      sendSuccess(res, result, 'Progress updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // Module Test
  async startModuleTest(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseSlug, moduleOrder } = req.params;
      const userId = req.user!.id;
      const result = await lmsService.startModuleTest(
        courseSlug,
        parseInt(moduleOrder),
        userId
      );
      sendSuccess(res, result, 'Test started successfully');
    } catch (error) {
      next(error);
    }
  }

  async submitModuleTest(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseSlug, moduleOrder } = req.params;
      const userId = req.user!.id;
      const data = req.body as SubmitTestBody;
      const result = await lmsService.submitModuleTest(
        courseSlug,
        parseInt(moduleOrder),
        userId,
        data
      );
      sendSuccess(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  // Final Test
  async startFinalTest(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseSlug } = req.params;
      const userId = req.user!.id;
      const result = await lmsService.startFinalTest(courseSlug, userId);
      sendSuccess(res, result, 'Final test started successfully');
    } catch (error) {
      next(error);
    }
  }

  async submitFinalTest(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseSlug } = req.params;
      const userId = req.user!.id;
      const data = req.body as SubmitTestBody;
      const result = await lmsService.submitFinalTest(courseSlug, userId, data);
      sendSuccess(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  // User Dashboard
  async getMyCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await lmsService.getMyCourses(userId);
      sendSuccess(res, result, 'Enrollments fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMyDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await lmsService.getMyDashboard(userId);
      sendSuccess(res, result, 'Dashboard fetched successfully');
    } catch (error) {
      next(error);
    }
  }
  async addCourseFeedback(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseSlug } = req.params;
      const userId = req.user!.id;
      const data = req.body;
      const result = await lmsService.addCourseFeedback(courseSlug, userId, data);
      sendSuccess(res, result, 'Feedback added successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const lmsController = new LmsController();