// src/module/practice/interview/interview.routes.ts

import { Router } from 'express';
import { interviewController } from './interview.controller';
import { authenticate } from '../../../middleware/auth.middleware';

const router = Router();

// =====================================================
// ALL ROUTES REQUIRE AUTHENTICATION
// =====================================================

router.use(authenticate);

// =====================================================
// SESSION ROUTES
// =====================================================

// POST /interview/sessions - Create new session
router.post('/sessions', interviewController.createSession);

// GET /interview/sessions - List user's sessions
router.get('/sessions', interviewController.listSessions);

// GET /interview/sessions/:sessionId - Get session
router.get('/sessions/:sessionId', interviewController.getSession);

// GET /interview/sessions/:sessionId/detail - Get session with details
router.get('/sessions/:sessionId/detail', interviewController.getSessionDetail);

// POST /interview/sessions/:sessionId/start - Start session
router.post('/sessions/:sessionId/start', interviewController.startSession);

// POST /interview/sessions/:sessionId/cancel - Cancel session
router.post('/sessions/:sessionId/cancel', interviewController.cancelSession);

// POST /interview/sessions/:sessionId/end - End session
router.post('/sessions/:sessionId/end', interviewController.endSession);

// =====================================================
// RESPONSE ROUTES
// =====================================================

// POST /interview/sessions/:sessionId/respond - Submit response
router.post('/sessions/:sessionId/respond', interviewController.submitResponse);

// =====================================================
// FEEDBACK ROUTES
// =====================================================

// GET /interview/sessions/:sessionId/feedback - Get feedback
router.get('/sessions/:sessionId/feedback', interviewController.getFeedback);

// POST /interview/sessions/:sessionId/feedback/regenerate - Regenerate feedback
router.post(
  '/sessions/:sessionId/feedback/regenerate',
  interviewController.regenerateFeedback
);

// =====================================================
// EXPORT
// =====================================================

export { router as interviewRoutes };
export default router;