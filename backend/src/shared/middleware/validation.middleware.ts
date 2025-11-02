import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { createError } from './error-handler.js';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        throw createError(
          `Validation error: ${err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
          400,
          'VALIDATION_ERROR'
        );
      }
      throw err;
    }
  };
}
