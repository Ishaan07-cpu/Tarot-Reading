import mongoose from 'mongoose';
import { Booking } from '../models/Booking';
import { Slot } from '../models/Slot';
import { ReadingType } from '../models/ReadingType';
import { AuditLog } from '../models/AuditLog';
import { OutboxEvent } from '../models/OutboxEvent';
import { User } from '../models/User';
import { withTransaction } from '../config/db';
import { outboxService } from './outbox.service';
import { bookingStateService } from './bookingState.service';
import { UserRole } from '../types';

export class BookingService {
  /**
   * Create a new booking request with atomic double-booking protection
   */
  public async createBooking(
    userId: string,
    slotId: string,
    readingTypeId: string,
    notes = ''
  ): Promise<any> {
    // 1. Validate Reading Type exists and is active
    const readingType = await ReadingType.findById(readingTypeId);
    if (!readingType || !readingType.isActive) {
      const err: any = new Error('Selected reading type is not available');
      err.statusCode = 400;
      throw err;
    }

    const result = await withTransaction(async (session) => {
      // 2. Check and atomically reserve slot
      // Slot must currently be AVAILABLE
      const slot = await Slot.findOneAndUpdate(
        {
          _id: slotId,
          status: 'AVAILABLE',
        },
        {
          $set: {
            status: 'HELD', // Temporarily held while booking request is pending admin approval
            heldBy: new mongoose.Types.ObjectId(userId),
            heldUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // Hold for review window
          },
        },
        { new: true, session: session || undefined }
      );

      if (!slot) {
        const err: any = new Error('Slot is no longer available. Please select another slot.');
        err.statusCode = 409;
        throw err;
      }

      // Check slot is not in the past
      const todayStr = new Date().toISOString().split('T')[0];
      if (slot.date < todayStr) {
        // Rollback slot status
        await Slot.findByIdAndUpdate(
          slotId,
          { $set: { status: 'AVAILABLE', heldBy: null, heldUntil: null } },
          { session: session || undefined }
        );
        const err: any = new Error('Cannot book a slot in the past');
        err.statusCode = 400;
        throw err;
      }

      // 3. Create booking document in PENDING state
      const booking = new Booking({
        userId: new mongoose.Types.ObjectId(userId),
        slotId: new mongoose.Types.ObjectId(slotId),
        readingTypeId: new mongoose.Types.ObjectId(readingTypeId),
        notes,
        status: 'PENDING',
      });
      await booking.save({ session: session || undefined });

      // 4. Create Audit Log
      const auditLog = new AuditLog({
        bookingId: booking._id,
        actorId: new mongoose.Types.ObjectId(userId),
        actorRole: 'USER',
        action: 'CREATE_BOOKING',
        toStatus: 'PENDING',
        timestamp: new Date(),
        metadata: { readingTypeId, slotId },
      });
      await auditLog.save({ session: session || undefined });

      // 5. Create Outbox Event
      const outboxEvent = new OutboxEvent({
        type: 'BOOKING_CREATED',
        bookingId: booking._id,
        userId: new mongoose.Types.ObjectId(userId),
        payload: {
          slotId,
          readingTypeId,
        },
        status: 'PENDING',
        attempts: 0,
        nextAttemptAt: new Date(),
      });
      await outboxEvent.save({ session: session || undefined });

      return booking;
    });

    // 6. Trigger notification worker post-commit
    outboxService.trigger();

    return Booking.findById(result._id)
      .populate('userId', 'name email phone')
      .populate('readingTypeId', 'name price duration')
      .populate('slotId', 'date startTime endTime');
  }

  /**
   * Get all bookings for the authenticated client
   */
  public async getMyBookings(userId: string): Promise<any[]> {
    return Booking.find({ userId })
      .populate('readingTypeId', 'name price duration')
      .populate('slotId', 'date startTime endTime status')
      .sort({ createdAt: -1 });
  }

  /**
   * Get a single booking by ID with ownership enforcement
   */
  public async getBookingById(
    bookingId: string,
    userId: string,
    role: UserRole
  ): Promise<any> {
    const booking = await Booking.findById(bookingId)
      .populate('userId', 'name email phone')
      .populate('readingTypeId', 'name price duration')
      .populate('slotId', 'date startTime endTime status');

    if (!booking) {
      const err: any = new Error('Booking not found');
      err.statusCode = 404;
      throw err;
    }

    if (role !== 'ADMIN' && booking.userId._id.toString() !== userId) {
      const err: any = new Error('You do not have permission to view this booking');
      err.statusCode = 403;
      throw err;
    }

    return booking;
  }

  /**
   * Cancel booking
   */
  public async cancelBooking(
    bookingId: string,
    userId: string,
    role: UserRole,
    reason?: string
  ): Promise<any> {
    return bookingStateService.transitionBooking(
      bookingId,
      'CANCELLED',
      { userId, role },
      { reason }
    );
  }

  /**
   * Query bookings for Admin with filters, search, and pagination
   */
  public async getAdminBookings(query: {
    status?: string;
    date?: string;
    readingTypeId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ bookings: any[]; total: number; page: number; totalPages: number }> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (query.status && query.status !== 'ALL') {
      filter.status = query.status.toUpperCase();
    }

    if (query.readingTypeId && query.readingTypeId !== 'ALL') {
      filter.readingTypeId = query.readingTypeId;
    }

    // Search query on User name / email or Booking ID
    if (query.search && query.search.trim()) {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      if (mongoose.Types.ObjectId.isValid(query.search.trim())) {
        filter._id = new mongoose.Types.ObjectId(query.search.trim());
      } else {
        const matchingUsers = await User.find({
          $or: [{ name: searchRegex }, { email: searchRegex }],
        }).select('_id');
        const userIds = matchingUsers.map((u) => u._id);
        filter.userId = { $in: userIds };
      }
    }

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('userId', 'name email phone')
        .populate('readingTypeId', 'name price duration')
        .populate('slotId', 'date startTime endTime')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(filter),
    ]);

    // If date filter was applied, filter populated slot dates
    let finalBookings = bookings;
    if (query.date) {
      finalBookings = bookings.filter((b: any) => b.slotId?.date === query.date);
    }

    return {
      bookings: finalBookings,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Admin dashboard statistics
   */
  public async getDashboardStats(): Promise<any> {
    const todayStr = new Date().toISOString().split('T')[0];

    const [
      totalBookings,
      pendingCount,
      approvedCount,
      completedCount,
      cancelledCount,
      totalUsers,
      recentPending,
      upcomingSlots,
    ] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'PENDING' }),
      Booking.countDocuments({ status: 'APPROVED' }),
      Booking.countDocuments({ status: 'COMPLETED' }),
      Booking.countDocuments({ status: 'CANCELLED' }),
      User.countDocuments({ role: 'USER' }),
      Booking.find({ status: 'PENDING' })
        .populate('userId', 'name email phone')
        .populate('readingTypeId', 'name price duration')
        .populate('slotId', 'date startTime endTime')
        .sort({ createdAt: -1 })
        .limit(5),
      Slot.find({ date: { $gte: todayStr }, status: 'BOOKED' })
        .sort({ date: 1, startTime: 1 })
        .limit(5),
    ]);

    return {
      totalBookings,
      pendingCount,
      approvedCount,
      completedCount,
      cancelledCount,
      totalUsers,
      recentPending,
      upcomingReadingsCount: upcomingSlots.length,
    };
  }
}

export const bookingService = new BookingService();
