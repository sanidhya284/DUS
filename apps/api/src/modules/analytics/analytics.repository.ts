import { ClickModel } from './analytics.model';

export class AnalyticsRepository {
  async insertClick(data: {
    shortCode: string;
    timestamp: Date;
    ipHash: string;
    userAgent: string;
    referrer: string;
    country: string;
  }): Promise<void> {
    await ClickModel.create(data);
  }

  async getClickStats(shortCode: string): Promise<{
    total: number;
    last7Days: number;
    last30Days: number;
  }> {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [total, last7Days, last30Days] = await Promise.all([
      ClickModel.countDocuments({ shortCode }),
      ClickModel.countDocuments({ shortCode, timestamp: { $gte: sevenDaysAgo } }),
      ClickModel.countDocuments({ shortCode, timestamp: { $gte: thirtyDaysAgo } }),
    ]);

    return { total, last7Days, last30Days };
  }

  async getGeoBreakdown(shortCode: string): Promise<Array<{ country: string; count: number }>> {
    return ClickModel.aggregate([
      { $match: { shortCode } },
      { $group: { _id: '$country', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 },
      { $project: { _id: 0, country: '$_id', count: 1 } },
    ]);
  }

  async getTimeSeries(
    shortCode: string,
    from: Date,
    to: Date,
    granularity: 'day' | 'hour' = 'day'
  ): Promise<Array<{ period: string; count: number }>> {
    const dateFormat = granularity === 'hour' ? '%Y-%m-%dT%H:00:00Z' : '%Y-%m-%d';

    return ClickModel.aggregate([
      { $match: { shortCode, timestamp: { $gte: from, $lte: to } } },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$timestamp' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, period: '$_id', count: 1 } },
    ]);
  }
}
