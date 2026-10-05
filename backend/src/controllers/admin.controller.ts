import { Request, Response } from 'express';
import { bookingService } from '../services/booking.service';
import { bookingStateService } from '../services/bookingState.service';
import { User } from '../models/User';
import { Booking } from '../models/Booking';
import { AuditLog } from '../models/AuditLog';
import { EmailLog } from '../models/EmailLog';
import { sendSuccess, sendError } from '../utils/apiResponse';

export class AdminController {
  /**
   * GET /api/admin/dashboard
   */
  public static async getDashboard(_req: Request, res: Response): Promise<void> {
    try {
      const stats = await bookingService.getDashboardStats();
      sendSuccess(res, stats);
    } catch (error: any) {
      console.error('[AdminController.getDashboard] Error:', error);
      sendError(res, error.message || 'Failed to fetch dashboard stats', 500);
    }
  }

  /**
   * GET /api/admin/bookings
   */
  public static async getBookings(req: Request, res: Response): Promise<void> {
    try {
      const { status, date, readingTypeId, search, page, limit } = req.query;

      const data = await bookingService.getAdminBookings({
        status: status as string,
        date: date as string,
        readingTypeId: readingTypeId as string,
        search: search as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
      });

      sendSuccess(res, data);
    } catch (error: any) {
      console.error('[AdminController.getBookings] Error:', error);
      sendError(res, error.message || 'Failed to fetch bookings', 500);
    }
  }

  /**
   * GET /api/admin/bookings/:id
   */
  public static async getBookingById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const booking = await Booking.findById(id)
        .populate('userId', 'name email phone createdAt isEmailVerified')
        .populate('readingTypeId', 'name price duration description')
        .populate('slotId', 'date startTime endTime status');

      if (!booking) {
        sendError(res, 'Booking not found', 404);
        return;
      }

      // Fetch audit logs for this booking
      const auditLogs = await AuditLog.find({ bookingId: id })
        .populate('actorId', 'name email role')
        .sort({ timestamp: -1 });

      sendSuccess(res, { booking, auditLogs });
    } catch (error: any) {
      console.error('[AdminController.getBookingById] Error:', error);
      sendError(res, error.message || 'Failed to fetch booking', 500);
    }
  }

  /**
   * PATCH /api/admin/bookings/:id/approve
   */
  public static async approveBooking(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const actor = {
        userId: req.user!.userId,
        role: req.user!.role,
      };

      const updated = await bookingStateService.transitionBooking(
        id,
        'APPROVED',
        actor
      );

      sendSuccess(res, updated, 200, 'Booking approved successfully.');
    } catch (error: any) {
      console.error('[AdminController.approveBooking] Error:', error);
      sendError(res, error.message || 'Failed to approve booking', error.statusCode || 500);
    }
  }

  /**
   * PATCH /api/admin/bookings/:id/reject
   */
  public static async rejectBooking(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body || {};
      const actor = {
        userId: req.user!.userId,
        role: req.user!.role,
      };

      const updated = await bookingStateService.transitionBooking(
        id,
        'REJECTED',
        actor,
        { reason }
      );

      sendSuccess(res, updated, 200, 'Booking rejected and slot released.');
    } catch (error: any) {
      console.error('[AdminController.rejectBooking] Error:', error);
      sendError(res, error.message || 'Failed to reject booking', error.statusCode || 500);
    }
  }

  /**
   * PATCH /api/admin/bookings/:id/complete
   */
  public static async completeBooking(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const actor = {
        userId: req.user!.userId,
        role: req.user!.role,
      };

      const updated = await bookingStateService.transitionBooking(
        id,
        'COMPLETED',
        actor
      );

      sendSuccess(res, updated, 200, 'Booking marked as completed.');
    } catch (error: any) {
      console.error('[AdminController.completeBooking] Error:', error);
      sendError(res, error.message || 'Failed to complete booking', error.statusCode || 500);
    }
  }

  /**
   * PATCH /api/admin/bookings/:id/cancel
   */
  public static async cancelBooking(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body || {};
      const actor = {
        userId: req.user!.userId,
        role: req.user!.role,
      };

      const updated = await bookingStateService.transitionBooking(
        id,
        'CANCELLED',
        actor,
        { reason }
      );

      sendSuccess(res, updated, 200, 'Booking cancelled and slot released.');
    } catch (error: any) {
      console.error('[AdminController.cancelBooking] Error:', error);
      sendError(res, error.message || 'Failed to cancel booking', error.statusCode || 500);
    }
  }

  /**
   * GET /api/admin/users
   */
  public static async getClients(req: Request, res: Response): Promise<void> {
    try {
      const { search } = req.query;
      const filter: any = { role: 'USER' };

      if (search && (search as string).trim()) {
        const regex = new RegExp((search as string).trim(), 'i');
        filter.$or = [{ name: regex }, { email: regex }, { phone: regex }];
      }

      const users = await User.find(filter).sort({ createdAt: -1 });

      // Attach booking count to each user
      const usersWithBookings = await Promise.all(
        users.map(async (u) => {
          const totalBookings = await Booking.countDocuments({ userId: u._id });
          return {
            id: u._id,
            name: u.name,
            email: u.email,
            phone: u.phone,
            isEmailVerified: u.isEmailVerified,
            createdAt: u.createdAt,
            totalBookings,
          };
        })
      );

      sendSuccess(res, usersWithBookings);
    } catch (error: any) {
      console.error('[AdminController.getClients] Error:', error);
      sendError(res, error.message || 'Failed to fetch clients', 500);
    }
  }

  /**
   * GET /api/admin/users/:id
   */
  public static async getClientDetails(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await User.findById(id);
      if (!user) {
        sendError(res, 'Client not found', 404);
        return;
      }

      const bookings = await Booking.find({ userId: id })
        .populate('readingTypeId', 'name price duration')
        .populate('slotId', 'date startTime endTime')
        .sort({ createdAt: -1 });

      sendSuccess(res, {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          isEmailVerified: user.isEmailVerified,
          createdAt: user.createdAt,
        },
        bookings,
      });
    } catch (error: any) {
      console.error('[AdminController.getClientDetails] Error:', error);
      sendError(res, error.message || 'Failed to fetch client details', 500);
    }
  }

  /**
   * GET /api/admin/email-logs
   */
  public static async getEmailLogs(_req: Request, res: Response): Promise<void> {
    try {
      const logs = await EmailLog.find().sort({ createdAt: -1 }).limit(50);
      sendSuccess(res, logs);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to fetch email logs', 500);
    }
  }
}
