//app/api/trades/quote/route.ts
import { NextResponse } from 'next/server';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export async function POST(request: Request) {
  try {
    const supabase = createClientComponentClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { from_currency, to_currency, from_amount } = body;

    if (!from_currency || !to_currency || !from_amount) {
      return NextResponse.json(
        { status: 'error', message: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get temporary swap quotation from Quidax
    const response = await fetch(
      'https://www.quidax.com/api/v1/users/me/temporary_swap_quotation',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.QUIDAX_SECRET_KEY}`
        },
        body: JSON.stringify({
          from_currency: from_currency.toLowerCase(),
          to_currency: to_currency.toLowerCase(),
          from_amount: from_amount.toString()
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get quote from Quidax');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API] Quote error:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Failed to get quote' 
      },
      { status: 500 }
    );
  }
} 