import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    // If Redis is not available, return a default response
    if (!redis) {
      console.warn('[Transaction Rate] Redis is not available, returning default response');
      return NextResponse.json({
        status: 'success',
        data: {
          rate: 0,
          timestamp: Date.now(),
        }
      });
    }

    const rate = await redis.get('current_rate');
    const timestamp = await redis.get('rate_timestamp');

    return NextResponse.json({
      status: 'success',
      data: {
        rate: rate || 0,
        timestamp: timestamp || Date.now(),
      }
    });
  } catch (error) {
    console.error('[Transaction Rate] Error:', error);
    return NextResponse.json({
      status: 'error',
      error: 'Failed to fetch transaction rate'
    }, { status: 500 });
  }
}