//app/api/wallet/users/[userId]/wallets/[currency]/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { QuidaxClient } from '@/app/lib/quidax';

export async function GET(
  request: Request,
  { params }: { params: { userId: string; currency: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user is accessing their own wallet
    if (session.user.id !== params.userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Get user's Quidax ID
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('quidax_user_id')
      .eq('user_id', session.user.id)
      .single();

    if (!profile?.quidax_user_id) {
      return NextResponse.json(
        { error: 'User has no trading account' },
        { status: 404 }
      );
    }

    // Initialize Quidax client
    const quidax = new QuidaxClient();
    
    // Get wallet balance from Quidax
    const response = await quidax.get(`/users/me/wallets/${params.currency.toLowerCase()}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch wallet balance from Quidax');
    }

    const data = await response.json();

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching wallet:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 