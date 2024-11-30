import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export const tradeLimiter = {
  async increment(userId: string): Promise<boolean> {
    const key = `trade-limit:${userId}`;
    const count = await redis.incr(key);
    
    if (count === 1) {
      await redis.expire(key, 3600); // 1 hour window
    }
    
    return count <= 10; // Max 10 trades per hour
  },
  
  async reset(userId: string): Promise<void> {
    await redis.del(`trade-limit:${userId}`);
  }
};