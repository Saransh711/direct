import Redis from 'ioredis';
import { env } from './env';
import { logger } from './logger';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

redis.on('error', (error) => {
  logger.error({ error }, 'Redis error');
});

export async function connectRedis(): Promise<void> {
  await redis.connect();
  logger.info('Redis connection established');
}
