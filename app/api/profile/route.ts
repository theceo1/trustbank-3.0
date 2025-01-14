// app/api/profile/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { ProfileService } from '@/lib/services/profile';
import { getWalletService } from '@/app/lib/services/quidax-wallet';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email } = await request.json();

    // Create profile using ProfileService
    const profile = await ProfileService.createProfile(user.id, email);

    // Update additional profile data
    const { data: updatedProfile, error: updateError } = await supabase
      .from('user_profiles')
      .update({
        full_name: name,
        referral_stats: {
          totalReferrals: 0,
          activeReferrals: 0,
          totalEarnings: 0,
          pendingEarnings: 0
        }
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Error creating profile:', error);
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Only attempt to get wallet data if user is verified and has quidax_id
    let walletData = null;
    let recentTransactions = [];
    
    if (profile.kyc_status === 'verified' && profile.quidax_id) {
      try {
        const walletService = getWalletService();
        const walletResponse = await walletService.getAllWallets(profile.quidax_id);
        walletData = walletResponse.data;

        // Get recent transactions only if we have wallet data
        if (walletData) {
          const { data: transactions } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5);
          recentTransactions = transactions || [];
        }
      } catch (error) {
        console.error('Error fetching wallet:', error);
        // Don't throw error, just continue without wallet data
      }
    }

    return NextResponse.json({
      ...profile,
      wallet: walletData,
      recent_transactions: recentTransactions,
      verification_limits: {
        daily: profile.daily_limit,
        monthly: profile.monthly_limit
      }
    });
  } catch (error) {
    console.error('Error in profile API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await request.json();
    const profile = await ProfileService.updateProfile(user.id, updates);
    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
} 