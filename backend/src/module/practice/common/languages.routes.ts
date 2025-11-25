import { Router } from 'express';
import { languagesController } from './languages.controller';
import { authenticate } from '../../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', languagesController.getAllLanguages.bind(languagesController));
router.get('/:id', languagesController.getLanguageById.bind(languagesController));

export default router;