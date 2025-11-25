import { Router } from 'express';
import { configController } from './config.controller';
import { authenticate } from '../../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/time-limits', configController.getTimeLimits.bind(configController));

export default router;