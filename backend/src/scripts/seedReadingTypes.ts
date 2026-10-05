import mongoose from 'mongoose';
import { env } from '../config/env';
import { ReadingType } from '../models/ReadingType';
import { Slot } from '../models/Slot';

const INITIAL_READING_TYPES = [
  {
    name: 'General Tarot Guidance',
    description: 'A comprehensive 3-card and Celtic cross spread exploring your current life energies, unseen influences, and upcoming opportunities.',
    duration: 30,
    price: 999,
    isActive: true,
  },
  {
    name: 'Love & Relationship Reading',
    description: 'Deep dive into romantic dynamics, partner energies, unspoken emotions, soul connections, and clarity for relationship dilemmas.',
    duration: 45,
    price: 1499,
    isActive: true,
  },
  {
    name: 'Career & Ambition Spread',
    description: 'Strategic cosmic insight into professional paths, business ventures, job transitions, and financial potential.',
    duration: 45,
    price: 1499,
    isActive: true,
  },
  {
    name: 'Deep Spiritual Guidance & Past Life',
    description: 'An immersive 60-minute sacred reading exploring higher soul purpose, karmic lessons, ancestral patterns, and spiritual awakening.',
    duration: 60,
    price: 1999,
    isActive: true,
  },
  {
    name: 'Quick Clarification Reading',
    description: 'A focused, rapid 15-minute session for seekers with a single urgent decision or pressing question.',
    duration: 15,
    price: 499,
    isActive: true,
  },
];

async function seedData() {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('[Seed] Connected to MongoDB');

    // 1. Seed Reading Types
    for (const rt of INITIAL_READING_TYPES) {
      await ReadingType.findOneAndUpdate(
        { name: rt.name },
        { $set: rt },
        { upsert: true, new: true }
      );
    }
    console.log('[Seed] Reading types seeded successfully');

    // 2. Seed initial slots for the next 7 days
    const today = new Date();
    const timeSlots = [
      { start: '10:00', end: '10:45' },
      { start: '11:30', end: '12:15' },
      { start: '14:00', end: '14:45' },
      { start: '16:00', end: '16:45' },
      { start: '18:00', end: '18:45' },
      { start: '19:30', end: '20:15' },
    ];

    let slotsCreated = 0;
    for (let dayOffset = 0; dayOffset <= 7; dayOffset++) {
      const targetDate = new Date();
      targetDate.setDate(today.getDate() + dayOffset);
      const dateStr = targetDate.toISOString().split('T')[0];

      for (const slot of timeSlots) {
        const existing = await Slot.findOne({
          date: dateStr,
          startTime: slot.start,
        });

        if (!existing) {
          await Slot.create({
            date: dateStr,
            startTime: slot.start,
            endTime: slot.end,
            status: 'AVAILABLE',
          });
          slotsCreated++;
        }
      }
    }
    console.log(`[Seed] Seeded ${slotsCreated} available sample slots for the next 7 days`);

    await mongoose.disconnect();
    console.log('[Seed] Done.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
