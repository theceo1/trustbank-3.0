import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { KYCTier, KYC_LIMITS } from '@/app/types/kyc';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { amount } = await request.json();

    // Get the current user's session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json({ 
        allowed: false,
        reason: 'Authentication required'
      }, { status: 401 });
    }

    // Get user's KYC status and transaction history
    const [profileResult, transactionsResult] = await Promise.all([
      supabase
        .from('user_profiles')
        .select('kyc_level, kyc_status, kyc_verified, daily_limit, monthly_limit')
        .eq('user_id', session.user.id)
        .single(),
      supabase
        .from('transactions')
        .select('amount, created_at')
        .eq('user_id', session.user.id)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    ]);

    if (profileResult.error) {
      console.error('Profile fetch error:', profileResult.error);
      return NextResponse.json({ 
        allowed: false,
        reason: 'Failed to fetch user profile'
      }, { status: 500 });
    }

    const profile = profileResult.data;
    const transactions = transactionsResult.data || [];

    // Check if user is verified
    if (profile.kyc_status !== 'verified' || profile.kyc_level === KYCTier.NONE) {
      return NextResponse.json({
        allowed: false,
        reason: 'Please complete KYC verification to trade'
      });
    }

    // Get limits based on KYC level
    const limits = KYC_LIMITS[profile.kyc_level as KYCTier];

    // Calculate daily and monthly totals
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const dailyTotal = transactions
      .filter(tx => tx.created_at >= todayStart)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    const monthlyTotal = transactions
      .filter(tx => tx.created_at >= monthStart)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    // Check if transaction would exceed limits
    if (dailyTotal + amount > limits.dailyLimit) {
      return NextResponse.json({
        allowed: false,
        reason: `Transaction would exceed daily limit of ₦${limits.dailyLimit.toLocaleString()}`,
        currentLimits: limits
      });
    }

    if (monthlyTotal + amount > limits.monthlyLimit) {
      return NextResponse.json({
        allowed: false,
        reason: `Transaction would exceed monthly limit of ₦${limits.monthlyLimit.toLocaleString()}`,
        currentLimits: limits
      });
    }

    return NextResponse.json({
      allowed: true,
      currentLimits: limits,
      dailyRemaining: limits.dailyLimit - dailyTotal,
      monthlyRemaining: limits.monthlyLimit - monthlyTotal
    });

  } catch (error) {
    console.error('Trade limit check error:', error);
    return NextResponse.json({ 
      allowed: false,
      reason: 'Failed to check trade limits'
    }, { status: 500 });
  }
} 