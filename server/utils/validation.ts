import { Response } from 'express';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';

/**
 * Handle validation errors and return appropriate response
 */
export function handleValidationError(
  error: unknown, 
  res: Response, 
  defaultMessage: string = 'Validation error'
) {
  console.error('Validation error:', error);

  if (error instanceof ZodError) {
    const validationError = fromZodError(error);
    return res.status(400).json({
      error: validationError.message
    });
  }

  if (error instanceof Error) {
    return res.status(500).json({
      error: error.message || defaultMessage
    });
  }

  return res.status(500).json({
    error: defaultMessage
  });
}