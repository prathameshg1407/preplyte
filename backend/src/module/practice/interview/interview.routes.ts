import { Router } from 'express';
import { InterviewController } from './interview.controller';
import { InterviewService } from './interview.service';
import { authenticate } from '../../../middleware/auth.middleware'; // Updated import
import { PrismaService } from '../../prisma/prisma.service';
import { ProfileService } from '../../profile/profile.service';

export const createInterviewRouter = (
  prismaService: PrismaService,
  profileService: ProfileService
): Router => {
  const router = Router();

  // Initialize service and controller
  const interviewService = new InterviewService(prismaService, profileService);
  const interviewController = new InterviewController(interviewService);

  // Apply authentication middleware to all routes
  router.use(authenticate);

  // ============= Static Routes (Must come BEFORE parameterized routes) =============

  /**
   * @route   GET /practice/ai-interview/test-tts
   * @desc    Test TTS Configuration (Debug endpoint)
   * @access  Private
   */
  router.get('/test-tts', interviewController.testTTS);

  /**
   * @route   GET /practice/ai-interview/stats
   * @desc    Get user session statistics
   * @access  Private
   */
  router.get('/stats', interviewController.getUserSessionStats);

  /**
   * @route   GET /practice/ai-interview/sessions
   * @desc    Get all user interview sessions
   * @access  Private
   */
  router.get('/sessions', interviewController.getUserSessions);

  /**
   * @route   POST /practice/ai-interview/start
   * @desc    Start new AI interview session
   * @access  Private
   */
  router.post('/start', interviewController.startInterviewSession);

  // ============= Parameterized Routes (Must come AFTER static routes) =============

  /**
   * @route   GET /practice/ai-interview/:sessionId
   * @desc    Get interview session state
   * @access  Private
   */
  router.get('/:sessionId', interviewController.getInterviewSession);

  /**
   * @route   GET /practice/ai-interview/:sessionId/next
   * @desc    Get next interview question
   * @access  Private
   */
  router.get('/:sessionId/next', interviewController.getNextQuestion);

  /**
   * @route   GET /practice/ai-interview/:sessionId/feedback
   * @desc    Get comprehensive interview feedback
   * @access  Private
   */
  router.get('/:sessionId/feedback', interviewController.getInterviewFeedback);

  /**
   * @route   POST /practice/ai-interview/:sessionId/answer
   * @desc    Submit answer to interview question
   * @access  Private
   */
  router.post('/:sessionId/answer', interviewController.submitAnswer);

  /**
   * @route   POST /practice/ai-interview/:sessionId/cancel
   * @desc    Cancel interview session
   * @access  Private
   */
  router.post('/:sessionId/cancel', interviewController.cancelSession);

  /**
   * @route   DELETE /practice/ai-interview/:sessionId
   * @desc    Delete interview session
   * @access  Private
   */
  router.delete('/:sessionId', interviewController.deleteSession);

  return router;
};

// Export default router factory
export default createInterviewRouter;