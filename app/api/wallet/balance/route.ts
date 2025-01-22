// /app/api/wallet/balance/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/config';
import { QuidaxClient } from '@/lib/services/quidax-client';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get currency from query params
    const { searchParams } = new URL(request.url);
    const currency = searchParams.get('currency');
    if (!currency) {
      return NextResponse.json(
        { status: 'error', message: 'Currency parameter is required' },
        { status: 400 }
      );
    }

    // Get user's Quidax ID from Supabase
    const supabase = createRouteHandlerClient({ cookies });
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('quidax_id')
      .eq('user_id', session.user.id)
      .single();

    if (profileError || !profile?.quidax_id) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Get wallet balances from Quidax
    const quidax = QuidaxClient.getInstance();
    const response = await quidax.fetchUserWallets(profile.quidax_id);
    
    return NextResponse.json({ status: 'success', data: response });
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch wallet balance' },
      { status: 500 }
    );
  }
} 