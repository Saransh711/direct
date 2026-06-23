import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../common/errors';
import { logger } from '../config/logger';

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    errors: [{ message: `No route registered for ${req.originalUrl}` }],
    traceId: req.correlationId,
  });
}

export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  void _next;

  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
      traceId: req.correlationId,
    });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      errors: error.details ?? [],
      traceId: req.correlationId,
    });
    return;
  }

  if (error instanceof Error) {
    logger.error({ err: error, traceId: req.correlationId }, 'Unhandled exception');
  } else {
    logger.error({ error, traceId: req.correlationId }, 'Unhandled exception');
  }
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    errors: [],
    traceId: req.correlationId,
  });
}
