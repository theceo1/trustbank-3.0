// app/api/wallet/balance/[currency]/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/supabase';

console.log('Loading wallet balance route handler...');

export async function GET(request: Request) {
  try {
    // Extract currency from URL
    const segments = request.url.split('/');
    const currency = segments[segments.length - 1];
    
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ 
      cookies: () => cookieStore 
    });
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: wallet, error } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', session.user.id)
      .eq('currency', currency.toUpperCase())
      .single();

    if (error) {
      console.error('Wallet fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch wallet balance' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ balance: wallet?.balance || 0 });

  } catch (error) {
    console.error('Wallet balance error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}