//app/api/trades/confirm/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { QuidaxSwapService } from '@/app/lib/services/quidax-swap';
import { Database } from '@/types/supabase';
import { TradeStatus } from '@/app/types/trade';

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Starting trade confirmation`);
  
  try {
    const supabase = createRouteHandlerClient<Database>({ 
      cookies
    });
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Please sign in to continue' }, 
        { status: 401 }
      );
    }

    const body = await request.json();
    const { tradeId, userId, type, currency, amount, rate, fees } = body;

    console.log(`[${requestId}] Processing trade:`, { tradeId, userId, type, currency, amount });
    
    if (!tradeId || !userId || !type || !currency || !amount || !rate || !fees) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get user's Quidax ID
    const { data: userData, error: userError } = await supabase
      .from('user_profiles')
      .select('quidax_id, is_verified')
      .eq('user_id', userId)
      .single();

    if (userError) {
      console.error(`[${requestId}] User profile error:`, userError);
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }

    if (!userData?.quidax_id) {
      return NextResponse.json(
        { error: 'User profile not properly setup' },
        { status: 400 }
      );
    }

    if (!userData.is_verified) {
      return NextResponse.json(
        { error: 'Please complete your identity verification to trade' },
        { status: 403 }
      );
    }

    console.log(`[${requestId}] Executing trade with Quidax ID:`, userData.quidax_id);

    // Execute the trade
    const { data: swapData, error: swapError } = await QuidaxSwapService.confirmSwap(
      userData.quidax_id,
      tradeId
    );

    if (swapError) {
      console.error(`[${requestId}] Trade execution failed:`, swapError);
      return NextResponse.json(
        { error: swapError.message },
        { status: swapError.status }
      );
    }

    if (!swapData) {
      console.error(`[${requestId}] Trade execution failed - no data returned`);
      return NextResponse.json(
        { error: 'Trade execution failed - no data returned from Quidax' },
        { status: 400 }
      );
    }

    console.log(`[${requestId}] Trade executed successfully:`, swapData);

    // Record the trade in our database
    const { error: tradeError } = await supabase
      .from('trades')
      .insert({
        id: tradeId,
        user_id: userId,
        type,
        currency,
        amount,
        rate,
        fees,
        status: TradeStatus.PENDING,
        quidax_reference: swapData.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (tradeError) {
      console.error(`[${requestId}] Trade recording error:`, tradeError);
      // Don't fail the request if recording fails, just log it
    }

    // Format the response according to TradeDetails interface
    const formattedTrade = {
      id: tradeId,
      user_id: userId,
      type,
      currency,
      amount,
      rate,
      total: amount + fees.total,
      fees: {
        platform: fees.platform,
        processing: fees.processing,
        total: fees.total
      },
      payment_method: 'crypto',
      status: TradeStatus.PENDING,
      reference: swapData.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return NextResponse.json({ 
      status: 'success',
      data: formattedTrade
    });
  } catch (error: any) {
    console.error(`[${requestId}] Trade confirmation error:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to confirm trade' },
      { status: 500 }
    );
  }
} 