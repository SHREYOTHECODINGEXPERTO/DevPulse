import { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const { method, originalUrl } = req;

  // Log on response completion
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const color = status >= 500 ? '\x1b[31m' : status >= 400 ? '\x1b[33m' : status >= 300 ? '\x1b[36m' : '\x1b[32m';
    const reset = '\x1b[0m';
    
    // Only log in non-test mode or when debug is enabled
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[API] ${color}${method} ${originalUrl} ${status}${reset} - ${duration}ms`);
    }
  });

  next();
}
