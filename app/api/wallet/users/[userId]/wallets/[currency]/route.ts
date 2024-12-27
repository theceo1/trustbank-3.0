import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { QuidaxService } from '@/app/lib/services/quidax';

export async function GET(
  request: Request,
  { params }: { params: { userId: string; currency: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    });

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const quidaxService = new QuidaxService();
    const { userId, currency } = await params;
    const userIdParam = userId === 'me' ? 'me' : userId;
    const currencyParam = currency.toLowerCase();

    const walletData = await quidaxService.getWallet(userIdParam, currencyParam);
    
    if (!walletData) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    return NextResponse.json(walletData);
  } catch (error) {
    console.error('Wallet fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 