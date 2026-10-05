import { Request, Response } from 'express';
import { bookingService } from '../services/booking.service';
import { sendSuccess, sendError } from '../utils/apiResponse';

export class BookingController {
  /**
   * POST /api/bookings
   */
  public static async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { slotId, readingTypeId, notes } = req.body;

      const booking = await bookingService.createBooking(
        userId,
        slotId,
        readingTypeId,
        notes
      );

      sendSuccess(
        res,
        booking,
        201,
        'Your tarot reading request has been received. Our reader will review your slot shortly.'
      );
    } catch (error: any) {
      console.error('[BookingController.create] Error:', error);
      sendError(res, error.message || 'Failed to create booking', error.statusCode || 500);
    }
  }

  /**
   * GET /api/bookings/my-bookings
   */
  public static async getMyBookings(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const bookings = await bookingService.getMyBookings(userId);
      sendSuccess(res, bookings);
    } catch (error: any) {
      console.error('[BookingController.getMyBookings] Error:', error);
      sendError(res, error.message || 'Failed to fetch bookings', 500);
    }
  }

  /**
   * GET /api/bookings/:id
   */
  public static async getById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const role = req.user!.role;
      const bookingId = req.params.id;

      const booking = await bookingService.getBookingById(bookingId, userId, role);
      sendSuccess(res, booking);
    } catch (error: any) {
      console.error('[BookingController.getById] Error:', error);
      sendError(res, error.message || 'Booking not found', error.statusCode || 500);
    }
  }

  /**
   * PATCH /api/bookings/:id/cancel
   */
  public static async cancel(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const role = req.user!.role;
      const bookingId = req.params.id;
      const { reason } = req.body || {};

      const updated = await bookingService.cancelBooking(
        bookingId,
        userId,
        role,
        reason
      );

      sendSuccess(res, updated, 200, 'Your booking has been cancelled.');
    } catch (error: any) {
      console.error('[BookingController.cancel] Error:', error);
      sendError(res, error.message || 'Failed to cancel booking', error.statusCode || 500);
    }
  }
}
