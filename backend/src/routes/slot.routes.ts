import { Router } from 'express';
import { SlotController } from '../controllers/slot.controller';

const router = Router();

router.get('/', SlotController.getAvailableSlots);

export default router;
