//app/api/trades/confirm/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { QuidaxSwapService } from '@/app/lib/services/quidax-swap';
import { Database } from '@/types/supabase';

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
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const body = await request.json();
    const { tradeId, userId } = body;

    console.log(`[${requestId}] Processing trade:`, { tradeId, userId });
    
    if (!tradeId || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get user's Quidax ID
    const { data: userData, error: userError } = await supabase
      .from('user_profiles')
      .select('quidax_id')
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

    console.log(`[${requestId}] Executing trade with Quidax ID:`, userData.quidax_id);

    // Execute the trade
    try {
      const trade = await QuidaxSwapService.confirmSwap(
        userData.quidax_id,
        tradeId
      );

      if (!trade) {
        return NextResponse.json(
          { error: 'Trade execution failed' },
          { status: 400 }
        );
      }

      console.log(`[${requestId}] Trade executed successfully:`, trade);

      // Record the trade in our database
      const { error: tradeError } = await supabase
        .from('trades')
        .insert({
          id: tradeId,
          user_id: userId,
          status: 'completed',
          details: trade
        });

      if (tradeError) {
        console.error(`[${requestId}] Trade recording error:`, tradeError);
        // Don't fail the request if recording fails, just log it
      }

      return NextResponse.json({ 
        status: 'success',
        data: trade 
      });
    } catch (swapError) {
      console.error(`[${requestId}] Swap execution error:`, swapError);
      return NextResponse.json(
        { error: swapError instanceof Error ? swapError.message : 'Failed to execute trade' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(`[${requestId}] Trade confirmation error:`, error);
    return NextResponse.json(
      { error: 'Failed to confirm trade' },
      { status: 500 }
    );
  }
} 