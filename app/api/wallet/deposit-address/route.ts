import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { QuidaxService } from '@/app/lib/services/quidax';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currency, network } = await request.json();
    if (!currency) {
      return NextResponse.json({ error: 'Currency is required' }, { status: 400 });
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

    console.log('Fetching deposit address for user:', profile.quidax_id, 'currency:', currency);
    
    // Get or create wallet address
    const response = await QuidaxService.getDepositAddress(profile.quidax_id, currency);
    console.log('Quidax response:', response);
    
    // Check if the response has the expected structure
    if (!response?.data?.address) {
      console.error('Invalid response structure:', response);
      return NextResponse.json({ error: 'Failed to get deposit address' }, { status: 500 });
    }

    return NextResponse.json({
      data: {
        address: response.data.address,
        tag: response.data.tag
      }
    });

  } catch (error) {
    console.error('Error fetching wallet address:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch wallet address' },
      { status: 500 }
    );
  }
} 