import { NextResponse } from 'next/server';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const supabase = createClientComponentClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch swap transactions from Quidax
    const response = await fetch(
      'https://www.quidax.com/api/v1/users/me/swap_transactions',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.QUIDAX_SECRET_KEY}`
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch trade history from Quidax');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API] Trade history error:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Failed to fetch trade history' 
      },
      { status: 500 }
    );
  }
}