import { Request, Response } from 'express';
import { User } from '../models/User';
import { OtpVerification } from '../models/OtpVerification';
import {
  generateOTP,
  hashOTP,
  verifyOTP,
  hashPassword,
  comparePassword,
} from '../utils/crypto';
import { signToken } from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { emailService } from '../services/email.service';
import { env } from '../config/env';

const authCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? ('none' as const) : ('lax' as const),
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export class AuthController {
  /**
   * POST /api/auth/signup
   */
  public static async signup(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, phone, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        if (existingUser.role === 'ADMIN' || existingUser.email === env.ADMIN_EMAIL.toLowerCase()) {
          sendError(res, 'An account with this email already exists.', 409);
          return;
        }
        if (existingUser.isEmailVerified) {
          sendError(res, 'An account with this email already exists.', 409);
          return;
        }
        // If user registered earlier but never verified email, update password and details
        existingUser.name = name;
        existingUser.phone = phone;
        existingUser.role = 'USER';
        existingUser.passwordHash = await hashPassword(password);
        await existingUser.save();
      } else {
        const passwordHash = await hashPassword(password);
        const newUser = new User({
          name,
          email,
          phone,
          passwordHash,
          role: 'USER', // Always explicitly USER
          isEmailVerified: false,
        });
        await newUser.save();
      }

      // Generate secure 6-digit OTP
      const otp = generateOTP();
      const otpHash = hashOTP(otp);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Remove existing OTP for email & purpose
      await OtpVerification.deleteMany({ email, purpose: 'email_verification' });

      await OtpVerification.create({
        email,
        otpHash,
        purpose: 'email_verification',
        expiresAt,
        attempts: 0,
      });

      // Send OTP via email
      const sent = await emailService.sendOTPEmail(email, otp, 'email_verification');
      if (!sent && env.NODE_ENV === 'production') {
        sendError(res, 'Unable to send verification email. Please try again.', 500);
        return;
      }

      sendSuccess(
        res,
        { email },
        201,
        'Account created successfully. Please enter the OTP sent to your email.'
      );
    } catch (error: any) {
      console.error('[Signup] Error:', error);
      sendError(res, error.message || 'Failed to complete signup', 500);
    }
  }

  /**
   * POST /api/auth/verify-email
   */
  public static async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp } = req.body;

      const record = await OtpVerification.findOne({
        email,
        purpose: 'email_verification',
      });

      if (!record) {
        sendError(res, 'Verification code has expired or does not exist. Please request a new code.', 400);
        return;
      }

      if (record.attempts >= 5) {
        await OtpVerification.deleteOne({ _id: record._id });
        sendError(res, 'Maximum verification attempts exceeded. Please request a new code.', 400);
        return;
      }

      const isValid = verifyOTP(otp, record.otpHash);
      if (!isValid) {
        record.attempts += 1;
        await record.save();
        sendError(res, 'Invalid verification code. Please check and try again.', 400);
        return;
      }

      // Mark user as email verified
      const user = await User.findOneAndUpdate(
        { email },
        { $set: { isEmailVerified: true } },
        { new: true }
      );

      if (!user) {
        sendError(res, 'User not found.', 404);
        return;
      }

      // Cleanup used OTP
      await OtpVerification.deleteOne({ _id: record._id });

      // Generate JWT
      const token = signToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name,
      });

      // Set HTTP-only cookie
      res.cookie('token', token, authCookieOptions);

      sendSuccess(
        res,
        {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
          },
          token,
        },
        200,
        'Email verified successfully.'
      );
    } catch (error: any) {
      console.error('[VerifyEmail] Error:', error);
      sendError(res, error.message || 'Email verification failed', 500);
    }
  }

  /**
   * POST /api/auth/resend-otp
   */
  public static async resendOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        sendError(res, 'No account found with this email address.', 404);
        return;
      }

      if (user.isEmailVerified) {
        sendError(res, 'This email is already verified. Please log in.', 400);
        return;
      }

      // Check cooldown (60 seconds)
      const existing = await OtpVerification.findOne({
        email,
        purpose: 'email_verification',
      });

      if (existing) {
        const timeSinceCreated = Date.now() - new Date(existing.createdAt).getTime();
        if (timeSinceCreated < 60 * 1000) {
          const waitSeconds = Math.ceil((60 * 1000 - timeSinceCreated) / 1000);
          sendError(res, `Please wait ${waitSeconds} seconds before requesting another code.`, 429);
          return;
        }
      }

      const otp = generateOTP();
      const otpHash = hashOTP(otp);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await OtpVerification.deleteMany({ email, purpose: 'email_verification' });
      await OtpVerification.create({
        email,
        otpHash,
        purpose: 'email_verification',
        expiresAt,
        attempts: 0,
      });

      await emailService.sendOTPEmail(email, otp, 'email_verification');

      sendSuccess(res, { email }, 200, 'A new verification code has been sent to your email.');
    } catch (error: any) {
      console.error('[ResendOtp] Error:', error);
      sendError(res, error.message || 'Failed to resend verification code', 500);
    }
  }

  /**
   * POST /api/auth/login
   */
  public static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).select('+passwordHash');
      if (!user) {
        sendError(res, 'Invalid email or password.', 401);
        return;
      }

      const isMatch = await comparePassword(password, user.passwordHash);
      if (!isMatch) {
        sendError(res, 'Invalid email or password.', 401);
        return;
      }

      // Check if email is verified
      if (!user.isEmailVerified && user.role !== 'ADMIN') {
        // Generate new verification OTP
        const otp = generateOTP();
        const otpHash = hashOTP(otp);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await OtpVerification.deleteMany({ email, purpose: 'email_verification' });
        await OtpVerification.create({
          email,
          otpHash,
          purpose: 'email_verification',
          expiresAt,
          attempts: 0,
        });

        await emailService.sendOTPEmail(email, otp, 'email_verification');

        sendError(
          res,
          'Your email address is not verified. A new verification OTP has been sent.',
          403,
          { needsVerification: true, email }
        );
        return;
      }

      const token = signToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name,
      });

      res.cookie('token', token, authCookieOptions);

      sendSuccess(
        res,
        {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
          },
          token,
        },
        200,
        'Welcome back!'
      );
    } catch (error: any) {
      console.error('[Login] Error:', error);
      sendError(res, error.message || 'Login failed', 500);
    }
  }

  /**
   * POST /api/auth/logout
   */
  public static async logout(_req: Request, res: Response): Promise<void> {
    res.clearCookie('token', {
      httpOnly: authCookieOptions.httpOnly,
      secure: authCookieOptions.secure,
      sameSite: authCookieOptions.sameSite,
    });
    sendSuccess(res, null, 200, 'Logged out successfully.');
  }

  /**
   * POST /api/auth/forgot-password
   */
  public static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (user) {
        const otp = generateOTP();
        const otpHash = hashOTP(otp);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await OtpVerification.deleteMany({ email, purpose: 'password_reset' });
        await OtpVerification.create({
          email,
          otpHash,
          purpose: 'password_reset',
          expiresAt,
          attempts: 0,
        });

        await emailService.sendPasswordResetEmail(user.name, email, otp);
      }

      // Always return success to prevent email discovery attacks
      sendSuccess(
        res,
        { email },
        200,
        'If an account exists with that email, a password reset code has been sent.'
      );
    } catch (error: any) {
      console.error('[ForgotPassword] Error:', error);
      sendError(res, error.message || 'Failed to initiate password reset', 500);
    }
  }

  /**
   * POST /api/auth/reset-password
   */
  public static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp, password } = req.body;

      const record = await OtpVerification.findOne({
        email,
        purpose: 'password_reset',
      });

      if (!record) {
        sendError(res, 'Reset code has expired or is invalid. Please request a new one.', 400);
        return;
      }

      if (record.attempts >= 5) {
        await OtpVerification.deleteOne({ _id: record._id });
        sendError(res, 'Too many invalid attempts. Please request a new reset code.', 400);
        return;
      }

      const isValid = verifyOTP(otp, record.otpHash);
      if (!isValid) {
        record.attempts += 1;
        await record.save();
        sendError(res, 'Invalid reset code. Please try again.', 400);
        return;
      }

      const newPasswordHash = await hashPassword(password);
      await User.findOneAndUpdate({ email }, { $set: { passwordHash: newPasswordHash } });

      await OtpVerification.deleteOne({ _id: record._id });

      sendSuccess(res, null, 200, 'Password has been reset successfully. You can now log in.');
    } catch (error: any) {
      console.error('[ResetPassword] Error:', error);
      sendError(res, error.message || 'Failed to reset password', 500);
    }
  }

  /**
   * GET /api/auth/me
   */
  public static async getMe(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthenticated', 401);
        return;
      }

      const user = await User.findById(req.user.userId);
      if (!user) {
        sendError(res, 'User not found', 404);
        return;
      }

      sendSuccess(res, {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      });
    } catch (error: any) {
      sendError(res, error.message || 'Failed to fetch user', 500);
    }
  }

  /**
   * PATCH /api/auth/profile
   */
  public static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthenticated', 401);
        return;
      }

      const { name, phone } = req.body;
      const updates: any = {};
      if (name) updates.name = name;
      if (phone) updates.phone = phone;

      const user = await User.findByIdAndUpdate(
        req.user.userId,
        { $set: updates },
        { new: true }
      );

      sendSuccess(res, {
        id: user?._id,
        name: user?.name,
        email: user?.email,
        phone: user?.phone,
        role: user?.role,
      }, 200, 'Profile updated successfully.');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to update profile', 500);
    }
  }
}
