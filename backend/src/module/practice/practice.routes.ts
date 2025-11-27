// src/module/practice/practice.routes.ts

import { Router } from 'express';
import { prismaService } from '../prisma/prisma.service';
import { profileService } from '../profile/profile.service';
import aptitudeRoutes from './aptitude/aptitude.routes';
import machineRoutes from './machine/machine.routes';
import { createInterviewRouter } from './interview/interview.routes';
import languagesRoutes from './common/languages.routes';
import configRoutes from './common/config.routes';
import enumsRoutes from './common/enums.routes';

const router = Router();

// Create interview routes with singleton dependencies
const interviewRoutes = createInterviewRouter(prismaService, profileService);

// Practice routes
router.use('/aptitude', aptitudeRoutes);
router.use('/machine', machineRoutes);
router.use('/ai-interview', interviewRoutes);

// Common APIs
router.use('/languages', languagesRoutes);
router.use('/config', configRoutes);
router.use('/enums', enumsRoutes);

export default router;