import { Schema, model } from 'mongoose';
import { IOutboxEvent } from '../types';

const outboxEventSchema = new Schema<IOutboxEvent>(
  {
    type: {
      type: String,
      enum: [
        'BOOKING_CREATED',
        'BOOKING_APPROVED',
        'BOOKING_REJECTED',
        'BOOKING_CANCELLED',
        'BOOKING_COMPLETED',
      ],
      required: true,
      index: true,
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    payload: {
      type: Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'PROCESSED', 'FAILED'],
      default: 'PENDING',
      required: true,
      index: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    nextAttemptAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    processedAt: {
      type: Date,
      default: null,
    },
    lastError: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound index for outbox worker polling
outboxEventSchema.index({ status: 1, nextAttemptAt: 1, createdAt: 1 });

export const OutboxEvent = model<IOutboxEvent>('OutboxEvent', outboxEventSchema);
