import { Schema, model } from 'mongoose';
import { IReadingType } from '../types';

const readingTypeSchema = new Schema<IReadingType>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: Number, // in minutes
      required: true,
      min: 5,
      max: 180,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ReadingType = model<IReadingType>('ReadingType', readingTypeSchema);
