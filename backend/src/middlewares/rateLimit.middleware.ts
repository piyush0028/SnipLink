import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { redisClient } from '../cache/redis.client';

const SLIDING_WINDOW_SCRIPT = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local member = ARGV[4]

redis.call('ZREMRANGEBYSCORE', key, 0, now - window)
local count = redis.call('ZCARD', key)

if count >= limit then
  return 0
end

redis.call('ZADD', key, now, member)
redis.call('PEXPIRE', key, window)
return 1
`;

interface RateLimitOptions {
  windowMs: number;
  limit: number;
  keyPrefix: string;
  keyGenerator?: (req: Request) => string;
}

export function rateLimit(options: RateLimitOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const identifier = options.keyGenerator ? options.keyGenerator(req) : req.ip;
    const key = `ratelimit:${options.keyPrefix}:${identifier}`;
    const now = Date.now();
    const member = `${now}-${randomUUID()}`;

    try {
      const allowed = await redisClient.eval(SLIDING_WINDOW_SCRIPT, {
        keys: [key],
        arguments: [String(now), String(options.windowMs), String(options.limit), member],
      });

      if (allowed === 0) {
        return res.status(429).json({ message: 'Too many requests, please try again later.' });
      }

      next();
    } catch (err) {
      console.error('Rate limiter error — failing open:', err);
      next();
    }
  };
}

export const loginRateLimit = rateLimit({ windowMs: 60_000, limit: 5, keyPrefix: 'login' });
export const registerRateLimit = rateLimit({ windowMs: 3_600_000, limit: 5, keyPrefix: 'register' });
export const createUrlRateLimit = rateLimit({
  windowMs: 60_000,
  limit: 20,
  keyPrefix: 'create-url',
  keyGenerator: (req) => req.user!.userId,
});
export const redirectRateLimit = rateLimit({ windowMs: 60_000, limit: 100, keyPrefix: 'redirect' });