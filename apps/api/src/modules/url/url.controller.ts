import { Request, Response } from 'express';
import { Types } from 'mongoose';
import * as urlService from './url.service';
import { shortenUrlSchema, updateUrlSchema } from './url.validator';
import { sendSuccess } from '../../shared/response/apiResponse';
import { AppError } from '../../shared/errors/AppError';

export async function shorten(req: Request, res: Response): Promise<void> {
  const body = shortenUrlSchema.parse(req.body);

  const result = await urlService.shortenUrl({
    originalUrl: body.originalUrl,
    alias: body.alias,
    expiresAt: body.expiresAt,
    userId: req.user ? new Types.ObjectId(req.user.sub) : undefined,
  });

  sendSuccess(res, result, 201);
}

export async function redirect(req: Request, res: Response): Promise<void> {
  const { shortCode } = req.params;
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ?? req.ip ?? '';

  const { originalUrl } = await urlService.resolveRedirect(shortCode, {
    ip,
    userAgent: req.headers['user-agent'] ?? '',
    referrer: req.headers.referer ?? '',
  });

  res.redirect(302, originalUrl);
}

export async function listMyUrls(req: Request, res: Response): Promise<void> {
  if (!req.user) throw AppError.unauthorized();

  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, parseInt(req.query.limit as string) || 20);

  const result = await urlService.getUserUrls(new Types.ObjectId(req.user.sub), page, limit);

  sendSuccess(res, result.urls, 200, { page: result.page, limit: result.limit, total: result.total });
}

export async function deleteUrl(req: Request, res: Response): Promise<void> {
  if (!req.user) throw AppError.unauthorized();

  await urlService.deleteUrl(req.params.shortCode, new Types.ObjectId(req.user.sub));
  sendSuccess(res, null, 200);
}

export async function updateUrl(req: Request, res: Response): Promise<void> {
  if (!req.user) throw AppError.unauthorized();

  const body = updateUrlSchema.parse(req.body);
  const updated = await urlService.updateUrl(
    req.params.shortCode,
    new Types.ObjectId(req.user.sub),
    { expiresAt: body.expiresAt, isActive: body.isActive }
  );

  sendSuccess(res, updated);
}
