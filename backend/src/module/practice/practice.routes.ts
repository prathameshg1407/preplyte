// src/module/practice/practice.routes.ts

import { Router } from 'express';

import aptitudeRoutes from './aptitude/aptitude.routes';
import machineRoutes from './machine/machine.routes';
import { interviewRoutes } from './interview';

import languagesRoutes from './common/languages.routes';
import configRoutes from './common/config.routes';
import enumsRoutes from './common/enums.routes';

const router = Router();

// Practice Modules
router.use('/aptitude', aptitudeRoutes);
router.use('/machine', machineRoutes);
router.use('/interview', interviewRoutes);

// Shared/Common APIs
router.use('/languages', languagesRoutes);
router.use('/config', configRoutes);
router.use('/enums', enumsRoutes);

export default router;
