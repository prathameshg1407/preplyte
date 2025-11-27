// src/module/practice/practice.routes.ts

import { Router } from 'express';
import { prismaService } from '../prisma/prisma.service';
import { profileService } from '../profile/profile.service';
import aptitudeRoutes from './aptitude/aptitude.routes';
import machineRoutes from './machine/machine.routes';
// ✅ Fix: Change from 'interview.routes' to 'interview.router'
import languagesRoutes from './common/languages.routes';
import configRoutes from './common/config.routes';
import enumsRoutes from './common/enums.routes';
import { interviewRoutes } from './interview';


const router = Router();

// Create interview routes with singleton dependencies

// Practice routes
router.use('/aptitude', aptitudeRoutes);
router.use('/machine', machineRoutes);
router.use('/interview', interviewRoutes);

// Common APIs
router.use('/languages', languagesRoutes);
router.use('/config', configRoutes);
router.use('/enums', enumsRoutes);

export default router;