// app/api/trade/rate/route.ts
import { NextResponse } from 'next/server';
import { QuidaxService } from '@/app/lib/services/quidax';
import { TradeRateResponse } from '@/app/types/trade';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { rateLimit } from '@/app/lib/rate-limit';
import { cache } from '@/app/lib/cache';
import { calculateTradeFees } from '@/app/lib/constants/fees';

export async function POST(request: Request) {
  try {
    // Rate limiting
    const identifier = request.headers.get('x-forwarded-for') || 'anonymous';
    const rateLimitResult = await rateLimit.check(identifier);
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, fromCurrency, toCurrency, type } = body;

    // Cache the rate for a short period
    const cacheKey = `rate:${fromCurrency}:${toCurrency}:${amount}:${type}`;
    const cachedRate = await cache.get(cacheKey);
    if (cachedRate) {
      return NextResponse.json(JSON.parse(cachedRate));
    }

    const quidaxRate = await QuidaxService.getRate({
      amount: amount.toString(),
      currency_pair: `${fromCurrency}_${toCurrency}`.toLowerCase(),
      type: type === 'send' ? 'sell' : type
    });

    const total = parseFloat(quidaxRate.total.amount);
    const fees = calculateTradeFees(total);

    const response: TradeRateResponse = {
      rate: parseFloat(quidaxRate.price.amount),
      amount: parseFloat(amount),
      total,
      fees: {
        platform: fees.platform,    // 1.6% TrustBank fee
        processing: fees.processing, // 1% Processing fee
        quidax: fees.quidax,        // 1.4% Quidax fee
        total: fees.total           // Combined 3% total fee
      },
      expiresAt: Date.now() + 14000
    };

    // Cache for 5 seconds
    await cache.set(cacheKey, JSON.stringify(response), 5);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Rate fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rate' },
      { status: 500 }
    );
  }
} 