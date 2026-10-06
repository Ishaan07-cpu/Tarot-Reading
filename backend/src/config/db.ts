import mongoose from 'mongoose';
import { env } from './env';

let isReplicaSet = false;
let isConnected = false;

export async function connectDB(): Promise<void> {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (isConnected) {
    return;
  }

  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    isConnected = true;
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
      // In some Atlas restricted user roles, serverStatus might be forbidden. Default to replica set
      isReplicaSet = true;
    }
  } catch (error) {
    isConnected = false;
    console.error('[DB] MongoDB connection error:', error);
    throw error;
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
