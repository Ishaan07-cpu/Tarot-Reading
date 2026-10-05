import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { createBookingSchema, cancelBookingSchema } from '../utils/validation';

const router = Router();

// All booking routes require authentication
router.use(requireAuth);

router.post('/', validateBody(createBookingSchema), BookingController.create);
router.get('/my-bookings', BookingController.getMyBookings);
router.get('/:id', BookingController.getById);
router.patch('/:id/cancel', validateBody(cancelBookingSchema), BookingController.cancel);

export default router;
