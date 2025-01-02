//app/api/trades/quote/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { QuidaxMarketService } from '@/app/lib/services/quidax-market';
import type { Database } from '@/types/supabase';
import { debug } from '@/app/lib/utils/debug';
import { APIError, handleAPIError } from '@/lib/api-utils';

const SUPPORTED_CURRENCIES = ['btc', 'eth', 'usdt', 'usdc', 'bnb', 'xrp'];

export async function POST(request: Request) {
  try {
    debug.trade('Starting quote request');
    
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ 
      cookies: () => cookieStore 
    });
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      debug.error('Unauthorized quote request', null);
      throw new APIError('Unauthorized', 401);
    }

    // Get user's KYC status
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('kyc_status, kyc_level')
      .eq('user_id', session.user.id)
      .single();

    if (profileError || !profile) {
      debug.error('Failed to fetch user profile:', profileError);
      throw new APIError('Failed to verify user status', 500);
    }

    if (profile.kyc_status !== 'verified' || !profile.kyc_level) {
      throw new APIError('KYC verification required for trading', 403);
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      throw new APIError('Invalid request body', 400);
    }
    debug.trade('Quote request body:', body);

    const { market, side, amount } = body;
    
    // Validate required fields
    if (!market || !side || !amount) {
      throw new APIError('Missing required parameters', 400);
    }

    // Validate market format
    const [fromCurrency, toCurrency] = [
      market.slice(0, -3),
      market.slice(-3)
    ];

    if (!SUPPORTED_CURRENCIES.includes(fromCurrency) || toCurrency !== 'ngn') {
      throw new APIError('Invalid market pair', 400);
    }

    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      throw new APIError('Invalid amount', 400);
    }

    // Validate side
    if (!['buy', 'sell'].includes(side)) {
      throw new APIError('Invalid trade side', 400);
    }

    debug.trade('Fetching quote for market:', market);

    const quote = await QuidaxMarketService.getQuote({
      market,
      unit: fromCurrency,
      kind: side === 'buy' ? 'ask' : 'bid',
      volume: amount.toString()
    }).catch((error) => {
      debug.error('Quidax quote error:', error);
      throw new APIError(
        error.message || 'Failed to get quote from exchange',
        error.status || 500
      );
    });

    debug.trade('Received quote:', quote);

    if (!quote || !quote.volume || !quote.price || !quote.receive || !quote.fee || !quote.total) {
      throw new APIError('Invalid quote response from exchange', 500);
    }

    // Generate a unique quote ID
    const quoteId = `QT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return NextResponse.json({
      data: {
        id: quoteId,
        market,
        side,
        amount: parseFloat(quote.volume.amount),
        rate: parseFloat(quote.price.amount),
        estimatedAmount: parseFloat(quote.receive.amount),
        fee: parseFloat(quote.fee.amount),
        total: parseFloat(quote.total.amount),
        expiresAt: Date.now() + 14000 // 14 seconds expiry
      }
    });
  } catch (error) {
    debug.error('Quote error:', error);
    return handleAPIError(error);
  }
} 