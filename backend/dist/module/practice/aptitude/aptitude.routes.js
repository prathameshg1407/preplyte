"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const aptitude_controller_1 = require("./aptitude.controller");
const auth_middleware_1 = require("../../../middleware/auth.middleware");
const validate_middleware_1 = require("../../../middleware/validate.middleware");
const aptitude_validation_1 = require("./aptitude.validation");
const router = (0, express_1.Router)();
// Require auth for all aptitude routes
router.use(auth_middleware_1.authenticate);
// =====================================================
// SESSION MANAGEMENT
// =====================================================
router.post('/sessions', (0, validate_middleware_1.validate)(aptitude_validation_1.createSessionSchema), aptitude_controller_1.aptitudeController.createSession);
router.get('/sessions', (0, validate_middleware_1.validate)(aptitude_validation_1.listSessionsSchema), aptitude_controller_1.aptitudeController.listSessions);
router.get('/sessions/:id', (0, validate_middleware_1.validate)(aptitude_validation_1.sessionIdSchema), aptitude_controller_1.aptitudeController.getSession);
// =====================================================
// QUESTIONS
// =====================================================
router.get('/sessions/:id/questions', (0, validate_middleware_1.validate)(aptitude_validation_1.sessionIdSchema), aptitude_controller_1.aptitudeController.getSessionQuestions);
router.get('/sessions/:id/questions/:questionId', (0, validate_middleware_1.validate)(aptitude_validation_1.questionIdSchema), aptitude_controller_1.aptitudeController.getQuestion);
// =====================================================
// TEST TAKING
// =====================================================
router.post('/sessions/:id/answer', (0, validate_middleware_1.validate)(aptitude_validation_1.saveAnswerSchema), aptitude_controller_1.aptitudeController.saveAnswer);
router.post('/sessions/:id/submit', (0, validate_middleware_1.validate)(aptitude_validation_1.sessionIdSchema), aptitude_controller_1.aptitudeController.submitSession);
// =====================================================
// STATUS & RESULTS
// =====================================================
router.get('/sessions/:id/status', (0, validate_middleware_1.validate)(aptitude_validation_1.sessionIdSchema), aptitude_controller_1.aptitudeController.getSessionStatus);
router.get('/sessions/:id/results', (0, validate_middleware_1.validate)(aptitude_validation_1.sessionIdSchema), aptitude_controller_1.aptitudeController.getSessionResults);
router.get('/sessions/:id/solutions', (0, validate_middleware_1.validate)(aptitude_validation_1.solutionsFilterSchema), aptitude_controller_1.aptitudeController.getSolutions);
exports.default = router;
//# sourceMappingURL=aptitude.routes.js.map