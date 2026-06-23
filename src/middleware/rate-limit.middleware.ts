import type { NextFunction, Request, Response } from 'express';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { env } from '../config/env';
import { redis } from '../config/redis';
import { AppError } from '../common/errors';

const rateLimiter = new RateLimiterRedis({
  storeClient: redis,
  points: env.RATE_LIMIT_POINTS,
  duration: env.RATE_LIMIT_DURATION,
  keyPrefix: 'http_rate_limit',
});

export function rateLimitMiddleware() {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const key = req.ip || 'unknown';
    try {
      await rateLimiter.consume(key);
      next();
    } catch {
      throw new AppError('Too many requests', 429);
    }
  };
}
