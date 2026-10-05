import { OutboxEvent } from '../models/OutboxEvent';
import { Booking } from '../models/Booking';
import { emailService } from './email.service';
import { realtimeService } from './realtime.service';

class OutboxService {
  private isRunning = false;
  private intervalTimer: NodeJS.Timeout | null = null;

  public startWorker(intervalMs = 4000): void {
    if (this.intervalTimer) return;
    this.intervalTimer = setInterval(() => {
      this.processPendingEvents().catch((err) =>
        console.error('[OutboxWorker] Error during poll:', err)
      );
    }, intervalMs);
    console.log('[OutboxWorker] Background outbox processor started');
  }

  public stopWorker(): void {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
  }

  /**
   * Immediate trigger to process events without waiting for the next polling tick
   */
  public trigger(): void {
    setImmediate(() => {
      this.processPendingEvents().catch((err) =>
        console.error('[OutboxWorker] Immediate trigger error:', err)
      );
    });
  }

  public async processPendingEvents(): Promise<number> {
    if (this.isRunning) return 0;
    this.isRunning = true;

    let processedCount = 0;
    try {
      const now = new Date();
      // Find up to 10 pending events that are ready to process
      const events = await OutboxEvent.find({
        status: { $in: ['PENDING'] },
        nextAttemptAt: { $lte: now },
      })
        .sort({ createdAt: 1 })
        .limit(10);

      for (const event of events) {
        event.status = 'PROCESSING';
        event.attempts += 1;
        await event.save();

        try {
          await this.handleEvent(event);
          event.status = 'PROCESSED';
          event.processedAt = new Date();
          await event.save();
          processedCount++;
        } catch (error: any) {
          console.error(`[OutboxWorker] Error processing event ${event._id}:`, error.message);
          event.lastError = error.message;

          if (event.attempts >= 3) {
            event.status = 'FAILED';
          } else {
            event.status = 'PENDING';
            // Exponential-style backoff (5s, 15s)
            const delaySec = event.attempts === 1 ? 5 : 15;
            event.nextAttemptAt = new Date(Date.now() + delaySec * 1000);
          }
          await event.save();
        }
      }
    } finally {
      this.isRunning = false;
    }

    return processedCount;
  }

  private async handleEvent(event: any): Promise<void> {
    const booking = await Booking.findById(event.bookingId)
      .populate('userId', 'name email phone')
      .populate('readingTypeId', 'name price duration')
      .populate('slotId', 'date startTime endTime');

    if (!booking) {
      console.warn(`[OutboxWorker] Booking ${event.bookingId} not found for event ${event._id}`);
      return;
    }

    const client: any = booking.userId;
    const readingType: any = booking.readingTypeId;
    const slot: any = booking.slotId;

    const bookingDetails = {
      bookingId: booking._id.toString(),
      readingType: readingType?.name || 'Tarot Reading',
      date: slot?.date || 'N/A',
      time: slot?.startTime ? `${slot.startTime} - ${slot.endTime}` : 'N/A',
    };

    switch (event.type) {
      case 'BOOKING_CREATED': {
        // 1. Realtime notification to admins
        realtimeService.emitBookingCreated(booking);
        // 2. Email confirmation to client
        if (client?.email) {
          await emailService.sendBookingReceivedEmail(
            client.name,
            client.email,
            bookingDetails,
            client._id.toString()
          );
        }
        break;
      }

      case 'BOOKING_APPROVED': {
        // 1. Realtime notification to client and admins
        realtimeService.emitBookingUpdated(booking);
        // 2. Email confirmation to client
        if (client?.email) {
          await emailService.sendBookingApprovedEmail(
            client.name,
            client.email,
            bookingDetails,
            client._id.toString()
          );
        }
        break;
      }

      case 'BOOKING_REJECTED': {
        // 1. Realtime notification to client and admins
        realtimeService.emitBookingUpdated(booking);
        // 2. Email rejection to client
        if (client?.email) {
          await emailService.sendBookingRejectedEmail(
            client.name,
            client.email,
            bookingDetails,
            booking.rejectionReason || undefined,
            client._id.toString()
          );
        }
        break;
      }

      case 'BOOKING_CANCELLED': {
        // 1. Realtime notification to client and admins
        realtimeService.emitBookingUpdated(booking);
        // 2. Email cancellation to client
        if (client?.email) {
          await emailService.sendBookingCancelledEmail(
            client.name,
            client.email,
            bookingDetails,
            booking.cancellationReason || undefined,
            client._id.toString()
          );
        }
        break;
      }

      case 'BOOKING_COMPLETED': {
        // 1. Realtime notification to client and admins
        realtimeService.emitBookingUpdated(booking);
        break;
      }

      default:
        console.warn(`[OutboxWorker] Unknown event type: ${event.type}`);
    }
  }
}

export const outboxService = new OutboxService();
