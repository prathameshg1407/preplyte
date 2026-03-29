// src/module/practice/individual-mockdrive/individual-mockdrive.routes.ts

import { Router } from 'express';
import { individualMockDriveController } from './individual-mockdrive.controller';
import { authenticate } from '../../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// MockDrive CRUD
router.get('/', individualMockDriveController.list.bind(individualMockDriveController));
router.post('/', individualMockDriveController.create.bind(individualMockDriveController));
router.get('/:id', individualMockDriveController.getDetails.bind(individualMockDriveController));
router.patch('/:id', individualMockDriveController.update.bind(individualMockDriveController));
router.delete('/:id', individualMockDriveController.delete.bind(individualMockDriveController));

// Attempts
router.post('/:id/attempts', individualMockDriveController.startAttempt.bind(individualMockDriveController));
router.get('/attempts/current', individualMockDriveController.getCurrentAttempt.bind(individualMockDriveController));
router.get('/attempts/sync', individualMockDriveController.sync.bind(individualMockDriveController));
router.get('/attempts/history', individualMockDriveController.getHistory.bind(individualMockDriveController));
router.get('/attempts/:attemptId', individualMockDriveController.getAttemptDetails.bind(individualMockDriveController));

// Module attempts within a specific attempt
router.post('/attempts/:attemptId/modules/:moduleId/start', individualMockDriveController.startModule.bind(individualMockDriveController));

export default router;
