"use strict";
// src/module/practice/machine/machine.routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const machine_controller_1 = require("./machine.controller");
const auth_middleware_1 = require("../../../middleware/auth.middleware");
const validate_middleware_1 = require("../../../middleware/validate.middleware");
const machine_validation_1 = require("./machine.validation");
const router = (0, express_1.Router)();
// Require Authentication for all machine endpoints
router.use(auth_middleware_1.authenticate);
// Sessions
router.post('/sessions', (0, validate_middleware_1.validate)(machine_validation_1.createSessionSchema), machine_controller_1.machineController.createSession);
router.get('/sessions', (0, validate_middleware_1.validate)(machine_validation_1.listSessionsSchema), machine_controller_1.machineController.listSessions);
router.get('/sessions/:id', (0, validate_middleware_1.validate)(machine_validation_1.sessionIdSchema), machine_controller_1.machineController.getSession);
router.get('/sessions/:id/questions', (0, validate_middleware_1.validate)(machine_validation_1.sessionIdSchema), machine_controller_1.machineController.getSessionQuestions);
router.get('/sessions/:id/questions/:questionId', (0, validate_middleware_1.validate)(machine_validation_1.questionIdSchema), machine_controller_1.machineController.getQuestion);
// Code Execution
router.post('/sessions/:sessionId/questions/:questionId/run', (0, validate_middleware_1.validate)(machine_validation_1.runCodeSchema), machine_controller_1.machineController.runCode);
router.post('/sessions/:sessionId/questions/:questionId/submit', (0, validate_middleware_1.validate)(machine_validation_1.submitCodeSchema), machine_controller_1.machineController.submitCode);
// Status + Results
router.get('/sessions/:id/status', (0, validate_middleware_1.validate)(machine_validation_1.sessionIdSchema), machine_controller_1.machineController.getSessionStatus);
router.post('/sessions/:id/complete', (0, validate_middleware_1.validate)(machine_validation_1.sessionIdSchema), machine_controller_1.machineController.completeSession);
router.get('/sessions/:id/results', (0, validate_middleware_1.validate)(machine_validation_1.sessionIdSchema), machine_controller_1.machineController.getSessionResults);
// Submissions
router.get('/sessions/:sessionId/questions/:questionId/submissions', (0, validate_middleware_1.validate)(machine_validation_1.submissionsListSchema), machine_controller_1.machineController.getSubmissionHistory);
router.get('/submissions/:id', (0, validate_middleware_1.validate)(machine_validation_1.submissionIdSchema), machine_controller_1.machineController.getSubmissionDetails);
exports.default = router;
//# sourceMappingURL=machine.routes.js.map