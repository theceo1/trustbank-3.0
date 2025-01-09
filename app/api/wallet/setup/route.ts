// app/api/wallet/setup/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { QuidaxWalletService, getWalletService } from '@/app/lib/services/quidax-wallet';

export async function POST() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    });
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email, raw_user_meta_data')
      .eq('id', session.user.id)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user data:', userError);
      return NextResponse.json({ 
        error: 'Unable to fetch user data' 
      }, { status: 500 });
    }

    // Check if user already has a Quidax ID
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('quidax_id')
      .eq('id', session.user.id)
      .single();

    if (existingProfile?.quidax_id) {
      return NextResponse.json({ 
        error: 'Wallet already set up' 
      }, { status: 400 });
    }

    // Get wallet service instance
    const walletService = getWalletService();

    // Create Quidax account
    const fullName = userData.raw_user_meta_data?.full_name || userData.email.split('@')[0];
    const quidaxResponse = await walletService.createSubAccount(
      userData.email,
      fullName
    ).catch(error => {
      console.error('Error creating Quidax account:', error);
      throw new Error('Failed to create Quidax account');
    });

    if (!quidaxResponse?.data?.id) {
      throw new Error('Invalid response from Quidax');
    }

    // Update user profile with Quidax ID
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        quidax_id: quidaxResponse.data.id,
        kyc_status: 'pending',
        kyc_level: 0,
        tier1_verified: false,
        tier2_verified: false,
        tier3_verified: false
      })
      .eq('id', session.user.id);

    if (updateError) {
      console.error('Error updating user profile:', updateError);
      throw new Error('Failed to update user profile');
    }

    return NextResponse.json({
      status: 'success',
      message: 'Wallet setup completed',
      data: {
        quidax_id: quidaxResponse.data.id
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