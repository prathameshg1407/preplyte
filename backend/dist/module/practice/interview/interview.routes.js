"use strict";
// src/module/practice/interview/interview.routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.interviewRoutes = void 0;
const express_1 = require("express");
const interview_controller_1 = require("./interview.controller");
const auth_middleware_1 = require("../../../middleware/auth.middleware");
const router = (0, express_1.Router)();
exports.interviewRoutes = router;
// =====================================================
// ALL ROUTES REQUIRE AUTHENTICATION
// =====================================================
router.use(auth_middleware_1.authenticate);
// =====================================================
// SESSION ROUTES
// =====================================================
// POST /interview/sessions - Create new session
router.post('/sessions', interview_controller_1.interviewController.createSession);
// GET /interview/sessions - List user's sessions
router.get('/sessions', interview_controller_1.interviewController.listSessions);
// GET /interview/sessions/:sessionId - Get session
router.get('/sessions/:sessionId', interview_controller_1.interviewController.getSession);
// GET /interview/sessions/:sessionId/detail - Get session with details
router.get('/sessions/:sessionId/detail', interview_controller_1.interviewController.getSessionDetail);
// POST /interview/sessions/:sessionId/start - Start session
router.post('/sessions/:sessionId/start', interview_controller_1.interviewController.startSession);
// POST /interview/sessions/:sessionId/cancel - Cancel session
router.post('/sessions/:sessionId/cancel', interview_controller_1.interviewController.cancelSession);
// POST /interview/sessions/:sessionId/end - End session
router.post('/sessions/:sessionId/end', interview_controller_1.interviewController.endSession);
// =====================================================
// RESPONSE ROUTES
// =====================================================
// POST /interview/sessions/:sessionId/respond - Submit response
router.post('/sessions/:sessionId/respond', interview_controller_1.interviewController.submitResponse);
// =====================================================
// FEEDBACK ROUTES
// =====================================================
// GET /interview/sessions/:sessionId/feedback - Get feedback
router.get('/sessions/:sessionId/feedback', interview_controller_1.interviewController.getFeedback);
// POST /interview/sessions/:sessionId/feedback/regenerate - Regenerate feedback
router.post('/sessions/:sessionId/feedback/regenerate', interview_controller_1.interviewController.regenerateFeedback);
exports.default = router;
//# sourceMappingURL=interview.routes.js.map