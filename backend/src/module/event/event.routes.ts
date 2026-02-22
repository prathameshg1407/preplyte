// backend/src/module/event/event.routes.ts

import { Router } from 'express';
import { authenticate, authorize, authorizeInstituteAdmin } from '../../middleware/auth.middleware';
import { jobController } from './job';
import { internshipController } from './internship';
import { hackathonController, registrationController, teamController, submissionController } from './hackathon';
import { applicationController as jobApplicationController } from './job';
import { internshipApplicationController } from './internship';

const router = Router();

/**
 * =====================================================
 * JOB ROUTES
 * =====================================================
 */

// Job Applications
router.get('/jobs/applications', authenticate, jobApplicationController.list);

router.get('/jobs', jobController.list);
router.post('/jobs', authenticate, authorizeInstituteAdmin, jobController.create);
router.get('/jobs/:id', authenticate, jobController.getOne);
router.patch('/jobs/:id', authenticate, authorizeInstituteAdmin, jobController.update);
router.delete('/jobs/:id', authenticate, authorizeInstituteAdmin, jobController.delete);

router.get('/jobs/:id/eligibility', authenticate, jobController.checkEligibility);
router.post('/jobs/:id/apply', authenticate, jobApplicationController.submit);
router.get('/jobs/applications/:id', authenticate, jobApplicationController.getOne);
router.patch('/jobs/applications/:id/review', authenticate, authorizeInstituteAdmin, jobApplicationController.review);

/**
 * =====================================================
 * INTERNSHIP ROUTES
 * =====================================================
 */

// Internship Applications
router.get('/internships/applications', authenticate, internshipApplicationController.list);

router.get('/internships', internshipController.list);
router.post('/internships', authenticate, authorizeInstituteAdmin, internshipController.create);
router.get('/internships/:id', authenticate, internshipController.getOne);
router.patch('/internships/:id', authenticate, authorizeInstituteAdmin, internshipController.update);
router.delete('/internships/:id', authenticate, authorizeInstituteAdmin, internshipController.delete);

router.get('/internships/:id/eligibility', authenticate, internshipController.checkEligibility);
router.post('/internships/:id/apply', authenticate, internshipApplicationController.submit);
router.get('/internships/applications/:id', authenticate, internshipApplicationController.getOne);
router.patch('/internships/applications/:id/review', authenticate, authorizeInstituteAdmin, internshipApplicationController.review);

/**
 * =====================================================
 * HACKATHON ROUTES
 * =====================================================
 */

router.get('/hackathons', hackathonController.list);
router.post('/hackathons', authenticate, authorizeInstituteAdmin, hackathonController.create);
router.get('/hackathons/:id', authenticate, hackathonController.getOne);
router.patch('/hackathons/:id', authenticate, authorizeInstituteAdmin, hackathonController.update);
router.delete('/hackathons/:id', authenticate, authorizeInstituteAdmin, hackathonController.delete);

// Hackathon Registration & Teams
router.get('/hackathons/:id/registrations', authenticate, authorizeInstituteAdmin, registrationController.list);
router.post('/hackathons/:id/register', authenticate, registrationController.register);
router.get('/hackathons/:id/registration', authenticate, registrationController.getStatus);
router.post('/hackathons/:id/teams', authenticate, teamController.create);
router.post('/hackathons/:id/teams/join', authenticate, teamController.join);
router.get('/hackathons/teams/:id', authenticate, teamController.getOne);

// Hackathon Submissions
router.get('/hackathons/:id/submissions', authenticate, authorizeInstituteAdmin, submissionController.list);
router.post('/hackathons/:id/submit', authenticate, submissionController.submit);
router.post('/hackathons/:id/draft', authenticate, submissionController.saveDraft);
router.get('/hackathons/submissions/:id', authenticate, submissionController.getOne);
router.patch('/hackathons/submissions/:id/review', authenticate, authorizeInstituteAdmin, submissionController.review);

export const eventRoutes = router;
