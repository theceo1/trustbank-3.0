import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Get current user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Referral code is required' }, { status: 400 });
    }

    // Get referrals count
    const { count: totalReferrals } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('referred_by', code);

    // Get active referrals (users who have made at least one trade)
    const { count: activeReferrals } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('referred_by', code)
      .gt('trade_count', 0);

    // Get total earnings from completed trades
    const { data: earnings } = await supabase
      .from('referral_earnings')
      .select('amount')
      .eq('referral_code', code)
      .eq('status', 'PAID');

    const totalEarnings = earnings?.reduce((sum, e) => sum + e.amount, 0) || 0;

    // Get pending earnings
    const { data: pendingEarnings } = await supabase
      .from('referral_earnings')
      .select('amount')
      .eq('referral_code', code)
      .eq('status', 'PENDING');

    const pendingAmount = pendingEarnings?.reduce((sum, e) => sum + e.amount, 0) || 0;

    return NextResponse.json({
      totalReferrals: totalReferrals || 0,
      activeReferrals: activeReferrals || 0,
      totalEarnings,
      pendingEarnings: pendingAmount,
    });
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch referral stats' },
      { status: 500 }
    );
  }
} 