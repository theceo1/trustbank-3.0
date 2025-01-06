import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { reference } = await request.json();
    
    if (!reference) {
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      );
    }

    // Verify payment with Paystack
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();

    if (!response.ok || !data.status) {
      throw new Error(data.message || 'Payment verification failed');
    }

    // Get authenticated user
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const amount = data.data.amount / 100; // Convert from kobo to naira

    // Record transaction
    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: session.user.id,
        type: 'deposit',
        amount,
        currency: 'NGN',
        status: 'completed',
        reference: data.data.reference,
        metadata: {
          paystack_reference: data.data.reference,
          payment_method: 'card',
          card_type: data.data.authorization.card_type,
          last4: data.data.authorization.last4,
          bank: data.data.authorization.bank
        }
      });

    if (txError) {
      throw txError;
    }

    // Credit user's wallet
    const { error: walletError } = await supabase.rpc('credit_wallet', {
      p_user_id: session.user.id,
      p_amount: amount,
      p_currency: 'NGN'
    });

    if (walletError) {
      throw walletError;
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        amount,
        reference: data.data.reference
      }
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: error instanceof Error ? error.message : 'Payment verification failed'
      },
      { status: 500 }
    );
  }
} 