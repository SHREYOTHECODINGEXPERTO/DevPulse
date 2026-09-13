import { app } from '../server/app.ts';
import { initializeDatabase } from '../server/data/database.init.ts';

let isInitialized = false;

export default async function handler(req: any, res: any) {
  if (!isInitialized) {
    try {
      await initializeDatabase();
      isInitialized = true;
    } catch (err) {
      console.error('[Vercel Serverless] Error initializing database:', err);
    }
  }
  return app(req, res);
}
