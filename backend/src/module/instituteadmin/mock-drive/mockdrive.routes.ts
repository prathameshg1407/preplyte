// src/modules/instituteadmin/mock-drive/mockdrive.routes.ts

import { Router } from 'express';
import { mockDriveController } from './mockdrive.controller';
import { mockDriveModuleController } from './modules';
import { eligibilityController } from './eligibility/eligibility.controller';
import { batchController } from './batch/batch.controller';
import { registrationController } from './registration/registration.controller';
import { analyticsController } from './analytics/analytics.controller';
import { resultsController } from './results/results.controller';
import { authenticate, authorize } from '../../../middleware/auth.middleware';

const router = Router();

// All routes require authentication and institute admin role
router.use(authenticate);
router.use(authorize('INSTITUTE_ADMIN'));

// ============================================
// Mock Drive CRUD
// ============================================

router.post('/', (req, res, next) => mockDriveController.create(req, res, next));
router.get('/', (req, res, next) => mockDriveController.list(req, res, next));
router.get('/:id', (req, res, next) => mockDriveController.getById(req, res, next));
router.put('/:id', (req, res, next) => mockDriveController.update(req, res, next));
router.delete('/:id', (req, res, next) => mockDriveController.delete(req, res, next));

// Mock Drive Actions
router.post('/:id/publish', (req, res, next) => mockDriveController.publish(req, res, next));
router.post('/:id/cancel', (req, res, next) => mockDriveController.cancel(req, res, next));
router.post('/:id/duplicate', (req, res, next) => mockDriveController.duplicate(req, res, next));
router.get('/:id/stats', (req, res, next) => mockDriveController.getStats(req, res, next));

// ============================================
// Modules
// ============================================

router.post('/:id/modules', (req, res, next) => mockDriveModuleController.addModule(req, res, next));
router.get('/:id/modules', (req, res, next) => mockDriveModuleController.getModules(req, res, next));
router.get('/:id/modules/:moduleId', (req, res, next) => mockDriveModuleController.getModule(req, res, next));
router.put('/:id/modules/:moduleId', (req, res, next) => mockDriveModuleController.updateModule(req, res, next));
router.delete('/:id/modules/:moduleId', (req, res, next) => mockDriveModuleController.deleteModule(req, res, next));
router.put('/:id/modules/reorder', (req, res, next) => mockDriveModuleController.reorderModules(req, res, next));

// ============================================
// Eligibility
// ============================================

router.put('/:id/eligibility', (req, res, next) => eligibilityController.setEligibility(req, res, next));
router.get('/:id/eligibility', (req, res, next) => eligibilityController.getEligibility(req, res, next));
router.patch('/:id/eligibility', (req, res, next) => eligibilityController.updateEligibility(req, res, next));
router.delete('/:id/eligibility', (req, res, next) => eligibilityController.deleteEligibility(req, res, next));
router.get('/:id/eligibility/students', (req, res, next) => eligibilityController.getEligibleStudents(req, res, next));
router.get('/:id/eligibility/summary', (req, res, next) => eligibilityController.getEligibilitySummary(req, res, next));
router.get('/:id/eligibility/check/:userId', (req, res, next) => eligibilityController.checkStudentEligibility(req, res, next));

// ============================================
// Registrations
// ============================================

router.get('/:id/registrations', (req, res, next) => registrationController.listRegistrations(req, res, next));
router.get('/:id/registrations/summary', (req, res, next) => registrationController.getRegistrationSummary(req, res, next));
router.get('/:id/registrations/export', (req, res, next) => registrationController.exportRegistrations(req, res, next));
router.get('/:id/registrations/:regId', (req, res, next) => registrationController.getRegistrationById(req, res, next));
router.put('/:id/registrations/:regId', (req, res, next) => registrationController.updateRegistration(req, res, next));
router.post('/:id/registrations/bulk', (req, res, next) => registrationController.bulkUpdateRegistrations(req, res, next));
router.post('/:id/registrations/approve-all', (req, res, next) => registrationController.approveAllPending(req, res, next));

// ============================================
// Batches
// ============================================

router.post('/:id/batches', (req, res, next) => batchController.createBatch(req, res, next));
router.get('/:id/batches', (req, res, next) => batchController.listBatches(req, res, next));
router.post('/:id/batches/auto-create', (req, res, next) => batchController.autoCreateBatches(req, res, next));
router.get('/:id/batches/:batchId', (req, res, next) => batchController.getBatchById(req, res, next));
router.put('/:id/batches/:batchId', (req, res, next) => batchController.updateBatch(req, res, next));
router.delete('/:id/batches/:batchId', (req, res, next) => batchController.deleteBatch(req, res, next));
router.get('/:id/batches/:batchId/students', (req, res, next) => batchController.getBatchStudents(req, res, next));
router.post('/:id/batches/:batchId/assign', (req, res, next) => batchController.assignStudents(req, res, next));
router.post('/:id/batches/:batchId/unassign', (req, res, next) => batchController.unassignStudents(req, res, next));
router.post('/:id/batches/:batchId/start', (req, res, next) => batchController.startBatch(req, res, next));
router.post('/:id/batches/:batchId/complete', (req, res, next) => batchController.completeBatch(req, res, next));

// ============================================
// Analytics
// ============================================

router.get('/:id/analytics', (req, res, next) => analyticsController.getFullAnalytics(req, res, next));
router.get('/:id/analytics/overview', (req, res, next) => analyticsController.getOverview(req, res, next));
router.get('/:id/analytics/score-distribution', (req, res, next) => analyticsController.getScoreDistribution(req, res, next));
router.get('/:id/analytics/module-performance', (req, res, next) => analyticsController.getModulePerformance(req, res, next));
router.get('/:id/analytics/batch-comparison', (req, res, next) => analyticsController.getBatchComparison(req, res, next));
router.get('/:id/analytics/time-analysis', (req, res, next) => analyticsController.getTimeAnalysis(req, res, next));

// ============================================
// Results
// ============================================

router.get('/:id/results', (req, res, next) => resultsController.listResults(req, res, next));
router.get('/:id/results/export', (req, res, next) => resultsController.exportResults(req, res, next));
router.post('/:id/results/calculate-rankings', (req, res, next) => resultsController.calculateRankings(req, res, next));
router.post('/:id/results/generate-reports', (req, res, next) => resultsController.generateAllReports(req, res, next));
router.get('/:id/results/:attemptId', (req, res, next) => resultsController.getDetailedResult(req, res, next));

export default router;
