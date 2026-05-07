import { z } from 'zod';

// After toLowerCase(), only lowercase alphanumeric + hyphen remain
const ALIAS_REGEX = /^[a-z0-9-]+$/;

const RESERVED_CODES = new Set([
  'api', 'admin', 'login', 'register', 'health', 'status',
  'dashboard', 'static', 'assets', 'favicon.ico', 'robots.txt',
  'sitemap.xml', 'auth', 'logout', 'signup', 'me',
]);

export const shortenUrlSchema = z.object({
  originalUrl: z
    .string({ required_error: 'originalUrl is required' })
    .url('Must be a valid URL')
    .max(2048, 'URL too long'),
  alias: z
    .string()
    .min(3, 'Alias must be at least 3 characters')
    .max(32, 'Alias must not exceed 32 characters')
    .toLowerCase()                                            // normalize to lowercase — case-insensitive
    .regex(ALIAS_REGEX, 'Alias can only contain a-z, 0-9, and hyphens')
    .refine((val) => !RESERVED_CODES.has(val), 'This alias is reserved')
    .optional(),
  expiresAt: z
    .string()
    .datetime()
    .refine((val) => new Date(val) > new Date(), 'Expiry date must be in the future')
    .transform((val) => new Date(val))
    .optional(),
});

export const updateUrlSchema = z.object({
  alias: z
    .string()
    .min(3)
    .max(32)
    .regex(ALIAS_REGEX)
    .optional(),
  expiresAt: z
    .string()
    .datetime()
    .transform((val) => new Date(val))
    .optional(),
  isActive: z.boolean().optional(),
});

export type ShortenUrlDto = z.infer<typeof shortenUrlSchema>;
export type UpdateUrlDto = z.infer<typeof updateUrlSchema>;
