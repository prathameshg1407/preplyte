import { Router } from 'express';
import { getInstituteStudents } from './students.controller';
import { validate } from '../../../middleware/validate.middleware';
import { getInstituteStudentsSchema } from './students.validation';

const router = Router();

// Note: Authentication and authorization are handled by parent router
// Parent router at /api/institute/mock-drive already has:
// - authenticate
// - authorize('INSTITUTE_ADMIN')
router.get(
  '/',
  validate(getInstituteStudentsSchema),
  getInstituteStudents
);

export default router;
