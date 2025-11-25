import { Router } from 'express';
import { machineController } from './machine.controller';
import { authenticate } from '../../../middleware/auth.middleware';
import { validate } from '../../../middleware/validate.middleware';
import {
  createSessionSchema,
  listSessionsSchema,
  sessionIdSchema,
  questionIdSchema,
  runCodeSchema,
  submitCodeSchema,
  submissionsListSchema,
  submissionIdSchema,
} from './machine.validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Session management
router.post(
  '/sessions',
  validate(createSessionSchema),
  machineController.createSession.bind(machineController)
);

router.get(
  '/sessions',
  validate(listSessionsSchema),
  machineController.listSessions.bind(machineController)
);

router.get(
  '/sessions/:id',
  validate(sessionIdSchema),
  machineController.getSession.bind(machineController)
);

router.get(
  '/sessions/:id/questions',
  validate(sessionIdSchema),
  machineController.getSessionQuestions.bind(machineController)
);

router.get(
  '/sessions/:id/questions/:questionId',
  validate(questionIdSchema),
  machineController.getQuestion.bind(machineController)
);

// Code execution
router.post(
  '/sessions/:sessionId/questions/:questionId/run',
  validate(runCodeSchema),
  machineController.runCode.bind(machineController)
);

router.post(
  '/sessions/:sessionId/questions/:questionId/submit',
  validate(submitCodeSchema),
  machineController.submitCode.bind(machineController)
);

// Session control
router.get(
  '/sessions/:id/status',
  validate(sessionIdSchema),
  machineController.getSessionStatus.bind(machineController)
);

router.post(
  '/sessions/:id/complete',
  validate(sessionIdSchema),
  machineController.completeSession.bind(machineController)
);

// Results
router.get(
  '/sessions/:id/results',
  validate(sessionIdSchema),
  machineController.getSessionResults.bind(machineController)
);

// Submissions
router.get(
  '/sessions/:sessionId/questions/:questionId/submissions',
  validate(submissionsListSchema),
  machineController.getSubmissionHistory.bind(machineController)
);

router.get(
  '/submissions/:id',
  validate(submissionIdSchema),
  machineController.getSubmissionDetails.bind(machineController)
);

export default router;