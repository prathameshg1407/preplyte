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

// All routes require authentication
router.use(authenticate);

// Session management
router.post(
  '/sessions',
  validate(createSessionSchema),
  aptitudeController.createSession.bind(aptitudeController)
);

router.get(
  '/sessions',
  validate(listSessionsSchema),
  aptitudeController.listSessions.bind(aptitudeController)
);

router.get(
  '/sessions/:id',
  validate(sessionIdSchema),
  aptitudeController.getSession.bind(aptitudeController)
);

// Questions
router.get(
  '/sessions/:id/questions',
  validate(sessionIdSchema),
  aptitudeController.getSessionQuestions.bind(aptitudeController)
);

router.get(
  '/sessions/:id/questions/:questionId',
  validate(questionIdSchema),
  aptitudeController.getQuestion.bind(aptitudeController)
);

// Test taking
router.post(
  '/sessions/:id/answer',
  validate(saveAnswerSchema),
  aptitudeController.saveAnswer.bind(aptitudeController)
);

router.post(
  '/sessions/:id/submit',
  validate(sessionIdSchema),
  aptitudeController.submitSession.bind(aptitudeController)
);

// Status & Results
router.get(
  '/sessions/:id/status',
  validate(sessionIdSchema),
  aptitudeController.getSessionStatus.bind(aptitudeController)
);

router.get(
  '/sessions/:id/results',
  validate(sessionIdSchema),
  aptitudeController.getSessionResults.bind(aptitudeController)
);

router.get(
  '/sessions/:id/solutions',
  validate(solutionsFilterSchema),
  aptitudeController.getSolutions.bind(aptitudeController)
);

export default router;