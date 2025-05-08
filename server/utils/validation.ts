import { Response } from 'express';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';

/**
 * Handle validation errors and return appropriate response
 */
export function handleValidationError(err: unknown, res: Response, defaultMessage: string = 'Validation error') {
  if (err instanceof ZodError) {
    const validationError = fromZodError(err);
    return res.status(400).json({ 
      message: validationError.message,
      errors: err.errors
    });
  }
  
  console.error('Error:', err);
  return res.status(500).json({ message: defaultMessage || 'Internal server error' });
}