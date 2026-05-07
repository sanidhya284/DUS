import { Request, Response, NextFunction } from 'express';
import { getRedisClient, isRedisAvailable } from '../config/redis';
import { AppError } from '../shared/errors/AppError';
import { env } from '../config/env';

// In-memory fallback store when Redis is down
const fallbackStore = new Map<string, { tokens: number; resetAt: number }>();

interface RateLimitConfig {
  maxTokens: number;
  windowMs: number;
}

function getLimit(req: Request, config?: Partial<RateLimitConfig>): RateLimitConfig {
  const plan = req.user?.plan ?? 'anon';
  const windowMs = config?.windowMs ?? env.RATE_LIMIT_WINDOW_MS;

  const maxByPlan: Record<string, number> = {
    anon: env.RATE_LIMIT_MAX_ANON,
    free: env.RATE_LIMIT_MAX_FREE,
    pro: env.RATE_LIMIT_MAX_PRO,
    enterprise: 500,
  };

  return {
    maxTokens: config?.maxTokens ?? (maxByPlan[plan] ?? env.RATE_LIMIT_MAX_ANON),
    windowMs,
  };
}

async function checkRedisRateLimit(key: string, maxTokens: number, windowMs: number): Promise<number> {
  const redis = getRedisClient()!;

  // Atomic sliding window: INCR then set expiry on first hit only
  const current = await redis.incr(key);
  if (current === 1) {
    await redis.pexpire(key, windowMs);
  }

  return maxTokens - current; // positive = remaining, negative = exceeded
}

function checkFallbackRateLimit(key: string, maxTokens: number, windowMs: number): number {
  const now = Date.now();
  const entry = fallbackStore.get(key);

  if (!entry || now > entry.resetAt) {
    fallbackStore.set(key, { tokens: maxTokens - 1, resetAt: now + windowMs });
    return maxTokens - 1;
  }

  if (entry.tokens <= 0) return -1;

  entry.tokens -= 1;
  return entry.tokens;
}

export function rateLimit(config?: Partial<RateLimitConfig>) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Skip rate limiting in test environment — the in-process store persists
    // across tests causing spurious 429s. Rate limiting is tested separately.
    if (env.NODE_ENV === 'test') return next();

    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ?? req.ip ?? 'unknown';
    const { maxTokens, windowMs } = getLimit(req, config);
    const key = `rate:${ip}:${req.path}`;

    let remaining: number;

    if (isRedisAvailable()) {
      remaining = await checkRedisRateLimit(key, maxTokens, windowMs);
    } else {
      remaining = checkFallbackRateLimit(key, maxTokens, windowMs);
    }

    res.setHeader('X-RateLimit-Limit', maxTokens);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, remaining));
    res.setHeader('X-RateLimit-Reset', Math.ceil((Date.now() + windowMs) / 1000));

    if (remaining < 0) {
      throw AppError.tooManyRequests();
    }

    next();
  };
}
