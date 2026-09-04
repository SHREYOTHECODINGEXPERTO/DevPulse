import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../models/types.ts';

export class ApiError extends Error {
  public statusCode: number;
  public errorCode: string;
  public details?: any[];

  constructor(statusCode: number, message: string, errorCode: string = 'INTERNAL_ERROR', details?: any[]) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends ApiError {
  constructor(message: string = 'Bad request', details?: any[]) {
    super(400, message, 'BAD_REQUEST', details);
  }
}

export class ValidationError extends ApiError {
  constructor(message: string = 'Validation failed', details?: any[]) {
    super(400, message, 'VALIDATION_ERROR', details);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized access') {
    super(401, message, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Access forbidden') {
    super(403, message, 'FORBIDDEN');
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string = 'Resource', id?: string) {
    const message = id ? `${resource} with ID '${id}' was not found` : `${resource} was not found`;
    super(404, message, 'NOT_FOUND');
  }
}

export class ConflictError extends ApiError {
  constructor(message: string = 'Resource conflict', details?: any[]) {
    super(409, message, 'CONFLICT', details);
  }
}

export class UnprocessableEntityError extends ApiError {
  constructor(message: string = 'Unprocessable entity', details?: any[]) {
    super(422, message, 'UNPROCESSABLE_ENTITY', details);
  }
}

export class InternalServerError extends ApiError {
  constructor(message: string = 'Internal server error') {
    super(500, message, 'INTERNAL_SERVER_ERROR');
  }
}

export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  next(new NotFoundError(`Endpoint '${req.method} ${req.originalUrl}'`));
}

export function errorHandler(
  err: Error | ApiError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  const timestamp = new Date().toISOString();
  const path = req.originalUrl;

  if (err instanceof ApiError) {
    const responseBody: ApiResponse = {
      success: false,
      error: {
        code: err.errorCode,
        message: err.message,
        details: err.details,
      },
      timestamp,
      path,
    };
    return res.status(err.statusCode).json(responseBody);
  }

  // Handle standard JSON syntax errors from express.json()
  if ('type' in err && (err as any).type === 'entity.parse.failed') {
    const responseBody: ApiResponse = {
      success: false,
      error: {
        code: 'MALFORMED_JSON',
        message: 'Invalid JSON payload received in request body',
      },
      timestamp,
      path,
    };
    return res.status(400).json(responseBody);
  }

  // Unhandled errors
  console.error('[Unhandled Error]', err);
  const responseBody: ApiResponse = {
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production' ? 'An unexpected server error occurred' : err.message,
    },
    timestamp,
    path,
  };
  return res.status(500).json(responseBody);
}
