import { getRedisClient, isRedisAvailable } from '../../config/redis';
import { CounterModel } from '../../modules/url/counter.model';

const COUNTER_KEY = 'url:counter';
const COUNTER_DOC_ID = 'url_counter';

/**
 * Returns the next unique sequence number.
 * Fast path: Redis INCR (atomic, sub-millisecond).
 * Fallback: MongoDB findOneAndUpdate with $inc (when Redis is down).
 */
export async function getNextSequence(): Promise<number> {
  const redis = getRedisClient();

  if (redis && isRedisAvailable()) {
    const next = await redis.incr(COUNTER_KEY);
    return next;
  }

  // Redis unavailable — fall back to MongoDB counter
  const result = await CounterModel.findOneAndUpdate(
    { _id: COUNTER_DOC_ID },
    { $inc: { seq: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return result!.seq;
}
