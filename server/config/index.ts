import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || '/api',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  dbFilePath: process.env.STORAGE_FILE || path.resolve(process.cwd(), 'server', 'data', 'db.json'),
  appName: 'DevPulse REST API',
  appVersion: '1.0.0',
};
