import { Queue } from 'bullmq';
import { getRedisClient, isRedisAvailable } from './redis';
import { env } from './env';

export const CLICK_QUEUE_NAME = 'click.events';

let clickQueue: Queue | null = null;

export function getClickQueue(): Queue | null {
  return clickQueue;
}

export function initQueue(): void {
  const redis = getRedisClient();
  if (!redis || !isRedisAvailable()) {
    console.warn('⚠️  Queue unavailable (Redis down) — analytics will be logged to file');
    return;
  }

  clickQueue = new Queue(CLICK_QUEUE_NAME, {
    connection: redis,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: 1000,
      removeOnFail: 500,
    },
  });

  console.log('✅ BullMQ click queue initialized');
}

export async function enqueueClickEvent(data: {
  shortCode: string;
  timestamp: Date;
  ipHash: string;
  userAgent: string;
  referrer: string;
  country: string;
}): Promise<void> {
  const queue = getClickQueue();

  if (!queue) {
    // Graceful degradation: log to stdout for later replay
    console.warn('CLICK_FALLBACK', JSON.stringify({ ...data, timestamp: data.timestamp.toISOString() }));
    return;
  }

  // Fire-and-forget — do NOT await this on the redirect path
  queue.add('click', data).catch((err) => {
    console.error('Failed to enqueue click event:', err.message);
  });
}
