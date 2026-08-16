import * as z from 'zod';

export const dateRangeQuerySchema = z
  .object({
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  })
  .refine((data) => !data.from || !data.to || data.from <= data.to, {
    message: 'from date must be before or equal to to date',
    path: ['to'],
  });