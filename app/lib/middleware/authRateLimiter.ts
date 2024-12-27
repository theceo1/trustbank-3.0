import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// More permissive limits for auth routes
const authRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "10s"), // 30 requests per 10 seconds
  analytics: true,
  prefix: "auth_ratelimit",
});

export async function authRateLimiter(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const { success } = await authRatelimit.limit(`auth_${ip}`);
  return success;
} 