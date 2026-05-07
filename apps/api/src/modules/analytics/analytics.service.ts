import { AnalyticsRepository } from './analytics.repository';
import { UrlRepository } from '../url/url.repository';
import { AppError } from '../../shared/errors/AppError';
import { Types } from 'mongoose';

const analyticsRepo = new AnalyticsRepository();
const urlRepo = new UrlRepository();

async function assertOwnership(shortCode: string, userId: Types.ObjectId): Promise<void> {
  const url = await urlRepo.findById(
    new Types.ObjectId(), // Will be looked up by shortCode below
    userId
  );
  // Re-fetch by shortCode since findById requires _id
  const urlByCode = await urlRepo.findByShortCode(shortCode);
  if (!urlByCode) throw AppError.notFound('Short URL not found');
  if (String(urlByCode.userId) !== String(userId)) throw AppError.forbidden();
}

export async function getStats(shortCode: string, userId: Types.ObjectId) {
  await assertOwnership(shortCode, userId);
  return analyticsRepo.getClickStats(shortCode);
}

export async function getGeo(shortCode: string, userId: Types.ObjectId) {
  await assertOwnership(shortCode, userId);
  return analyticsRepo.getGeoBreakdown(shortCode);
}

export async function getTimeSeries(
  shortCode: string,
  userId: Types.ObjectId,
  from: Date,
  to: Date,
  granularity: 'day' | 'hour'
) {
  await assertOwnership(shortCode, userId);
  return analyticsRepo.getTimeSeries(shortCode, from, to, granularity);
}
