import mongoose from 'mongoose';
import { BookingStateService, bookingStateService } from '../services/bookingState.service';
import { Booking } from '../models/Booking';
import { Slot } from '../models/Slot';
import { User } from '../models/User';
import { ReadingType } from '../models/ReadingType';
import { AuditLog } from '../models/AuditLog';
import { OutboxEvent } from '../models/OutboxEvent';
import { bookingService } from '../services/booking.service';
import { env } from '../config/env';

describe('Booking State Machine & Concurrency Tests', () => {
  let clientUser: any;
  let adminUser: any;
  let otherClientUser: any;
  let readingType: any;
  let testSlot: any;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(env.MONGODB_URI);
    }

    // Clean up test data
    await User.deleteMany({ email: { $regex: /@test-suite\.com$/ } });
    await ReadingType.deleteMany({ name: { $regex: /Test Reading/ } });
    await Slot.deleteMany({ date: '2029-12-31' });

    // Create client user
    clientUser = await User.create({
      name: 'Seeker Jane',
      email: 'jane@test-suite.com',
      phone: '+1-555-0101',
      passwordHash: 'dummyhash',
      role: 'USER',
      isEmailVerified: true,
    });

    // Create another client user
    otherClientUser = await User.create({
      name: 'Seeker Bob',
      email: 'bob@test-suite.com',
      phone: '+1-555-0102',
      passwordHash: 'dummyhash',
      role: 'USER',
      isEmailVerified: true,
    });

    // Create admin user
    adminUser = await User.create({
      name: 'Admin Oracle',
      email: 'oracle@test-suite.com',
      phone: '+1-555-0999',
      passwordHash: 'dummyhash',
      role: 'ADMIN',
      isEmailVerified: true,
    });

    // Create reading type
    readingType = await ReadingType.create({
      name: 'Test Reading Spread',
      description: 'Test Spread',
      duration: 30,
      price: 40,
      isActive: true,
    });
  });

  beforeEach(async () => {
    // Recreate fresh slot before each test
    await Slot.deleteMany({ date: '2029-12-31' });
    testSlot = await Slot.create({
      date: '2029-12-31',
      startTime: '15:00',
      endTime: '15:30',
      status: 'AVAILABLE',
    });
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $regex: /@test-suite\.com$/ } });
    await ReadingType.deleteMany({ name: { $regex: /Test Reading/ } });
    await Slot.deleteMany({ date: '2029-12-31' });
    await mongoose.disconnect();
  });

  test('Validates allowed and disallowed state transitions', () => {
    expect(BookingStateService.isValidTransition('PENDING', 'APPROVED')).toBe(true);
    expect(BookingStateService.isValidTransition('PENDING', 'REJECTED')).toBe(true);
    expect(BookingStateService.isValidTransition('PENDING', 'CANCELLED')).toBe(true);
    expect(BookingStateService.isValidTransition('APPROVED', 'COMPLETED')).toBe(true);
    expect(BookingStateService.isValidTransition('APPROVED', 'CANCELLED')).toBe(true);

    // Invalid transitions
    expect(BookingStateService.isValidTransition('REJECTED', 'APPROVED')).toBe(false);
    expect(BookingStateService.isValidTransition('CANCELLED', 'APPROVED')).toBe(false);
    expect(BookingStateService.isValidTransition('COMPLETED', 'APPROVED')).toBe(false);
    expect(BookingStateService.isValidTransition('APPROVED', 'PENDING')).toBe(false);
    expect(BookingStateService.isValidTransition('APPROVED', 'REJECTED')).toBe(false);
  });

  test('Creates a booking in PENDING state and marks slot HELD', async () => {
    const booking = await bookingService.createBooking(
      clientUser._id.toString(),
      testSlot._id.toString(),
      readingType._id.toString(),
      'Looking for career clarity'
    );

    expect(booking.status).toBe('PENDING');

    const updatedSlot = await Slot.findById(testSlot._id);
    expect(updatedSlot?.status).toBe('HELD');

    const outbox = await OutboxEvent.findOne({
      bookingId: booking._id,
      type: 'BOOKING_CREATED',
    });
    expect(outbox).not.toBeNull();
  });

  test('Prevents double-booking: second user cannot book an already reserved slot', async () => {
    // First booking succeeds
    await bookingService.createBooking(
      clientUser._id.toString(),
      testSlot._id.toString(),
      readingType._id.toString()
    );

    // Second booking on same slot must fail with conflict
    await expect(
      bookingService.createBooking(
        otherClientUser._id.toString(),
        testSlot._id.toString(),
        readingType._id.toString()
      )
    ).rejects.toThrow(/Slot is no longer available/i);
  });

  test('Admin approval workflow: PENDING -> APPROVED updates slot to BOOKED', async () => {
    const booking = await bookingService.createBooking(
      clientUser._id.toString(),
      testSlot._id.toString(),
      readingType._id.toString()
    );

    const approvedBooking = await bookingStateService.transitionBooking(
      booking._id,
      'APPROVED',
      { userId: adminUser._id.toString(), role: 'ADMIN' }
    );

    expect(approvedBooking.status).toBe('APPROVED');
    expect(approvedBooking.approvedAt).toBeDefined();

    const updatedSlot = await Slot.findById(testSlot._id);
    expect(updatedSlot?.status).toBe('BOOKED');

    // Outbox event created
    const outbox = await OutboxEvent.findOne({
      bookingId: booking._id,
      type: 'BOOKING_APPROVED',
    });
    expect(outbox).not.toBeNull();
  });

  test('Client cannot approve their own booking (Unauthorized transition)', async () => {
    const booking = await bookingService.createBooking(
      clientUser._id.toString(),
      testSlot._id.toString(),
      readingType._id.toString()
    );

    await expect(
      bookingStateService.transitionBooking(
        booking._id,
        'APPROVED',
        { userId: clientUser._id.toString(), role: 'USER' }
      )
    ).rejects.toThrow(/Clients are only permitted to cancel/i);
  });

  test('Admin rejection workflow: releases slot back to AVAILABLE', async () => {
    const booking = await bookingService.createBooking(
      clientUser._id.toString(),
      testSlot._id.toString(),
      readingType._id.toString()
    );

    const rejectedBooking = await bookingStateService.transitionBooking(
      booking._id,
      'REJECTED',
      { userId: adminUser._id.toString(), role: 'ADMIN' },
      { reason: 'Reader is unavailable during this time window' }
    );

    expect(rejectedBooking.status).toBe('REJECTED');
    expect(rejectedBooking.rejectionReason).toBe('Reader is unavailable during this time window');

    // Slot is now AVAILABLE again
    const updatedSlot = await Slot.findById(testSlot._id);
    expect(updatedSlot?.status).toBe('AVAILABLE');
  });

  test('Invalid transition rejection: cannot transition REJECTED -> APPROVED', async () => {
    const booking = await bookingService.createBooking(
      clientUser._id.toString(),
      testSlot._id.toString(),
      readingType._id.toString()
    );

    await bookingStateService.transitionBooking(
      booking._id,
      'REJECTED',
      { userId: adminUser._id.toString(), role: 'ADMIN' }
    );

    await expect(
      bookingStateService.transitionBooking(
        booking._id,
        'APPROVED',
        { userId: adminUser._id.toString(), role: 'ADMIN' }
      )
    ).rejects.toThrow(/Invalid booking status transition/i);
  });

  test('Completion workflow: APPROVED -> COMPLETED marks completedAt and retains slot history', async () => {
    const booking = await bookingService.createBooking(
      clientUser._id.toString(),
      testSlot._id.toString(),
      readingType._id.toString()
    );

    await bookingStateService.transitionBooking(
      booking._id,
      'APPROVED',
      { userId: adminUser._id.toString(), role: 'ADMIN' }
    );

    const completed = await bookingStateService.transitionBooking(
      booking._id,
      'COMPLETED',
      { userId: adminUser._id.toString(), role: 'ADMIN' }
    );

    expect(completed.status).toBe('COMPLETED');
    expect(completed.completedAt).toBeDefined();

    // Slot remains BOOKED for historical integrity
    const updatedSlot = await Slot.findById(testSlot._id);
    expect(updatedSlot?.status).toBe('BOOKED');
  });
});
