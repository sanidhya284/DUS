import { Request, Response } from 'express';
import { Types } from 'mongoose';
import * as analyticsService from './analytics.service';
import { sendSuccess } from '../../shared/response/apiResponse';
import { AppError } from '../../shared/errors/AppError';

export async function getStats(req: Request, res: Response): Promise<void> {
  if (!req.user) throw AppError.unauthorized();
  const stats = await analyticsService.getStats(req.params.shortCode, new Types.ObjectId(req.user.sub));
  sendSuccess(res, stats);
}

export async function getGeo(req: Request, res: Response): Promise<void> {
  if (!req.user) throw AppError.unauthorized();
  const geo = await analyticsService.getGeo(req.params.shortCode, new Types.ObjectId(req.user.sub));
  sendSuccess(res, geo);
}

export async function getTimeSeries(req: Request, res: Response): Promise<void> {
  if (!req.user) throw AppError.unauthorized();

  const from = req.query.from ? new Date(req.query.from as string) : new Date(Date.now() - 30 * 86400000);
  const to = req.query.to ? new Date(req.query.to as string) : new Date();
  const granularity = (req.query.granularity as 'day' | 'hour') ?? 'day';

  const series = await analyticsService.getTimeSeries(
    req.params.shortCode,
    new Types.ObjectId(req.user.sub),
    from,
    to,
    granularity
  );

  sendSuccess(res, series);
}
