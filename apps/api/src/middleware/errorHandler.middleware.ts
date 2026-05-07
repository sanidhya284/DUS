import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../shared/errors/AppError';
import { sendError } from '../shared/response/apiResponse';
import { env } from '../config/env';

export function errorHandlerMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Zod validation errors — return clean field-level messages
  if (err instanceof ZodError) {
    const message = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    sendError(res, 400, 'VALIDATION_ERROR', message);
    return;
  }
  // Known operational errors — safe to expose message
  if (err instanceof AppError && err.isOperational) {
    sendError(res, err.statusCode, err.code, err.message);
    return;
  }

  // Mongoose duplicate key error
  if ((err as NodeJS.ErrnoException).name === 'MongoServerError' && (err as any).code === 11000) {
    sendError(res, 409, 'CONFLICT', 'This short code or alias is already taken');
    return;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    sendError(res, 400, 'VALIDATION_ERROR', err.message);
    return;
  }

  // Unexpected error — log details, hide from client
  console.error(`[${req.requestId}] Unhandled error:`, {
    message: err.message,
    stack: env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  sendError(
    res,
    500,
    'INTERNAL_ERROR',
    env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  );
}
