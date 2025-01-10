import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's wallet balance
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('balance, currency')
      .eq('user_id', session.user.id)
      .single();

    if (walletError) {
      return NextResponse.json(
        { error: 'Failed to fetch wallet balance' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 'success',
      data: wallet
    });

  } catch (error) {
    console.error('Error fetching balance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
