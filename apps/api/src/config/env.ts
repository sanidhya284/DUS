import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  API_BASE_URL: z.string().url(),

  // MongoDB
  MONGO_URI: z.string().min(1),
  MONGO_DB_NAME: z.string().default('dus'),

  // Redis
  REDIS_URL: z.string().min(1),
  REDIS_PASSWORD: z.string().optional(),

  // JWT
  JWT_PRIVATE_KEY_PATH: z.string().min(1),
  JWT_PUBLIC_KEY_PATH: z.string().min(1),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Short code
  SHORT_CODE_LENGTH: z.coerce.number().default(6),
  SHORT_CODE_BASE_URL: z.string().url(),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_MAX_ANON: z.coerce.number().default(10),
  RATE_LIMIT_MAX_FREE: z.coerce.number().default(30),
  RATE_LIMIT_MAX_PRO: z.coerce.number().default(100),

  // BullMQ
  BULL_CONCURRENCY: z.coerce.number().default(10),

  // GeoIP
  GEOIP_DB_PATH: z.string().default('./data/GeoLite2-Country.mmdb'),

  // Safe Browsing (optional)
  GOOGLE_SAFE_BROWSING_API_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
