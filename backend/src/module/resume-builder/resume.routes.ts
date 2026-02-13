import { Router } from 'express';
import { ResumeController } from './resume.controller';
import { ResumeService } from './resume.service';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { resumeUpload } from '../../middleware/upload.middleware';
import { 
  createResumeSchema, 
  updateResumeSchema, 
  updateSectionSchema,
  duplicateResumeSchema,
  changeTemplateSchema,
} from './resume.validation';
import { prisma } from '../../lib/db';

const router = Router();

const resumeService = new ResumeService(prisma);
const resumeController = new ResumeController(resumeService);

// ============ Public Template Routes ============

// Get all templates (public - for browsing before login)
router.get('/templates', resumeController.getTemplates);

// Get template categories
router.get('/templates/categories', resumeController.getTemplateCategories);

// Get template by ID
router.get('/templates/:templateId', resumeController.getTemplateById);

// Get template by slug
router.get('/templates/slug/:slug', resumeController.getTemplateBySlug);

// ============ Protected Resume Routes ============

// All routes below require authentication
router.use(authenticate);

// Resume CRUD
router.post('/', validate(createResumeSchema), resumeController.createResume);
router.get('/', resumeController.getUserResumes);
router.get('/:resumeId', resumeController.getResumeById);
router.get('/slug/:slug', resumeController.getResumeBySlug);
router.patch('/:resumeId', validate(updateResumeSchema), resumeController.updateResume);
router.delete('/:resumeId', resumeController.deleteResume);

// Section update
router.patch(
  '/:resumeId/section', 
  validate(updateSectionSchema), 
  resumeController.updateResumeSection
);

// Duplicate resume
router.post(
  '/:resumeId/duplicate', 
  validate(duplicateResumeSchema), 
  resumeController.duplicateResume
);

// Change template
router.patch(
  '/:resumeId/template', 
  validate(changeTemplateSchema), 
  resumeController.changeTemplate
);

// Version history
router.get('/:resumeId/versions', resumeController.getResumeVersions);
router.post('/:resumeId/versions/:versionId/restore', resumeController.restoreVersion);

// Import from profile
router.post('/:resumeId/import-profile', resumeController.importFromProfile);

// ============ ATS Score Checker Routes ============

// Check ATS score for uploaded resume
router.post('/ats-check', resumeUpload, resumeController.checkATSScore);

export default router;
