import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { SlotController } from '../controllers/slot.controller';
import { ReadingTypeController } from '../controllers/readingType.controller';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import {
  rejectBookingSchema,
  cancelBookingSchema,
  createSlotSchema,
  readingTypeSchema,
} from '../utils/validation';

const router = Router();

// Enforce authentication & admin role across all /api/admin routes
router.use(requireAuth, requireAdmin);

// Dashboard
router.get('/dashboard', AdminController.getDashboard);

// Bookings
router.get('/bookings', AdminController.getBookings);
router.get('/bookings/:id', AdminController.getBookingById);
router.patch('/bookings/:id/approve', AdminController.approveBooking);
router.patch('/bookings/:id/reject', validateBody(rejectBookingSchema), AdminController.rejectBooking);
router.patch('/bookings/:id/complete', AdminController.completeBooking);
router.patch('/bookings/:id/cancel', validateBody(cancelBookingSchema), AdminController.cancelBooking);

// Client Management
router.get('/users', AdminController.getClients);
router.get('/users/:id', AdminController.getClientDetails);

// Slot Management
router.get('/slots', SlotController.getAdminSlots);
router.post('/slots', validateBody(createSlotSchema), SlotController.createSlot);
router.patch('/slots/:id', SlotController.updateSlot);
router.delete('/slots/:id', SlotController.deleteSlot);

// Reading Type Management
router.get('/reading-types', ReadingTypeController.getAllAdmin);
router.post('/reading-types', validateBody(readingTypeSchema), ReadingTypeController.create);
router.patch('/reading-types/:id', ReadingTypeController.update);
router.delete('/reading-types/:id', ReadingTypeController.delete);

// Email Delivery Logs
router.get('/email-logs', AdminController.getEmailLogs);

export default router;
