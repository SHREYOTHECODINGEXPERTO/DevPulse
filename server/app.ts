import express, { Express, Request, Response } from 'express';
import { config } from './config/index.ts';
import { requestLogger } from './middleware/logger.ts';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.ts';
import apiRoutes from './routes/index.ts';

export function createApp(): Express {
  const app = express();

  // Basic CORS support
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', config.corsOrigin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    next();
  });

  // Body parsers
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  // Request logger
  app.use(requestLogger);

  // Root redirect to Swagger documentation
  app.get('/', (req: Request, res: Response) => {
    res.redirect(`${config.apiPrefix}/docs`);
  });

  // Mount API router
  app.use(config.apiPrefix, apiRoutes);

  // 404 Catch-all handler
  app.use(notFoundHandler);

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();
