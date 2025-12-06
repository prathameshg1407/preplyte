// src/module/practice/machine/machine.routes.ts

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

// Require Authentication for all machine endpoints
router.use(authenticate);

// Sessions
router.post('/sessions', validate(createSessionSchema), machineController.createSession);
router.get('/sessions', validate(listSessionsSchema), machineController.listSessions);
router.get('/sessions/:id', validate(sessionIdSchema), machineController.getSession);
router.get('/sessions/:id/questions', validate(sessionIdSchema), machineController.getSessionQuestions);
router.get('/sessions/:id/questions/:questionId', validate(questionIdSchema), machineController.getQuestion);

// Code Execution
router.post('/sessions/:sessionId/questions/:questionId/run', validate(runCodeSchema), machineController.runCode);
router.post('/sessions/:sessionId/questions/:questionId/submit', validate(submitCodeSchema), machineController.submitCode);

// Status + Results
router.get('/sessions/:id/status', validate(sessionIdSchema), machineController.getSessionStatus);
router.post('/sessions/:id/complete', validate(sessionIdSchema), machineController.completeSession);
router.get('/sessions/:id/results', validate(sessionIdSchema), machineController.getSessionResults);

// Submissions
router.get('/sessions/:sessionId/questions/:questionId/submissions', validate(submissionsListSchema), machineController.getSubmissionHistory);
router.get('/submissions/:id', validate(submissionIdSchema), machineController.getSubmissionDetails);

export default router;
