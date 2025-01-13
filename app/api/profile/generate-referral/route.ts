import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

function generateReferralCode(): string {
  // Format: TB + 6 alphanumeric characters
  return `TB${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

export async function POST() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First check if user already has a referral code
    const { data: existingProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('referral_code')
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      console.error('Error fetching profile:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }

    // If user already has a referral code, return it
    if (existingProfile?.referral_code) {
      return NextResponse.json({
        status: 'success',
        data: { referral_code: existingProfile.referral_code }
      });
    }

    // If no referral code exists, generate a new one
    const referralCode = generateReferralCode();

    // Update user profile with the new referral code
    const { data: profile, error: updateError } = await supabase
      .from('user_profiles')
      .update({ referral_code: referralCode })
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 'success',
      data: { referral_code: referralCode }
    });
  } catch (error) {
    console.error('Error generating referral code:', error);
    return NextResponse.json(
      { error: 'Failed to generate referral code' },
      { status: 500 }
    );
  }
} 