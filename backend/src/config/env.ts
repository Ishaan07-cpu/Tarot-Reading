import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend directory first, then root if not found
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const env = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tarot_reading',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret_must_be_set_in_production_987654321',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASSWORD: process.env.SMTP_PASSWORD || '',
  SMTP_FROM: process.env.SMTP_FROM || '"Mystic Tarot" <noreply@mystictarot.com>',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  ADMIN_NAME: process.env.ADMIN_NAME || 'Head Tarot Reader',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@mystictarot.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'AdminSecurePass123!',
};

export function validateEnv() {
  if (!env.MONGODB_URI) {
    console.warn('[WARN] MONGODB_URI is not set, defaulting to local mongodb');
  }
  if (!env.JWT_SECRET || env.JWT_SECRET === 'fallback_secret_must_be_set_in_production_987654321') {
    if (env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be securely configured in production');
    }
  }
}
