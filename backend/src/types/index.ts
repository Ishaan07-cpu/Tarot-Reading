import { Types } from 'mongoose';

export type UserRole = 'USER' | 'ADMIN';

export type BookingStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'COMPLETED';

export type SlotStatus =
  | 'AVAILABLE'
  | 'HELD'
  | 'BOOKED'
  | 'DISABLED';

export type OutboxEventType =
  | 'BOOKING_CREATED'
  | 'BOOKING_APPROVED'
  | 'BOOKING_REJECTED'
  | 'BOOKING_CANCELLED'
  | 'BOOKING_COMPLETED';

export type OutboxStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'PROCESSED'
  | 'FAILED';

export type EmailStatus =
  | 'PENDING'
  | 'SENT'
  | 'FAILED';

export type OtpPurpose =
  | 'email_verification'
  | 'password_reset';

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOtpVerification {
  _id: Types.ObjectId;
  email: string;
  otpHash: string;
  purpose: OtpPurpose;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
}

export interface ISlot {
  _id: Types.ObjectId;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: SlotStatus;
  heldBy?: Types.ObjectId;
  heldUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReadingType {
  _id: Types.ObjectId;
  name: string;
  description: string;
  duration: number; // minutes
  price: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBooking {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  slotId: Types.ObjectId;
  readingTypeId: Types.ObjectId;
  notes?: string;
  status: BookingStatus;
  approvedAt?: Date;
  rejectedAt?: Date;
  cancelledAt?: Date;
  completedAt?: Date;
  rejectionReason?: string;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEmailLog {
  _id: Types.ObjectId;
  userId?: Types.ObjectId;
  bookingId?: Types.ObjectId;
  type: string;
  recipient: string;
  status: EmailStatus;
  attempts: number;
  sentAt?: Date;
  lastError?: string;
  createdAt: Date;
}

export interface IOutboxEvent {
  _id: Types.ObjectId;
  type: OutboxEventType;
  bookingId?: Types.ObjectId;
  userId?: Types.ObjectId;
  payload: Record<string, any>;
  status: OutboxStatus;
  attempts: number;
  nextAttemptAt: Date;
  createdAt: Date;
  processedAt?: Date;
  lastError?: string;
}

export interface IAuditLog {
  _id: Types.ObjectId;
  bookingId: Types.ObjectId;
  actorId: Types.ObjectId;
  actorRole: 'USER' | 'ADMIN' | 'SYSTEM';
  action: string;
  fromStatus?: BookingStatus;
  toStatus: BookingStatus;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface AuthUserPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
}
