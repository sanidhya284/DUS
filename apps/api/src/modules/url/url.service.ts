import { Types } from 'mongoose';
import { UrlRepository } from './url.repository';
import { ShortenUrlInput, UrlResponse, RedirectResult } from './url.types';
import { getNextSequence } from '../../shared/utils/counter';
import { encodeBase62 } from '../../shared/utils/base62';
import { validateUrl } from '../../shared/utils/urlValidator';
import { getRedisClient, isRedisAvailable } from '../../config/redis';
import { enqueueClickEvent } from '../../config/queue';
import { hashIp } from '../../shared/utils/hashIp';
import { lookupCountry } from '../../shared/utils/geoip';
import { AppError } from '../../shared/errors/AppError';
import { env } from '../../config/env';

const CACHE_TTL = 3600; // 1 hour
const CACHE_PREFIX = 'url:';

const repo = new UrlRepository();

function buildShortUrl(shortCode: string): string {
  return `${env.SHORT_CODE_BASE_URL}/${shortCode}`;
}

function toUrlResponse(url: any): UrlResponse {
  return {
    shortCode: url.shortCode,
    shortUrl: buildShortUrl(url.shortCode),
    originalUrl: url.originalUrl,
    customAlias: url.customAlias,
    expiresAt: url.expiresAt,
    clickCount: url.clickCount,
    isActive: url.isActive,
    createdAt: url.createdAt,
  };
}

async function cacheUrl(shortCode: string, originalUrl: string): Promise<void> {
  const redis = getRedisClient();
  if (!redis || !isRedisAvailable()) return;
  await redis.setex(`${CACHE_PREFIX}${shortCode}`, CACHE_TTL, originalUrl);
}

async function getCachedUrl(shortCode: string): Promise<string | null> {
  const redis = getRedisClient();
  if (!redis || !isRedisAvailable()) return null;
  return redis.get(`${CACHE_PREFIX}${shortCode}`);
}

async function invalidateCache(shortCode: string): Promise<void> {
  const redis = getRedisClient();
  if (!redis || !isRedisAvailable()) return;
  await redis.del(`${CACHE_PREFIX}${shortCode}`);
}

export async function shortenUrl(input: ShortenUrlInput): Promise<UrlResponse> {
  // 1. Validate URL
  const validation = validateUrl(input.originalUrl);
  if (!validation.valid) throw AppError.badRequest(validation.error!, 'INVALID_URL');

  // 2. Dedup: same user + same URL → return existing
  if (input.userId) {
    const existing = await repo.findByOriginalUrlAndUser(input.originalUrl, input.userId);
    if (existing) return toUrlResponse(existing);
  }

  // 3. Determine short code
  let shortCode: string;
  let customAlias = false;

  if (input.alias) {
    const taken = await repo.findByShortCode(input.alias);
    if (taken) throw AppError.conflict('This alias is already taken', 'ALIAS_TAKEN');
    shortCode = input.alias;
    customAlias = true;
  } else {
    const seq = await getNextSequence();
    shortCode = encodeBase62(seq);
  }

  // 4. Persist
  const url = await repo.create({
    shortCode,
    originalUrl: input.originalUrl,
    customAlias,
    userId: input.userId,
    expiresAt: input.expiresAt,
  });

  // 5. Warm cache immediately
  await cacheUrl(shortCode, input.originalUrl);

  return toUrlResponse(url);
}

export async function resolveRedirect(
  shortCode: string,
  meta: { ip: string; userAgent: string; referrer: string }
): Promise<RedirectResult> {
  // 1. Cache hit (fast path)
  const cached = await getCachedUrl(shortCode);
  if (cached) {
    // Fire-and-forget analytics
    enqueueClickEvent({
      shortCode,
      timestamp: new Date(),
      ipHash: hashIp(meta.ip),
      userAgent: meta.userAgent,
      referrer: meta.referrer,
      country: lookupCountry(meta.ip),
    });
    return { originalUrl: cached, shortCode };
  }

  // 2. Cache miss — DB lookup
  const url = await repo.findByShortCode(shortCode);
  if (!url) throw AppError.notFound('Short URL not found');

  // 3. Check expiry
  if (url.expiresAt && url.expiresAt < new Date()) {
    throw AppError.gone();
  }

  // 4. Populate cache for next time
  await cacheUrl(shortCode, url.originalUrl);

  // 5. Fire-and-forget analytics
  enqueueClickEvent({
    shortCode,
    timestamp: new Date(),
    ipHash: hashIp(meta.ip),
    userAgent: meta.userAgent,
    referrer: meta.referrer,
    country: lookupCountry(meta.ip),
  });

  return { originalUrl: url.originalUrl, shortCode };
}

export async function getUserUrls(
  userId: Types.ObjectId,
  page: number,
  limit: number
): Promise<{ urls: UrlResponse[]; total: number; page: number; limit: number }> {
  const { urls, total } = await repo.findByUserId(userId, page, limit);
  return { urls: urls.map(toUrlResponse), total, page, limit };
}

export async function deleteUrl(shortCode: string, userId: Types.ObjectId): Promise<void> {
  const deleted = await repo.softDelete(shortCode, userId);
  if (!deleted) throw AppError.notFound('URL not found or not owned by you');
  await invalidateCache(shortCode);
}

export async function updateUrl(
  shortCode: string,
  userId: Types.ObjectId,
  data: { expiresAt?: Date; isActive?: boolean }
): Promise<UrlResponse> {
  const updated = await repo.update(shortCode, userId, data);
  if (!updated) throw AppError.notFound('URL not found or not owned by you');
  await invalidateCache(shortCode);
  return toUrlResponse(updated);
}
