// src/modules/instituteadmin/mock-drive/index.ts
import { Router } from 'express';
import studentsRoutes from '../students/students.routes';

const router = Router();

router.use('/', studentsRoutes);
// Main exports
export * from './mockdrive.types';
export * from './mockdrive.validation';
export * from './mockdrive.service';
export * from './mockdrive.controller';
export { default as mockDriveRoutes } from './mockdrive.routes';

// Sub-module exports

