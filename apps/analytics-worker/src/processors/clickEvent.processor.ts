import { Job } from 'bullmq';
import { ClickModel } from '../../../api/src/modules/analytics/analytics.model';

interface ClickEventData {
  shortCode: string;
  timestamp: string;
  ipHash: string;
  userAgent: string;
  referrer: string;
  country: string;
}

export async function processClickEvent(job: Job<ClickEventData>): Promise<void> {
  const { shortCode, timestamp, ipHash, userAgent, referrer, country } = job.data;

  await ClickModel.create({
    shortCode,
    timestamp: new Date(timestamp),
    ipHash,
    userAgent,
    referrer,
    country,
  });
}
