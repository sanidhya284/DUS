import 'dotenv/config';
import { Worker } from 'bullmq';
import mongoose from 'mongoose';
import Redis from 'ioredis';
import { processClickEvent } from './processors/clickEvent.processor';

const QUEUE_NAME = 'click.events';
const MONGO_URI = process.env.MONGO_URI!;
const REDIS_URL = process.env.REDIS_URL!;
const CONCURRENCY = parseInt(process.env.BULL_CONCURRENCY ?? '10', 10);

async function bootstrap(): Promise<void> {
  console.log('🚀 Starting DUS Analytics Worker');

  // Connect MongoDB
  await mongoose.connect(MONGO_URI, { dbName: process.env.MONGO_DB_NAME ?? 'dus' });
  console.log('✅ MongoDB connected');

  const connection = new Redis(REDIS_URL, {
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: null, // Required by BullMQ
  });

  const worker = new Worker(QUEUE_NAME, processClickEvent, {
    connection,
    concurrency: CONCURRENCY,
  });

  worker.on('completed', (job) => {
    console.log(`✅ Click job ${job.id} processed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ Click job ${job?.id} failed:`, err.message);
  });

  worker.on('error', (err) => {
    console.error('Worker error:', err);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received — closing worker`);
    await worker.close();
    await mongoose.connection.close();
    connection.disconnect();
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  console.log(`✅ Worker listening on queue "${QUEUE_NAME}" [concurrency=${CONCURRENCY}]`);
}

bootstrap().catch((err) => {
  console.error('❌ Worker bootstrap failed:', err);
  process.exit(1);
});
