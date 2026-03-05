"use strict";
// src/modules/instituteadmin/mock-drive/mockdrive.routes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mockdrive_controller_1 = require("./mockdrive.controller");
const modules_1 = require("./modules");
const eligibility_controller_1 = require("./eligibility/eligibility.controller");
const batch_controller_1 = require("./batch/batch.controller");
const registration_controller_1 = require("./registration/registration.controller");
const analytics_controller_1 = require("./analytics/analytics.controller");
const results_controller_1 = require("./results/results.controller");
const auth_middleware_1 = require("../../../middleware/auth.middleware");
const students_routes_1 = __importDefault(require("../students/students.routes"));
const router = (0, express_1.Router)();
// All routes require authentication and institute admin role
router.use(auth_middleware_1.authenticate);
router.use((0, auth_middleware_1.authorize)('INSTITUTE_ADMIN'));
// ============================================
// Students (mounted before mock-drive routes to avoid conflicts)
// ============================================
router.use('/students', students_routes_1.default);
// ============================================
// Mock Drive CRUD
// ============================================
router.post('/', (req, res, next) => mockdrive_controller_1.mockDriveController.create(req, res, next));
router.get('/', (req, res, next) => mockdrive_controller_1.mockDriveController.list(req, res, next));
router.get('/:id', (req, res, next) => mockdrive_controller_1.mockDriveController.getById(req, res, next));
router.put('/:id', (req, res, next) => mockdrive_controller_1.mockDriveController.update(req, res, next));
router.delete('/:id', (req, res, next) => mockdrive_controller_1.mockDriveController.delete(req, res, next));
// Mock Drive Actions
router.post('/:id/publish', (req, res, next) => mockdrive_controller_1.mockDriveController.publish(req, res, next));
router.post('/:id/cancel', (req, res, next) => mockdrive_controller_1.mockDriveController.cancel(req, res, next));
router.post('/:id/duplicate', (req, res, next) => mockdrive_controller_1.mockDriveController.duplicate(req, res, next));
router.get('/:id/stats', (req, res, next) => mockdrive_controller_1.mockDriveController.getStats(req, res, next));
// ============================================
// Modules
// ============================================
router.post('/:id/modules', (req, res, next) => modules_1.mockDriveModuleController.addModule(req, res, next));
router.get('/:id/modules', (req, res, next) => modules_1.mockDriveModuleController.getModules(req, res, next));
router.get('/:id/modules/:moduleId', (req, res, next) => modules_1.mockDriveModuleController.getModule(req, res, next));
router.put('/:id/modules/:moduleId', (req, res, next) => modules_1.mockDriveModuleController.updateModule(req, res, next));
router.delete('/:id/modules/:moduleId', (req, res, next) => modules_1.mockDriveModuleController.deleteModule(req, res, next));
router.put('/:id/modules/reorder', (req, res, next) => modules_1.mockDriveModuleController.reorderModules(req, res, next));
// ============================================
// Eligibility
// ============================================
router.put('/:id/eligibility', (req, res, next) => eligibility_controller_1.eligibilityController.setEligibility(req, res, next));
router.get('/:id/eligibility', (req, res, next) => eligibility_controller_1.eligibilityController.getEligibility(req, res, next));
router.patch('/:id/eligibility', (req, res, next) => eligibility_controller_1.eligibilityController.updateEligibility(req, res, next));
router.delete('/:id/eligibility', (req, res, next) => eligibility_controller_1.eligibilityController.deleteEligibility(req, res, next));
router.get('/:id/eligibility/students', (req, res, next) => eligibility_controller_1.eligibilityController.getEligibleStudents(req, res, next));
router.get('/:id/eligibility/summary', (req, res, next) => eligibility_controller_1.eligibilityController.getEligibilitySummary(req, res, next));
router.get('/:id/eligibility/check/:userId', (req, res, next) => eligibility_controller_1.eligibilityController.checkStudentEligibility(req, res, next));
// ============================================
// Registrations
// ============================================
router.get('/:id/registrations', (req, res, next) => registration_controller_1.registrationController.listRegistrations(req, res, next));
router.get('/:id/registrations/summary', (req, res, next) => registration_controller_1.registrationController.getRegistrationSummary(req, res, next));
router.get('/:id/registrations/export', (req, res, next) => registration_controller_1.registrationController.exportRegistrations(req, res, next));
router.get('/:id/registrations/:regId', (req, res, next) => registration_controller_1.registrationController.getRegistrationById(req, res, next));
router.put('/:id/registrations/:regId', (req, res, next) => registration_controller_1.registrationController.updateRegistration(req, res, next));
router.post('/:id/registrations/bulk', (req, res, next) => registration_controller_1.registrationController.bulkUpdateRegistrations(req, res, next));
router.post('/:id/registrations/approve-all', (req, res, next) => registration_controller_1.registrationController.approveAllPending(req, res, next));
// ============================================
// Batches
// ============================================
router.post('/:id/batches', (req, res, next) => batch_controller_1.batchController.createBatch(req, res, next));
router.get('/:id/batches', (req, res, next) => batch_controller_1.batchController.listBatches(req, res, next));
router.post('/:id/batches/auto-create', (req, res, next) => batch_controller_1.batchController.autoCreateBatches(req, res, next));
router.get('/:id/batches/:batchId', (req, res, next) => batch_controller_1.batchController.getBatchById(req, res, next));
router.put('/:id/batches/:batchId', (req, res, next) => batch_controller_1.batchController.updateBatch(req, res, next));
router.delete('/:id/batches/:batchId', (req, res, next) => batch_controller_1.batchController.deleteBatch(req, res, next));
router.get('/:id/batches/:batchId/students', (req, res, next) => batch_controller_1.batchController.getBatchStudents(req, res, next));
router.post('/:id/batches/:batchId/assign', (req, res, next) => batch_controller_1.batchController.assignStudents(req, res, next));
router.post('/:id/batches/:batchId/unassign', (req, res, next) => batch_controller_1.batchController.unassignStudents(req, res, next));
router.post('/:id/batches/:batchId/start', (req, res, next) => batch_controller_1.batchController.startBatch(req, res, next));
router.post('/:id/batches/:batchId/complete', (req, res, next) => batch_controller_1.batchController.completeBatch(req, res, next));
// ============================================
// Analytics
// ============================================
router.get('/:id/analytics', (req, res, next) => analytics_controller_1.analyticsController.getFullAnalytics(req, res, next));
router.get('/:id/analytics/overview', (req, res, next) => analytics_controller_1.analyticsController.getOverview(req, res, next));
router.get('/:id/analytics/score-distribution', (req, res, next) => analytics_controller_1.analyticsController.getScoreDistribution(req, res, next));
router.get('/:id/analytics/module-performance', (req, res, next) => analytics_controller_1.analyticsController.getModulePerformance(req, res, next));
router.get('/:id/analytics/batch-comparison', (req, res, next) => analytics_controller_1.analyticsController.getBatchComparison(req, res, next));
router.get('/:id/analytics/time-analysis', (req, res, next) => analytics_controller_1.analyticsController.getTimeAnalysis(req, res, next));
// ============================================
// Results
// ============================================
router.get('/:id/results', (req, res, next) => results_controller_1.resultsController.listResults(req, res, next));
router.get('/:id/results/export', (req, res, next) => results_controller_1.resultsController.exportResults(req, res, next));
router.post('/:id/results/calculate-rankings', (req, res, next) => results_controller_1.resultsController.calculateRankings(req, res, next));
router.post('/:id/results/generate-reports', (req, res, next) => results_controller_1.resultsController.generateAllReports(req, res, next));
router.get('/:id/results/:attemptId', (req, res, next) => results_controller_1.resultsController.getDetailedResult(req, res, next));
exports.default = router;
//# sourceMappingURL=mockdrive.routes.js.map