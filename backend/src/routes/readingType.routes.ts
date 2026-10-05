import { Router } from 'express';
import { ReadingTypeController } from '../controllers/readingType.controller';

const router = Router();

router.get('/', ReadingTypeController.getActive);

export default router;
