import { Redis } from '@upstash/redis';

export class Cache {
  private redis: Redis;
  
  constructor() {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.redis.get(key);
    } catch (error) {
      console.error('Cache get failed:', error);
      return null;
    }
  }

  async set(key: string, value: string, expirySeconds: number): Promise<void> {
    try {
      await this.redis.set(key, value, { ex: expirySeconds });
    } catch (error) {
      console.error('Cache set failed:', error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Cache delete failed:', error);
    }
  }
}

export const cache = new Cache(); 