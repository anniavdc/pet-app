import { Request, Response, NextFunction } from 'express';
import { NotFoundError, ValidationError, DomainError } from '@domain/errors';

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (error instanceof ValidationError) {
    res.status(400).json({
      error: 'Validation failed',
      details: error.errors,
    });
    return;
  }

  if (error instanceof NotFoundError) {
    res.status(404).json({
      error: error.message,
    });
    return;
  }

  if (error instanceof DomainError) {
    res.status(400).json({
      error: error.message,
    });
    return;
  }

  // Log unexpected errors
  console.error('Unexpected error:', error);
  
  res.status(500).json({
    error: 'Internal server error',
  });
}
