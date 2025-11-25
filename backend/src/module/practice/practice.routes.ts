// src/module/practice/practice.routes.ts

import { Router } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { profileService } from '../profile/profile.service'; // Import the singleton
import aptitudeRoutes from './aptitude/aptitude.routes';
import machineRoutes from './machine/machine.routes';
import interviewRoutesFactory from './interview/interview.routes';
import languagesRoutes from './common/languages.routes';
import configRoutes from './common/config.routes';
import enumsRoutes from './common/enums.routes';

const router = Router();

// Initialize services for interview routes
const prismaService = new PrismaService();
// Use the exported singleton instead of creating a new instance
const interviewRoutes = interviewRoutesFactory(prismaService, profileService);

// Aptitude practice routes - /api/aptitude/*
router.use('/aptitude', aptitudeRoutes);

// Machine coding practice routes - /api/machine/*
router.use('/machine', machineRoutes);

// AI Interview practice routes - /api/ai-interview/*
router.use('/ai-interview', interviewRoutes);

// Common APIs
router.use('/languages', languagesRoutes);  // /api/languages/*
router.use('/config', configRoutes);        // /api/config/*
router.use('/enums', enumsRoutes);          // /api/enums/*

export default router;