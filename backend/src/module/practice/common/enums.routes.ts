import { Router } from 'express';
import { enumsController } from './enums.controller';
import { authenticate } from '../../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/difficulty-levels', enumsController.getDifficultyLevels.bind(enumsController));
router.get('/question-types', enumsController.getQuestionTypes.bind(enumsController));
router.get('/ai-interview-difficulties', enumsController.getAiInterviewDifficulties.bind(enumsController));
router.get('/module-types', enumsController.getModuleTypes.bind(enumsController));
router.get('/mock-drive-statuses', enumsController.getMockDriveStatuses.bind(enumsController));

export default router;