import { Router } from 'express';
import { aptitudeController } from './aptitude.controller';
import { authenticate } from '../../../middleware/auth.middleware';
import { validate } from '../../../middleware/validate.middleware';
import {
  createSessionSchema,
  listSessionsSchema,
  saveAnswerSchema,
  sessionIdSchema,
  questionIdSchema,
  solutionsFilterSchema,
} from './aptitude.validation';

const router = Router();

// Require auth for all aptitude routes
router.use(authenticate);

// =====================================================
// SESSION MANAGEMENT
// =====================================================
router.post('/sessions', validate(createSessionSchema), aptitudeController.createSession);
router.get('/sessions', validate(listSessionsSchema), aptitudeController.listSessions);
router.get('/sessions/:id', validate(sessionIdSchema), aptitudeController.getSession);

// =====================================================
// QUESTIONS
// =====================================================
router.get('/sessions/:id/questions', validate(sessionIdSchema), aptitudeController.getSessionQuestions);
router.get('/sessions/:id/questions/:questionId', validate(questionIdSchema), aptitudeController.getQuestion);

// =====================================================
// TEST TAKING
// =====================================================
router.post('/sessions/:id/answer', validate(saveAnswerSchema), aptitudeController.saveAnswer);
router.post('/sessions/:id/submit', validate(sessionIdSchema), aptitudeController.submitSession);

// =====================================================
// STATUS & RESULTS
// =====================================================
router.get('/sessions/:id/status', validate(sessionIdSchema), aptitudeController.getSessionStatus);
router.get('/sessions/:id/results', validate(sessionIdSchema), aptitudeController.getSessionResults);
router.get('/sessions/:id/solutions', validate(solutionsFilterSchema), aptitudeController.getSolutions);

export default router;
