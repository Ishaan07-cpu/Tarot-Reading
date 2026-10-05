import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User';
import { OtpVerification } from '../models/OtpVerification';
import { env } from '../config/env';

describe('Auth & Security API Integration Tests', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(env.MONGODB_URI);
    }
    await User.deleteMany({ email: { $regex: /@authtest\.com$/ } });
    await OtpVerification.deleteMany({ email: { $regex: /@authtest\.com$/ } });
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $regex: /@authtest\.com$/ } });
    await OtpVerification.deleteMany({ email: { $regex: /@authtest\.com$/ } });
    await mongoose.disconnect();
  });

  const testUser = {
    name: 'Astral Walker',
    email: 'astral@authtest.com',
    phone: '+1-555-7788',
    password: 'SecretPassword123!',
    confirmPassword: 'SecretPassword123!',
  };

  test('POST /api/auth/signup - creates unverified user and generates OTP', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const user = await User.findOne({ email: testUser.email });
    expect(user).not.toBeNull();
    expect(user?.isEmailVerified).toBe(false);
    expect(user?.role).toBe('USER'); // Role must be USER

    const otpRecord = await OtpVerification.findOne({
      email: testUser.email,
      purpose: 'email_verification',
    });
    expect(otpRecord).not.toBeNull();
    expect(otpRecord?.otpHash).toBeDefined();
  });

  test('POST /api/auth/verify-email - rejects invalid OTP and accepts correct OTP', async () => {
    // 1. Send invalid OTP
    const invalidRes = await request(app)
      .post('/api/auth/verify-email')
      .send({
        email: testUser.email,
        otp: '000000',
      });
    expect(invalidRes.status).toBe(400);

    // 2. Fetch the actual OTP hash or inject a known OTP
    const { hashOTP } = require('../utils/crypto');
    const knownOtp = '123456';
    await OtpVerification.updateOne(
      { email: testUser.email },
      { $set: { otpHash: hashOTP(knownOtp), attempts: 0 } }
    );

    // 3. Send valid OTP
    const validRes = await request(app)
      .post('/api/auth/verify-email')
      .send({
        email: testUser.email,
        otp: knownOtp,
      });

    expect(validRes.status).toBe(200);
    expect(validRes.body.success).toBe(true);
    expect(validRes.body.data.token).toBeDefined();
    expect(validRes.body.data.user.isEmailVerified).toBe(true);
  });

  test('POST /api/auth/login - authenticates verified user with JWT cookie', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  test('POST /api/auth/login - rejects invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'WrongPassword999!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/auth/me - returns authenticated user details', async () => {
    // First login to get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    const token = loginRes.body.data.token;

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.data.email).toBe(testUser.email);
    expect(meRes.body.data.role).toBe('USER');
  });

  test('Protected admin endpoint rejects regular client token', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    const token = loginRes.body.data.token;

    const adminRes = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(adminRes.status).toBe(403);
    expect(adminRes.body.message).toMatch(/Administrator privileges required/i);
  });
});
