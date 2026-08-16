import { Request, Response, NextFunction } from 'express';
import * as z from 'zod';

export function validate(schema: z.ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({ body: req.body });
    if (!result.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: z.flattenError(result.error).fieldErrors,
      });
    }
    next();
  };
}