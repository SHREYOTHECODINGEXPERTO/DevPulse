import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || '/api',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  
  // Database Configuration (MongoDB & Persistence)
  mongoUri: process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/devpulse',
  dbName: process.env.DB_NAME || 'devpulse',
  dbMaxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE || '10', 10),
  dbMinPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE || '2', 10),
  dbFilePath: process.env.STORAGE_FILE || path.resolve(process.cwd(), 'server', 'data', 'db.json'),
  
  appName: 'DevPulse REST API',
  appVersion: '1.0.0',
};
