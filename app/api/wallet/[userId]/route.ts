// /app/api/wallet/[userId]/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { QuidaxClient } from '@/app/lib/services/quidax-client';
import { QUIDAX_CONFIG } from '@/app/lib/config/quidax';

interface WalletParams {
  userId: string;
}

export async function GET(request: Request, { params }: { params: WalletParams }) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const quidaxClient = new QuidaxClient(QUIDAX_CONFIG.apiKey);

    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json(
        { 
          status: 'error',
          message: 'Unauthorized. Please sign in to continue.'
        },
        { status: 401 }
      );
    }

    // Verify user is requesting their own wallet
    if (session.user.id !== params.userId) {
      return NextResponse.json(
        { 
          status: 'error',
          message: 'Unauthorized to access this wallet.'
        },
        { status: 403 }
      );
    }

    // Get user's Quidax ID from user_profiles
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('quidax_id, kyc_status')
      .eq('user_id', session.user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { 
          status: 'error',
          message: 'Failed to fetch user profile.'
        },
        { status: 400 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        { 
          status: 'error',
          message: 'User profile not found.'
        },
        { status: 404 }
      );
    }

    // If KYC is not verified, return error
    if (profile.kyc_status !== 'verified') {
      return NextResponse.json(
        { 
          status: 'error',
          message: 'KYC verification required',
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

        const quidaxResponse = await quidaxClient.createSubAccount({
          email: userData.email,
          first_name: userData.first_name || 'User',
          last_name: userData.last_name || userData.email.split('@')[0]
        });

        // Update user profile with Quidax ID
        await supabase
          .from('user_profiles')
          .update({ quidax_id: quidaxResponse.id })
          .eq('user_id', session.user.id);

        profile.quidax_id = quidaxResponse.id;
      } catch (error: any) {
        return NextResponse.json(
          { 
            status: 'error',
            message: 'Failed to create Quidax account'
          },
          { status: 500 }
        );
      }
    }

    // Fetch wallets for the user
    const wallets = await quidaxClient.fetchUserWallets(profile.quidax_id);

    return NextResponse.json({
      status: 'success',
      message: 'Wallets retrieved successfully',
      data: wallets
    });

  } catch (error: any) {
    console.error('[UserWallet] Error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: error.message || 'Failed to fetch wallets'
      },
      { status: error.status || 500 }
    );
  }
} 