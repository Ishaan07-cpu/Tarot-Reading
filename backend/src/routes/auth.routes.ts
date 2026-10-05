import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateBody } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';
import { authLimiter, otpLimiter } from '../middleware/rateLimiter';
import {
  signupSchema,
  verifyEmailSchema,
  resendOtpSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from '../utils/validation';

const router = Router();

router.post('/signup', authLimiter, validateBody(signupSchema), AuthController.signup);
router.post('/verify-email', otpLimiter, validateBody(verifyEmailSchema), AuthController.verifyEmail);
router.post('/resend-otp', otpLimiter, validateBody(resendOtpSchema), AuthController.resendOtp);
router.post('/login', authLimiter, validateBody(loginSchema), AuthController.login);
router.post('/logout', AuthController.logout);
router.post('/forgot-password', authLimiter, validateBody(forgotPasswordSchema), AuthController.forgotPassword);
router.post('/reset-password', authLimiter, validateBody(resetPasswordSchema), AuthController.resetPassword);

router.get('/me', requireAuth, AuthController.getMe);
router.patch('/profile', requireAuth, validateBody(updateProfileSchema), AuthController.updateProfile);

export default router;
