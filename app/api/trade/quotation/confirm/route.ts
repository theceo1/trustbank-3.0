// app/api/trade/quotation/confirm/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { QuidaxService } from '@/app/lib/services/quidax';

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    });
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's Quidax ID
    const { data: userData } = await supabase
      .from('users')
      .select('quidax_id')
      .eq('id', session.user.id)
      .single();

    if (!userData?.quidax_id) {
      return NextResponse.json(
        { error: 'Please complete your account setup to trade' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const confirmation = await QuidaxService.confirmSwapQuotation({
      user_id: userData.quidax_id,
      quotation_id: body.quoteId
    });

    return NextResponse.json(confirmation);
  } catch (error) {
    console.error('Trade confirmation error:', error);
    return NextResponse.json(
      { error: 'Failed to confirm trade' },
      { status: 500 }
    );
  }
} 