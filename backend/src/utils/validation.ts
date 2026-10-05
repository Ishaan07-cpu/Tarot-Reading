import { z } from 'zod';

export const signupSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters'),
    email: z.string().trim().email('Invalid email address').toLowerCase(),
    phone: z.string().trim().min(7, 'Phone number must be at least 7 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const verifyEmailSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  otp: z.string().trim().length(6, 'OTP must be 6 digits'),
});

export const resendOtpSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
});

export const resetPasswordSchema = z
  .object({
    email: z.string().trim().email('Invalid email address').toLowerCase(),
    otp: z.string().trim().length(6, 'OTP must be 6 digits'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const createSlotSchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
    startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Start time must be HH:mm (24hr)'),
    endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'End time must be HH:mm (24hr)'),
  })
  .refine(
    (data) => {
      // Must not be in the past
      const todayStr = new Date().toISOString().split('T')[0];
      if (data.date < todayStr) return false;
      return true;
    },
    { message: 'Slot date cannot be in the past', path: ['date'] }
  )
  .refine(
    (data) => {
      // endTime must be strictly after startTime
      return data.endTime > data.startTime;
    },
    { message: 'End time must be after start time', path: ['endTime'] }
  );

export const createBookingSchema = z.object({
  slotId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid slot ID'),
  readingTypeId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid reading type ID'),
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional().default(''),
});

export const rejectBookingSchema = z.object({
  reason: z.string().max(500, 'Reason cannot exceed 500 characters').optional(),
});

export const cancelBookingSchema = z.object({
  reason: z.string().max(500, 'Reason cannot exceed 500 characters').optional(),
});

export const readingTypeSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  description: z.string().trim().min(5, 'Description must be at least 5 characters'),
  duration: z.number().int().min(5, 'Duration must be at least 5 minutes').max(180),
  price: z.number().min(0, 'Price cannot be negative'),
  isActive: z.boolean().optional().default(true),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().trim().min(7, 'Phone number must be at least 7 characters').optional(),
});
