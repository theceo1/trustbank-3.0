import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { QuidaxClient } from '@/lib/services/quidax-client';

async function getOrCreateWalletAddress(client: QuidaxClient, userId: string, currency: string) {
  const response = await client.getDepositAddress(userId, currency);
  
  if (!response.data.address) {
    // If no address exists, try to create one by calling getDepositAddress again
    const newAddress = await client.getDepositAddress(userId, currency);
    return newAddress;
  }

  return response;
}

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

    // Initialize Quidax client
    const quidaxClient = new QuidaxClient(process.env.QUIDAX_SECRET_KEY!);

    // Fetch or create wallet address
    const address = await getOrCreateWalletAddress(quidaxClient, profile.quidax_id, currency);

    return NextResponse.json({
      status: 'success',
      data: address.data
    });

  } catch (error) {
    console.error('Error fetching wallet address:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch wallet address' },
      { status: 500 }
    );
  }
} 