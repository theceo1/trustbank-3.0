import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

const WINDOW_SIZE = 60 * 1000; // 1 minute
const MAX_REQUESTS = 30; // requests per minute

export async function rateLimit(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
  const key = `rate-limit:${ip}`;

  const currentTime = Date.now();
  const windowStart = currentTime - WINDOW_SIZE;

  try {
    // Add current timestamp and remove old entries
    await redis.zadd(key, { score: currentTime, member: currentTime.toString() });
    await redis.zremrangebyscore(key, 0, windowStart);

    // Count requests in current window
    const requests = await redis.zcard(key);
    
    // Set expiry for cleanup
    await redis.expire(key, 60);

    if (requests > MAX_REQUESTS) {
      return new NextResponse(JSON.stringify({
        error: 'Too many requests',
        retryAfter: Math.ceil(WINDOW_SIZE / 1000)
      }), {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(WINDOW_SIZE / 1000)),
          'Content-Type': 'application/json',
        },
      });
    }
  } catch (error) {
    console.error('Rate limiting error:', error);
  }

  return NextResponse.next();
}