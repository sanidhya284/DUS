import Redis from 'ioredis';
import { env } from './env';

let redisClient: Redis | null = null;
let redisAvailable = false;

export function getRedisClient(): Redis | null {
  return redisClient;
}

export function isRedisAvailable(): boolean {
  return redisAvailable;
}

export function createRedisClient(): Redis {
  const client = new Redis(env.REDIS_URL, {
    password: env.REDIS_PASSWORD,
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true,
    retryStrategy(times) {
      if (times > 5) {
        console.warn('⚠️  Redis unavailable after retries — falling back to MongoDB-only mode');
        redisAvailable = false;
        return null; // Stop retrying
      }
      return Math.min(times * 200, 2000);
    },
  });

  client.on('connect', () => {
    redisAvailable = true;
    console.log('✅ Redis connected');
  });

  client.on('error', (err) => {
    redisAvailable = false;
    console.warn('⚠️  Redis error (system continues without cache):', err.message);
  });

  client.on('close', () => {
    redisAvailable = false;
    console.warn('⚠️  Redis connection closed');
  });

  client.on('reconnecting', () => {
    console.log('🔄 Redis reconnecting...');
  });

  return client;
}

export async function connectRedis(): Promise<void> {
  try {
    redisClient = createRedisClient();
    await redisClient.connect();
    redisAvailable = true;
  } catch (error) {
    console.warn('⚠️  Redis startup failed — running without cache:', (error as Error).message);
    redisAvailable = false;
  }
}
