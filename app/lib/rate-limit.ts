import { Redis } from '@upstash/redis';

export class RateLimit {
  private redis: Redis;
  
  constructor(
    private readonly maxRequests: number = 20,
    private readonly windowMs: number = 60000 // 1 minute
  ) {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }

  async check(identifier: string): Promise<{ success: boolean; remaining: number }> {
    const key = `rate-limit:${identifier}`;
    const now = Date.now();
    const windowStart = now - this.windowMs;

    try {
      // Add the current timestamp and remove old entries
      await this.redis
        .pipeline()
        .zremrangebyscore(key, 0, windowStart)
        .zadd(key, { score: now, member: now.toString() })
        .expire(key, Math.ceil(this.windowMs / 1000))
        .exec();

      // Count requests in current window
      const requestCount = await this.redis.zcount(key, windowStart, now);
      
      return {
        success: requestCount <= this.maxRequests,
        remaining: Math.max(0, this.maxRequests - requestCount)
      };
    } catch (error) {
      console.error('Rate limit check failed:', error);
      // Fail open if Redis is down
      return { success: true, remaining: this.maxRequests };
    }
  }
}

export const rateLimit = new RateLimit(); 