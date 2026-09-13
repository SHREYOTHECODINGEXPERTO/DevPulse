import mongoose from 'mongoose';
import { config } from './index.ts';

/**
 * Mask sensitive credentials in MongoDB connection URI string for secure logging
 */
export function maskMongoUri(uri: string): string {
  if (!uri) return 'not configured';
  try {
    // Matches mongodb://user:pass@host or mongodb+srv://user:pass@host
    return uri.replace(/(mongodb(?:\+srv)?:\/\/)([^:@]+):([^@]+)@/i, '$1$2:****@');
  } catch {
    return 'mongodb://****:****@****';
  }
}

export interface DatabaseHealthInfo {
  status: 'connected' | 'connecting' | 'disconnected' | 'fallback_mode';
  readyState: number;
  host: string;
  database: string;
  isFallback: boolean;
  poolSize?: number;
  pingLatencyMs?: number;
}

let isFallbackMode = false;

/**
 * Connect to MongoDB with secure credentials and connection pooling
 */
export async function connectDatabase(): Promise<typeof mongoose | null> {
  const uri = config.mongoUri;
  const maskedUri = maskMongoUri(uri);

  if (mongoose.connection.readyState === 1) {
    console.log(`[Database] Already connected to ${maskedUri}`);
    return mongoose;
  }

  const options: mongoose.ConnectOptions = {
    maxPoolSize: config.dbMaxPoolSize || 10,
    minPoolSize: config.dbMinPoolSize || 2,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4, // Use IPv4, skip trying IPv6
    autoIndex: true,
  };

  try {
    console.log(`[Database] Connecting to MongoDB: ${maskedUri}...`);
    await mongoose.connect(uri, options);
    isFallbackMode = false;
    console.log(`[Database] ✅ Connected successfully to MongoDB [${mongoose.connection.name}]`);
    return mongoose;
  } catch (err: any) {
    console.warn(`[Database] ⚠️ MongoDB connection attempt to [${maskedUri}] failed: ${err.message}`);
    console.info(`[Database] 💡 Operating in resilient persistent local storage mode with full schema & relational modeling.`);
    isFallbackMode = true;
    return null;
  }
}

/**
 * Disconnect from MongoDB gracefully
 */
export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('[Database] Disconnected from MongoDB');
  }
}

/**
 * Get live database health metrics for /api/health endpoint
 */
export async function getDatabaseHealth(): Promise<DatabaseHealthInfo> {
  const readyState = mongoose.connection.readyState;
  let status: DatabaseHealthInfo['status'] = 'disconnected';

  if (readyState === 1) {
    status = 'connected';
  } else if (readyState === 2) {
    status = 'connecting';
  } else if (isFallbackMode) {
    status = 'fallback_mode';
  }

  let pingLatencyMs: number | undefined;
  if (readyState === 1 && mongoose.connection.db) {
    try {
      const start = performance.now();
      await mongoose.connection.db.admin().ping();
      pingLatencyMs = Math.round(performance.now() - start);
    } catch {
      pingLatencyMs = undefined;
    }
  }

  return {
    status,
    readyState,
    host: mongoose.connection.host || 'local',
    database: mongoose.connection.name || config.dbName,
    isFallback: isFallbackMode,
    poolSize: config.dbMaxPoolSize,
    pingLatencyMs,
  };
}

// Connection event hooks for observability
mongoose.connection.on('connected', () => {
  console.log('[Database Event] Connection established');
});

mongoose.connection.on('error', (err) => {
  console.error('[Database Event] Connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('[Database Event] Connection lost');
});

export { mongoose, isFallbackMode };
