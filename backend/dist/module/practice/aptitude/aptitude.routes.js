"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const aptitude_controller_1 = require("./aptitude.controller");
const auth_middleware_1 = require("../../../middleware/auth.middleware");
const validate_middleware_1 = require("../../../middleware/validate.middleware");
const aptitude_validation_1 = require("./aptitude.validation");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
// Session management
router.post('/sessions', (0, validate_middleware_1.validate)(aptitude_validation_1.createSessionSchema), aptitude_controller_1.aptitudeController.createSession.bind(aptitude_controller_1.aptitudeController));
router.get('/sessions', (0, validate_middleware_1.validate)(aptitude_validation_1.listSessionsSchema), aptitude_controller_1.aptitudeController.listSessions.bind(aptitude_controller_1.aptitudeController));
router.get('/sessions/:id', (0, validate_middleware_1.validate)(aptitude_validation_1.sessionIdSchema), aptitude_controller_1.aptitudeController.getSession.bind(aptitude_controller_1.aptitudeController));
// Questions
router.get('/sessions/:id/questions', (0, validate_middleware_1.validate)(aptitude_validation_1.sessionIdSchema), aptitude_controller_1.aptitudeController.getSessionQuestions.bind(aptitude_controller_1.aptitudeController));
router.get('/sessions/:id/questions/:questionId', (0, validate_middleware_1.validate)(aptitude_validation_1.questionIdSchema), aptitude_controller_1.aptitudeController.getQuestion.bind(aptitude_controller_1.aptitudeController));
// Test taking
router.post('/sessions/:id/answer', (0, validate_middleware_1.validate)(aptitude_validation_1.saveAnswerSchema), aptitude_controller_1.aptitudeController.saveAnswer.bind(aptitude_controller_1.aptitudeController));
router.post('/sessions/:id/submit', (0, validate_middleware_1.validate)(aptitude_validation_1.sessionIdSchema), aptitude_controller_1.aptitudeController.submitSession.bind(aptitude_controller_1.aptitudeController));
// Status & Results
router.get('/sessions/:id/status', (0, validate_middleware_1.validate)(aptitude_validation_1.sessionIdSchema), aptitude_controller_1.aptitudeController.getSessionStatus.bind(aptitude_controller_1.aptitudeController));
router.get('/sessions/:id/results', (0, validate_middleware_1.validate)(aptitude_validation_1.sessionIdSchema), aptitude_controller_1.aptitudeController.getSessionResults.bind(aptitude_controller_1.aptitudeController));
router.get('/sessions/:id/solutions', (0, validate_middleware_1.validate)(aptitude_validation_1.solutionsFilterSchema), aptitude_controller_1.aptitudeController.getSolutions.bind(aptitude_controller_1.aptitudeController));
exports.default = router;
//# sourceMappingURL=aptitude.routes.js.map