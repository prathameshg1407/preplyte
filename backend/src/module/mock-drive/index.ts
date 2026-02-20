// src/module/mock-drive/index.ts

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

// Discovery
import { DiscoveryService } from './discovery/discovery.service';
import { DiscoveryController } from './discovery/discovery.controller';
import { discoveryListSchema, mockDriveIdSchema } from './discovery/discovery.validation';

// Attempt
import { AttemptService } from './attempt/attempt.service';
import { AttemptController } from './attempt/attempt.controller';
import {
  mockDriveIdSchema as attemptDriveIdSchema,
  moduleIdSchema,
  aptitudeAnswerSchema,
  aptitudeClearSchema,
  machineSubmitSchema,
  machineRunSchema,
  interviewRespondSchema,
  interviewSkipSchema,
} from './attempt/attempt.validation';

// Results
import { ResultsService } from './results/results.service';
import { ResultsController } from './results/results.controller';

// Leaderboard
import { LeaderboardService } from './leaderboard/leaderboard.service';
import { LeaderboardController } from './leaderboard/leaderboard.controller';

import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';

export function createMockDriveRoutes(prisma: PrismaClient): Router {
  const router = Router();

  // Initialize services
  const discoveryService = new DiscoveryService(prisma);
  const attemptService = new AttemptService(prisma);
  const resultsService = new ResultsService(prisma);
  const leaderboardService = new LeaderboardService(prisma);

  // Initialize controllers
  const discoveryController = new DiscoveryController(discoveryService);
  const attemptController = new AttemptController(attemptService);
  const resultsController = new ResultsController(resultsService);
  const leaderboardController = new LeaderboardController(leaderboardService);

  // All routes require authentication and USER role
  router.use(authenticate, authorize('USER', 'INSTITUTE_ADMIN', 'PLATFORM_ADMIN'));
  // =====================================================
  // DISCOVERY & REGISTRATION ROUTES
  // =====================================================

  // List available mock drives
  router.get('/', validate(discoveryListSchema), discoveryController.listAvailableDrives);

  // Get my registrations
  router.get('/my-registrations', discoveryController.getMyRegistrations);

  // Get mock drive details
  router.get('/:driveId', validate(mockDriveIdSchema), discoveryController.getDriveDetails);

  // Check eligibility
  router.get(
    '/:driveId/eligibility',
    validate(mockDriveIdSchema),
    discoveryController.checkEligibility
  );

  // Register for mock drive
  router.post('/:driveId/register', validate(mockDriveIdSchema), discoveryController.register);

  // Withdraw registration
  router.delete(
    '/:driveId/register',
    validate(mockDriveIdSchema),
    discoveryController.withdrawRegistration
  );

  // =====================================================
  // ATTEMPT ROUTES
  // =====================================================

  // Get my attempt state
  router.get(
    '/:driveId/attempt',
    validate(attemptDriveIdSchema),
    attemptController.getAttemptState
  );

  // Start mock drive attempt
  router.post('/:driveId/start', validate(attemptDriveIdSchema), attemptController.startAttempt);

  // Submit/End mock drive attempt
  router.post('/:driveId/submit', validate(attemptDriveIdSchema), attemptController.submitAttempt);

  // Start a specific module
  router.post(
    '/:driveId/modules/:moduleId/start',
    validate(moduleIdSchema),
    attemptController.startModule
  );

  // Submit a module
  router.post(
    '/:driveId/modules/:moduleId/submit',
    validate(moduleIdSchema),
    attemptController.submitModule
  );

  // Aptitude module actions
  router.post(
    '/:driveId/modules/:moduleId/aptitude/answer',
    validate(aptitudeAnswerSchema),
    attemptController.submitAptitudeAnswer
  );

  router.post(
    '/:driveId/modules/:moduleId/aptitude/clear',
    validate(aptitudeClearSchema),
    attemptController.clearAptitudeAnswer
  );

  // Machine coding module actions
  router.post(
    '/:driveId/modules/:moduleId/machine/run',
    validate(machineRunSchema),
    attemptController.runMachineCode
  );

  router.post(
    '/:driveId/modules/:moduleId/machine/submit',
    validate(machineSubmitSchema),
    attemptController.submitMachineCode
  );

  // AI Interview module actions
  router.post(
    '/:driveId/modules/:moduleId/interview/respond',
    validate(interviewRespondSchema),
    attemptController.submitInterviewResponse
  );

  router.post(
    '/:driveId/modules/:moduleId/interview/skip',
    validate(interviewSkipSchema),
    attemptController.skipInterviewQuestion
  );

  router.post(
    '/:driveId/modules/:moduleId/interview/next',
    validate(moduleIdSchema),
    attemptController.getNextInterviewQuestion
  );

  router.post(
    '/:driveId/modules/:moduleId/interview/voice/start',
    validate(moduleIdSchema),
    attemptController.startVoiceMode
  );

  router.post(
    '/:driveId/modules/:moduleId/interview/audio-question',
    validate(moduleIdSchema),
    attemptController.getAudioQuestion
  );

  // =====================================================
  // RESULTS ROUTES
  // =====================================================

  // Get my result overview
  router.get('/:driveId/result', validate(mockDriveIdSchema), resultsController.getResultOverview);

  // Get my detailed report
  router.get('/:driveId/report', validate(mockDriveIdSchema), resultsController.getDetailedReport);

  // =====================================================
  // LEADERBOARD ROUTES
  // =====================================================

  // Get leaderboard
  router.get('/:driveId/leaderboard', validate(mockDriveIdSchema), leaderboardController.getLeaderboard);

  // Get my rank
  router.get('/:driveId/leaderboard/my-rank', validate(mockDriveIdSchema), leaderboardController.getMyRank);

  return router;
}

// Export for use in app.ts
export { createMockDriveRoutes as default };