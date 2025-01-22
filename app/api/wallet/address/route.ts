import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { QuidaxService } from '@/app/lib/services/quidax';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get currency from query params
    const { searchParams } = new URL(request.url);
    const currency = searchParams.get('currency')?.toLowerCase();
    const network = searchParams.get('network')?.toLowerCase();

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

    try {
      // Get or create wallet address
      const response = await QuidaxService.getDepositAddress(profile.quidax_id, currency);
      
      // If no address is available, return a specific error
      if (!response?.data?.address) {
        return NextResponse.json({
          status: 'error',
          error: 'No deposit address available for this currency. Please try again later or contact support.'
        }, { status: 404 });
      }

      return NextResponse.json({
        status: 'success',
        data: response.data
      });
    } catch (error: any) {
      // If the error is about no deposit address, return a specific error
      if (error.message?.includes('No deposit address')) {
        return NextResponse.json({
          status: 'error',
          error: 'No deposit address available for this currency. Please try again later or contact support.'
        }, { status: 404 });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error fetching wallet address:', error);
    return NextResponse.json(
      { 
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to fetch wallet address'
      },
      { status: 500 }
    );
  }
} 