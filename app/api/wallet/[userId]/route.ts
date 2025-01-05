// /app/api/wallet/[userId]/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { QuidaxClient } from '@/app/lib/services/quidax-client';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const quidaxClient = new QuidaxClient();
    
    // Get the current user's session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to continue.' },
        { status: 401 }
      );
    }

    // Verify user is accessing their own wallet
    if (session.user.id !== params.userId) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    // Get user's Quidax ID from user_profiles
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('quidax_id, is_verified, kyc_status')
      .eq('user_id', session.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch user profile.' },
        { status: 400 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found.' },
        { status: 404 }
      );
    }

    if (!profile.is_verified || profile.kyc_status !== 'verified') {
      return NextResponse.json(
        { 
          error: 'KYC verification required',
          message: 'Complete KYC to view wallet',
          redirectTo: '/profile/verification'
        },
        { status: 403 }
      );
    }

    // If no Quidax ID, try to create a sub-account
    if (!profile.quidax_id) {
      try {
        const { data: userData } = await supabase
          .from('users')
          .select('email, first_name, last_name')
          .eq('id', session.user.id)
          .single();

        if (!userData) {
          throw new Error('User data not found');
        }

        const quidaxUser = await quidaxClient.createSubAccount({
          email: userData.email,
          first_name: userData.first_name || 'User',
          last_name: userData.last_name || userData.email.split('@')[0]
        });

        // Update user profile with Quidax ID
        await supabase
          .from('user_profiles')
          .update({ quidax_id: quidaxUser.data.id })
          .eq('user_id', session.user.id);

        profile.quidax_id = quidaxUser.data.id;
      } catch (error: any) {
        console.error('Error creating Quidax account:', error);
        return NextResponse.json(
          { error: 'Failed to create Quidax account' },
          { status: 500 }
        );
      }
    }

    // Fetch wallet details from Quidax
    const walletData = await quidaxClient.fetchUserWallets(profile.quidax_id);
    
    return NextResponse.json({
      status: 'success',
      message: 'Wallets retrieved successfully',
      data: walletData.data
    });
    
  } catch (error: any) {
    console.error('Error fetching wallets:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch wallet details' },
      { status: 500 }
    );
  }
} 