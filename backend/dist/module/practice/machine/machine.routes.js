"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const machine_controller_1 = require("./machine.controller");
const auth_middleware_1 = require("../../../middleware/auth.middleware");
const validate_middleware_1 = require("../../../middleware/validate.middleware");
const machine_validation_1 = require("./machine.validation");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// Session management
router.post('/sessions', (0, validate_middleware_1.validate)(machine_validation_1.createSessionSchema), machine_controller_1.machineController.createSession.bind(machine_controller_1.machineController));
router.get('/sessions', (0, validate_middleware_1.validate)(machine_validation_1.listSessionsSchema), machine_controller_1.machineController.listSessions.bind(machine_controller_1.machineController));
router.get('/sessions/:id', (0, validate_middleware_1.validate)(machine_validation_1.sessionIdSchema), machine_controller_1.machineController.getSession.bind(machine_controller_1.machineController));
router.get('/sessions/:id/questions', (0, validate_middleware_1.validate)(machine_validation_1.sessionIdSchema), machine_controller_1.machineController.getSessionQuestions.bind(machine_controller_1.machineController));
router.get('/sessions/:id/questions/:questionId', (0, validate_middleware_1.validate)(machine_validation_1.questionIdSchema), machine_controller_1.machineController.getQuestion.bind(machine_controller_1.machineController));
// Code execution
router.post('/sessions/:sessionId/questions/:questionId/run', (0, validate_middleware_1.validate)(machine_validation_1.runCodeSchema), machine_controller_1.machineController.runCode.bind(machine_controller_1.machineController));
router.post('/sessions/:sessionId/questions/:questionId/submit', (0, validate_middleware_1.validate)(machine_validation_1.submitCodeSchema), machine_controller_1.machineController.submitCode.bind(machine_controller_1.machineController));
// Session control & results
router.get('/sessions/:id/status', (0, validate_middleware_1.validate)(machine_validation_1.sessionIdSchema), machine_controller_1.machineController.getSessionStatus.bind(machine_controller_1.machineController));
router.post('/sessions/:id/complete', (0, validate_middleware_1.validate)(machine_validation_1.sessionIdSchema), machine_controller_1.machineController.completeSession.bind(machine_controller_1.machineController));
router.get('/sessions/:id/results', (0, validate_middleware_1.validate)(machine_validation_1.sessionIdSchema), machine_controller_1.machineController.getSessionResults.bind(machine_controller_1.machineController));
// Submissions
router.get('/sessions/:sessionId/questions/:questionId/submissions', (0, validate_middleware_1.validate)(machine_validation_1.submissionsListSchema), machine_controller_1.machineController.getSubmissionHistory.bind(machine_controller_1.machineController));
router.get('/submissions/:id', (0, validate_middleware_1.validate)(machine_validation_1.submissionIdSchema), machine_controller_1.machineController.getSubmissionDetails.bind(machine_controller_1.machineController));
exports.default = router;
//# sourceMappingURL=machine.routes.js.map