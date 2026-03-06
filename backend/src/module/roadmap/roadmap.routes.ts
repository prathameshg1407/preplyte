// src/module/roadmap/roadmap.routes.ts

import { Router } from 'express';
import { RoadmapController } from './roadmap.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// AI conversation (auth required)
router.post('/question', authenticate, RoadmapController.getNextQuestion);
router.post('/generate', authenticate, RoadmapController.generateRoadmap);

// CRUD — saved roadmaps (auth required)
router.post('/save', authenticate, RoadmapController.saveRoadmap);
router.get('/list', authenticate, RoadmapController.listRoadmaps);
router.get('/shared/:token', RoadmapController.getSharedRoadmap);   // public — BEFORE :id route
router.post('/courses-for-steps', authenticate, RoadmapController.searchCoursesForSteps);
router.get('/:id', authenticate, RoadmapController.getRoadmap);
router.patch('/:id/steps/:stepId', authenticate, RoadmapController.updateStepStatus);
router.delete('/:id', authenticate, RoadmapController.deleteRoadmap);

// Sharing (auth required)
router.post('/:id/share', authenticate, RoadmapController.shareRoadmap);

export default router;
