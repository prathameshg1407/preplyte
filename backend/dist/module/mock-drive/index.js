"use strict";
// src/module/mock-drive/index.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMockDriveRoutes = createMockDriveRoutes;
exports.default = createMockDriveRoutes;
const express_1 = require("express");
// Discovery
const discovery_service_1 = require("./discovery/discovery.service");
const discovery_controller_1 = require("./discovery/discovery.controller");
const discovery_validation_1 = require("./discovery/discovery.validation");
// Attempt
const attempt_service_1 = require("./attempt/attempt.service");
const attempt_controller_1 = require("./attempt/attempt.controller");
const attempt_validation_1 = require("./attempt/attempt.validation");
// Results
const results_service_1 = require("./results/results.service");
const results_controller_1 = require("./results/results.controller");
// Leaderboard
const leaderboard_service_1 = require("./leaderboard/leaderboard.service");
const leaderboard_controller_1 = require("./leaderboard/leaderboard.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
function createMockDriveRoutes(prisma) {
    const router = (0, express_1.Router)();
    // Initialize services
    const discoveryService = new discovery_service_1.DiscoveryService(prisma);
    const attemptService = new attempt_service_1.AttemptService(prisma);
    const resultsService = new results_service_1.ResultsService(prisma);
    const leaderboardService = new leaderboard_service_1.LeaderboardService(prisma);
    // Initialize controllers
    const discoveryController = new discovery_controller_1.DiscoveryController(discoveryService);
    const attemptController = new attempt_controller_1.AttemptController(attemptService);
    const resultsController = new results_controller_1.ResultsController(resultsService);
    const leaderboardController = new leaderboard_controller_1.LeaderboardController(leaderboardService);
    // All routes require authentication and USER role
    router.use(auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('USER', 'INSTITUTE_ADMIN', 'PLATFORM_ADMIN'));
    // =====================================================
    // DISCOVERY & REGISTRATION ROUTES
    // =====================================================
    // List available mock drives
    router.get('/', (0, validate_middleware_1.validate)(discovery_validation_1.discoveryListSchema), discoveryController.listAvailableDrives);
    // Get my registrations
    router.get('/my-registrations', discoveryController.getMyRegistrations);
    // Get mock drive details
    router.get('/:driveId', (0, validate_middleware_1.validate)(discovery_validation_1.mockDriveIdSchema), discoveryController.getDriveDetails);
    // Check eligibility
    router.get('/:driveId/eligibility', (0, validate_middleware_1.validate)(discovery_validation_1.mockDriveIdSchema), discoveryController.checkEligibility);
    // Register for mock drive
    router.post('/:driveId/register', (0, validate_middleware_1.validate)(discovery_validation_1.mockDriveIdSchema), discoveryController.register);
    // Withdraw registration
    router.delete('/:driveId/register', (0, validate_middleware_1.validate)(discovery_validation_1.mockDriveIdSchema), discoveryController.withdrawRegistration);
    // =====================================================
    // ATTEMPT ROUTES
    // =====================================================
    // Get my attempt state
    router.get('/:driveId/attempt', (0, validate_middleware_1.validate)(attempt_validation_1.mockDriveIdSchema), attemptController.getAttemptState);
    // Start mock drive attempt
    router.post('/:driveId/start', (0, validate_middleware_1.validate)(attempt_validation_1.mockDriveIdSchema), attemptController.startAttempt);
    // Start a specific module
    router.post('/:driveId/modules/:moduleId/start', (0, validate_middleware_1.validate)(attempt_validation_1.moduleIdSchema), attemptController.startModule);
    // Submit a module
    router.post('/:driveId/modules/:moduleId/submit', (0, validate_middleware_1.validate)(attempt_validation_1.moduleIdSchema), attemptController.submitModule);
    // Aptitude module actions
    router.post('/:driveId/modules/:moduleId/aptitude/answer', (0, validate_middleware_1.validate)(attempt_validation_1.aptitudeAnswerSchema), attemptController.submitAptitudeAnswer);
    router.post('/:driveId/modules/:moduleId/aptitude/clear', (0, validate_middleware_1.validate)(attempt_validation_1.aptitudeClearSchema), attemptController.clearAptitudeAnswer);
    // Machine coding module actions
    router.post('/:driveId/modules/:moduleId/machine/submit', (0, validate_middleware_1.validate)(attempt_validation_1.machineSubmitSchema), attemptController.submitMachineCode);
    // AI Interview module actions
    router.post('/:driveId/modules/:moduleId/interview/respond', (0, validate_middleware_1.validate)(attempt_validation_1.interviewRespondSchema), attemptController.submitInterviewResponse);
    router.post('/:driveId/modules/:moduleId/interview/skip', (0, validate_middleware_1.validate)(attempt_validation_1.interviewSkipSchema), attemptController.skipInterviewQuestion);
    // =====================================================
    // RESULTS ROUTES
    // =====================================================
    // Get my result overview
    router.get('/:driveId/result', (0, validate_middleware_1.validate)(discovery_validation_1.mockDriveIdSchema), resultsController.getResultOverview);
    // Get my detailed report
    router.get('/:driveId/report', (0, validate_middleware_1.validate)(discovery_validation_1.mockDriveIdSchema), resultsController.getDetailedReport);
    // =====================================================
    // LEADERBOARD ROUTES
    // =====================================================
    // Get leaderboard
    router.get('/:driveId/leaderboard', (0, validate_middleware_1.validate)(discovery_validation_1.mockDriveIdSchema), leaderboardController.getLeaderboard);
    // Get my rank
    router.get('/:driveId/leaderboard/my-rank', (0, validate_middleware_1.validate)(discovery_validation_1.mockDriveIdSchema), leaderboardController.getMyRank);
    return router;
}
//# sourceMappingURL=index.js.map