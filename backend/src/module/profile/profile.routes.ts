// src/module/profile/profile.routes.ts

import { Router } from 'express';
import multer from 'multer';
import { profileController } from './profile.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { CONSTANTS } from '../../config/constants';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: CONSTANTS.MAX_RESUME_SIZE,
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'));
    }
  },
});

// Apply authentication to all routes
router.use(authenticate);

// ============= Resume Routes =============

// Get default resume (must be before /:resumeId)
router.get('/resumes/default', profileController.getDefaultResume);

// Get all resumes
router.get('/resumes', profileController.getResumes);

// Upload resume
router.post('/resumes', upload.single('resume'), profileController.uploadResume);

// Get specific resume
router.get('/resumes/:resumeId', profileController.getResume);

// Delete resume
router.delete('/resumes/:resumeId', profileController.deleteResume);

// Set default resume
router.patch('/resumes/:resumeId/default', profileController.setDefaultResume);

export { router as profileRoutes };