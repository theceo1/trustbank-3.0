// app/api/wallet/balance/[currency]/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { QuidaxService } from '@/app/lib/services/quidax';

export async function GET(request: Request) {
  try {
    const segments = request.url.split('/');
    const currency = segments[segments.length - 1].toUpperCase();
    
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    });
    
    const { data: { user }, error: sessionError } = await supabase.auth.getUser();
    
    if (sessionError || !user) {
      console.error('Session error:', sessionError);
      return NextResponse.json({ error: 'Authentication error' }, { status: 401 });
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('quidax_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData?.quidax_id) {
      console.error('User fetch error:', userError);
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
    }

    const quidaxService = new QuidaxService();
    const walletInfo = await quidaxService.getWallet(userData.quidax_id, currency.toLowerCase());
    
    if (!walletInfo) {
      return NextResponse.json({ error: 'Failed to fetch wallet info' }, { status: 500 });
    }

    return NextResponse.json({ 
      balance: walletInfo.balance || '0',
      locked: walletInfo.locked || '0'
    });

  } catch (error) {
    console.error('Wallet balance error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}