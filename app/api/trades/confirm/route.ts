//app/api/trades/confirm/route.ts
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
      return NextResponse.json(
        { error: 'Please login to continue' }, 
        { status: 401 }
      );
    }

    const { quotationId } = await request.json();
    
    // Get user's Quidax ID only when confirming the trade
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

    const confirmation = await QuidaxService.confirmSwapQuotation({
      user_id: userData.quidax_id,
      quotation_id: quotationId
    });

    return NextResponse.json(confirmation);
  } catch (error: any) {
    console.error('Trade confirmation error:', error);
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'Unable to process trade at this time';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: error.response?.status || 500 }
    );
  }
} 