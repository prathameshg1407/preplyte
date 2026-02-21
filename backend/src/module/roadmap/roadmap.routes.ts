// src/module/roadmap/roadmap.routes.ts

import { Router } from 'express';
import { RoadmapController } from './roadmap.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.post('/question', authenticate, RoadmapController.getNextQuestion);
router.post('/generate', authenticate, RoadmapController.generateRoadmap);

export default router;
