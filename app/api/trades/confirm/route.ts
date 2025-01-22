//app/api/trades/confirm/route.ts
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
    const { quotation_id } = body;

    if (!quotation_id) {
      return NextResponse.json(
        { status: 'error', message: 'Missing quotation ID' },
        { status: 400 }
      );
    }

    // Confirm the swap with Quidax
    const response = await fetch(
      `https://www.quidax.com/api/v1/users/me/swap_quotation/${quotation_id}/confirm`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.QUIDAX_SECRET_KEY}`
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to confirm swap with Quidax');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API] Confirm swap error:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Failed to confirm swap' 
      },
      { status: 500 }
    );
  }
} 