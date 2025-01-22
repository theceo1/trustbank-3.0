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
      console.error('[DepositAddress] Session error:', sessionError);
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
      console.error('[DepositAddress] Profile error:', {
        error: profileError,
        userId: session.user.id
      });
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    console.log('[DepositAddress] Fetching deposit address:', {
      quidaxId: profile.quidax_id,
      currency,
      network
    });
    
    // Get or create wallet address
    const response = await QuidaxService.getDepositAddress(profile.quidax_id, currency);
    console.log('[DepositAddress] Quidax response:', response);
    
    // Check if the response has the expected structure
    if (!response?.data?.address) {
      console.error('[DepositAddress] Invalid response structure:', response);
      return NextResponse.json(
        { 
          error: 'Failed to get deposit address',
          details: 'No address found in response'
        }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 'success',
      data: {
        address: response.data.address,
        tag: response.data.tag
      }
    });

  } catch (error: any) {
    console.error('[DepositAddress] Error:', error);
    
    // Handle specific error cases
    if (error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Currency not supported or address generation failed' },
        { status: 400 }
      );
    }
    
    if (error.message.includes('Unauthorized') || error.message.includes('Invalid token')) {
      return NextResponse.json(
        { error: 'Authentication failed with Quidax API' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        error: error.message || 'Failed to fetch wallet address',
        details: error.details || error.stack
      },
      { status: error.status || 500 }
    );
  }
} 