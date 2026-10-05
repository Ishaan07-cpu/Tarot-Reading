import { Schema, model } from 'mongoose';
import { ISlot } from '../types';

const slotSchema = new Schema<ISlot>(
  {
    date: {
      type: String, // format: YYYY-MM-DD
      required: true,
      index: true,
    },
    startTime: {
      type: String, // format: HH:mm (24hr)
      required: true,
    },
    endTime: {
      type: String, // format: HH:mm (24hr)
      required: true,
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'HELD', 'BOOKED', 'DISABLED'],
      default: 'AVAILABLE',
      required: true,
      index: true,
    },
    heldBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    heldUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness of slots by date and startTime
slotSchema.index({ date: 1, startTime: 1 }, { unique: true });
// Compound index for fast queries of available slots
slotSchema.index({ date: 1, status: 1 });

export const Slot = model<ISlot>('Slot', slotSchema);
