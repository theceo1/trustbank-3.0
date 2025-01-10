import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { QuidaxClient } from '@/app/lib/services/quidax-client';
import { QUIDAX_CONFIG } from '@/app/lib/config/quidax';

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

    // Get user's Quidax ID from Supabase
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('quidax_id')
      .eq('user_id', session.user.id)
      .single();

    if (profileError || !userProfile?.quidax_id) {
      return NextResponse.json(
        { error: 'Quidax account not linked' },
        { status: 400 }
      );
    }

    // Fetch wallets from Quidax
    const quidaxClient = new QuidaxClient(QUIDAX_CONFIG.apiKey);
    const wallets = await quidaxClient.fetchUserWallets(userProfile.quidax_id);

    if (!wallets) {
      return NextResponse.json(
        { error: 'Failed to fetch Quidax wallets' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 'success',
      data: wallets
    });

  } catch (error) {
    console.error('Error fetching balances:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 