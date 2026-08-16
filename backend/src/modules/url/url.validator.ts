import * as z from 'zod';

const RESERVED_ALIASES = ['register', 'login', 'logout', 'refresh', 'me', 'health', 'api', 'admin'];

function isValidUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export const createUrlSchema = z.object({
  body: z.object({
    originalUrl: z
      .string()
      .trim()
      .min(1, 'URL is required')
      .refine(isValidUrl, 'Must be a valid http or https URL'),
    customAlias: z
      .string()
      .trim()
      .min(3, 'Alias must be at least 3 characters')
      .max(30, 'Alias must be at most 30 characters')
      .regex(/^[a-zA-Z0-9_-]+$/, 'Alias can only contain letters, numbers, hyphens, and underscores')
      .refine((val) => !RESERVED_ALIASES.includes(val.toLowerCase()), 'This alias is reserved')
      .optional(),
    expiresAt: z.coerce.date().min(new Date(), 'Expiry must be in the future').optional(),
  }),
});

export const updateUrlSchema = z.object({
  body: z
    .object({
      originalUrl: z
        .string()
        .trim()
        .min(1, 'URL is required')
        .refine(isValidUrl, 'Must be a valid http or https URL')
        .optional(),
      expiresAt: z.coerce.date().min(new Date(), 'Expiry must be in the future').optional(),
    })
    .refine((data) => data.originalUrl !== undefined || data.expiresAt !== undefined, {
      message: 'At least one field (originalUrl or expiresAt) must be provided',
    }),
});