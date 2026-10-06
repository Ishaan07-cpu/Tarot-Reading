import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env, validateEnv } from './config/env';
import { connectDB } from './config/db';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';

import authRoutes from './routes/auth.routes';
import slotRoutes from './routes/slot.routes';
import readingTypeRoutes from './routes/readingType.routes';
import bookingRoutes from './routes/booking.routes';
import adminRoutes from './routes/admin.routes';

validateEnv();

export const app = express();

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration
// CLIENT_URL may be comma-separated for multiple allowed origins
const allowedOrigins = new Set([
  ...env.CLIENT_URL.split(',').map((u) => u.trim()).filter(Boolean),
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
]);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server) or Vercel preview/production domains
      if (!origin || allowedOrigins.has(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin} is not an allowed origin.`));
      }
    },
    credentials: true,
  })
);

// Ensure MongoDB is connected before processing requests (critical for Vercel serverless execution)
app.use(async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

// Rate limiter on general API calls
app.use('/api', apiLimiter);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Tarot Reading API',
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/reading-types', readingTypeRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// Centralized error handling
app.use(errorHandler);

export default app;
