import { NextResponse } from 'next/server';
import { QuidaxClient } from '@/app/lib/services/quidax-client';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/app/types/database';

export async function GET() {
  try {
    const supabase = createServerComponentClient<Database>({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's Quidax ID from the database
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('quidax_id')
      .eq('user_id', session.user.id)
      .single();

    if (profileError || !profile?.quidax_id) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Get wallet balances from Quidax
    const quidax = QuidaxClient.getInstance();
    const response = await quidax.fetchUserWallets(profile.quidax_id);

    if (!response?.data) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch wallets' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: response.data,
      message: 'Successful'
    });
  } catch (error: any) {
    console.error('Error fetching wallets:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: error.statusCode || 500 }
    );
  }
} 