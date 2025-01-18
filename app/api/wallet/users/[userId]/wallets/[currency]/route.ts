//app/api/wallet/users/[userId]/wallets/[currency]/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { QuidaxService } from '@/app/lib/services/quidax';

export async function GET(
  request: Request,
  { params }: { params: { userId: string; currency: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Verify user is accessing their own wallet
    if (session.user.id !== params.userId) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Get user's Quidax ID
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('quidax_id')
      .eq('user_id', params.userId)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return new NextResponse('Error fetching user profile', { status: 500 });
    }

    if (!userProfile?.quidax_id) {
      return new NextResponse('User has no linked Quidax account', { status: 404 });
    }

    // Get wallet balance
    const wallet = await QuidaxService.getWalletBalance(userProfile.quidax_id, params.currency);
    
    return NextResponse.json(wallet);
  } catch (error) {
    console.error('Error fetching wallet:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 