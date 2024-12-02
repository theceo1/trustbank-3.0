import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user's session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json({ verified: false }, { status: 401 });
    }

    // Get user's KYC status from user_profiles table
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('kyc_status, kyc_level')
      .eq('user_id', session.user.id)
      .single();

    if (profileError) {
      console.error('KYC status fetch error:', profileError);
      return NextResponse.json({ verified: false }, { status: 500 });
    }

    // Consider user verified if they have kyc_status === 'verified' and kyc_level > 0
    const isVerified = profile?.kyc_status === 'verified' && profile?.kyc_level > 0;

    return NextResponse.json({ verified: isVerified });
    
  } catch (error) {
    console.error('KYC status check error:', error);
    return NextResponse.json({ verified: false }, { status: 500 });
  }
} 