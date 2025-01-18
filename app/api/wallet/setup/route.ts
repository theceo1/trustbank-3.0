// app/api/wallet/setup/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { QuidaxService } from '@/lib/services/quidax';

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('quidax_id, email, full_name')
      .eq('user_id', session.user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch profile data' },
        { status: 500 }
      );
    }

    // If user already has a Quidax ID, return it
    if (profile.quidax_id) {
      return NextResponse.json({
        status: 'success',
        message: 'Wallet already setup',
        data: {
          quidax_id: profile.quidax_id
        }
      });
    }

    // Handle name parsing with validation
    const fullName = profile.full_name?.trim() || 'Unknown User';
    const nameParts = fullName.split(' ').filter((part: string) => part.length > 0);
    const firstName = nameParts[0] || 'Unknown';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'User';

    // Ensure we have a valid email
    const email = profile.email || session.user.email;
    if (!email) {
      return NextResponse.json(
        { error: 'Valid email is required for wallet setup' },
        { status: 400 }
      );
    }

    // Create Quidax sub-account with validated data
    const quidaxUser = await QuidaxService.createSubAccount({
      email,
      first_name: firstName,
      last_name: lastName,
      country: 'NG' // Default to Nigeria
    });

    if (!quidaxUser?.id) {
      throw new Error('Failed to create Quidax account');
    }

    // Update user profile with Quidax ID
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ 
        quidax_id: quidaxUser.id,
        kyc_status: 'pending',
        kyc_level: 0,
        tier1_verified: false,
        tier2_verified: false,
        tier3_verified: false
      })
      .eq('user_id', session.user.id);

    if (updateError) {
      console.error('Error updating user profile:', updateError);
      throw new Error('Failed to update user profile');
    }

    return NextResponse.json({
      status: 'success',
      message: 'Wallet setup completed',
      data: {
        quidax_id: quidaxUser.id
      }
    });

  } catch (error: any) {
    console.error('Wallet setup error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to setup wallet' },
      { status: 500 }
    );
  }
} 