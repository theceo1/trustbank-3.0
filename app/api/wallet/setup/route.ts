// app/api/wallet/setup/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { QuidaxWalletService } from '@/app/lib/services/quidax-wallet';

export async function POST(request: Request) {
  try {
    // Get cookie store
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    });

    // Get session for authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('Session error:', sessionError);
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (profileError) {
      // If profile doesn't exist, create one
      const { data: userData } = await supabase
        .from('auth.users')
        .select('email, raw_user_meta_data')
        .eq('id', session.user.id)
        .single();

      if (!userData?.email) {
        return NextResponse.json({ 
          error: 'User email not found' 
        }, { status: 404 });
      }

      // Create Quidax account
      const quidaxResponse = await QuidaxWalletService.createSubAccount(
        userData.email,
        userData.raw_user_meta_data?.full_name || userData.email.split('@')[0]
      ).catch(error => {
        console.error('Failed to create Quidax account:', error);
        return null;
      });

      if (!quidaxResponse?.data?.id) {
        return NextResponse.json({ 
          error: 'Failed to create Quidax account' 
        }, { status: 500 });
      }

      // Create user profile
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: session.user.id,
          quidax_id: quidaxResponse.data.id,
          full_name: userData.raw_user_meta_data?.full_name || userData.email.split('@')[0],
          is_verified: false,
          kyc_level: 0,
          is_test: false
        });

      if (insertError) {
        return NextResponse.json({ 
          error: 'Failed to create user profile' 
        }, { status: 500 });
      }

      return NextResponse.json({
        status: 'success',
        message: 'Wallet setup complete',
        data: quidaxResponse.data
      });
    }

    // If profile exists but no Quidax ID
    if (!userProfile.quidax_id) {
      const { data: userData } = await supabase
        .from('auth.users')
        .select('email, raw_user_meta_data')
        .eq('id', session.user.id)
        .single();

      if (!userData?.email) {
        return NextResponse.json({ 
          error: 'User email not found' 
        }, { status: 404 });
      }

      // Create Quidax account
      const quidaxResponse = await QuidaxWalletService.createSubAccount(
        userData.email,
        userProfile.full_name || userData.email.split('@')[0]
      ).catch(error => {
        console.error('Failed to create Quidax account:', error);
        return null;
      });

      if (!quidaxResponse?.data?.id) {
        return NextResponse.json({ 
          error: 'Failed to create Quidax account' 
        }, { status: 500 });
      }

      // Update user profile with Quidax ID
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ quidax_id: quidaxResponse.data.id })
        .eq('user_id', session.user.id);

      if (updateError) {
        return NextResponse.json({ 
          error: 'Failed to update user profile' 
        }, { status: 500 });
      }

      return NextResponse.json({
        status: 'success',
        message: 'Wallet setup complete',
        data: quidaxResponse.data
      });
    }

    return NextResponse.json({
      status: 'success',
      message: 'Wallet already set up',
      data: { quidax_id: userProfile.quidax_id }
    });

  } catch (error) {
    console.error('Error setting up wallet:', error);
    return NextResponse.json(
      { error: 'Failed to set up wallet' }, 
      { status: 500 }
    );
  }
} 