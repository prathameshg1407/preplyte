// src/modules/instituteadmin/institute-analytics.routes.ts

import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { instituteAnalyticsController } from './institute-analytics.controller';

const router = Router();

// All routes require authentication and institute admin role
router.use((req: Request, res: Response, next: NextFunction) =>
  authenticate(req as AuthenticatedRequest, res, next)
);
router.use((req: Request, res: Response, next: NextFunction) =>
  authorize('INSTITUTE_ADMIN')(req as AuthenticatedRequest, res, next)
);

// GET /api/institute/analytics
router.get('/', (req: Request, res: Response, next: NextFunction) =>
  instituteAnalyticsController.getAnalytics(req as AuthenticatedRequest, res, next)
);

export default router;
