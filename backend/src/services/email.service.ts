import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { EmailLog } from '../models/EmailLog';
import { Types } from 'mongoose';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  type: string;
  userId?: Types.ObjectId | string;
  bookingId?: Types.ObjectId | string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured = false;

  constructor() {
    this.initTransporter();
  }

  private initTransporter(): void {
    if (env.SMTP_USER && env.SMTP_PASSWORD) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASSWORD,
        },
      });
      this.isConfigured = true;
      console.log('[EmailService] SMTP transporter configured with Gmail/Host:', env.SMTP_HOST);
    } else {
      console.log('[EmailService] SMTP credentials not set. Operating in local console delivery mode.');
      this.isConfigured = false;
    }
  }

  private wrapMysticTemplate(title: string, bodyContent: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            background-color: #0b0819;
            color: #e2e8f0;
            font-family: 'Cinzel', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 24px;
          }
          .container {
            max-width: 580px;
            margin: 0 auto;
            background: linear-gradient(180deg, #161033 0%, #0e0922 100%);
            border: 1px solid #7e22ce;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0,0,0,0.5);
          }
          .header {
            padding: 32px 24px 16px;
            text-align: center;
            border-bottom: 1px solid #3b1d6e;
          }
          .logo {
            font-size: 24px;
            font-weight: 700;
            color: #fbbf24;
            letter-spacing: 2px;
            text-transform: uppercase;
          }
          .subtitle {
            font-size: 13px;
            color: #a855f7;
            letter-spacing: 1px;
            margin-top: 4px;
          }
          .content {
            padding: 32px 28px;
            line-height: 1.6;
            font-size: 15px;
            color: #cbd5e1;
          }
          .highlight-card {
            background: rgba(147, 51, 234, 0.12);
            border: 1px solid #9333ea;
            border-radius: 8px;
            padding: 20px;
            margin: 24px 0;
            text-align: center;
          }
          .otp-code {
            font-size: 32px;
            font-weight: bold;
            color: #f59e0b;
            letter-spacing: 6px;
            margin: 12px 0;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #2d1f56;
          }
          .footer {
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #64748b;
            background-color: #080612;
            border-top: 1px solid #1e153b;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">✦ Mystic Tarot ✦</div>
            <div class="subtitle">Illuminating Your Path</div>
          </div>
          <div class="content">
            <h2 style="color: #f3e8ff; margin-top: 0; font-size: 20px;">${title}</h2>
            ${bodyContent}
          </div>
          <div class="footer">
            <p>May the celestial forces guide your journey.<br/>Mystic Tarot Sanctuary &bull; All rights reserved</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  public async sendEmail(options: EmailOptions): Promise<boolean> {
    const { to, subject, html, type, userId, bookingId } = options;

    let emailLog = new EmailLog({
      userId: userId ? new Types.ObjectId(userId) : undefined,
      bookingId: bookingId ? new Types.ObjectId(bookingId) : undefined,
      type,
      recipient: to,
      status: 'PENDING',
      attempts: 1,
    });

    try {
      if (this.isConfigured && this.transporter) {
        await this.transporter.sendMail({
          from: env.SMTP_FROM,
          to,
          subject,
          html,
        });
      } else {
        // Log cleanly to console for development/test visibility
        console.log(`\n================== [EMAIL DISPATCHED: ${type}] ==================`);
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Time: ${new Date().toISOString()}`);
        console.log(`=================================================================\n`);
      }

      emailLog.status = 'SENT';
      emailLog.sentAt = new Date();
      await emailLog.save();
      return true;
    } catch (error: any) {
      console.error(`[EmailService] Failed to send email to ${to}:`, error.message);
      emailLog.status = 'FAILED';
      emailLog.lastError = error.message;
      await emailLog.save().catch(() => {});
      return false;
    }
  }

  public async sendOTPEmail(
    email: string,
    otp: string,
    purpose: 'email_verification' | 'password_reset'
  ): Promise<boolean> {
    const isSignup = purpose === 'email_verification';
    const subject = isSignup
      ? 'Verify Your Tarot Reading Account'
      : 'Reset Your Tarot Reading Account Password';

    const bodyContent = `
      <p>Greetings seeker,</p>
      <p>
        ${
          isSignup
            ? 'Thank you for stepping onto the celestial path. Please verify your email address to complete your registration.'
            : 'A password reset request was received for your Mystic Tarot account. If you did not make this request, you may safely ignore this message.'
        }
      </p>
      <div class="highlight-card">
        <div style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #a855f7;">Your One-Time Code</div>
        <div class="otp-code">${otp}</div>
        <div style="font-size: 12px; color: #94a3b8;">This sacred key expires in 10 minutes. Do not share it with anyone.</div>
      </div>
      <p style="font-size: 13px; color: #94a3b8;">Warm regards,<br/>The Mystic Tarot Circle</p>
    `;

    const success = await this.sendEmail({
      to: email,
      subject,
      html: this.wrapMysticTemplate(subject, bodyContent),
      type: isSignup ? 'OTP_VERIFICATION' : 'PASSWORD_RESET_OTP',
    });

    if (!success && env.NODE_ENV === 'development') {
      console.log(`\n======================================================`);
      console.log(`✨ [DEV OTP FALLBACK] (SMTP delivery failed)`);
      console.log(`Email: ${email}`);
      console.log(`One-Time Code (OTP): ${otp}`);
      console.log(`======================================================\n`);
    }

    return success;
  }

  public async sendBookingReceivedEmail(
    clientName: string,
    clientEmail: string,
    booking: {
      bookingId: string;
      readingType: string;
      date: string;
      time: string;
    },
    userId?: string
  ): Promise<boolean> {
    const subject = 'Your Tarot Reading Booking Request';
    const bodyContent = `
      <p>Dear ${clientName},</p>
      <p>We have successfully received your tarot reading request. Our head reader will review your requested time slot shortly.</p>
      <div class="highlight-card" style="text-align: left;">
        <div style="margin-bottom: 8px;"><strong>Booking ID:</strong> <span style="color: #fbbf24;">${booking.bookingId}</span></div>
        <div style="margin-bottom: 8px;"><strong>Reading Type:</strong> ${booking.readingType}</div>
        <div style="margin-bottom: 8px;"><strong>Requested Date:</strong> ${booking.date}</div>
        <div style="margin-bottom: 8px;"><strong>Scheduled Time:</strong> ${booking.time}</div>
        <div><strong>Status:</strong> <span style="color: #fbbf24; font-weight: bold;">Pending Approval</span></div>
      </div>
      <p>You will receive an approval confirmation as soon as your slot is confirmed.</p>
    `;

    return this.sendEmail({
      to: clientEmail,
      subject,
      html: this.wrapMysticTemplate(subject, bodyContent),
      type: 'BOOKING_RECEIVED',
      userId,
      bookingId: booking.bookingId,
    });
  }

  public async sendBookingApprovedEmail(
    clientName: string,
    clientEmail: string,
    booking: {
      bookingId: string;
      readingType: string;
      date: string;
      time: string;
    },
    userId?: string
  ): Promise<boolean> {
    const subject = 'Your Tarot Reading Booking Has Been Approved';
    const bodyContent = `
      <p>Dear ${clientName},</p>
      <p>The universe has aligned. Your tarot reading session has been officially <strong>confirmed and approved</strong> by our reader.</p>
      <div class="highlight-card" style="text-align: left; border-color: #10b981; background: rgba(16, 185, 129, 0.1);">
        <div style="margin-bottom: 8px;"><strong>Booking ID:</strong> <span style="color: #fbbf24;">${booking.bookingId}</span></div>
        <div style="margin-bottom: 8px;"><strong>Reading Type:</strong> ${booking.readingType}</div>
        <div style="margin-bottom: 8px;"><strong>Date:</strong> ${booking.date}</div>
        <div style="margin-bottom: 8px;"><strong>Time:</strong> ${booking.time}</div>
        <div><strong>Status:</strong> <span style="color: #34d399; font-weight: bold;">Approved & Confirmed</span></div>
      </div>
      <p><strong>Instructions for your session:</strong></p>
      <ul>
        <li>Find a quiet, calm sanctuary for your reading.</li>
        <li>Reflect upon any specific intentions or questions you wish to bring to the cards.</li>
        <li>Be ready 5 minutes before your scheduled start time.</li>
      </ul>
      <p>We eagerly await connecting with you in the cards.</p>
    `;

    return this.sendEmail({
      to: clientEmail,
      subject,
      html: this.wrapMysticTemplate(subject, bodyContent),
      type: 'BOOKING_APPROVED',
      userId,
      bookingId: booking.bookingId,
    });
  }

  public async sendBookingRejectedEmail(
    clientName: string,
    clientEmail: string,
    booking: {
      bookingId: string;
      readingType: string;
      date: string;
      time: string;
    },
    reason?: string,
    userId?: string
  ): Promise<boolean> {
    const subject = 'Update Regarding Your Tarot Reading Booking';
    const bodyContent = `
      <p>Dear ${clientName},</p>
      <p>We are writing to inform you that your booking request could not be confirmed at this time.</p>
      <div class="highlight-card" style="text-align: left; border-color: #ef4444; background: rgba(239, 68, 68, 0.1);">
        <div style="margin-bottom: 8px;"><strong>Booking ID:</strong> <span style="color: #fbbf24;">${booking.bookingId}</span></div>
        <div style="margin-bottom: 8px;"><strong>Reading:</strong> ${booking.readingType}</div>
        <div style="margin-bottom: 8px;"><strong>Date:</strong> ${booking.date} at ${booking.time}</div>
        <div style="margin-bottom: 8px;"><strong>Status:</strong> <span style="color: #f87171; font-weight: bold;">Rejected</span></div>
        ${reason ? `<div><strong>Reader Note:</strong> <em>${reason}</em></div>` : ''}
      </div>
      <p>The slot has been released. You are warmly welcome to select another available time on our schedule.</p>
    `;

    return this.sendEmail({
      to: clientEmail,
      subject,
      html: this.wrapMysticTemplate(subject, bodyContent),
      type: 'BOOKING_REJECTED',
      userId,
      bookingId: booking.bookingId,
    });
  }

  public async sendBookingCancelledEmail(
    clientName: string,
    clientEmail: string,
    booking: {
      bookingId: string;
      readingType: string;
      date: string;
      time: string;
    },
    reason?: string,
    userId?: string
  ): Promise<boolean> {
    const subject = 'Your Tarot Reading Booking Has Been Cancelled';
    const bodyContent = `
      <p>Dear ${clientName},</p>
      <p>This is confirmation that your tarot reading session has been cancelled.</p>
      <div class="highlight-card" style="text-align: left;">
        <div style="margin-bottom: 8px;"><strong>Booking ID:</strong> ${booking.bookingId}</div>
        <div style="margin-bottom: 8px;"><strong>Reading:</strong> ${booking.readingType}</div>
        <div style="margin-bottom: 8px;"><strong>Date:</strong> ${booking.date} at ${booking.time}</div>
        <div style="margin-bottom: 8px;"><strong>Status:</strong> <span style="color: #94a3b8; font-weight: bold;">Cancelled</span></div>
        ${reason ? `<div><strong>Reason:</strong> <em>${reason}</em></div>` : ''}
      </div>
      <p>If you wish to reschedule for another date, please visit your dashboard to book a new slot.</p>
    `;

    return this.sendEmail({
      to: clientEmail,
      subject,
      html: this.wrapMysticTemplate(subject, bodyContent),
      type: 'BOOKING_CANCELLED',
      userId,
      bookingId: booking.bookingId,
    });
  }

  public async sendPasswordResetEmail(
    clientName: string,
    clientEmail: string,
    otp: string
  ): Promise<boolean> {
    return this.sendOTPEmail(clientEmail, otp, 'password_reset');
  }
}

export const emailService = new EmailService();
