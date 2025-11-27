// interview.router.ts

import { Router } from 'express';
import { InterviewController } from './interview.controller';
import { InterviewService } from './interview.service';
import { authenticate } from '../../../middleware/auth.middleware';
import { PrismaService } from '../../prisma/prisma.service';
import { ProfileService } from '../../profile/profile.service';

export function createInterviewRouter(
  prisma: PrismaService,
  profileService: ProfileService
): Router {
  const router = Router();
  const service = new InterviewService(prisma, profileService);
  const controller = new InterviewController(service);

  // All routes require authentication
  router.use(authenticate);

  // Session management
  router.post('/start', controller.startSession);
  router.get('/sessions', controller.getSessions);
  router.get('/stats', controller.getStats);

  // Active session operations
  router.get('/:sessionId', controller.getSession);
  router.post('/:sessionId/respond', controller.submitResponse);
  router.post('/:sessionId/end', controller.endSession);
  router.get('/:sessionId/feedback', controller.getFeedback);
  router.delete('/:sessionId', controller.deleteSession);

  return router;
}