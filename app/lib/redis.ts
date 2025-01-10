import { Redis } from '@upstash/redis';

let redis: Redis | null = null;

function isValidRedisUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
}

try {
  const redisUrl = process.env.UPSTASH_REDIS_URL;
  const redisToken = process.env.UPSTASH_REDIS_TOKEN;

  if (redisUrl && redisToken && isValidRedisUrl(redisUrl)) {
    redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });
    console.log('[Redis] Successfully initialized Redis client');
  } else {
    console.warn('[Redis] Invalid or missing Redis configuration. Some features may be limited.');
    console.warn('[Redis] Please ensure UPSTASH_REDIS_URL starts with https:// and UPSTASH_REDIS_TOKEN is set.');
  }
} catch (error) {
  console.error('[Redis] Failed to initialize Redis client:', error);
}

export default redis; 