import mongoose from 'mongoose';
import { env } from '../config/env';
import { User } from '../models/User';
import { hashPassword } from '../utils/crypto';

async function seedAdmin() {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('[SeedAdmin] Connected to MongoDB');

    const adminEmail = env.ADMIN_EMAIL.toLowerCase().trim();
    const passwordHash = await hashPassword(env.ADMIN_PASSWORD);

    // Use findOneAndUpdate with upsert so phone is always set correctly
    const result = await User.findOneAndUpdate(
      { email: adminEmail },
      {
        $set: {
          name: env.ADMIN_NAME,
          email: adminEmail,
          phone: '+91-9999-TAROT',
          passwordHash,
          role: 'ADMIN',
          isEmailVerified: true,
        },
      },
      { upsert: true, new: true, runValidators: false }
    );

    console.log(`[SeedAdmin] Admin seeded: ${result?.name} (${result?.email})`);

    await mongoose.disconnect();
    console.log('[SeedAdmin] Done.');
    process.exit(0);
  } catch (error) {
    console.error('[SeedAdmin] Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();
