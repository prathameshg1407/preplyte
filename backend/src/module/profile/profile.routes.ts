// src/module/profile/profile.routes.ts

import { Router } from 'express';
import multer from 'multer';
import { profileController } from './profile.controller';
import { authenticate } from '../../middleware/auth.middleware';
import {
  RESUME_LIMITS,
  ALLOWED_RESUME_MIME_TYPES,
} from './profile.constants';

const router = Router();

// =====================================================
// MULTER CONFIGURATION
// =====================================================

const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: RESUME_LIMITS.MAX_FILE_SIZE,
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ALLOWED_RESUME_MIME_TYPES as readonly string[];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'));
    }
  },
});

// =====================================================
// ALL ROUTES REQUIRE AUTHENTICATION
// =====================================================

router.use(authenticate);

// =====================================================
// COMPLETE PROFILE
// =====================================================

// GET /profile - Get complete profile with all data
router.get('/', profileController.getCompleteProfile);

// =====================================================
// USER PROFILE ROUTES
// =====================================================

// GET /profile/user - Get basic user profile
router.get('/user', profileController.getUserProfile);

// PATCH /profile/user - Update basic user profile
router.patch('/user', profileController.updateUserProfile);

// =====================================================
// DEPARTMENT ROUTES
// =====================================================

// GET /profile/departments - Get available departments for user's institute
router.get('/departments', profileController.getAvailableDepartments);

// =====================================================
// STUDENT PROFILE ROUTES
// =====================================================

// POST /profile/student - Create student profile
router.post('/student', profileController.createStudentProfile);

// GET /profile/student - Get student profile
router.get('/student', profileController.getStudentProfile);

// PATCH /profile/student - Update student profile
router.patch('/student', profileController.updateStudentProfile);

// DELETE /profile/student - Delete student profile
router.delete('/student', profileController.deleteStudentProfile);

// POST /profile/student/skills - Add skills
router.post('/student/skills', profileController.addSkills);

// DELETE /profile/student/skills - Remove skills
router.delete('/student/skills', profileController.removeSkills);

// PATCH /profile/student/academics - Update academic marks
router.patch('/student/academics', profileController.updateAcademicMarks);

// =====================================================
// RESUME ROUTES (Static routes first)
// =====================================================

// GET /profile/resumes/default - Get default resume
router.get('/resumes/default', profileController.getDefaultResume);

// GET /profile/resumes - Get all resumes
router.get('/resumes', profileController.getResumes);

// POST /profile/resumes - Upload new resume
router.post(
  '/resumes',
  resumeUpload.single('resume'),
  profileController.uploadResume
);

// =====================================================
// RESUME ROUTES (Parameterized routes)
// =====================================================

// GET /profile/resumes/:resumeId - Get specific resume
router.get('/resumes/:resumeId', profileController.getResume);

// DELETE /profile/resumes/:resumeId - Delete resume
router.delete('/resumes/:resumeId', profileController.deleteResume);

// PATCH /profile/resumes/:resumeId/default - Set as default
router.patch('/resumes/:resumeId/default', profileController.setDefaultResume);

// GET /profile/resumes/:resumeId/text - Extract text
router.get('/resumes/:resumeId/text', profileController.extractResumeText);

// POST /profile/resumes/:resumeId/link - Link to student profile
router.post('/resumes/:resumeId/link', profileController.linkResumeToProfile);

// =====================================================
// EXPORT
// =====================================================

export { router as profileRoutes };
export default router;