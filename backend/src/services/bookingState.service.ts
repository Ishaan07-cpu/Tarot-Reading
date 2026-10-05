import mongoose from 'mongoose';
import { Booking } from '../models/Booking';
import { Slot } from '../models/Slot';
import { AuditLog } from '../models/AuditLog';
import { OutboxEvent } from '../models/OutboxEvent';
import { withTransaction } from '../config/db';
import { outboxService } from './outbox.service';
import { BookingStatus, UserRole } from '../types';

export interface TransitionActor {
  userId: string;
  role: UserRole;
}

export interface TransitionOptions {
  reason?: string;
  metadata?: Record<string, any>;
}

export class BookingStateService {
  /**
   * Allowed state transitions map
   */
  private static readonly ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
    PENDING: ['APPROVED', 'REJECTED', 'CANCELLED'],
    APPROVED: ['COMPLETED', 'CANCELLED'],
    REJECTED: [],
    CANCELLED: [],
    COMPLETED: [],
  };

  /**
   * Validate whether a transition from one state to another is permissible
   */
  public static isValidTransition(from: BookingStatus, to: BookingStatus): boolean {
    const allowed = BookingStateService.ALLOWED_TRANSITIONS[from];
    return allowed ? allowed.includes(to) : false;
  }

  /**
   * Execute state transition on a booking
   */
  public async transitionBooking(
    bookingId: string | mongoose.Types.ObjectId,
    targetState: BookingStatus,
    actor: TransitionActor,
    options: TransitionOptions = {}
  ): Promise<any> {
    const result = await withTransaction(async (session) => {
      const booking = await Booking.findById(bookingId).session(session || null);
      if (!booking) {
        const err: any = new Error('Booking not found');
        err.statusCode = 404;
        throw err;
      }

      const currentState = booking.status;

      // 1. Verify state transition is valid
      if (!BookingStateService.isValidTransition(currentState, targetState)) {
        const err: any = new Error(
          `Invalid booking status transition from ${currentState} to ${targetState}`
        );
        err.statusCode = 409;
        throw err;
      }

      // 2. Verify actor permissions
      if (actor.role === 'USER') {
        // A user can ONLY cancel their own booking
        if (booking.userId.toString() !== actor.userId) {
          const err: any = new Error('You do not have permission to modify this booking');
          err.statusCode = 403;
          throw err;
        }
        if (targetState !== 'CANCELLED') {
          const err: any = new Error('Clients are only permitted to cancel their bookings');
          err.statusCode = 403;
          throw err;
        }
      }

      // 3. Find and validate slot
      const slot = await Slot.findById(booking.slotId).session(session || null);
      if (!slot) {
        const err: any = new Error('Associated slot not found');
        err.statusCode = 404;
        throw err;
      }

      const now = new Date();

      // 4. Apply status-specific changes to booking and slot
      switch (targetState) {
        case 'APPROVED': {
          booking.status = 'APPROVED';
          booking.approvedAt = now;
          slot.status = 'BOOKED';
          slot.heldBy = undefined;
          slot.heldUntil = undefined;
          break;
        }

        case 'REJECTED': {
          booking.status = 'REJECTED';
          booking.rejectedAt = now;
          booking.rejectionReason = options.reason || undefined;
          // Release slot back to AVAILABLE
          slot.status = 'AVAILABLE';
          slot.heldBy = undefined;
          slot.heldUntil = undefined;
          break;
        }

        case 'CANCELLED': {
          booking.status = 'CANCELLED';
          booking.cancelledAt = now;
          booking.cancellationReason = options.reason || undefined;
          // Release slot back to AVAILABLE
          slot.status = 'AVAILABLE';
          slot.heldBy = undefined;
          slot.heldUntil = undefined;
          break;
        }

        case 'COMPLETED': {
          booking.status = 'COMPLETED';
          booking.completedAt = now;
          // Slot remains BOOKED for historical integrity
          break;
        }
      }

      // Save updated booking and slot
      await booking.save({ session: session || undefined });
      await slot.save({ session: session || undefined });

      // 5. Create audit log
      const auditLog = new AuditLog({
        bookingId: booking._id,
        actorId: actor.userId,
        actorRole: actor.role,
        action: `TRANSITION_${targetState}`,
        fromStatus: currentState,
        toStatus: targetState,
        timestamp: now,
        metadata: {
          reason: options.reason,
          ...options.metadata,
        },
      });
      await auditLog.save({ session: session || undefined });

      // 6. Create outbox event
      const eventType = `BOOKING_${targetState}` as any;
      const outboxEvent = new OutboxEvent({
        type: eventType,
        bookingId: booking._id,
        userId: booking.userId,
        payload: {
          fromStatus: currentState,
          toStatus: targetState,
          reason: options.reason,
        },
        status: 'PENDING',
        attempts: 0,
        nextAttemptAt: now,
      });
      await outboxEvent.save({ session: session || undefined });

      return booking;
    });

    // 7. Trigger outbox worker asynchronously post-commit
    outboxService.trigger();

    // Re-fetch populated booking for clean response
    return Booking.findById(result._id)
      .populate('userId', 'name email phone')
      .populate('readingTypeId', 'name price duration')
      .populate('slotId', 'date startTime endTime');
  }
}

export const bookingStateService = new BookingStateService();
