import mongoose from 'mongoose';
import { env } from './env';

let isReplicaSet = false;

export async function connectDB(): Promise<void> {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    console.log(`[DB] Connected to MongoDB: ${conn.connection.host}`);

    // Check if connected instance is a replica set (required for multi-doc transactions)
    try {
      if (conn.connection.db) {
        const adminDb = conn.connection.db.admin();
        const serverStatus = await adminDb.serverStatus();
        isReplicaSet = !!serverStatus.repl;
        console.log(`[DB] Replica Set Mode: ${isReplicaSet ? 'YES (Transactions fully supported)' : 'NO (Standalone mode)'}`);
      }
    } catch {
      // In some Atlas restricted user roles, serverStatus might be forbidden. Try ping or default
      isReplicaSet = true;
    }
  } catch (error) {
    console.error('[DB] MongoDB connection error:', error);
    process.exit(1);
  }
}

/**
 * Execute a unit of work inside a MongoDB transaction if replica set is available,
 * or execute directly if running on a standalone development MongoDB instance.
 */
export async function withTransaction<T>(
  fn: (session?: mongoose.ClientSession) => Promise<T>
): Promise<T> {
  if (!isReplicaSet) {
    // Standalone MongoDB does not support transactions
    return await fn(undefined);
  }

  const session = await mongoose.startSession();
  try {
    let result: T;
    await session.withTransaction(async () => {
      result = await fn(session);
    });
    return result!;
  } catch (error: any) {
    // If transaction failed due to replica set error, fall back gracefully
    if (error?.message?.includes('replica set member') || error?.codeName === 'CommandNotSupportedOnStandalone') {
      isReplicaSet = false;
      return await fn(undefined);
    }
    throw error;
  } finally {
    await session.endSession();
  }
}
